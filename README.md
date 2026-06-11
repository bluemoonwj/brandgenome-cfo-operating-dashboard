# Cosmetics Operating Intelligence

Static CFO operating dashboard for a cosmetics operating intelligence console.

## Scope

- Connected extracts: Cafe24 orders, Google Ads, Meta Ads, Naver Search Ad, Naver GFA manual export, TikTok Business, and BOK ECOS FX rates
- Display-only source: Kakao Moments remains disabled until OAuth consent and ad-account mapping are complete
- Lower-priority mock areas: bank, cash, tax, and ledger feeds are still mock or estimated until production feeds are connected
- Cadence: daily and weekly operating view with source freshness, raw extract preview, ROAS formulas, and action queues
- Language toggle: full English / Korean UI toggle for executive presentation
- Finance views: CEO cashflow, CEO finance, finance operator, and tax/accounting views remain available for role-based review

## Files

- `index.html`: self-contained static dashboard
- `mock_data_snapshot.json`: dashboard data snapshot. The filename is retained for compatibility, but connected-source sections now use sanitized live extracts.
- `mock_api_contract.json`: connector contract and production input scaffold
- `warehouse/server.mjs`: read-only local warehouse API for raw-data pagination, filtering, and export
- `warehouse/config.example.json`: local API configuration template
- `dashboard_*_sanity.png`: previous QA screenshots

## Data Notice

The hosted dashboard should stay lightweight. Full raw exports are not tracked in Git. Keep them on the customer-owned local machine and expose them through the local warehouse API when full raw-data browsing is needed.

The static HTML still contains presentation-level snapshots and previews. Do not publish or share a public deployment unless the client has approved exposing those metrics. Secrets and API tokens are not embedded.

## Local Warehouse

```bash
cp warehouse/config.example.json warehouse/config.local.json
npm run warehouse
```

Default API:

```text
http://127.0.0.1:8787
```

The Raw Data tab can connect to this API for source/dataset browsing, date filters, column selection, pagination, and CSV/JSONL export.

## Local Check

```bash
npm run check
npm run warehouse:check
```
