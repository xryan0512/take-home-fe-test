Param(
  [Parameter(Mandatory=$true)] [string]$SubscriptionId,
  [Parameter(Mandatory=$true)] [string]$ResourceGroup,
  [Parameter(Mandatory=$true)] [string]$BaseName
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

az account set --subscription $SubscriptionId | Out-Null

$Artifacts = Join-Path $PSScriptRoot 'artifacts'
if (!(Test-Path $Artifacts)) { throw "Artifacts folder not found. Run build-all.ps1 first." }

$apiName = "$BaseName-api"
$nextName = "$BaseName-next"
$userSto = ("$BaseName" + "user").ToLower().Replace('-','')
$adminSto = ("$BaseName" + "admin").ToLower().Replace('-','')

Write-Host '==> Deploy backend.zip to API Web App'
$backendZip = Join-Path $Artifacts 'backend.zip'
if (!(Test-Path $backendZip)) { throw "backend.zip not found" }
az webapp deploy -g $ResourceGroup -n $apiName --src-path $backendZip --type zip | Out-Null

Write-Host '==> Deploy next-app.zip to Next.js Web App (Kudu build)'
$nextZip = Join-Path $Artifacts 'next-app.zip'
if (!(Test-Path $nextZip)) { throw "next-app.zip not found" }
az webapp deploy -g $ResourceGroup -n $nextName --src-path $nextZip --type zip | Out-Null

Write-Host '==> Upload Angular User dist to Storage Static Website'
$userOut = Join-Path $Artifacts 'angular-user'
if (!(Test-Path $userOut)) { throw "angular-user dist not found" }
$userWeb = az storage account show -g $ResourceGroup -n $userSto --query "primaryEndpoints.web" -o tsv
$userConn = az storage account show-connection-string -g $ResourceGroup -n $userSto -o tsv
az storage blob upload-batch --account-name $userSto --destination '$web' --source $userOut --connection-string $userConn --overwrite | Out-Null

Write-Host '==> Upload Angular Admin dist to Storage Static Website'
$adminOut = Join-Path $Artifacts 'angular-admin'
if (!(Test-Path $adminOut)) { throw "angular-admin dist not found" }
$adminWeb = az storage account show -g $ResourceGroup -n $adminSto --query "primaryEndpoints.web" -o tsv
$adminConn = az storage account show-connection-string -g $ResourceGroup -n $adminSto -o tsv
az storage blob upload-batch --account-name $adminSto --destination '$web' --source $adminOut --connection-string $adminConn --overwrite | Out-Null

Write-Host '==> Deployment completed.'
Write-Host 'API Web App:' (az webapp show -g $ResourceGroup -n $apiName --query defaultHostName -o tsv)
Write-Host 'Next Web App:' (az webapp show -g $ResourceGroup -n $nextName --query defaultHostName -o tsv)
Write-Host 'User Static Web:' $userWeb
Write-Host 'Admin Static Web:' $adminWeb



