---
name: intake-bot
metadata:
  version: 1.0.0
description: Monitors the talabat Opportunity Intake Sheet for status changes and sends Slack DMs to submitters. Use when the user says "run intake bot", "check intake statuses", "intake notifications", or "start intake bot".
---

# Intake Status Bot

Monitors the Opportunity Intake Sheet for status changes and sends Slack DMs to submitters automatically.

## Configuration

```
SPREADSHEET_ID: 1bYw6ise5wWpIrAviP5OTNdONIF0fVC5wIPPzKgHV900
USER_EMAIL: miriam.velloso@talabat.com
STATE_FILE: /Users/miriam.velloso/.claude/intake-bot-state.json
TABS: ["1/ Choice", "2/Experience", "3/Value", "4/Ecosystem & Growth", "5/Foundations", "6/No Related Bet"]
```

## Column Mapping (0-indexed from row array)

| Index | Column | Field |
|-------|--------|-------|
| 5 | F | Initiative Name |
| 6 | G | Description |
| 7 | H | Status |
| 8 | I | Impact |
| 12 | M | Requester Department |
| 13 | N | Requester Name |
| 14 | O | CBO |
| 15 | P | Product Tribe |
| 17 | R | Product Owner |

## Execution Steps

When invoked, follow these steps in order:

### Step 1: Load State
Read the state file from `/Users/miriam.velloso/.claude/intake-bot-state.json`.
If the file does not exist, this is a **bootstrap run** — create an empty state:
```json
{"last_run": null, "slack_user_cache": {}, "lookup_failures": {}, "rows": {}}
```

### Step 2: Read All Bet Tabs
For each tab in the TABS list, call:
```
mcp__google-workspace__read_sheet_values(
  user_google_email: "miriam.velloso@talabat.com",
  spreadsheet_id: "1bYw6ise5wWpIrAviP5OTNdONIF0fVC5wIPPzKgHV900",
  range_name: "'<tab_name>'!A2:R100"
)
```
Skip row 1 (headers). Read all tabs in parallel when possible.

### Step 3: Detect Status Changes
For each row in each tab:
1. Extract initiative name (idx 5), status (idx 7), submitter name (idx 13)
2. Build the row key: `"<initiative_name>|<submitter_name>"`
3. Look up the key in `state.rows[tab_name]`
4. **If key not in state**: This is a new row.
   - If status is "NEW" or empty → just record it, no DM (submitter just submitted)
   - If status is anything else → queue a notification (row existed before bot started)
5. **If key in state and status changed** → queue a notification
6. **If key in state and status unchanged** → skip

### Step 4: Resolve Slack Users (for queued notifications only)
For each submitter name that needs a DM:
1. Clean the name: strip leading `@`, trim whitespace
2. Check `slack_user_cache` — if present and cached less than 24 hours ago, use it
3. If not cached, search Slack:
   ```
   mcp__Slack__search_users(query: "<cleaned_name>")
   ```
4. Match criteria:
   - Exact `real_name` match (case-insensitive) = best
   - `display_name` match = good
   - Contains all words from search = acceptable
5. If no match found → log to `lookup_failures`, increment attempts count. After 5 failures, mark permanently unresolved. Skip this DM.
6. Cache the result in `slack_user_cache`

### Step 5: Send DMs
For each queued notification with a resolved Slack user:
1. Select the message template based on the NEW status (see templates below)
2. Fill in the template with row data
3. Send via Slack:
   ```
   mcp__Slack__send_message(channel: "<user_slack_id>", text: "<message>")
   ```
   Note: Sending to a user ID opens/uses the DM channel automatically.
4. If send succeeds → update the row state with new status and `last_notified` timestamp
5. If send fails → set `send_failed: true` in row state (retry next tick)

### Step 6: Update State File
Write the updated state back to the state file using Bash:
```bash
cat > /Users/miriam.velloso/.claude/intake-bot-state.json << 'STATEEOF'
<updated JSON>
STATEEOF
```

