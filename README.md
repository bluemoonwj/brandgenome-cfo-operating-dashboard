# Cosmetics Operating Intelligence

Static mock dashboard for a cosmetics operating intelligence console.

## Scope

- Revenue sources: Amazon, Cafe24
- Ad vendors: 10 agency, platform, and influencer vendors
- Costs: payroll, rent, fulfillment, COGS, import duty, payment fees, campaign management, operations
- Cadence: daily and weekly operating view
- Controls: source, product, vendor, decision mode, trend mode, WoW/MoM/YoY comparison
- Daily comparison: DoD operating pulse and DoD chart overlay
- Management questions: CFO-facing KPI questions with evidence and action context
- Revenue breakdown: source mix, share, MER, settlement lag, and YoY baseline
- KPI tables: channel, product, and ad vendor management tables
- CFO workflow: command actions, mock decision chat, directive queue
- Data views: raw orders, ad spend, costs, daily facts, payroll, tax, FX
- Market signals: FX, Amazon FBA fees, K-beauty demand, Cafe24 channel shift
- Language toggle: full English / Korean UI toggle for executive presentation
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
- `dashboard_sanity.png`: tab/navigation QA screenshot

## Data Notice

All dashboard data is synthetic and intended for product scoping, customer demos, and connector design. It should not be used as actual financial data.

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
