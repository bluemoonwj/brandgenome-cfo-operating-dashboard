# Cloudflare Tunnel + Access

Use this when the hosted dashboard needs to query a customer-owned local warehouse without putting raw exports in Git or opening router ports.

## Target Shape

```text
Vercel dashboard
  -> Cloudflare Access login
  -> Cloudflare Tunnel public hostname
  -> customer PC localhost:8787
  -> warehouse/server.mjs
```

## Required From The Operator

- A Cloudflare account with Zero Trust enabled
- A domain/zone in Cloudflare DNS
- A public hostname for this warehouse, for example `client-a-warehouse.example.com`
- Access allowlist rule:
  - internal pilot: `email_domain = company.example`
  - client pilot: exact approved emails or a client-owned domain
- Optional local warehouse token for an extra API-level guard

## Recommended Dashboard Setup

1. Cloudflare dashboard -> Zero Trust -> Access controls -> Applications.
2. Create a self-hosted application for `<warehouse-hostname.example.com>`.
3. Add an Allow policy:
   - Include an approved organization domain for internal pilot, or client-owned domain/exact emails for client pilot.
   - Exclude any blocked accounts.
4. Configure CORS for the Access application:
   - Allowed origins: `https://brandgenome-cfo-operating-dashboard.vercel.app`
   - Methods: `GET`, `OPTIONS`
   - Headers: `Content-Type`, `X-Warehouse-Token`
   - Credentials: enabled
5. Cloudflare dashboard -> Zero Trust -> Networks -> Tunnels.
6. Create a tunnel, for example `olivo-client-warehouse`.
7. Install/run `cloudflared` on the customer PC using Cloudflare's generated command.
8. Add a public hostname route:
   - Hostname: `<warehouse-hostname.example.com>`
   - Service: `http://127.0.0.1:8787`
   - Access protection: enabled for the self-hosted application above

## Local Warehouse Config

Keep `warehouse/config.local.json` untracked. For Cloudflare Access, keep the server bound to loopback:

```json
{
  "host": "127.0.0.1",
  "port": 8787,
  "authToken": "",
  "allowCredentials": true,
  "allowOrigins": [
    "https://brandgenome-cfo-operating-dashboard.vercel.app",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
    "null"
  ]
}
```

Run:

```bash
npm run warehouse
```

## Checks

```bash
npm run warehouse:check
npm run cloudflare:check
WAREHOUSE_PUBLIC_URL=https://<warehouse-hostname.example.com> npm run cloudflare:check
```

If the public URL is protected by Access, a CLI request may return an Access login page or redirect. Open the public URL in a browser, complete the Access login, then test from the dashboard.
