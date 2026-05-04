---
name: intake-triage
metadata:
  version: 1.0.0
description: Triages new submissions in the talabat Opportunity Intake Sheet — classifies initiatives, checks quality, assigns stakeholders, maps OKRs, and sets status. Use when the user says "run intake triage", "triage intake", "triage new submissions", or "check new intakes".
---

# Intake Triage Pipeline

Processes NEW submissions in the Opportunity Intake Sheet through 6 automated steps: classify, detect, evaluate quality, assign stakeholders, map OKRs, and set status.

## Configuration

```
SPREADSHEET_ID: 1bYw6ise5wWpIrAviP5OTNdONIF0fVC5wIPPzKgHV900
USER_EMAIL: miriam.velloso@talabat.com
TABS: ["1/ Choice", "2/Experience", "3/Value", "4/Ecosystem & Growth", "5/Foundations", "6/No Related Bet"]
```

## Column Mapping (0-indexed from row array)

| Index | Column | Field |
|-------|--------|-------|
| 0 | A | Input ID |
| 1 | B | Submitter Prio |
| 2 | C | Theme |
| 3 | D | Submission Date |
| 4 | E | Submission Quarter |
| 5 | F | Initiative Name |
| 6 | G | Description |
| 7 | H | Status |
| 8 | I | Impact |
| 9 | J | Metric |
| 10 | K | Customer impact / Insights quality |
| 11 | L | Related documents |
| 12 | M | Requester department |
| 13 | N | Requester Name |
| 14 | O | CBO |
| 15 | P | Product Tribe |
| 16 | Q | Squad |
| 17 | R | Product Owner |

## Stakeholder Mapping (per bet tab)

```
"1/ Choice":             CBO: Kedar Kulkarni,            Tribe: Tony Fadel
"2/Experience":          CBO: Khee Lim,                  Tribe: Rose Marsh
"3/Value":               CBO: Alvaro Martinez Espinosa,   Tribe: Rose Marsh
"4/Ecosystem & Growth":  CBO: Hussein Daher,             Tribe: Emily Thomas
"5/Foundations":         CBO: Sofia Simoes de Almeida,    Tribe: Sofia Simoes de Almeida
"6/No Related Bet":      CBO: (none),                    Tribe: (none)
```

## OKR Mapping Table (Q2 2026 P&T Objectives)

| Obj | Title | Match Keywords |
|-----|-------|---------------|
| O1 | Grow G&R (Fresh & Discovery) | fresh, discovery, search, add to cart, categories, grocery, retail, assortment |
| O2 | Customer & partner peace of mind | contact rate, deflection, cancellation, unavailable, complaint, support |
| O3 | Boost MAUs | MAU, acquisition, reactivation, new customers |
| O4 | Grow tPro | tPro, pro, churn, loyalty, partnership, retention |
| O5 | Topline acceleration | frequency, missions, best sellers, orders/user, incentive, topline |
| O6 | Personalisation engine | personalisation, personalization, home, ranking, relevance, recommendation, swimlane |
| O7 | Growth initiatives | beauty, dark store, dine out, health, RNPL |
| O8 | NMR & NCR | NMR, NCR, ads, sponsored, brand, incrementality |
| O9 | Global migrations & Foundations | fraud, migration, disaster recovery, tax, compliance, fintech, invoice |
| O10 | AI Power User | AI, DataMaxx, repo readiness, machine learning |

## Execution Steps

### Step 1: Read All Bet Tabs

Read all 6 tabs in parallel:
```
mcp__google-workspace__read_sheet_values(
  user_google_email: "miriam.velloso@talabat.com",
  spreadsheet_id: "1bYw6ise5wWpIrAviP5OTNdONIF0fVC5wIPPzKgHV900",
  range_name: "'<tab_name>'!A1:R100"
)
```

Read from A1 (include headers) to verify column structure. Data rows start at row index 1 (sheet row 2).

**Critical**: Rows may be truncated when trailing columns are empty. Always pad each row array to length 18 before accessing any index. Treat missing indices as empty strings.

If a tab read fails, skip it and continue. If ALL fail, stop and report auth error.

### Step 2: Filter Qualifying Rows

For each row (index 1+ in returned data, i.e., skipping headers):
1. Extract Status (index 7), trim whitespace
2. **Qualifying**: Status is "NEW" (case-insensitive) OR Status is empty/blank
3. **Skip**: Any other status — these are already in the pipeline
4. Also skip rows with empty Initiative Name (index 5) — these are blank rows

Record the **sheet row number** for each qualifying row: `sheet_row = data_array_index + 1` (since A1:R100 includes headers, array index 1 = sheet row 2, index 2 = sheet row 3, etc.)

### Step 3: Classify (New Bet vs Optimization)

For each qualifying row, read:
- Initiative Name (index 5)
- Description (index 6)
- Theme (index 2)

