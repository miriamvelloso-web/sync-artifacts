---
name: business-case
metadata:
  version: 1.0.0
description: Guides commercial team through creating a strong business case for intake submissions. Interviews the user section by section with coaching, auto-pulls baseline metrics from BigQuery (data-assisted mode), auto-maps to H1 2026 OKRs, optionally pulls experiment context from Eppo, then generates a Google Doc from the official template. Use when the user says "business case", "create business case", "help me write a business case", or "new business case".
---

# Business Case Helper

Conversational skill that walks a user through building a business case for an Opportunity Intake submission, section by section, with active coaching to strengthen weak inputs. Outputs a ready-to-share Google Doc.

## Configuration

```
TEMPLATE_DOC_ID: 1_Uuz5xlVuGJYfLjwwbMOR1Kcre16cePmoHeqipKgV6k
USER_EMAIL: miriam.velloso@talabat.com
BQ_DATA_PROJECT: fulfillment-dwh-production
EPPO_MCP_URL: https://talabatai.dhhmena.com/mcp/gateway/eppo/mcp
```

## Business Case Sections

The template has 5 sections. Each section has required elements that the user must address:

### Section 1: Business Problem
Required elements:
- What is the problem?
- In what process does it show up?
- Why is it a problem? Why is a solution needed?
- Size of the problem (countries, frequency, volume)
- Screenshots/visuals if relevant

### Section 2: Business Value / Business Impact
Required elements:
- Benefit to the organisation
- Which business metrics it improves (with estimates)
- Quantified value in business KPIs (e.g., uplift in GMV, reduction in contact rate)
- Which OKRs or company bets this connects to
- Competitor insights if any
- Graphs/visuals if relevant

### Section 3: Current Process
Required elements:
- Current situation/status
- How the problem is currently managed
- Existing workarounds and their limitations
- Step-by-step example of the current flow
- Process flow diagram if applicable

### Section 4: Desired Outcome (Definition of Success)
Required elements:
- Expected outcome / deliverables if the problem is solved
- What constitutes success (the goalpost)
- Out of Scope: what does NOT need to be addressed, and why
- Assumptions: hidden/unspoken assumptions made to estimate impact
- Open questions: what needs to be explored during discovery

### Section 5: Reference
Required elements:
- Links to supporting documents (PRDs, dashboards, research)
- Data sources used for estimates

## Execution Flow

### Step 1: Introduction

Display this message:

```
## Business Case Helper

I'll help you build a strong business case for your intake submission. We'll go through 5 sections:

1. Business Problem
2. Business Value / Impact
3. Current Process
4. Desired Outcome
5. References

For each section, I'll ask you questions and help you strengthen your answers. This usually takes about 10 minutes.

Let's start!
```

Then ask:

```
What is the name/title of your initiative?
```

Store the answer as `INITIATIVE_NAME`.

### Step 2: Business Problem (Section 1)

Ask the user the following questions. You can use `AskUserQuestion` or open-ended conversation — adapt to the user's style:

1. "What is the problem you're trying to solve?"
2. "Where does this problem show up? (Which process, product area, or customer journey?)"
3. "Why does this need to be solved now? What happens if we don't?"
4. "How big is this problem? (Which countries/markets? How often does it occur? How many users/orders are affected?)"

**Coaching rules for this section:**
- If the answer is fewer than 2 sentences → ask: "Could you elaborate a bit more? The more context you give, the easier it is for the product team to understand the urgency."
- If no countries/markets mentioned → ask: "Which markets are affected? Is this global or specific countries?"
- If no frequency/volume mentioned → ask: "How often does this happen? Daily? Weekly? Can you estimate the volume?"

Once you have enough content, draft the section text and show it to the user:
```
Here's what I've drafted for the Business Problem section:

[drafted text]

Does this look good, or would you like to adjust anything?
```

Wait for confirmation before proceeding.

### Step 2.5: Initiative Context

Before moving to impact estimation, gather context needed for data-assisted calculators and OKR mapping.

Use `AskUserQuestion` to ask:

1. "Which vertical does this initiative primarily affect?"
   Options:
   - Food
   - tMart / QCommerce
   - Life Style (LS)
   - All Verticals / Platform-wide

   Store as `VERTICAL`.

2. "Which markets are in scope?" (multi-select)
   Options:
   - UAE
   - KW (Kuwait)
   - QA (Qatar)
   - BH (Bahrain)
   - JO (Jordan)
   - EG (Egypt)
   - IQ (Iraq)
   - All Markets

   Store as `MARKETS_LIST`.

