# Toon — Weekly Update Draft

Generate a weekly P&T update in Toon's official format. Pulls recent activity across active initiatives, filters to only what genuinely shipped/progressed, and drafts a CEO-scannable update.

**Output format:** Email-style update following Toon's mandated 3-section structure.
**Subject line:** `[P&T update] [Week {NN}] - Value - Home & Personalization`

## First-time setup

Ask the PM for:
- **Jira project key** (e.g. TLBOPS, TLBPT, GROWTH)
- **Jira cloud ID** (e.g. `deliveryhero.atlassian.net` or a UUID)
- **Google email** (for searching Drive/Slack for related docs)

Store these for the session so they don't need to repeat them.

---

## Workflow

### Step 1: Scan the board

Fetch all active initiatives:

```
mcp__atlassian__searchJiraIssuesUsingJql
  cloudId: {PM's cloud ID}
  jql: "project = {PROJECT_KEY} AND status != Done ORDER BY key ASC"
  fields: ["summary", "status", "priority", "assignee", "updated", "description", "labels", "issuetype"]
  maxResults: 50
  responseContentFormat: markdown
```

List all results to the PM:
```
Found {N} active initiatives:
- {KEY-1} — {Summary} ({status})
- {KEY-2} — {Summary} ({status})
...
```

### Step 2: Identify recent activity

For each initiative updated in the **last 7 days**, fetch recent comments:

```
mcp__atlassian__getJiraIssue
  cloudId: {PM's cloud ID}
  issueIdOrKey: {ISSUE_KEY}
  expand: "changelog"
  responseContentFormat: markdown
```

Also fetch child issues (subtasks/stories under epics):

```
mcp__atlassian__searchJiraIssuesUsingJql
  jql: "parent = {ISSUE_KEY} AND updated >= -7d ORDER BY updated DESC"
  fields: ["summary", "status", "assignee", "updated"]
```

### Step 3: Enrich with context

Search Google Drive for related docs updated this week:
```
mcp__google-workspace__search_drive_files
  query: "{initiative keywords}"
  user_google_email: {PM's email}
```

Search Slack for relevant discussions:
```
mcp__Slack__search_messages
  query: "{initiative keywords}"
  limit: 5
```

Search for visuals — PRDs, mockups, screenshots in linked docs:
```
mcp__google-workspace__get_doc_as_markdown
  document_id: {linked PRD doc ID}
  user_google_email: {PM's email}
```

### Step 4: Draft the update — Toon's official format

**CRITICAL: Only include initiatives that genuinely shipped or progressed this week.** Quality over quantity. Read the draft as a CEO would — if anything feels vague or unnecessary, cut it.

Draft the email in this exact structure:

```
Subject: [P&T update] [Week {NN}] - Value - Home & Personalization

1. What shipped / progressed this week:

{Initiative Name}
{Jira URL}
Status: {3 sentences on current state — prototype/live, shipped to whom, where}
Demo/prototype: {Image / GIF / Video — link or placeholder}
Progress: {X% complete}
Rationale: {1-2 sentences max}
Expected Impact: {1-2 sentences; include data where available}

{Repeat for each initiative that ACTUALLY shipped/progressed}


2. Focus for next week:
{Initiative name}: {brief description and why we're doing it}
{Initiative name}: {brief description and why we're doing it}
{Initiative name}: {brief description and why we're doing it}

3. Blockers and support needed
Blocker: {2-3 sentences max}
Decision/support needed: {What do you need, and from whom?}

Regards,
{PM name}
```

### Formatting rules (from Toon directly)

1. **Keep it short and on point** — no filler
2. **Only updates that actually matter** — quality over quantity, don't pad to look busy
3. **No inflated text** — simple formatting, easy to scan
4. **Add visuals where possible** — screenshots, GIFs, demos make it real
5. **CEO sanity check** — read as Toon would. Cut anything vague or unnecessary

### Step 5: Present for review

Show the complete email draft to the PM. Format it branded (talabat styling if sending as HTML).

Ask: **"Want me to create this as a Gmail draft, send it, or edit anything?"**

### Step 6: Act on PM's choice

- **Gmail draft**: Use `mcp__google-workspace__draft_gmail_message` with HTML body
- **Send directly**: Use `mcp__google-workspace__send_gmail_message` — ask for recipients
- **Export as MD**: Save to `~/Desktop/toon-update-week-{NN}-{YYYY-MM-DD}.md`
- **Edit**: Apply changes and re-show

---

## Rules

1. **Never send without explicit approval** — always show drafts first
2. **No repetition from last week** — compare against prior week's output. Only surface what genuinely moved this week
3. **Only shipped/progressed items in Section 1** — if it didn't move, it doesn't belong
4. **Include visuals** — screenshots from PRDs, Figma links, demo GIFs. Check linked Google Docs for UI mockups
5. **CEO scan test** — every line must earn its place. If Toon would skip it, cut it
6. If Drive/Slack search finds nothing, skip — don't include empty sections
7. **No activity = no mention** — don't list "no activity" initiatives, just omit them
8. Keep Section 2 (focus for next week) to 3-5 initiatives max
9. Section 3 (blockers) — only include if there are real blockers. If none, write "No blockers this week"