Use judgment to classify:
- **New Bet**: Novel initiative introducing something that does not exist today. Signals: "launch new", "build", "introduce", "create", "enable new capability", "MVP", "pilot new"
- **Optimization**: Improvement to existing feature/metric. Signals: "improve", "optimize", "increase", "reduce", "enhance", "A/B test", "boost", "grow existing", "expand to new market", "automate existing process"

When ambiguous, lean toward "Optimization" if the initiative references an existing product feature or metric. Lean toward "New Bet" if it describes a capability that does not currently exist.

This flag determines whether OKR mapping (Step 6) applies.

### Step 4: Quality Evaluation

Check 4 required fields. ALL must pass for the row to pass quality.

**Field 1 — Description (index 6)**
- PASS: Non-empty AND at least 50 characters
- FAIL: Empty, or fewer than 50 characters

**Field 2 — Impact (index 8)**
- PASS: Contains a number or currency amount or quantified estimate
- FAIL: Empty, "-", "nil", "NA", "N/A", or a request for help (e.g. "Need your assistance...")

**Field 3 — Metric (index 9)**
- PASS: Contains a named metric (GMV, MAU, NCR, orders, etc.)
- FAIL: Empty, "-", "nil", "yes", or non-metric text

**Field 4 — Related Documents (index 11)**
- PASS: Contains a URL (starts with "http") OR explicitly says "NA"/"nil"/"none"/"N/A"
- FAIL: Empty string only (submitter didn't address the field at all)

**Result**:
- ALL 4 PASS → quality_result = "PASS", new_status = "Ready for Intake"
- ANY FAIL → quality_result = "FAIL", new_status = "Needs Clarification", list which fields failed

### Step 5: Auto-Assign Stakeholders

For each qualifying row:
1. Look up the **tab name** in the Stakeholder Mapping table above
2. If tab is "6/No Related Bet" → skip assignment, note in report
3. If CBO (index 14) is empty → propose writing the mapped CBO
4. If Product Tribe (index 15) is empty → propose writing the mapped tribe
5. If CBO or Tribe is already filled (non-empty after trimming) → do NOT overwrite, note "already set"

**Never touch** Squad (index 16) or Product Owner (index 17) — those are post-acceptance.

### Step 6: OKR Mapping (Optimizations Only)

Only for rows classified as "Optimization" in Step 3.

Read the row's Metric (index 9) + Description (index 6) + Initiative Name (index 5). Match against the OKR Mapping Table using keyword matching and contextual judgment. Select the best-fit OKR (or top 2 if ambiguous).

For "New Bet" rows: report `OKR: N/A (New Bet)`

This is **informational only** — NOT written to the sheet.

### Step 7: Generate Triage Report (Dry Run)

Output a structured report:

```
## Intake Triage Report
Scanned: X rows across Y tabs | NEW/Unassigned: Z

### "Initiative Name" (Tab: <tab_name>, Row <sheet_row>)
- Type: <New Bet | Optimization>
- Quality: <PASS | FAIL> (<details — which fields passed/failed>)
- Assign: CBO → <name> (<new | already set>), Tribe → <name> (<new | already set>)
- OKR: <code> — <title> | N/A (New Bet)
- Status: <current> → <proposed new status>

[repeat for each row]

---
Summary: X Ready for Intake | Y Needs Clarification | Z skipped
Say "apply" to write these changes to the sheet.
```

### Step 8: Apply Mode (on user approval)

When the user says "apply":

1. **Re-read all 6 tabs** to get current state (prevents overwriting manual changes)
2. For each proposed change, verify the row still qualifies:
   - If Status has changed since dry run → skip, note "Status changed since dry run"
   - If CBO/Tribe was filled since dry run → skip that write
3. Write changes using:
   ```
   mcp__google-workspace__modify_sheet_values(
     user_google_email: "miriam.velloso@talabat.com",
     spreadsheet_id: "1bYw6ise5wWpIrAviP5OTNdONIF0fVC5wIPPzKgHV900",
     range_name: "'<tab_name>'!<col><row>",
     values: [["<value>"]]
   )
   ```
4. Up to 3 writes per row:
   - CBO: `'<tab>'!O<row>` (if was empty)
   - Product Tribe: `'<tab>'!P<row>` (if was empty)
   - Status: `'<tab>'!H<row>` ("Ready for Intake" or "Needs Clarification")
5. Output confirmation of all cells written
6. The intake-bot will detect status changes on its next hourly tick and send DMs automatically

## Error Handling

- **Tab read fails**: Skip that tab, continue with others
- **All tabs fail**: Report "Google Sheets auth may have expired" and stop
- **Short/truncated rows**: Pad to length 18 before accessing indices
- **"6/No Related Bet" rows**: Quality check + status update still apply, but no stakeholder assignment
- **Re-triage safety**: Rows already triaged (status no longer NEW/empty) are automatically skipped
- **Stale dry run**: Re-read sheet before apply to catch manual changes made between dry run and apply