3. "Does this initiative target tPro subscribers specifically, non-Pro users, or both?"
   Options:
   - tPro subscribers
   - Non-Pro users
   - Both / All users

   Store as `USER_SEGMENT`.

These values feed the data-assisted calculator and OKR auto-mapping.

### Step 3: Business Value / Impact (Section 2)

This is the most critical section. Start by offering the user a choice of mode:

Use `AskUserQuestion` to ask:

```
How would you like to estimate the business impact?
```

Options:
- **Data-Assisted (recommended)** — I'll pull real baseline metrics from our data warehouse (orders, AOV, GMV, user counts) and pre-fill the calculator. You just provide the expected improvement %.
- **Manual** — You provide all the numbers yourself.

Store the choice as `CALC_MODE`.

Then identify the impact type:

```
What type of business impact does your initiative have?
```

Options:
- **Revenue / GMV growth** — More orders, higher AOV, better conversion
- **Cost savings / efficiency** — Fewer contacts, less manual work, lower ops costs
- **User growth / retention** — More MAUs, lower churn, reactivation
- **Multiple types** — Combination of the above

---

#### Data-Assisted Mode (if CALC_MODE = Data-Assisted)

##### Step 3a: Authenticate with BigQuery

Check if BQ MCP tools are available. If not authenticated:

1. Call `mcp__bigquery__authenticate()` to start the OAuth flow
2. Share the authorization URL with the user:
   ```
   To pull real data, I need to connect to BigQuery. Please open this link to authorize:
   [authorization URL]

   Once you've authorized in your browser, paste the callback URL here (it starts with http://localhost:.../callback?code=...).
   ```
3. When the user pastes the callback URL, call `mcp__bigquery__complete_authentication(callback_url: "<pasted URL>")`
4. If auth fails after 2 attempts:
   ```
   BQ authentication didn't work — no worries, we'll use manual mode instead.
   ```
   Set `CALC_MODE = Manual` and fall through to Manual Mode below.

##### Step 3b: Pull Baseline Metrics

Once authenticated, run the appropriate query based on impact type, VERTICAL, and MARKETS_LIST.

**Query rules:**
- Data project: `fulfillment-dwh-production`
- Use `dry_run_query` first to validate (catches permission/schema errors without cost)
- Date range: last 3 complete calendar months
- Store the query date range for source attribution

**Build the market and vertical filters from user inputs:**
- `{MARKETS_FILTER}`: map MARKETS_LIST to quoted codes: `'ae','kw','qa'` etc. If "All Markets", remove the AND clause.
- `{VERTICAL_FILTER}`: map VERTICAL to: `'food'` | `'groceries','retail'` | `'lifestyle'` | remove clause for All Verticals

**Query Template A — Revenue / GMV Baseline** (for Revenue/GMV impact type):

```sql
SELECT
  FORMAT_DATE('%Y-%m', order_date) AS month,
  country_code,
  vertical,
  COUNT(DISTINCT order_id) AS total_orders,
  ROUND(AVG(gmv_eur), 2) AS avg_order_value_eur,
  ROUND(SUM(gmv_eur), 2) AS total_gmv_eur
FROM `fulfillment-dwh-production.cl_data_warehouse.fact_orders`
WHERE order_date >= DATE_TRUNC(DATE_SUB(CURRENT_DATE(), INTERVAL 3 MONTH), MONTH)
  AND order_date < DATE_TRUNC(CURRENT_DATE(), MONTH)
  AND order_status = 'delivered'
  AND vertical IN ({VERTICAL_FILTER})
  AND country_code IN ({MARKETS_FILTER})
GROUP BY 1, 2, 3
ORDER BY 1, 2, 3
```

**Query Template B — Contact Volume Baseline** (for Cost Savings impact type):

```sql
SELECT
  FORMAT_DATE('%Y-%m', contact_date) AS month,
  country_code,
  contact_reason_l1,
  COUNT(*) AS total_contacts
FROM `fulfillment-dwh-production.cl_data_warehouse.fact_contacts`
WHERE contact_date >= DATE_TRUNC(DATE_SUB(CURRENT_DATE(), INTERVAL 3 MONTH), MONTH)
  AND contact_date < DATE_TRUNC(CURRENT_DATE(), MONTH)
  AND country_code IN ({MARKETS_FILTER})
GROUP BY 1, 2, 3
ORDER BY 1, 2, total_contacts DESC
```

**Query Template C — User Base / MAU Baseline** (for User Growth impact type):

