# Cosmetics Operating Intelligence

Static mock dashboard for a cosmetics operating intelligence console.

## Scope

- Revenue sources: Amazon, Cafe24
- Ad vendors: 10 agency, platform, and influencer vendors
- Costs: payroll, rent, fulfillment, COGS, import duty, payment fees, campaign management, operations
- Cadence: daily and weekly operating view
- Controls: source, product, vendor, decision mode, trend mode, WoW/MoM/YoY comparison
- Daily comparison: DoD operating pulse and DoD chart overlay
- Peer-style CFO mainboard: sales summary, profit summary, cash status, inventory risk, cashbook matching
- Management questions: CFO-facing KPI questions with evidence and action context
- Revenue breakdown: source mix, share, MER, settlement lag, and YoY baseline
- KPI tables: channel, product, and ad vendor management tables
- CFO workflow: command actions, mock decision chat, directive queue
- Data views: raw orders, ad spend, costs, daily facts, payroll, tax, FX
- Market signals: FX, Amazon FBA fees, K-beauty demand, Cafe24 channel shift
- Language toggle: full English / Korean UI toggle for executive presentation
- Required four-view finance board from `finance_dashboards_4views_interactive.html`
- CEO cashflow view: north-star cash KPIs, Profit First five-bucket scenario sliders, channel cash contribution, 30-day cash events
- CEO financial strategy view: business health KPIs, unit economics, working capital efficiency, channel/SKU concentration risk
- Finance operator view: daily task checklist, AR aging actions, AP due schedule, channel settlement reconciliation
- Tax accounting view: filing calendar, monthly bookkeeping progress, VAT status, annual P&L/B/S/C/F statement progress
- Blueprint alignment: VOLT AX BI Platform Blueprint Brandgenome v0.1 principles embedded in the dashboard payload and Settings view
- Daily report contract: fixed executive verdict, what changed, why it changed, what to do, and open-question slots
- Schema first: 13 standard dim/fact/quality tables shown as the target ontology before KPI or AI recommendations
- Data quality gate: 9 freshness, completeness, uniqueness, reconciliation, mapping, accounting, outlier, integrity, and FX checks

## Files

- `index.html`: self-contained static dashboard
- `mock_data_snapshot.json`: synthetic source and normalized data snapshot
- `mock_api_contract.json`: dummy API contracts for future connector design
- `dashboard_executive_sanity.png`: executive view QA screenshot
- `dashboard_operating_sanity.png`: operating view QA screenshot
- `dashboard_korean_sanity.png`: Korean UI QA screenshot
- `dashboard_ceo_cash_sanity.png`: CEO cashflow view QA screenshot
- `dashboard_ceo_finance_sanity.png`: CEO financial strategy view QA screenshot
- `dashboard_finance_ops_sanity.png`: finance operator view QA screenshot
- `dashboard_tax_accounting_sanity.png`: tax accounting view QA screenshot
- `dashboard_ceo_cash_korean_sanity.png`: Korean CEO cashflow QA screenshot
- `dashboard_sanity.png`: tab/navigation QA screenshot

## Data Notice

All dashboard data is synthetic and intended for product scoping, customer demos, and connector design. It should not be used as actual financial data.

## Environment Variables and Secrets

This repository currently deploys a static mock dashboard. It does not need runtime environment variables or secrets for Vercel/static hosting.

Do not commit real API keys, passwords, OAuth tokens, verification codes, certificates, or customer exports to this repository. Put production values in Vercel Project Settings > Environment Variables or a secret manager. For local connector smoke tests, keep credentials outside this public repo.

### Required Only When Backend Connectors Are Enabled

Common platform secrets:

```bash
APP_ENV=
TENANT_ID=
BRAND_IDS=entropy,morandypark
DATABASE_URL=
DATA_ENCRYPTION_KEY=
CONNECTOR_RUN_SECRET=
```

Cafe24:

