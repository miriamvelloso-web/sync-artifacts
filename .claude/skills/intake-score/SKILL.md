---
name: intake-score
metadata:
  version: 1.0.0
description: Scores triaged submissions in the talabat Opportunity Intake Sheet on 3 weighted dimensions (Strategic Impact, Confidence, Priority) and assigns a tier. Use when the user says "score intake", "run intake scoring", "score submissions", or "intake scores".
---

# Intake Scoring Engine

Scores submissions that have already been triaged (Status = "Ready for Intake") on 3 weighted dimensions. Writes scores, total, tier, and rationale to new columns at the end of the sheet.

## Configuration

```
SPREADSHEET_ID: 1bYw6ise5wWpIrAviP5OTNdONIF0fVC5wIPPzKgHV900
USER_EMAIL: miriam.velloso@talabat.com
TABS: ["1/ Choice", "2/Experience", "3/Value", "4/Ecosystem & Growth", "5/Foundations", "6/No Related Bet"]
```

## Column Mapping

Existing columns (0–19, A–T) are defined in the intake-triage skill. Columns S–T are P&T OKR Mapping and Recommended PM. This skill adds columns U–Z:

| Index | Column | Field |
|-------|--------|-------|
| 20 | U | Strategic Impact (1–5) |
| 21 | V | Confidence Level (1–5) |
| 22 | W | Business Priority (1–5) |
| 23 | X | Total Score |
| 24 | Y | Tier |
| 25 | Z | Score Rationale |

## Scoring Rubric

### Strategic Impact (Weight: 50%)

| Score | Criteria |
|-------|----------|
| 5 | Annual impact > €15M or critical compliance / regulatory |
| 4 | Annual impact €7M–€15M or major compliance |
| 3 | Annual impact €3M–€7M or moderate measurable impact |
| 2 | Annual impact €1M–€3M or narrow single-scope impact |
| 1 | Annual impact < €1M or not quantified |

### Confidence Level (Weight: 30%)

| Score | Criteria |
|-------|----------|
| 5 | Full business case with validated data or A/B test results |
| 4 | Business case with solid financial projections |
| 3 | Business case with estimates and some assumptions |
| 2 | Rough estimates only, no formal business case |
| 1 | No data, conceptual only |

### Business Priority (Weight: 20%)

| Score | Criteria |
|-------|----------|
| 5 | Multi-market / regulatory / legal risk |
| 4 | Regional scale, affects multiple functions |
| 3 | One market, cross-functional |
| 2 | Single team scope |
| 1 | Sub-functional nice-to-have |

### Formula

```
Total Score = (Strategic Impact × 0.5) + (Confidence Level × 0.3) + (Business Priority × 0.2)
```

### Tier Assignment

| Tier | Total Score Range | Meaning |
|------|-------------------|---------|
| Prioritize | >= 4.0 | Strong case, recommend council approval |
| Discuss | 2.5 – 3.9 | Needs council review and discussion |
| Defer | < 2.5 | Lower priority, next quarter or deprioritize |

Note: "Fast-Track" is a **manual** council decision for urgent requests that bypass normal review. It is NOT score-based and is never auto-assigned by this skill.

## Execution Steps

### Step 1: Ensure Headers Exist

For each tab, read row 1 (headers) via range `'<tab>'!U1:Z1`.

If empty, write the headers:
```
mcp__google-workspace__modify_sheet_values(
  user_google_email: "miriam.velloso@talabat.com",
  spreadsheet_id: "1bYw6ise5wWpIrAviP5OTNdONIF0fVC5wIPPzKgHV900",
  range_name: "'<tab_name>'!U1:Z1",
  values: [["Strategic Impact", "Confidence Level", "Business Priority", "Total Score", "Tier", "Score Rationale"]]
)
```

Do all 6 tabs in parallel.

### Step 2: Read All Bet Tabs

Read all 6 tabs in parallel with extended range:
```
mcp__google-workspace__read_sheet_values(
  user_google_email: "miriam.velloso@talabat.com",
  spreadsheet_id: "1bYw6ise5wWpIrAviP5OTNdONIF0fVC5wIPPzKgHV900",
  range_name: "'<tab_name>'!A1:X100"
)
```

**Critical**: Rows may be truncated when trailing columns are empty. Always pad each row array to length 24 before accessing any index. Treat missing indices as empty strings.