```sql
SELECT
  FORMAT_DATE('%Y-%m', order_date) AS month,
  country_code,
  CASE WHEN is_pro_subscriber THEN 'tPro' ELSE 'Non-Pro' END AS user_segment,
  COUNT(DISTINCT user_id) AS mau,
  ROUND(COUNT(DISTINCT order_id) * 1.0 / NULLIF(COUNT(DISTINCT user_id), 0), 2) AS orders_per_user,
  ROUND(SUM(gmv_eur) / NULLIF(COUNT(DISTINCT user_id), 0), 2) AS arpu_eur
FROM `fulfillment-dwh-production.cl_data_warehouse.fact_orders`
WHERE order_date >= DATE_TRUNC(DATE_SUB(CURRENT_DATE(), INTERVAL 3 MONTH), MONTH)
  AND order_date < DATE_TRUNC(CURRENT_DATE(), MONTH)
  AND order_status = 'delivered'
  AND country_code IN ({MARKETS_FILTER})
GROUP BY 1, 2, 3
ORDER BY 1, 2, 3
```

**If any query fails** (table not found, permission denied):
1. Run `list_tables` on the dataset to discover actual table names
2. Run `describe_table` on promising tables to find correct column names
3. Rebuild the query with discovered names and retry once
4. If still failing: inform the user and fall back to manual mode for that input

##### Step 3c: Present Pre-filled Calculator

Display the BQ results in a summary table, then show the pre-filled calculator:

For Revenue/GMV:
```
## Baseline Data (Source: fulfillment-dwh-production, {START_MONTH}–{END_MONTH})

| Month | Market | Vertical | Orders | AOV (EUR) | GMV (EUR) |
|-------|--------|----------|--------|-----------|-----------|
| ... | ... | ... | ... | ... | ... |

**3-month averages:**
- Monthly orders: {AFFECTED_ORDERS}
- Average order value: EUR {AOV}
- Monthly GMV: EUR {BASELINE_GMV}

These are pre-filled from real data. You can adjust any of them.

Now I just need one number from you:
**What % improvement do you expect from this initiative?**
(Tip: most initiatives see 1-5%. If you have experiment data, we can use that.)
```

After the user provides improvement %, calculate and show:

```
Revenue Impact Estimate:
- Affected orders/month: {AFFECTED_ORDERS} *(source: BQ, {PERIOD})*
- Average order value: EUR {AOV} *(source: BQ, {PERIOD})*
- Expected improvement: {IMPROVEMENT_PCT}% *(user estimate)*
- Monthly GMV impact: EUR {calculated}
- Annual GMV impact: EUR {calculated}
- Markets: {MARKETS_LIST}

Want to adjust any of these numbers before we lock them in?
```

If the user overrides any value, note it: `*(overridden from EUR X BQ baseline)*`

Apply the same pattern for Cost Savings and User Growth calculators — show BQ data, ask only for the reduction/improvement %, calculate.

---

#### Manual Mode (if CALC_MODE = Manual, or fallback from data-assisted)

Run the appropriate calculator(s):

---

#### Calculator A: Revenue / GMV Impact

Ask these inputs one by one:

1. "How many orders or transactions are affected per month?" → store as `AFFECTED_ORDERS`
2. "What is the average order value (AOV) in USD for these orders?" → store as `AOV`
3. "What % improvement do you expect? (e.g., 5% more orders, 3% higher AOV)" → store as `IMPROVEMENT_PCT`
4. "Which markets will benefit?" → store as `MARKETS`

**Calculate and show:**
```
Revenue Impact Estimate:
- Affected orders/month: {AFFECTED_ORDERS}
- Average order value: ${AOV}
- Expected improvement: {IMPROVEMENT_PCT}%
- Monthly GMV impact: ${AFFECTED_ORDERS × AOV × IMPROVEMENT_PCT / 100}
- Annual GMV impact: ${monthly × 12}
- Markets: {MARKETS}
```

If the user doesn't know exact numbers, help them estimate:
- "Do you know the total monthly orders for this product/market? We can work from there."
- "What's a conservative vs optimistic estimate for the improvement %?"
- Offer to show a range: "Conservative (2%) → $X | Moderate (5%) → $Y | Optimistic (10%) → $Z"

---

#### Calculator B: Cost Savings / Efficiency Impact

Ask these inputs one by one:

