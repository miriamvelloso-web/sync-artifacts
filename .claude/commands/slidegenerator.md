# Slide Generator — Jira to Google Slides

Browse a PM's full Jira structure, select initiatives, and generate a branded Google Slides deck.

## First-time setup

Ask the PM for:
- **Jira project key** (e.g. TLBOPS, TLBPT, GROWTH)
- **Jira cloud ID** (e.g. `deliveryhero.atlassian.net` or a UUID)
- **Google email** (for creating the Slides deck)

---

## Workflow

### Step 1: Show the full Jira structure

Fetch the complete project hierarchy:

```
mcp__atlassian__searchJiraIssuesUsingJql
  cloudId: {PM's cloud ID}
  jql: "project = {PROJECT_KEY} AND issuetype in (Epic, Initiative) ORDER BY key ASC"
  fields: ["summary", "status", "priority", "assignee", "issuetype", "labels", "parent"]
  maxResults: 100
  responseContentFormat: markdown
```

For each epic/initiative, also fetch children:

```
mcp__atlassian__searchJiraIssuesUsingJql
  jql: "parent = {EPIC_KEY} ORDER BY key ASC"
  fields: ["summary", "status", "assignee", "issuetype"]
```

Present the full tree to the PM:

```
Your Jira Structure — {PROJECT_KEY}
====================================

EPIC: {KEY-1} — {Summary} ({status})
  ├── {KEY-1a} — {child summary} ({status})
  ├── {KEY-1b} — {child summary} ({status})
  └── {KEY-1c} — {child summary} ({status})

EPIC: {KEY-2} — {Summary} ({status})
  ├── {KEY-2a} — {child summary} ({status})
  └── {KEY-2b} — {child summary} ({status})

EPIC: {KEY-3} — {Summary} ({status})
  (no children)

...
```

### Step 2: PM selects items

Ask: **"Which initiatives do you want in the deck? You can pick by number, key, or say 'all'."**

Wait for the PM to select. They might say:
- "KEY-1, KEY-3" — specific picks
- "all in progress" — filter by status
- "all" — everything
- "KEY-1 and its children" — include subtasks

### Step 3: Fetch details for selected items

For each selected initiative, get full details:

```
mcp__atlassian__getJiraIssue
  cloudId: {PM's cloud ID}
  issueIdOrKey: {ISSUE_KEY}
  responseContentFormat: markdown
```

Also search Drive for related docs:
```
mcp__google-workspace__search_drive_files
  query: "{initiative title keywords}"
  user_google_email: {PM's email}
```

### Step 4: Show slide outline for approval

Before creating slides, show the PM what the deck will look like:

```
Proposed Deck Structure:
========================
Slide 1: Title — "{PROJECT_KEY} Update — {date}"
Slide 2: Summary — {N} initiatives, status breakdown
Slide 3: {KEY-1} — {title} — status, progress, next steps
Slide 4: {KEY-2} — {title} — status, progress, next steps
...
Slide N: Key Risks & Blockers
Slide N+1: Next Steps & Timeline

Want me to generate this deck?
```

### Step 5: Generate the Google Slides deck

Create the presentation:
```
mcp__google-workspace__create_presentation
  user_google_email: {PM's email}
  title: "{PROJECT_KEY} Update — {date}"
```

Build slides using `mcp__google-workspace__batch_update_presentation`:

**Slide 1 — Title**
- Title: "{PROJECT_KEY} Update"
- Subtitle: "Week of {date range}"
- Use orange header bar (#FF5A00)

**Slide 2 — Summary Dashboard**
- Table or text boxes showing:
  - Total initiatives: {N}
  - In Progress: {count} | Blocked: {count} | Done: {count}
- Color-code statuses: green (#00B050), red (#E60000), orange (#FF5A00)

**Slides 3-N — One per initiative**
- Header: "{ISSUE_KEY} — {Summary}"
- Left column: Status, Assignee, Priority
- Right column: Key updates, progress bullets
- Bottom: Related docs (linked), next steps
- Status badge: colored shape (green/amber/red)

**Second-to-last slide — Risks & Blockers**
- Table of any blocked items with:
  - Issue key | Summary | Blocker reason | Owner

**Last slide — Next Steps**
- Bulleted list of upcoming priorities per initiative

### Step 6: Share the link

After generation, get the shareable link:
```
mcp__google-workspace__get_drive_shareable_link
  file_id: {presentation_id}
  user_google_email: {PM's email}
```

Tell the PM: **"Deck ready: {link}"**

---

## Talabat brand guidelines

Use these consistently across all slides:
- **Primary orange**: `#FF5A00` — headers, accent bars
- **Dark text**: `#1A1A1A` — body text
- **Light orange bg**: `#FFF0E6` — section headers, highlight boxes
- **Green (on track)**: `#00B050`
- **Amber (at risk)**: `#FFA500`
- **Red (blocked)**: `#E60000`
- **Font**: Use default Google Slides font (Arial)
- **Layout**: Clean, minimal — max 5 bullets per slide, no walls of text

---

## Rules

1. **Always show the Jira tree first** — let the PM pick what goes in the deck
2. **Always show the slide outline** before generating — slides are hard to restructure after
3. Keep slides **concise**: title + 3-5 bullets + status badge per initiative
4. Include **Jira links** in speaker notes (not on the slide face to keep it clean)
5. If the PM asks for a specific template or layout, adapt accordingly