### Step 7: Report Summary
Output a brief summary:
- Rows scanned / tabs checked
- Status changes detected
- DMs sent successfully
- Failures (user not found, send failed)
- If bootstrap: "Bootstrap complete. Tracking X rows. No DMs sent."

## Message Templates

### Accepted / Intake process accepted
```
:tada: *Great news — your initiative has been accepted!*

`<initiative_name>`
_Bet: <tab_name>_

:busts_in_silhouette: *Your team*
• Product Owner: <product_owner>
• Product Tribe: <product_tribe>
• CBO: <cbo>

:arrow_forward: *What happens next*
The product owner will reach out to kick off scoping. No action needed from you right now.
```

### In Review
```
:mag: *Your initiative is now under review*

`<initiative_name>`
_Bet: <tab_name>_

:busts_in_silhouette: *Reviewers*
• Product Owner: <product_owner>
• CBO: <cbo>

We'll notify you as soon as a decision is reached. No action needed.
```

### Needs More Info / Needs Clarification
```
:rotating_light: *Action needed — the review team has questions*

`<initiative_name>`
_Bet: <tab_name>_

:memo: *What you submitted*
> <description_first_150_chars>...
> _Impact: <impact_first_150_chars>_

:point_right: *Please update your submission* with the additional details requested:
<sheet_url|Open Intake Sheet>
```

### Ready for Review
```
:inbox_tray: *Your initiative is queued for review*

`<initiative_name>`
_Bet: <tab_name>_

• CBO: <cbo>
• Product Tribe: <product_tribe>

You'll be notified when the review kicks off. Nothing needed from you right now.
```

### Rejected
```
:no_entry_sign: *Initiative not moving forward this cycle*

`<initiative_name>`
_Bet: <tab_name>_

This doesn't mean the idea isn't valuable — it may be revisited in a future cycle based on priorities.

:speech_balloon: For context on the decision, reach out to *<cbo>*.
```

### Backlog
```
:file_folder: *Initiative added to backlog*

`<initiative_name>`
_Bet: <tab_name>_

Your initiative has been acknowledged and added to the backlog for consideration in a future cycle. We'll notify you if the status changes.

:speech_balloon: Questions? Reach out to *<cbo>*.
```

### Product Review
```
:microscope: *Initiative is in product review*

`<initiative_name>`
_Bet: <tab_name>_

The product team is evaluating feasibility and scope.

:busts_in_silhouette: *Reviewing*
• Product Owner: <product_owner>
• Product Tribe: <product_tribe>

We'll keep you posted. No action needed.
```

### Generic (catch-all)
```
:arrows_counterclockwise: *Status update on your initiative*

`<initiative_name>`
_Bet: <tab_name>_

• Previous status: <old_status>
• New status: *<new_status>*

:speech_balloon: Questions? Reach out to *<cbo>*.
```

### Template Selection Logic
```
Accepted / Intake process accepted → Accepted template
Rejected → Rejected template
Needs More Info / Needs Clarification → Needs Clarification template
In Review → In Review template
Ready for Review → Ready template
Backlog → Backlog template
Product Review → Product Review template
Anything else → Generic template
```

## Scheduling

To run on a schedule:
```
CronCreate(
  cron: "7 * * * *",
  prompt: "/intake-bot",
  recurring: true
)
```
This runs hourly at :07. The 7-day CronCreate expiry means the user needs to restart weekly.

To run manually: user says "run intake bot" or "/intake-bot".

## Error Handling

- **Slack not authenticated**: If any Slack tool call fails with auth error, log "Slack auth expired — please run mcp__Slack__authenticate" and stop.
- **Sheet read fails for one tab**: Log the error, skip that tab, continue with others.
- **All sheet reads fail**: Log "Google Sheets auth may have expired" and stop.
- **User lookup fails**: Log the name, skip that DM, continue. Retry next tick (up to 5 times).
- **DM send fails**: Flag `send_failed: true` in state. Retry next tick. Do NOT re-detect as a new change.
- **Empty submitter name**: Skip the row entirely.