1. "What is the current cost of this process? (e.g., monthly contact volume, FTE hours, manual ops cost)" → store as `CURRENT_COST`
2. "What unit are we measuring? (e.g., contacts/month, FTE hours/week, $/month)" → store as `COST_UNIT`
3. "What % reduction do you expect?" → store as `REDUCTION_PCT`
4. "What is the cost per unit? (e.g., $X per contact, $Y per FTE hour)" → store as `COST_PER_UNIT`

**Calculate and show:**
```
Cost Savings Estimate:
- Current volume: {CURRENT_COST} {COST_UNIT}
- Expected reduction: {REDUCTION_PCT}%
- Units saved/month: {CURRENT_COST × REDUCTION_PCT / 100}
- Monthly savings: ${units_saved × COST_PER_UNIT}
- Annual savings: ${monthly × 12}
```

If user doesn't know cost per unit, suggest typical benchmarks:
- "A typical customer contact costs $3-8 to handle. Want to use $5 as an estimate?"
- "An FTE hour typically costs $25-50 depending on role. What's reasonable here?"

---

#### Calculator C: User Growth / Retention Impact

Ask these inputs one by one:

1. "What is the current user base affected? (e.g., MAU, registered users)" → store as `CURRENT_USERS`
2. "What metric will improve? (e.g., MAU growth, churn reduction, reactivation rate)" → store as `GROWTH_METRIC`
3. "What % improvement do you expect?" → store as `GROWTH_PCT`
4. "What is the average revenue per user (ARPU) per month?" → store as `ARPU`

**Calculate and show:**
```
User Growth Impact Estimate:
- Current user base: {CURRENT_USERS}
- Metric: {GROWTH_METRIC}
- Expected improvement: {GROWTH_PCT}%
- Additional users/month: {CURRENT_USERS × GROWTH_PCT / 100}
- Revenue impact/month: ${additional_users × ARPU}
- Annual revenue impact: ${monthly × 12}
```

If user doesn't know ARPU:
- "If you don't have ARPU, we can estimate from orders: how many orders per user per month, and what's the AOV?"

---

#### After Calculator(s)

##### OKR Auto-Mapping

Based on INITIATIVE_NAME, VERTICAL, the drafted Business Problem, and the impact type, auto-suggest the most relevant OKR alignment using this mapping:

**H1 2026 Company Bets & OKRs:**

| Big Bet | Objective | Key Result | CBO |
|---|---|---|---|
| Growth | Boost MAUs | Increase platform MAUs | Alvaro Martinez Espinosa |
| Growth | Boost MAUs | High frequency, profitable customers | Alvaro Martinez Espinosa |
| Experience | Improve vendor operations | Reduce AWT + Prep Time (food) | Khee Lim |
| Experience | Improve seamless experience | % seamless orders (food) | Khee Lim / Aanchal Kotwaney |
| Experience | Improve seamless experience | Inaccurate Orders | Aanchal Kotwaney |
| Experience | Improve seamless experience | % orders delayed > 10 mins (food) | Khee Lim |
| QC | Grow G&R | Increase G&R MAUs | Alvaro Martinez Espinosa / Alvaro Garcia Leal |
| QC | Grow G&R | % tmart orders <15 mins | Khee Lim / Alvaro Garcia Leal |
| Choice | Secure top loved brands and lock GMV | Increase food KPP% GMV | Kedar Kulkarni |
| Value | Improve affordability | VFD/fGMV | Kedar Kulkarni / Alvaro Martinez Espinosa |
| Ecosystem | Grow tPro | tPro customer GMV% | Hussein Daher |
| Ecosystem | Boost growth initiatives | DineOut Product Market Fit | Moiza Saeed |
| Experience | Improve rider compliance | # of legal bike riders onboarded | Khee Lim |
| Others | Optimize savings | Reduce SG&A % GMV | TBD |

**Matching rules (apply in order, use first strong match):**

1. **Keyword match on initiative name + problem statement:**
   - tPro, Pro, subscription, loyalty, churn, exclusive deals → **Ecosystem: Grow tPro** (Hussein Daher)
   - MAU, acquisition, reactivation, new customers → **Growth: Boost MAUs** (Alvaro)
   - Prep time, vendor, kitchen, AWT → **Experience: Improve vendor operations** (Khee Lim)
   - Seamless, accuracy, delay, on-time, delivery → **Experience: Improve seamless experience** (Khee Lim / Aanchal)
   - Grocery, retail, fresh, discovery, assortment, tmart → **QC: Grow G&R** (Alvaro / Alvaro Garcia Leal)
   - KPP, key partner, brand, exclusivity → **Choice: Secure top loved brands** (Kedar)
   - Discount, affordability, VFD, voucher, deal, value → **Value: Improve affordability** (Kedar / Alvaro)
   - DineOut, dine-in → **Ecosystem: Boost growth initiatives** (Moiza Saeed)
   - Rider, compliance, legal, bike → **Experience: Improve rider compliance** (Khee Lim)
   - Cost, SG&A, savings, efficiency, reduce spend → **Others: Optimize savings** (TBD)

