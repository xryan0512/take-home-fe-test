Quick Guide: Build and Deploy Scripts to Azure (with Front Door)

1) Requirements
- Azure CLI installed and logged in: `az login`
- Subscription selected: `az account set --subscription <SUBSCRIPTION_ID>`
- PowerShell 7+ recommended

2) Suggested variables
- Resource Group: `fe-takehome-rg`
- Region: `eastus`
- Prefix/baseName (unique): `fe_takehome` (used for resource names)

3) Infrastructure provisioning
Run (adjust parameters as needed):

```bash
powershell -ExecutionPolicy Bypass -File ./deploy/az-provision.ps1 `
  -SubscriptionId "<SUBSCRIPTION_ID>" `
  -Location "eastus" `
  -ResourceGroup "fe-takehome-rg" `
  -BaseName "fe-takehome"
```

This creates:
- Linux App Service Plan
- .NET API Web App (backend)
- Node Web App (Next.js)
- 2 Storage accounts with Static Website (Angular User/Admin)
- Azure Front Door Standard with routes:
  - `/api/*` → backend
  - `/` and `/home*` → Next.js
  - `/user*` → Angular User (Static Website)
  - `/admin*` → Angular Admin (Static Website)

4) Local build of artifacts

```bash
powershell -ExecutionPolicy Bypass -File ./deploy/build-all.ps1
```

Generates:
- `artifacts/backend.zip`
- `artifacts/next-app.zip`
- `artifacts/angular-user/` and `artifacts/angular-admin/` with static `dist` outputs

5) Deploy artifacts

```bash
powershell -ExecutionPolicy Bypass -File ./deploy/az-deploy.ps1 `
  -SubscriptionId "<SUBSCRIPTION_ID>" `
  -ResourceGroup "fe-takehome-rg" `
  -BaseName "fe-takehome"
```

Publishes:
- `backend.zip` to the .NET Web App
- `next-app.zip` to the Node Web App (with Kudu build enabled)
- uploads Angular `dist` folders to Storage Static Website

6) DNS in Cloudflare
- Create a CNAME from the Front Door endpoint host → your subdomain (e.g., `app.mydomain.com`)
- Enable orange proxy, "Always Use HTTPS" and HSTS according to your policy

7) Notes
- The backend is configured with `UseForwardedHeaders`, `UseHttpsRedirection`, and `UseHsts`.
- CORS is applied only in Development; in production everything is same-origin via routes.
- If Front Door performs a path "strip" of `/api`, disable that behavior or remove `ASPNETCORE_PATHBASE`.