```bash
CAFE24_MALL_ID=
CAFE24_API_VERSION=
CAFE24_APP_URL=
CAFE24_REDIRECT_URL=
CAFE24_CLIENT_ID=
CAFE24_CLIENT_SECRET=
CAFE24_FRONT_API_KEY=
CAFE24_SERVICE_KEY=
CAFE24_ACCESS_TOKEN=
CAFE24_REFRESH_TOKEN=
```

Amazon SP-API:

```bash
AMAZON_SP_API_LWA_CLIENT_ID=
AMAZON_SP_API_LWA_CLIENT_SECRET=
AMAZON_SP_API_REFRESH_TOKEN=
AMAZON_SP_API_SELLER_ID=
AMAZON_SP_API_MARKETPLACE_IDS=
AMAZON_SP_API_REGION=
```

Meta Ads:

```bash
META_ADS_ACCESS_TOKEN=
META_AD_ACCOUNT_IDS=
META_API_VERSION=
```

Google Ads:

```bash
GOOGLE_ADS_CLIENT_ID=
GOOGLE_ADS_CLIENT_SECRET=
GOOGLE_ADS_REFRESH_TOKEN=
GOOGLE_ADS_DEVELOPER_TOKEN=
GOOGLE_ADS_ACCESS_TOKEN=
GOOGLE_ADS_API_VERSION=
GOOGLE_ADS_MANAGER_CUSTOMER_ID=
GOOGLE_ADS_CUSTOMER_IDS=
```

Naver Search Ad, brand-scoped:

```bash
NAVER_SEARCH_AD_ENTROPY_CUSTOMER_ID=
NAVER_SEARCH_AD_ENTROPY_ACCESS_LICENSE=
NAVER_SEARCH_AD_ENTROPY_SECRET_KEY=
NAVER_SEARCH_AD_MORANDYPARK_CUSTOMER_ID=
NAVER_SEARCH_AD_MORANDYPARK_ACCESS_LICENSE=
NAVER_SEARCH_AD_MORANDYPARK_SECRET_KEY=
NAVER_SEARCH_AD_BASE_URL=
```

Naver GFA, brand-scoped:

```bash
NAVER_GFA_ENTROPY_AD_ACCOUNT_NO=
NAVER_GFA_ENTROPY_ACCESS_MANAGER_ACCOUNT_NO=
NAVER_GFA_ENTROPY_ACCESS_TOKEN=
NAVER_GFA_MORANDYPARK_AD_ACCOUNT_NO=
NAVER_GFA_MORANDYPARK_ACCESS_MANAGER_ACCOUNT_NO=
NAVER_GFA_MORANDYPARK_ACCESS_TOKEN=
NAVER_GFA_API_VERSION=
NAVER_GFA_BASE_URL=
```

Kakao Moments, brand-scoped:

```bash
KAKAO_MOMENTS_ENTROPY_AD_ACCOUNT_ID=
KAKAO_MOMENTS_ENTROPY_ACCESS_TOKEN=
KAKAO_MOMENTS_MORANDYPARK_AD_ACCOUNT_ID=
KAKAO_MOMENTS_MORANDYPARK_ACCESS_TOKEN=
KAKAO_MOMENTS_API_VERSION=
```

### Handling Rules

- Keep OAuth refresh/access tokens server-side only.
- Never place client secrets in browser JavaScript.
- Never paste credentials into GitHub issues, pull requests, screenshots, or dashboard mock data.
- Rotate any credential that was ever committed to a public repository.
- Keep `.env`, `.env.*`, `secrets/`, `*.pem`, and `*.key` out of git.

## Core Product Principles

Source: `VOLT_AX_BI_Platform_Blueprint_Brandgenome_v0.1.xlsx`

- Daily report is the product; chat and command actions are support layers.
- Schema first; every source must normalize into shared fact/dim tables before KPI or AI recommendations are trusted.
- KPI tabs are organized by recurring management questions, not by chart collections.
- Data quality gates run before report generation and recommendations.
- Multi-tenant isolation, role-based access, data contracts, and audit logs are part of the core platform model.

## Local Check

```bash
npm run check
```
