# Local Warehouse API

This service lets a customer-owned local machine act as a temporary raw-data warehouse for the dashboard.

The dashboard stays lightweight and hosted separately. Raw CSV/JSONL extracts stay on the local machine and are exposed only through a read-only API with dataset whitelisting, date filters, column selection, pagination, and CSV export.

## Run

```bash
cp warehouse/config.example.json warehouse/config.local.json
npm run warehouse
```

Default URL:

```text
http://127.0.0.1:8787
```

## Dry Run

```bash
npm run warehouse:check
curl http://127.0.0.1:8787/health
curl "http://127.0.0.1:8787/api/raw/query?dataset=real_cafe24_orders&from=2024-01-01&to=2024-01-02&columns=order_date,channel,payment_amount_krw&limit=5"
```

## Dashboard Contract

- `GET /health`
- `GET /api/raw/sources`
- `GET /api/raw/query?dataset=...&from=YYYY-MM-DD&to=YYYY-MM-DD&columns=a,b&search=...&limit=500&offset=0`
- `GET /api/raw/export?dataset=...&from=YYYY-MM-DD&to=YYYY-MM-DD&columns=a,b&search=...`

## Security Model

- Keep full raw exports outside Git.
- Bind to `127.0.0.1` by default.
- Set `authToken` in `warehouse/config.local.json` before exposing the API beyond the local browser.
- Use a private tunnel or VPN when a hosted dashboard must reach a customer local machine from outside the local network.
- Do not place vendor API credentials in this service or in dashboard state.
