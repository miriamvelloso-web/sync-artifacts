---
name: Business Case Helper
description: Conversational skill (/business-case) with data-assisted impact calculators (BQ auto-pull), OKR auto-mapping, Eppo experiment context, and Google Doc generation
type: project
originSessionId: b9df386c-4c48-499b-b0ff-1b2ecf64744c
---
Skill at `.claude/skills/business-case/SKILL.md` — invoked via `/business-case`.

- Walks user through sections: Business Problem, Initiative Context, Business Value/Impact, Current Process, Desired Outcome, References
- **Initiative Context** (Step 2.5): Collects vertical (Food/tMart/LS/All), markets (multi-select), user segment (tPro/Non-Pro/Both) — feeds BQ queries and OKR mapping
- **Data-Assisted Mode** (Step 3): Authenticates with BQ MCP, runs 3 SQL queries against `fulfillment-dwh-production.cl_data_warehouse` to pull baseline metrics (orders, AOV, GMV, contacts, MAU, ARPU) for the last 3 complete months. User only provides improvement %. Falls back to Manual if BQ unavailable.
- **Manual Mode**: Three calculator types unchanged — Revenue/GMV, Cost Savings, User Growth
- **OKR Auto-Mapping**: Embedded H1 2026 OKR table with keyword matching rules — auto-suggests best-fit company bet/objective based on vertical + initiative keywords
- **Experiment Context**: Optional Eppo MCP pull for related experiments — offers to use proven uplift % as improvement estimate. Silent skip if Eppo unavailable.
- Generates a Google Doc by copying template `1_Uuz5xlVuGJYfLjwwbMOR1Kcre16cePmoHeqipKgV6k`
- Uses `miriam.velloso@talabat.com` for Google Workspace calls
- Source attribution in draft: data sources, query dates, user-overridden values noted inline

**Why:** Commercial team submissions often lack quantified business impact, leading to "Needs Clarification" status. Data-assisted mode reduces submitter effort from "provide all numbers" to "just tell me your expected improvement %."
**How to apply:** When user says `/business-case` or mentions creating a business case for intake.
