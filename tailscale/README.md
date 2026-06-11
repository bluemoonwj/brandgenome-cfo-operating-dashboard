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

## Current PoC Endpoint

```text
https://junhome.tail9812b6.ts.net
```

The dashboard Raw Data API field defaults to this URL. The token is intentionally not stored in Git or in the dashboard bundle.

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

## Operations

Check the warehouse service:

```bash
launchctl print gui/$(id -u)/olivo.finance
```

Restart the warehouse service:

```bash
launchctl kickstart -k gui/$(id -u)/olivo.finance
```

Check Funnel:

```bash
tailscale funnel status
```

Stop public access:

```bash
tailscale funnel --https=443 off
```

Rotate the warehouse token:

```bash
cd /Users/jun_home/dev/finance-ax-brandgenome/deploy/brandgenome-cfo-operating-dashboard
TOKEN=$(openssl rand -base64 32) node -e 'const fs=require("fs"); const p="warehouse/config.local.json"; const c=JSON.parse(fs.readFileSync(p,"utf8")); c.authToken=process.env.TOKEN; fs.writeFileSync(p, JSON.stringify(c,null,2)+"\n", {mode:0o600});'
launchctl kickstart -k gui/$(id -u)/olivo.finance
```
