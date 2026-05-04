---
name: BigQuery access for business case skill
description: BQ MCP access status and what's needed to auto-generate business case impact sections from data
type: project
originSessionId: be49076a-813e-4ab7-96de-9ea9ba2d169c
---
**Status:** Access granted as of 2026-04-29.

**Available:**
- BigQuery Job User on `tlb-nondatateam-analysis-9264` (can run queries)
- BigQuery Data Viewer on `fulfillment-dwh-production` (orders, users, subscriptions, verticals, commercial/deals)

**Why:** The /business-case skill needs to auto-pull baseline metrics from BQ to generate the Business Value / Impact section, instead of asking the user for every number or rephrasing existing docs.

**How to apply:** Once access is granted, update the business-case skill to query BQ for relevant metrics based on the initiative scope (revenue, cost savings, user growth). The example doc to model from is Harshit's LS Exclusive Deals brief: `1Z_fEWgUukWwWS3En8TGQGIGEt-4boDfobvbSA6WhvFw`.

**GitHub:** Access request details to be tracked in GitHub (added by Miriam).
