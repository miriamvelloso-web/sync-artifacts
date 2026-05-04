---
name: Segmentum flashsale hitlist upload
description: Recurring task — split QC Sessions CSV by country into per-market Segmentum Excel files for upload
type: project
originSessionId: ae2d79b3-40ba-4a2d-917e-1ccec6d1f935
---
## What
After a March 2026 outage, a customer flashsale hitlist CSV is generated (QC Sessions). Miriam needs to split it by country and produce one Segmentum Talabat Portal Excel file per market to upload into Segmentum.

## Source file
- Google Sheet: `1cKqxrMdZs-x3C7HyXRnI8N-leQtXplSv5fpqFT8R2hw` tab "Customer flashsale hitlist"
- Original CSV: `QC Sessions During March outage - Customer flashsale hitlist.csv` (Downloads)
- Columns: `account_id`, `country_code`, `analytical_customer_id`, `last_qc_order_date`, `days_since_last_qc_order`
- Auth: use `miriam.velloso@talabat.com` (NOT @deliveryhero.com)

## Template
- Excel: `Segmentum Talabat Portal (1).xlsx` (Downloads) — single sheet with `customer_id` column

## Process
1. Read CSV, group rows by `country_code`
2. For each country, copy the template and fill `customer_id` with `account_id` values
3. Save as `Segmentum_Talabat_Portal_{COUNTRY}.xlsx` in Downloads

## Last run: 2026-04-22
| Market | Apr 21 | Apr 22 | Change |
|--------|-------:|-------:|-------:|
| AE | 31,608 | 29,173 | -2,435 |
| BH | 7,964 | 7,329 | -635 |
| EG | 37,809 | 34,793 | -3,016 |
| IQ | 3,363 | 3,114 | -249 |
| JO | 12,115 | 11,446 | -669 |
| KW | 25,276 | 23,319 | -1,957 |
| OM | 6,768 | 6,245 | -523 |
| QA | 8,387 | 7,755 | -632 |
| **Total** | **133,290** | **123,174** | **-10,116** |

**Why:** This is a recurring exercise; Miriam wants to track number changes between runs.
**How to apply:** On future runs, compare new counts to the table above and flag differences.
