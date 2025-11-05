Param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$Root = Split-Path -Parent $PSScriptRoot
$Artifacts = Join-Path $PSScriptRoot 'artifacts'
if (!(Test-Path $Artifacts)) { New-Item -ItemType Directory -Path $Artifacts | Out-Null }

Write-Host '==> Building backend (.NET)'
Push-Location (Join-Path $Root 'backend-dotnet')
dotnet restore
dotnet publish -c Release -o publish
$backendZip = Join-Path $Artifacts 'backend.zip'
if (Test-Path $backendZip) { Remove-Item $backendZip -Force }
Compress-Archive -Path (Join-Path (Get-Location) 'publish\*') -DestinationPath $backendZip
Pop-Location

Write-Host '==> Building Next.js'
Push-Location (Join-Path $Root 'frontend-nextjs')
if (Test-Path 'node_modules') { Write-Host '   node_modules exists - skipping npm ci check' } else { npm ci }
# Zip source for Kudu build on server
$nextZip = Join-Path $Artifacts 'next-app.zip'
if (Test-Path $nextZip) { Remove-Item $nextZip -Force }

# Include files needed for build on App Service
$nextInclusions = @(
  'package.json','package-lock.json','next.config.ts','middleware.ts','next-env.d.ts','tsconfig.json','postcss.config.mjs','eslint.config.mjs'
)
$nextDirs = @('app','public','src') | Where-Object { Test-Path $_ }
Compress-Archive -Path ($nextInclusions + $nextDirs) -DestinationPath $nextZip
Pop-Location

Write-Host '==> Building Angular User'
Push-Location (Join-Path $Root 'frontend-angular1')
if (!(Test-Path 'node_modules')) { npm ci } else { Write-Host '   node_modules exists - skipping npm ci' }
npm run build
$userDist = Join-Path (Get-Location) 'dist'
$userOut = Join-Path $Artifacts 'angular-user'
if (Test-Path $userOut) { Remove-Item $userOut -Recurse -Force }
Copy-Item $userDist -Destination $userOut -Recurse
Pop-Location

Write-Host '==> Building Angular Admin'
Push-Location (Join-Path $Root 'frontend-angular2')
if (!(Test-Path 'node_modules')) { npm ci } else { Write-Host '   node_modules exists - skipping npm ci' }
npm run build
$adminDist = Join-Path (Get-Location) 'dist'
$adminOut = Join-Path $Artifacts 'angular-admin'
if (Test-Path $adminOut) { Remove-Item $adminOut -Recurse -Force }
Copy-Item $adminDist -Destination $adminOut -Recurse
Pop-Location

Write-Host '==> Done. Artifacts in' $Artifacts



