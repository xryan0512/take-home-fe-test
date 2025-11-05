Param(
  [Parameter(Mandatory=$true)] [string]$SubscriptionId,
  [Parameter(Mandatory=$true)] [string]$Location,
  [Parameter(Mandatory=$true)] [string]$ResourceGroup,
  [Parameter(Mandatory=$true)] [string]$BaseName
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

az account set --subscription $SubscriptionId | Out-Null

Write-Host "==> Creating resource group $ResourceGroup in $Location"
az group create -n $ResourceGroup -l $Location | Out-Null

# Names
$planName = "$BaseName-plan"
$apiName = "$BaseName-api"
$nextName = "$BaseName-next"
$userSto = ("$BaseName" + "user").ToLower().Replace('-','')
$adminSto = ("$BaseName" + "admin").ToLower().Replace('-','')

# App Service Plan (Linux)
Write-Host "==> Creating App Service Plan (Linux)"
az appservice plan create -g $ResourceGroup -n $planName --sku P1v3 --is-linux | Out-Null

# Web Apps
Write-Host "==> Creating Web App for API (.NET)"
az webapp create -g $ResourceGroup -p $planName -n $apiName --runtime "DOTNETCORE|8.0" | Out-Null
Write-Host "==> Creating Web App for Next.js (Node)"
az webapp create -g $ResourceGroup -p $planName -n $nextName --runtime "NODE|20-lts" | Out-Null

# App settings
Write-Host "==> Configuring app settings"
az webapp config appsettings set -g $ResourceGroup -n $apiName --settings \
  ASPNETCORE_ENVIRONMENT=Production ASPNETCORE_PATHBASE=/api | Out-Null
az webapp config appsettings set -g $ResourceGroup -n $nextName --settings \
  SCM_DO_BUILD_DURING_DEPLOYMENT=true WEBSITE_NODE_DEFAULT_VERSION=~20 NEXT_PUBLIC_API_BASE=/api | Out-Null

# Storage accounts for Angular static sites
Write-Host "==> Creating Storage accounts (Static Websites)"
az storage account create -g $ResourceGroup -n $userSto -l $Location --sku Standard_LRS --kind StorageV2 | Out-Null
az storage account create -g $ResourceGroup -n $adminSto -l $Location --sku Standard_LRS --kind StorageV2 | Out-Null

for ($i=0; $i -lt 2; $i++) {
  $sto = @($userSto,$adminSto)[$i]
  az storage blob service-properties update --account-name $sto --static-website --index-document index.html --404-document index.html | Out-Null
}

# Azure Front Door Standard
$afdProfile = "$BaseName-afd"
$afdEndpoint = "$BaseName-endpoint"

Write-Host "==> Creating Azure Front Door profile and endpoint"
az afd profile create -g $ResourceGroup -n $afdProfile --sku Standard_AzureFrontDoor | Out-Null
az afd endpoint create -g $ResourceGroup --profile-name $afdProfile -n $afdEndpoint | Out-Null

# Origins (origin groups + origins)
Write-Host "==> Configuring origins"
az afd origin-group create -g $ResourceGroup --profile-name $afdProfile -n api-og --probe-request-type GET --probe-protocol Https --probe-interval-in-seconds 60 | Out-Null
az afd origin create -g $ResourceGroup --profile-name $afdProfile --origin-group-name api-og -n api-origin \
  --host-name "$(az webapp show -g $ResourceGroup -n $apiName --query defaultHostName -o tsv)" --http-port 80 --https-port 443 | Out-Null

az afd origin-group create -g $ResourceGroup --profile-name $afdProfile -n next-og --probe-request-type GET --probe-protocol Https --probe-interval-in-seconds 60 | Out-Null
az afd origin create -g $ResourceGroup --profile-name $afdProfile --origin-group-name next-og -n next-origin \
  --host-name "$(az webapp show -g $ResourceGroup -n $nextName --query defaultHostName -o tsv)" --http-port 80 --https-port 443 | Out-Null

az afd origin-group create -g $ResourceGroup --profile-name $afdProfile -n user-og --probe-request-type GET --probe-protocol Https --probe-interval-in-seconds 60 | Out-Null
az afd origin create -g $ResourceGroup --profile-name $afdProfile --origin-group-name user-og -n user-origin \
  --host-name "$(az storage account show -g $ResourceGroup -n $userSto --query primaryEndpoints.web -o tsv | ForEach-Object { ($_ -replace 'https://','').TrimEnd('/') })" --http-port 80 --https-port 443 | Out-Null

az afd origin-group create -g $ResourceGroup --profile-name $afdProfile -n admin-og --probe-request-type GET --probe-protocol Https --probe-interval-in-seconds 60 | Out-Null
az afd origin create -g $ResourceGroup --profile-name $afdProfile --origin-group-name admin-og -n admin-origin \
  --host-name "$(az storage account show -g $ResourceGroup -n $adminSto --query primaryEndpoints.web -o tsv | ForEach-Object { ($_ -replace 'https://','').TrimEnd('/') })" --http-port 80 --https-port 443 | Out-Null

# Routes
Write-Host "==> Creating routes (path-based)"
az afd route create -g $ResourceGroup --profile-name $afdProfile --endpoint-name $afdEndpoint -n api-route \
  --supported-protocols Http Https --https-redirect Enabled --origin-group api-og --patterns-to-match "/api/*" | Out-Null

az afd route create -g $ResourceGroup --profile-name $afdProfile --endpoint-name $afdEndpoint -n next-root \
  --supported-protocols Http Https --https-redirect Enabled --origin-group next-og --patterns-to-match "/" | Out-Null

az afd route create -g $ResourceGroup --profile-name $afdProfile --endpoint-name $afdEndpoint -n next-home \
  --supported-protocols Http Https --https-redirect Enabled --origin-group next-og --patterns-to-match "/home*" | Out-Null

az afd route create -g $ResourceGroup --profile-name $afdProfile --endpoint-name $afdEndpoint -n user-route \
  --supported-protocols Http Https --https-redirect Enabled --origin-group user-og --patterns-to-match "/user*" | Out-Null

az afd route create -g $ResourceGroup --profile-name $afdProfile --endpoint-name $afdEndpoint -n admin-route \
  --supported-protocols Http Https --https-redirect Enabled --origin-group admin-og --patterns-to-match "/admin*" | Out-Null

Write-Host "==> Done. AFD endpoint host:"
az afd endpoint show -g $ResourceGroup --profile-name $afdProfile -n $afdEndpoint --query hostName -o tsv