### Step 3: Filter Qualifying Rows

For each row (index 1+ in returned data, skipping headers):
1. Extract Status (index 7), trim whitespace
2. Extract Strategic Impact (index 18), trim whitespace
3. **Qualifying**: Status is "Ready for Intake" (case-insensitive) AND Strategic Impact (index 18) is empty
4. **Skip**: Any other status (not yet triaged) or Strategic Impact already filled (already scored)
5. Also skip rows with empty Initiative Name (index 5)

Record the **sheet row number** for each qualifying row: `sheet_row = data_array_index + 1`

### Step 4: Score Each Row

For each qualifying row, read these fields for scoring context:
- Initiative Name (index 5)
- Description (index 6)
- Impact (index 8)
- Metric (index 9)
- Customer impact / Insights quality (index 10)
- Related documents (index 11)
- Theme (index 2)
- Submitter Prio (index 1)

Apply the rubric above to determine 3 sub-scores (integers 1–5). Use these guidelines:

**How to score Strategic Impact:**
- Look at Impact field for GMV/revenue numbers. Parse currency amounts (€, $, AED).
- If metric mentions compliance, regulatory, legal → lean toward 4–5.
- If no numbers at all → score 1.
- Cross-reference with Description for additional quantification.

**How to score Confidence Level:**
- Check Related Documents — a URL to a BC/PRD with data = higher confidence.
- Check Impact field — validated data or A/B results mentioned = 5, projections = 4, estimates = 3, rough = 2, nothing = 1.
- Description mentioning "tested", "validated", "proven" increases confidence.

**How to score Business Priority:**
- Check Description for scope signals: "all markets", "regional", "multi-country" = 4–5.
- Regulatory/legal/compliance language = 5.
- "Single market", "one team" = 2–3.
- "Nice to have", "exploration" = 1.

Compute:
```
total = (strategic × 0.5) + (confidence × 0.3) + (priority × 0.2)
```
Round total to 1 decimal place.

Assign tier:
- total >= 4.0 → "Prioritize"
- total >= 2.5 → "Discuss"
- total < 2.5 → "Defer"

Write a 1-line rationale summarizing the key scoring driver (e.g., "€21M GMV with full BC, multi-market regulatory" or "No quantified impact, conceptual only").

### Step 5: Generate Score Report (Dry Run)

Output a structured report:

```
## Intake Scoring Report
Scanned: X rows across Y tabs | Scoreable: Z

### "<Initiative Name>" (Tab: <tab_name>, Row <sheet_row>)
- Strategic Impact: <score>/5 — <brief reason>
- Confidence Level: <score>/5 — <brief reason>
- Business Priority: <score>/5 — <brief reason>
- **Total: <total>/5.0 → <Tier>**
- Rationale: <1-line summary>

[repeat for each row]

---
Summary: X Fast-Track | Y Discuss | Z Defer
Say "apply" to write these scores to the sheet.
```

### Step 6: Apply Mode (on user approval)

When the user says "apply" or "please start":

1. **Re-read all 6 tabs** (range A1:X100) to get current state
2. For each proposed score, verify the row still qualifies:
   - If Status has changed since dry run → skip, note "Status changed"
   - If Strategic Impact (index 18) was filled since dry run → skip, note "Already scored"
3. Write scores using a single range write per row:
   ```
   mcp__google-workspace__modify_sheet_values(
     user_google_email: "miriam.velloso@talabat.com",
     spreadsheet_id: "1bYw6ise5wWpIrAviP5OTNdONIF0fVC5wIPPzKgHV900",
     range_name: "'<tab_name>'!U<row>:Z<row>",
     values: [["<strategic>", "<confidence>", "<priority>", "<total>", "<tier>", "<rationale>"]]
   )
   ```
4. Output confirmation of all rows scored

## Error Handling

- **Tab read fails**: Skip that tab, continue with others
- **All tabs fail**: Report "Google Sheets auth may have expired" and stop
- **Short/truncated rows**: Pad to length 24 before accessing indices
- **No qualifying rows**: Report "No unscored 'Ready for Intake' rows found. Run intake-triage first if there are NEW submissions."
- **Re-score safety**: Rows with existing scores (index 18 non-empty) are always skipped
- **Stale dry run**: Re-read sheet before apply to catch manual changes
