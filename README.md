# Brandgenome CFO Operating Dashboard

Static mock dashboard for a cosmetics reseller CFO operating console.

## Scope

- Revenue sources: Amazon, Cafe24
- Ad vendors: 10 agency, platform, and influencer vendors
- Costs: payroll, rent, fulfillment, COGS, import duty, payment fees, campaign management, operations
- Cadence: daily and weekly operating view
- Controls: source, product, vendor, decision mode, trend mode, WoW/MoM/YoY comparison
- CFO workflow: command actions, mock decision chat, directive queue
- Data views: raw orders, ad spend, costs, daily facts, payroll, tax, FX
- Market signals: FX, Amazon FBA fees, K-beauty demand, Cafe24 channel shift

## Files

- `index.html`: self-contained static dashboard
- `mock_data_snapshot.json`: synthetic source and normalized data snapshot
- `mock_api_contract.json`: dummy API contracts for future connector design
- `dashboard_executive_sanity.png`: executive view QA screenshot
- `dashboard_sanity.png`: tab/navigation QA screenshot

## Data Notice

All dashboard data is synthetic and intended for product scoping, customer demos, and connector design. It should not be used as actual financial data.

## Local Check

```bash
npm run check
```
