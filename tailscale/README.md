# Tailscale Funnel PoC

Use this when clients need to reach the local raw warehouse from the hosted dashboard, but no DNS/domain change is available yet.

## Target Shape

```text
Vercel dashboard
  -> browser fetch with X-Warehouse-Token
  -> Tailscale Funnel HTTPS URL
  -> junhome localhost:8787
  -> warehouse/server.mjs
```

## Required From The Operator

- Tailscale signed in on junhome
- Funnel enabled for the tailnet
- A short-lived warehouse token generated locally
- Client demo window where the public Funnel URL is intentionally open

## Setup

On junhome, start from the existing folder that owns `raw_exports`.

```bash
git pull
cp warehouse/config.example.json warehouse/config.local.json
openssl rand -base64 32
```

Put the generated value in `warehouse/config.local.json`:

```json
{
  "host": "127.0.0.1",
  "port": 8787,
  "authToken": "<generated-token>",
  "allowCredentials": true,
  "allowOrigins": [
    "https://brandgenome-cfo-operating-dashboard.vercel.app"
  ]
}
```

Terminal 1:

```bash
npm run warehouse
```

Terminal 2:

```bash
tailscale funnel 8787
```

Use the reported `https://<machine>.<tailnet>.ts.net` URL in the dashboard Raw Data API field, and use the generated token in the token field.

## Checks

```bash
npm run warehouse:check
WAREHOUSE_TOKEN=<generated-token> TAILSCALE_WAREHOUSE_URL=https://<machine>.<tailnet>.ts.net npm run tailscale:check
```

If no public URL is set, `npm run tailscale:check` validates only the local warehouse endpoint.

## Security Notes

- Do not expose Funnel without `authToken`.
- Do not place the token in Git, screenshots, docs, issue comments, or chat.
- Stop Funnel or rotate the token after the client demo window.
- This is a PoC path. For long-running external client access, prefer Cloudflare Access once a controlled domain is available.