2. **Vertical match (if no keyword match):**
   - tMart / QCommerce → QC: Grow G&R
   - Food → Experience or Choice (depending on impact type)
   - LS → Ecosystem or Value

**Present the suggestion:**
```
Based on your initiative, I'd suggest this OKR alignment:

**Company Bet:** {BET}
**Objective:** {OBJECTIVE}
**Key Result:** {KEY_RESULT}
**CBO:** {CBO_NAME}

Does this look right, or would you like to map it differently?
```

If the user disagrees, show the full OKR table above and let them pick.

##### Experiment Context (Optional)

If Eppo MCP is available and authenticated, search for experiments related to the initiative:

1. Use the INITIATIVE_NAME and VERTICAL as search terms in Eppo
2. If a relevant experiment is found, present it:
   ```
   I found a related experiment that might support your business case:

   **Experiment:** {experiment_name}
   **Primary Metric:** {metric_name}
   **Result:** {uplift}% uplift ({significant/not significant})

   Would you like to use this as your improvement estimate?
   ```
3. If the user says yes, use the experiment uplift as the improvement % and note the source
4. If Eppo is not available, not authenticated, or no matching experiment found — skip silently. Never block the flow for this.

##### Remaining Questions

Ask:
1. "Are there any additional costs that solving this would create? (e.g., new FTEs, vendor costs, maintenance)"
2. "Do you have any competitor insights? Are competitors already doing this?"

##### Draft the Section

Combine the calculator output, OKR mapping, and qualitative answers:

```
Here's what I've drafted for the Business Value / Impact section:

[Narrative paragraph explaining the benefit]

**Estimated Impact:**
[Calculator output formatted as a table or bullet points]

{If data-assisted mode was used:}
*Data sources: fulfillment-dwh-production (queried {DATE}, period: {START_MONTH}–{END_MONTH})*
*Any user-adjusted values are noted inline.*

{If experiment data was used:}
*Supported by experiment: {experiment_name} — {uplift}% {metric}*

**OKR Alignment:**
- **Company Bet:** {BET}
- **Objective:** {OBJECTIVE}
- **Key Result:** {KEY_RESULT}
- **CBO:** {CBO_NAME}

**Additional Costs:** [if any]
**Competitor Insights:** [if any]

Does this look good, or would you like to adjust any numbers?
```

Wait for confirmation before proceeding. If the user wants to adjust inputs, re-run the calculator with new values.

### Step 4: Current Process (Section 3)

Ask:
1. "How is this currently handled today?"
2. "Are there any workarounds in place? What are their limitations?"
3. "Can you walk me through the current process step by step?"

**Coaching rules for this section:**
- If they say "there's no current process" → ask: "So what happens today when this situation arises? Is it just not addressed?"
- Help them structure the answer as numbered steps
- If complex → suggest: "Would a process flow diagram be helpful? You could add one to the doc later."

Draft and confirm.

### Step 5: Desired Outcome (Section 4)

Ask:
1. "If this problem is solved successfully, what does the outcome look like? What are the deliverables?"
2. "What would you consider a success? Where is the goalpost?"
3. "Is there anything explicitly OUT of scope? Things that don't need to be solved?"
4. "What assumptions have you made in your estimates or analysis?"
5. "What open questions should the product team explore during discovery?"

**Coaching rules for this section:**
- If success criteria are vague → push: "Can you make the success criteria measurable? e.g., 'contact rate drops below X%' or 'feature live in Y markets by Q3'"
- If no out-of-scope items → suggest: "It's helpful to state what's NOT included, so everyone is aligned on boundaries."
- If no assumptions listed → prompt: "What are you assuming to be true? e.g., 'assumes current vendor pricing stays the same' or 'assumes no regulatory changes'"

Draft and confirm.

### Step 6: References (Section 5)

Ask:
1. "Do you have any supporting documents? (PRDs, dashboards, research decks, data analyses)"
2. "Where did you get the data for your estimates?"

If data-assisted mode was used, auto-populate these references:
- "Baseline metrics from fulfillment-dwh-production (BigQuery), queried on {DATE}, period {START_MONTH}–{END_MONTH}"
- If experiment data was used: "Experiment results from Eppo: {experiment_name}"

If they have no additional references beyond auto-generated ones, that's okay — note it and move on.

### Step 7: Final Review

Display the complete business case draft with all 5 sections formatted cleanly. Ask:

```
Here's your complete business case. Please review it:

## Business Case — {INITIATIVE_NAME}

### Business Problem
[section 1 content]

### Business Value / Business Impact
[section 2 content]

### Current Process
[section 3 content]

### Desired Outcome (Definition of Success)
[section 4 content]

### Reference
[section 5 content]

---

Does this look good? Say "generate" and I'll create the Google Doc for you, or tell me what to change.
```

### Step 8: Generate Google Doc

When the user approves:

1. **Copy the template**:
```
mcp__google-workspace__copy_drive_file(
  user_google_email: "miriam.velloso@talabat.com",
  file_id: "1_Uuz5xlVuGJYfLjwwbMOR1Kcre16cePmoHeqipKgV6k",
  new_name: "Business Case — {INITIATIVE_NAME}"
)
```

2. **Read the copy** to understand its structure:
```
mcp__google-workspace__inspect_doc_structure(
  user_google_email: "miriam.velloso@talabat.com",
  document_id: "{NEW_DOC_ID}",
  detailed: true
)
```

3. **Clear the template content and write the business case**.

Use `get_doc_as_markdown` to read the current content of the copied doc. Then use a combination of `find_and_replace_doc` and `batch_update_doc` to:
- Keep the header/title section
- Replace the readme/instructions section and the placeholder content under each heading with the user's actual business case content

The approach:
a. First, use `find_and_replace_doc` to replace identifiable placeholder text blocks with the user's content for each section
b. If find_and_replace doesn't work cleanly (because the placeholder text is complex), use `batch_update_doc` with delete_text + insert_text operations based on the indices from inspect_doc_structure

The goal is a clean doc with:
- The talabat logo header (keep as-is)
- Title: "Business Case — {INITIATIVE_NAME}"
- The 5 sections with the user's content
- Professional formatting (keep the template's styles)

4. **Get the shareable link**:
```
mcp__google-workspace__get_drive_shareable_link(
  user_google_email: "miriam.velloso@talabat.com",
  file_id: "{NEW_DOC_ID}"
)
```

5. **Share the result**:
```
Your business case is ready!

📄 Business Case — {INITIATIVE_NAME}
🔗 {SHAREABLE_LINK}

You can now attach this link to your Opportunity Intake submission.
```

## Error Handling

### Google Workspace Errors
- **Auth fails**: Prompt user to re-authorize Google Workspace
- **Template copy fails**: Check if user has access to the template doc
- **Doc editing fails**: Fall back to showing the text content and ask the user to copy-paste into a doc manually

### BigQuery Errors
- **BQ MCP not available**: Skip data-assisted mode entirely — offer only Manual mode in Step 3
- **BQ auth fails after 2 attempts**: Inform user, switch to Manual mode. Say: "I couldn't connect to BigQuery. Let's continue with manual entry — you can always re-run with data later."
- **Query fails — table not found**: Run table discovery (`list_datasets` → `list_tables` → `describe_table`) to find the correct table name, rebuild the query, and retry once. If still failing → fall back to Manual for that calculator only
- **Query fails — permission denied**: Report the specific dataset/table, suggest the user request Data Viewer access, fall back to Manual
- **Query returns no rows**: Inform user that no data was found for the selected vertical/market/segment combination. Offer to broaden filters (e.g., remove segment filter, try "All" markets) or switch to Manual
- **Partial data**: If some queries succeed and others fail, use available data and note gaps. Example: "Revenue data loaded from BQ. Cost data entered manually (table not accessible)."

### Eppo Errors
- **Eppo MCP not configured or unavailable**: Skip experiment context silently — do not mention Eppo to the user
- **Eppo search returns no results**: Say "No related experiments found" and move on
- **Eppo auth fails**: Skip silently, same as unavailable

### Flow Control
- **User wants to restart a section**: Allow going back to any section by name
- **User wants to skip a section**: Allow it but warn that incomplete business cases may get "Needs Clarification" status
- **User wants to switch from Data-Assisted to Manual mid-flow**: Allow it — preserve any data already collected, let user override with manual values
- **User wants to switch from Manual to Data-Assisted mid-flow**: Allow it — trigger BQ auth and run queries, then merge with any manual entries already provided
