---
name: sync
metadata:
  version: 0.2.0
description: >-
  Universal PM tool: route initiative updates to Jira, Google Docs, Google Slides,
  Slack, and email. Also generates branded slide decks from Jira and drafts weekly
  updates. Works for any PM — onboarding discovers their project, artifacts, and channels.
  Use when the user says "/sync", "sync updates", "push updates", "sync initiatives",
  "generate slides", "weekly update", or "draft updates".
---
<!-- Roles: PM -->

# /sync — Universal PM Initiative Router

Works for **any PM**. Onboarding discovers their Jira project, artifacts, and notification channels. All PM-specific config is stored in a per-PM sync registry memory file — nothing is hardcoded.

## Modes

| Command | What it does |
|---------|-------------|
| `/sync [updates]` | Parse updates from any input, push to all registered destinations |
| `/sync slides` | Generate a branded Google Slides deck from the PM's Jira board |
| `/sync weekly` | Draft weekly update in Toon's 3-section format (shipped / next week / blockers) |
| `/sync experiment` | Draft an experiment launch or results email for an initiative |
| `/sync artifacts` | Generate branded slide decks (experiments, lightspeed, MPR) from live data |
| `/sync add [URL \| slack \| email]` | Register a new destination |
| `/sync status` | Show the current sync registry |
| `/sync remove [name]` | Remove a destination |
| `/sync test [destination]` | Send a test message to verify connectivity |

---

## 0. Onboarding (first run only)

Check if a sync registry memory exists for this PM (search MEMORY.md for "sync registry" or "sync_registry_{PM_NAME}"). If found, load it and skip to the requested mode.

If no registry exists:

### a) Identify the PM

Ask for:
- **Name** (used to name the registry file, e.g. `sync_registry_ahmed.md`)
- **Jira project key** (e.g. HOMESQUAD, TLBOPS, GROWTH)
- **Jira cloud ID** (e.g. `deliveryhero.atlassian.net`)
- **Google email** (for Docs, Slides, Drive, Gmail access)

### b) Discover Jira structure

Fetch the full project hierarchy:

```
mcp__atlassian__searchJiraIssuesUsingJql
  cloudId: {PM's cloud ID}
  jql: "project = {PROJECT_KEY} AND issuetype in (Epic, Initiative) ORDER BY key ASC"
  fields: ["summary", "status", "priority", "assignee", "issuetype", "labels", "parent"]
  maxResults: 100
  responseContentFormat: markdown
```

For each epic/initiative, fetch children:

```
mcp__atlassian__searchJiraIssuesUsingJql
  jql: "parent = {EPIC_KEY} ORDER BY key ASC"
  fields: ["summary", "status", "assignee", "issuetype"]
```

Present the full tree:

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
...
```

Store the initiative list in the registry: `{initiative name} → {epic key}`.

### c) Register artifacts (optional)

Ask: "Do you have any source-of-truth documents (Google Docs, Slides) for your initiatives? Paste the URL(s), or say 'skip' to set up later."

For each URL:
- Detect artifact type from URL
- Verify read+write access via MCP tools
- Discover structure:
  - **Google Doc**: list all tabs with IDs and titles (`mcp__google-workspace__inspect_doc_structure`)
  - **Google Slides**: list all slides with IDs and content summaries (`mcp__google-workspace__get_presentation`)
- Present the structure
- Ask which sections/tabs/slides map to which initiatives

### d) Register channels (optional)

Ask: "Do you want /sync to notify stakeholders via Slack or email? You can set this up now or later with `/sync add slack`."

If yes for **Slack**: ask which channels, which initiatives per channel, and format preference (detailed/summary/executive).

If yes for **email**: ask recipients, triggers, and frequency (immediate/daily/weekly digest).

### e) Discover context sources for weekly updates

Ask: "For weekly updates, I can pull context from Slack channels, Google Drive docs, and Gmail threads. Do you have specific channels or docs per initiative?"

Accept natural language:
- "#my-channel is about Screen Ranker"
- "Rana Hegazi emails about VLP rollout"
- "Doc ID abc123 is the rollout plan for KEY-42"

Store as `context_sources` in the registry:

```yaml
context_sources:
  {EPIC_KEY}:
    slack_channels:
      - id: "C0XXXX"
        name: "#channel-name"
    slack_keywords: ["screen ranker", "VLP"]
    drive_docs:
      - id: "abc123"
        name: "Rollout Plan"
    gmail_contacts: ["rana.hegazi@talabat.com"]
    gmail_keywords: ["screen ranker"]
```

If the PM doesn't know or wants to skip: store empty lists. `/sync weekly` will still work using keyword search based on initiative names.

### f) Save the sync registry

Write a reference memory file named `sync_registry_{pm_name}.md` containing:

```yaml
pm:
  name: "{PM name}"
  email: "{google email}"
  jira_cloud_id: "{cloud ID}"
  jira_project: "{PROJECT_KEY}"

jira:
  initiatives:
    "{Initiative Name}": "{EPIC_KEY}"
    ...

artifacts: [...]    # Google Docs, Slides with mapped sections

channels: [...]     # Slack channels, email routes with trigger/format rules

context_sources:    # Per-initiative Slack channels, Drive docs, Gmail contacts
  {EPIC_KEY}: {...}
```

Add to MEMORY.md index. Confirm setup to the PM.

---

## Mode: `/sync [updates]` — Push Updates

### 1. Parse Updates

Read the PM's input and extract structured updates per initiative:

- **Input formats accepted:** plain text, images/screenshots, PDFs, pasted Slack messages, meeting notes, Google Doc URLs, any combination
- **Extract per initiative:**
  - What changed (status, scope, metrics, design, setup, decisions)
  - Which canonical fields are affected (targeting, traffic split, expected impact, timeline, etc.)
  - New artifacts (dashboard links, documents, design mockups)
  - Action items or new tickets needed (with owner and priority if mentioned)
  - **Experiment signals**: detect if this is an experiment launch or conclusion (keywords: "launched", "experiment started", "live", "results", "concluded", "win", "loss", "inconclusive", "ship", "kill"). If detected, flag for experiment email suggestion in the routing plan.

### 2. Load Sync Registry

Read the PM's sync registry from memory. Identify:
- Which initiatives are mentioned in the updates
- Which Jira epics they map to
- Which artifacts contain sections for those initiatives
- Which channels should be notified

### 3. Route Updates to Destinations

Build and present the routing plan:

```
Update: "Screen Ranker experiment results: +2.1% clicks, p=0.03, 14-day readout"
  → Jira: HOMESQUAD-967 (comment with experiment results)
  → Google Doc: tab "SR MVP rollout" (inline: update metrics table + append: results log)
  → Generated Deck: slide for HOMESQUAD-967 (update Progress column with results, change status badge to green)
  → Slack: #perso-updates (summary with Eppo link)

Update: "Coffee tile experiment blocked — DineOut integration delayed"
  → Jira: HOMESQUAD-992 (comment + status transition)
  → Google Doc: tab "Coffee tile time-based experiment" (update status field)
  → Generated Deck: slide for HOMESQUAD-992 (update status badge to red, add blocker text) + Risks slide
  → Slack: #perso-updates (blocker alert)

🔬 Experiment detected in update 1 — "Screen Ranker experiment results"
  → Suggest: "Want me to also draft an experiment results email? (`/sync experiment`)"
```

Ask: "Here's what I'll update. Proceed?"

### 4. Update Jira

For each affected initiative:
- Add a comment to the epic with the update summary
- Add comments to relevant child stories if directly affected
- Transition story statuses where appropriate
- Create new tickets if action items were identified (with assignee and priority)
- Update issue descriptions if scope/setup changed

```
mcp__atlassian__addCommentToJiraIssue
  cloudId: {PM's cloud ID}
  issueIdOrKey: {EPIC_KEY}
  commentBody: {update text}
  contentFormat: markdown
```

### 5. Update Artifacts

#### Google Doc adapter

**a) Read current state:**
- Fetch doc with tab content (`mcp__google-workspace__inspect_doc_structure`)
- Find target tab, identify indices of canonical fields

**b) Edit canonical fields inline (CRITICAL):**
- Update table cells, summary rows, key figures directly
- Process edits from highest index to lowest to avoid index shifts
- Preserve formatting (bold, italic) when replacing styled text

**c) Append status log entry:**
- Timestamped section at end of tab: `## [Date] Title`
- Include narrative update, setup changes, links, action items

**d) Execute:**
- Batch all requests per tab
- Order: inline edits (high→low index) before appends

#### Google Slides adapter

**Two slide sources:**

1. **Registered Slides artifacts** (manually added via `/sync add`):
   - **append_on_top:** New slide(s) at position 0. Existing slides = history.
   - **update_existing:** Find mapped slide(s), update text/tables in place.

2. **Generated deck** (created by `/sync slides`, stored in `generated_deck`):
   - Always **update_existing** — find the initiative's slide by `epic_key` in the registry's `generated_deck.slides` mapping.

**Update flow for generated deck:**

a) Read the registry's `generated_deck` to find `presentation_id` and the slide `object_id` for the affected initiative.

b) Read current slide state:
```
mcp__google-workspace__get_page
  presentation_id: {generated_deck.presentation_id}
  page_object_id: {slide object_id for this initiative}
  user_google_email: {PM's email}
```

c) Build update requests — what to change depends on the update type:
- **Experiment metrics update:** Replace the "Progress" column bullets with new results (conversion rates, lift, p-values, sample sizes). Add Eppo experiment link if available.
- **Status change:** Update the status badge color and text.
- **Scope/timeline change:** Update the "Setup" column and "Next steps" section.
- **New blocker:** Update the "Risks & Blockers" slide too (find via `type: risks` in slide mapping).

d) Execute via `batch_update_presentation`:
- Use `replaceAllText` for text placeholder updates
- Use `updateShapeProperties` for status badge color changes
- Use `insertText` + `deleteText` for replacing bullet content in specific text boxes

e) Update `generated_deck.last_updated` in the registry.

**Operations for registered Slides artifacts:**
- Read slide structure (`mcp__google-workspace__get_presentation`)
- Replace text placeholders or table cells
- Create new slides if append mode
- Preserve slide master/layout styling

### 6. Notify Channels

Runs last — notifications link to already-updated artifacts.

For each registered channel, check trigger level → generate message in correct format → deliver.

#### Slack adapter

```
mcp__Slack__send_message
  channel_id: {channel ID from registry}
  text: {formatted message}
  thread_ts: {previous thread ts, if continuing}
```

**Format by level:**
- **detailed:** Initiative name, what changed, metrics, links to Jira + artifact, action items
- **summary:** One-line per initiative with links
- **executive:** Single line with key outcome

#### Email adapter

- Use `mcp__google-workspace__send_gmail_message` or compose for manual send
- Batch for digest frequencies

### 7. Verify & Report

Re-read modified sections, confirm Jira comments posted, report failures.

Present summary table:

| Initiative | Jira | Artifacts | Channels | Changes |
|---|---|---|---|---|
| Screen Ranker | KEY-967 ✓ | Doc ✓ Slides ✓ | #updates ✓ | Launched, 33/33/33 |

---

## Mode: `/sync slides` — Generate Slide Deck from Jira

Generates a single branded Google Slides presentation with **one slide per initiative**, grouped under the quarter's OKR and KR hierarchy. Uses the sync registry for PM config and OKR context.

### Step 1: Resolve the OKR hierarchy

If the registry already has `okr_hierarchy`, use it. Otherwise, for each tracked initiative:

a) Get the initiative's parent (the KR):
```
mcp__atlassian__getJiraIssue
  cloudId: {PM's cloud ID}
  issueIdOrKey: {INITIATIVE_KEY}
  fields: ["summary", "status", "parent"]
```

b) Get the KR's parent (the Objective):
```
mcp__atlassian__getJiraIssue
  cloudId: {PM's cloud ID}
  issueIdOrKey: {KR_KEY}
  fields: ["summary", "status", "parent"]
```

Build the tree: `Objective → KR → Initiative(s)`.

### Step 2: Fetch details for each initiative

For each initiative, fetch full details + child issues **in parallel**:

```
mcp__atlassian__getJiraIssue
  cloudId: {PM's cloud ID}
  issueIdOrKey: {EPIC_KEY}
  responseContentFormat: markdown
```

```
mcp__atlassian__searchJiraIssuesUsingJql
  jql: "parent = {EPIC_KEY} ORDER BY key ASC"
  fields: ["summary", "status", "assignee", "updated"]
```

Also search Drive for related docs:
```
mcp__google-workspace__search_drive_files
  query: "{initiative title keywords}"
  user_google_email: {PM's email}
```

### Step 3: Show slide outline for approval

Present the outline grouped by OKR:

```
Proposed Deck — Q2 2026 Personalization Update
================================================
Slide 1: Title — "Q2 2026 — Personalization Update"

── O6. Establish a personalisation engine that drives growth ──

Slide 2: KR1 — Increase component clicks/session by 1.5%
  └ Initiative: Screen Ranker Home (HOMESQUAD-967)
     Status, progress, child stories, next steps

Slide 3: KR2 — Increase Home orders/user by 0.3%
  └ Initiative: Coffee Tile Time-Based Experiment (HOMESQUAD-992)
     Status, progress, child stories, next steps

Slide 4: KR3 — Enable personalization decision-making at scale
  └ Initiative: Personalization Orchestrator MVP (HOMESQUAD-1012)
     Status, progress, child stories, next steps

Slide 5: Risks & Blockers
Slide 6: Next Steps & Timeline

Want me to generate this deck?
```

### Step 4: Generate Google Slides

Create the presentation:
```
mcp__google-workspace__create_presentation
  user_google_email: {PM's email}
  title: "Q{quarter} {year} — {Objective area} Update"
```

Build slides using `mcp__google-workspace__batch_update_presentation`:

**Slide 1 — Title**
- Title: "Q{quarter} {year} — {Objective area} Update"
- Subtitle: "{PM name} — {date}"
- Orange header bar (#FF5A00)

**Slides 2–N — One per initiative (grouped by KR)**

Each initiative slide layout:

```
┌──────────────────────────────────────────────────────────┐
│  [OKR CONTEXT BAR — light orange #FFF0E6]               │
│  O6. Establish a personalisation engine...               │
│  KR1. Increase component clicks/session by 1.5%         │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Screen Ranker Home — Experimentation & Rollout          │
│  HOMESQUAD-967                         [STATUS BADGE]    │
│                                                          │
│  ┌─────────────────────┐  ┌────────────────────────────┐ │
│  │ Setup               │  │ Progress                   │ │
│  │ • Status: Experiment│  │ • Launched in 3 markets     │ │
│  │ • Assignee: Adrian  │  │ • 33/33/33 split active     │ │
│  │ • Priority: Medium  │  │ • Monitoring phase started  │ │
│  │ • Epic: 967         │  │                             │ │
│  └─────────────────────┘  └────────────────────────────┘ │
│                                                          │
│  Child stories: 4 Done, 2 In Progress, 1 To Do          │
│                                                          │
│  Next steps:                                             │
│  • Read out results week 3                               │
│  • Prepare rollout decision                              │
│                                                          │
│  Docs: [Strategy Doc] [PRD]                              │
├──────────────────────────────────────────────────────────┤
│  [Footer — Jira link: deliveryhero.atlassian.net/...]    │
└──────────────────────────────────────────────────────────┘
```

Key elements per slide:
- **OKR context bar** (top): Objective name + KR name in light orange (#FFF0E6) background
- **Initiative title**: Bold, large — the epic summary
- **Status badge**: Colored shape — green (#00B050) on track, amber (#FFA500) at risk, red (#E60000) blocked
- **Left column**: Setup metadata (status, assignee, priority)
- **Right column**: Progress bullets (from Jira description, recent comments, child story status)
- **Child story summary**: counts by status (Done / In Progress / To Do)
- **Next steps**: Inferred from context
- **Doc links**: Links to strategy doc tab and any related Drive docs
- **Footer**: Jira epic link (small, gray)

**Second-to-last slide — Risks & Blockers**
- Table: Initiative | Issue key | Blocker | Owner
- Only include if any initiatives have blockers

**Last slide — Next Steps & Timeline**
- Bulleted list of upcoming priorities across all initiatives
- Key dates / milestones

### Step 5: Save deck to registry

After generating, read the presentation structure to capture slide object IDs:

```
mcp__google-workspace__get_presentation
  presentation_id: {new presentation ID}
  user_google_email: {PM's email}
```

Map each slide's object ID to its initiative. Save to the sync registry:

```yaml
generated_deck:
  presentation_id: "1abc..."
  url: "https://docs.google.com/presentation/d/1abc.../edit"
  created: "2026-04-26"
  last_updated: "2026-04-26"
  slides:
    - object_id: "p1"
      type: title
    - object_id: "g2f3..."
      type: initiative
      epic_key: "HOMESQUAD-967"
      kr_key: "TLBPT-319"
    - object_id: "g4a1..."
      type: initiative
      epic_key: "HOMESQUAD-992"
      kr_key: "TLBPT-318"
    - object_id: "g5b2..."
      type: initiative
      epic_key: "HOMESQUAD-1012"
      kr_key: "TLBPT-327"
    - object_id: "g6c3..."
      type: risks
    - object_id: "g7d4..."
      type: next_steps
```

Update the sync registry memory file with the `generated_deck` section. This allows `/sync [updates]` to find and update specific slides later.

### Step 6: Share

```
mcp__google-workspace__get_drive_shareable_link
  file_id: {presentation_id}
  user_google_email: {PM's email}
```

Tell the PM: **"Deck ready: {link} — future `/sync` updates will update these slides automatically."**

### Subsequent runs

If the registry already has a `generated_deck`, ask the PM:
- **"Update existing deck"** — refresh all slides with latest Jira data
- **"Create new deck"** — generate a fresh presentation (and replace the registry entry)

For **update existing**, re-fetch initiative details and use `batch_update_presentation` with `replaceAllText` and shape updates targeting the stored slide object IDs. Don't recreate slides — update them in place.

---

## Mode: `/sync weekly` — Draft Weekly Update (Toon Format)

Scans the PM's Jira board for recent activity, gathers context from Slack, Drive, and Gmail, and drafts a CEO-scannable weekly update in Toon's official 3-section format.

**Output:** Email draft with subject `[P&T update] [Week {NN}] - Value - Home & Personalization`

### Step 1: Scan the board

Fetch all active (non-Done) initiatives:

```
mcp__atlassian__searchJiraIssuesUsingJql
  cloudId: {PM's cloud ID}
  jql: "project = {PROJECT_KEY} AND status != Done ORDER BY key ASC"
  fields: ["summary", "status", "priority", "assignee", "updated", "description", "labels", "issuetype"]
  maxResults: 50
  responseContentFormat: markdown
```

Show the PM what was found. Identify which initiatives were updated in the **last 7 days**.

### Step 2: Gather context per initiative

For EACH initiative updated in the last 7 days, run ALL of these **in parallel**:

#### 2a. Jira details + child issues

```
mcp__atlassian__getJiraIssue
  cloudId: {PM's cloud ID}
  issueIdOrKey: {ISSUE_KEY}
  expand: "changelog"
  responseContentFormat: markdown
```

```
mcp__atlassian__searchJiraIssuesUsingJql
  jql: "parent = {ISSUE_KEY} AND updated >= -7d ORDER BY updated DESC"
  fields: ["summary", "status", "assignee", "updated"]
```

#### 2b. Slack

If registry has `context_sources.{EPIC_KEY}.slack_channels`, read history for those channels:

```
mcp__Slack__read_channel_history
  channel_id: {channel_id}
  limit: 50
```

Also do keyword searches using initiative name + any stored keywords:

```
mcp__Slack__search_messages
  query: "{initiative keywords}"
  limit: 5
```

#### 2c. Google Drive + Visuals

If registry has `context_sources.{EPIC_KEY}.drive_docs`, check those docs for recent changes.

Also search broadly:
```
mcp__google-workspace__search_drive_files
  query: "{initiative keywords}"
  user_google_email: {PM's email}
```

**Search for visuals** — PRDs, mockups, screenshots in linked Google Docs:
```
mcp__google-workspace__get_doc_as_markdown
  document_id: {linked PRD doc ID}
  user_google_email: {PM's email}
```

Look for embedded images, Figma links, demo GIFs — these are critical for the update.

#### 2d. Gmail

Search the PM's inbox for threads from the past 7 days:

```
mcp__google-workspace__search_gmail_messages
  user_google_email: {PM's email}
  query: "{keywords OR contact name} newer_than:7d"
  page_size: 5
```

If registry has `context_sources.{EPIC_KEY}.gmail_contacts`, search for those contacts too.

### Step 3: Filter — only what genuinely shipped/progressed

**CRITICAL GATE:** Before drafting, apply the CEO scan test:
- Did this initiative actually ship or progress this week?
- Is there something concrete to show (demo, screenshot, metric)?
- Would Toon find this update vague or filler? If yes → cut it.

Only initiatives that pass this filter go into Section 1. Everything else goes to Section 2 (next week focus) or gets dropped entirely.

**No repetition:** Compare against prior week's output. Strip anything that appeared last week.

### Step 4: Draft the update — Toon's official format

```
Subject: [P&T update] [Week {NN}] - Value - Home & Personalization


1. What shipped / progressed this week:

{Initiative Name}
{Jira URL: https://{cloud_host}/browse/{EPIC_KEY}}
Status: {3 sentences on current state — prototype/live, shipped to whom, where}
Demo/prototype: {Image / GIF / Video link or placeholder}
Progress: {X% complete}
Rationale: {1-2 sentences max}
Expected Impact: {1-2 sentences; include data where available}

{Repeat ONLY for initiatives that genuinely shipped/progressed}


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

### Step 5: Present for review

Show the complete email draft to the PM.

Ask: **"Want me to create this as a Gmail draft, send it, or edit anything?"**

### Step 6: Act on PM's choice

- **Gmail draft**: `mcp__google-workspace__draft_gmail_message` with the update as body
- **Send directly**: `mcp__google-workspace__send_gmail_message` — ask for recipients
- **Export as MD**: Save to `~/Desktop/toon-update-week-{NN}-{YYYY-MM-DD}.md`
- **Post to Jira**: Also post per-initiative summaries as Jira comments if requested

```
mcp__atlassian__addCommentToJiraIssue
  cloudId: {PM's cloud ID}
  issueIdOrKey: {ISSUE_KEY}
  commentBody: {draft text}
  contentFormat: markdown
```

### Step 7: Push to other destinations (optional)

After the email is created, offer to also update other registered destinations:
- If a Google Doc has mapped tabs for these initiatives → update inline fields + append status log
- If a `generated_deck` exists for any updated initiatives → update the corresponding slides
- If channels are registered with `trigger: all` → send Slack notifications
- Follow the same routing logic as `/sync [updates]` mode

### Toon format rules (mandatory)

1. **Keep it short and on point** — no filler
2. **Only updates that actually matter** — quality over quantity, don't pad
3. **No inflated text** — simple formatting, easy to scan
4. **Add visuals where possible** — screenshots, GIFs, demos
5. **CEO sanity check** — read as Toon would. If anything feels vague or unnecessary, cut it
6. **No repetition from last week** — only what genuinely moved
7. **No activity = no mention** — don't list "nothing happened" initiatives

---

## Mode: `/sync experiment` — Draft Experiment Email

Generates a structured experiment launch or results email for any initiative, using Jira context and Eppo data when available. The email is created as a Gmail draft or sent directly.

### Step 1: Identify the experiment

Ask the PM:
1. **Email type:** `start` (experiment launching) or `end` (experiment concluded)?
2. **Which initiative?** — show the registry's initiative list for selection, or accept a Jira key / name directly.

### Step 2: Pull context automatically

**From Jira** — fetch the initiative's epic and children:

```
mcp__atlassian__getJiraIssue
  cloudId: {PM's cloud ID}
  issueIdOrKey: {EPIC_KEY}
  responseContentFormat: markdown
```

```
mcp__atlassian__searchJiraIssuesUsingJql
  jql: "parent = {EPIC_KEY} AND summary ~ 'experiment' ORDER BY updated DESC"
  fields: ["summary", "status", "description", "assignee"]
```

Extract: experiment name, hypothesis, variants, metrics, markets, traffic split, timeline — from epic description and child stories.

**From Eppo** (if experiment key is known or discoverable):

```
mcp__eppo__find_experiment
  query: "{initiative name or experiment keyword}"
```

If found:
```
mcp__eppo__get_experiment_details
  experiment_id: {experiment_id}
```

For **end** emails, also pull results:
```
mcp__eppo__get_experiment_results
  experiment_id: {experiment_id}
```

Extract: variant names, conversion rates, lift, confidence intervals, p-values, sample sizes.

**From the OKR hierarchy** — use the registry's `okr_hierarchy` to add context:
- Which Objective and KR this experiment supports
- The KR's target metric (e.g., "+1.5% component clicks/session")

### Step 3: Fill gaps

If any required fields couldn't be auto-populated from Jira/Eppo, ask the PM to fill them:
- For **start** emails: hypothesis, variants, primary metric, traffic split, expected duration
- For **end** emails: result (win/loss/inconclusive), decision (ship/kill/iterate), key learnings

Show what was auto-populated and what's missing:
```
Auto-populated from Jira + Eppo:
  ✓ Experiment name: Screen Ranker Home
  ✓ Markets: UAE, KW, QA
  ✓ Primary metric: Component clicks per session
  ✓ Variants: Control (current ranking) vs. Treatment (ML-ranked)
  ✓ Traffic split: 33/33/33
  ✓ Results: +2.1% clicks (p=0.03)

Still needed:
  ? Decision: Ship / Kill / Iterate?
  ? Key learnings (2-3 bullets)
```

### Step 4: Draft the email

#### START email template

```
Subject: [Experiment Launch] {Experiment Name} — {Markets}

Hi team,

We're launching a new experiment. Here are the details:

**Experiment:** {Experiment Name}
**Initiative:** {Initiative name} ({EPIC_KEY})
**OKR context:** {Objective name} → {KR name}
**Jira:** https://deliveryhero.atlassian.net/browse/{EPIC_KEY}

**Hypothesis:** {Hypothesis}

**Setup:**
- Control: {control description}
- Treatment: {treatment description}
- Traffic split: {split}
- Markets: {markets/segments}

**What we're measuring:**
- Primary: {primary metric} (KR target: {KR target value})
- Secondary: {secondary metrics}
- Guardrails: {guardrail metrics}

**Timeline:**
- Start: {start date}
- Expected end: {end date}
- Duration: {X weeks}

I'll share results once we reach statistical significance.

Best,
{PM name}
```

#### END email template

```
Subject: [Experiment Results] {Experiment Name} — {Result: Win/Loss/Inconclusive}

Hi team,

The {Experiment Name} experiment has concluded.

**Result: {WIN / LOSS / INCONCLUSIVE}**
**Decision: {Ship to 100% / Kill / Iterate}**

**Experiment:** {Experiment Name}
**Initiative:** {Initiative name} ({EPIC_KEY})
**OKR context:** {Objective name} → {KR name}
**Duration:** {start date} → {end date} ({X weeks})
**Markets:** {markets}

**Results:**
| Metric | Control | Treatment | Lift | p-value | Confidence |
|--------|---------|-----------|------|---------|------------|
| {Primary} | {value} | {value} | {+X%} | {p} | {CI} |
| {Secondary} | {value} | {value} | {+X%} | {p} | {CI} |
| {Guardrail} | {value} | {value} | {+X%} | {p} | {CI} |

**Sample size:** {N} per variant
**Eppo:** {Eppo experiment link, if available}

**Key learnings:**
- {Learning 1}
- {Learning 2}

**Next steps:**
- {Rollout plan / follow-up experiment / cleanup}

Best,
{PM name}
```

### Step 5: Present draft and act

Show the full email to the PM. Ask:

**"Here's the draft. Want me to:**
1. **Create as Gmail draft**
2. **Send it now** — need the recipient list
3. **Edit something**"

**Gmail draft:**
```
mcp__google-workspace__draft_gmail_message
  user_google_email: {PM's email}
  subject: {subject line}
  body: {email body}
  body_format: html
```

**Send directly:**
```
mcp__google-workspace__send_gmail_message
  user_google_email: {PM's email}
  to: {recipients}
  subject: {subject line}
  body: {email body}
  body_format: html
```

### Step 6: Generate experiment review slides (optional)

After the email, offer to generate branded experiment review slides:

Ask: **"Want me to also create experiment review slides? I can run `/sync artifacts` → experiments to generate a deck."**

If yes, invoke the `/sync artifacts` mode with artifact type pre-set to **experiments** and scope pre-set to the experiment(s) from this email. This avoids duplicating the slide generation logic — all slide creation lives in `/sync artifacts`.

### Step 7: Cross-update other destinations

After the email and slide are created, also route through the standard `/sync` pipeline:

- **Jira:** Add a comment to the epic with the experiment status (launched/concluded + key results)
- **Google Doc:** If the initiative has a mapped tab, update the experiment status fields + append log entry
- **Generated Deck:** If an initiative slide exists in the deck, update its Progress column with experiment results
- **Slack:** If channels are registered, post a summary

Ask: **"Want me to also update Jira, your strategy doc, and the initiative deck with this experiment info?"**

Only proceed with cross-updates after explicit approval.

### Auto-trigger from `/sync [updates]`

When `/sync [updates]` detects that an update is about an experiment launch or conclusion (keywords: "launched", "experiment started", "results are in", "experiment concluded", "win", "loss", "inconclusive"), suggest:

**"This looks like an experiment update. Want me to also draft an experiment email? (`/sync experiment`)"**

---

## Mode: `/sync artifacts` — Generate Branded Slide Decks

Generates presentation-ready branded slide decks directly in Google Slides from live data. Supports three artifact types — each pulls data from different sources and uses a different layout.

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      INPUT LAYER                            │
│  Text, images, screenshots, PDFs, Slack messages,           │
│  meeting notes, pasted content — any format                 │
└──────────────────────────┬──────────────────────────────────┘
                           │
                      ┌────▼────┐
                      │  PARSE  │  Extract structured updates
                      │         │  per initiative
                      └────┬────┘
                           │
                ┌──────────▼──────────┐
                │   ROUTE & MATCH     │  Map updates to destinations
                │                     │  using the sync registry
                └───┬──────┬─────┬───┘
                    │      │     │
        ┌───────────▼┐  ┌──▼──────────┐  ┌──▼───────────────┐
        │   JIRA      │  │  ARTIFACTS  │  │   CHANNELS       │
        │             │  │             │  │                   │
        │ • Comments  │  │ Google Doc  │  │ Slack             │
        │ • Transitions│ │ • Inline    │  │ • Channel posts   │
        │ • New tickets│ │ • Status log│  │ • Thread updates  │
        │ • Field edits│ │             │  │ • DMs             │
        │             │  │ Google Slides│ │                   │
        │             │  │ • Experiment│  │ Email             │
        │             │  │ • Lightspeed│  │ • Stakeholder     │
        │             │  │ • MPR (6-sl)│  │   notifications   │
        │             │  │             │  │ • Digest summaries│
        └──────┬──────┘  └──────┬──────┘  └────────┬─────────┘
               │                │                   │
             ┌─▼────────────────▼───────────────────▼──┐
             │           VERIFY & REPORT                │
             └──────────────────────────────────────────┘
```

**Slide creation flow (direct Google Slides API):**

```
┌─────────────┐     ┌──────────────┐     ┌──────────────────────┐
│  Data Pull   │────▶│  Synthesize  │────▶│  Google Slides API   │
│              │     │              │     │                      │
│ • Jira       │     │ • Narrative  │     │ create_presentation  │
│ • Eppo       │     │ • Metrics    │     │ batch_update_        │
│ • Docs       │     │ • Status     │     │   presentation       │
│ • Sheets     │     │ • Decisions  │     │                      │
└──────────────┘     └──────────────┘     └──────────┬───────────┘
                                                     │
                                          ┌──────────▼───────────┐
                                          │  Live Google Slides   │
                                          │  (shareable link)     │
                                          └──────────────────────┘
```

No .pptx files generated — slides are created directly via MCP tools. The `.js` reference files in `tlb-slides/references/` serve as **design specs** (colors, positions, fonts, content structure) to translate into Google Slides API calls.

### Step 1: Select artifact type

Present the artifact menu:

```
What type of artifact do you want to generate?

  1. 🔬 Experiment — Single experiment review slide (Eppo + Jira data)
  2. ⚡ Lightspeed — Engineering/product sync slide (Jira data)
  3. 📊 MPR — Monthly Product Review deck, 6 slides (Jira + strategy doc + metrics)
```

Use `AskUserQuestion` with these options. The user can also specify the type directly: `/sync artifacts experiments`.

### Step 2: Select scope

Based on the artifact type selected:

**Experiments:**
- Show the registry's initiatives that have experiment data (Eppo experiment IDs)
- Ask: "Which experiments? Select one or more, or 'all active'."
- If coming back to refresh, default to the same experiments from the last run (stored in registry under `last_artifacts.experiments`)

**Lightspeed:**
- Show all active initiatives from the registry
- Ask: "Which initiatives to include in the lightspeed deck?"
- Default to all active initiatives with recent Jira activity (updated in last 14 days)

**MPR:**
- Show all initiatives grouped by OKR
- Ask: "Which initiative for the MPR? Link the strategy doc if available."
- Strategy docs provide vision, thesis, problems, roadmap, and risks

### Step 3: Pull fresh data

Each artifact type has its own data pipeline:

#### Experiments data pipeline

For each selected experiment:

**a) Jira context:**
```
mcp__atlassian__getJiraIssue → hypothesis, variants, markets, entry point
```

**b) 1-pager doc (if linked):**
```
mcp__google-workspace__get_doc_as_markdown → hypothesis, variant details, metrics
```

**c) Eppo results (live data):**
```
get_experiment_details → experiment_id, status, variant names, dates
get_experiment_results → per-variant CUPED-adjusted percent_change, p_value, is_significant
get_metric_details → resolve metric IDs to human-readable names
```

**d) Synthesize narrative** (3-bullet summary per experiment):
- Bullet 1: Primary metric result with number + significance
- Bullet 2: Secondary/guardrail highlights
- Bullet 3: "Decision: [Roll out / Kill / Iterate / Continue running] — rationale"

#### Lightspeed data pipeline

For each selected initiative:

**a) Jira epic + children:**
```
mcp__atlassian__getJiraIssue → status, assignee, priority, description
mcp__atlassian__searchJiraIssuesUsingJql → child stories with status counts
```

**b) Recent activity (last 14 days):**
```
mcp__atlassian__searchJiraIssuesUsingJql
  jql: "parent = {EPIC_KEY} AND updated >= -14d ORDER BY updated DESC"
```

**c) Synthesize per initiative:**
- Status badge (on track / at risk / blocked)
- Shipped items (completed stories since last run)
- In-flight items (in progress stories)
- Blockers (blocked stories or flagged items)
- Key metrics if available from linked docs

#### MPR data pipeline

For the selected initiative:

**a) Strategy doc** (primary source):
```
mcp__google-workspace__get_doc_as_markdown → vision, thesis, problem spaces,
  features, roadmap phases, risks, decisions
```

**b) OKR hierarchy:** Objective → KR → Initiative tree from registry

**c) Jira status:** Epic status, child story counts by status, recent progress

**d) Key metrics:** Pull from linked Google Sheets, Eppo, or Docs

**e) Synthesize across 6 slides:**
- Cover: initiative name, PM, quarter, status
- Vision & Thesis: strategic context, problem statement
- Feature Grid: 4-6 features with status pills
- KPI Dashboard: 3 metric cards with trend indicators
- Roadmap: 3 phases with timeline
- Risks & Next Steps: risk matrix + decision asks

### Step 4: Create Google Slides directly

Create the presentation via MCP tools — no .pptx files:

```
mcp__google-workspace__create_presentation
  user_google_email: miriam.velloso@talabat.com
  title: "{Artifact Type} — {Initiative Name}"
```

Build all slide elements using `mcp__google-workspace__batch_update_presentation` with requests that translate the design specs from the reference `.js` files into Google Slides API calls.

**Design spec reference files** in `tlb-slides/references/`:

| Artifact | Template (design spec) | Filled examples |
|---|---|---|
| Experiment | `create-experiment-v2.js` | `create-3-experiments.js` (SR, Flash Sale KW, Coffee) |
| Lightspeed | `create-lightspeed-v3.js` | `create-lightspeed-coffee-tile.js` |
| MPR | `create-mpr-template.js` | `create-mpr-fuf.js`, `create-mpr-personalization.js` |

These `.js` files are NOT executed — they define the exact colors, positions, font sizes, and content structure to reproduce in Google Slides API calls.

**Experiment slide helpers** (design patterns from reference files):

| Pattern | Purpose |
|---|---|
| Base layout | Cream bg + accent bar + logo + title |
| Column headers | "Experiment Setup" + "Experiment Results" split |
| Hypothesis badge | Orange badge + hypothesis text |
| Variant badges | Color-coded A/B/C badges with descriptions |
| Metric lines | Value with lime/red highlight + significance |
| Footer | Analysis period + Eppo links |

**Lightspeed slide helpers:**

| Pattern | Purpose |
|---|---|
| Base layout | White bg + accent bar + logo + status badge |
| Impact headline | Bold + lime-highlighted key metrics |
| What section | Bullet list with sub-items |
| Impact section | Metrics with lime-highlighted values |
| Next steps | Numbered action items |
| Right visuals | Dual screenshot placeholders with titles |

**MPR deck helpers** (6-slide structure):

| Pattern | Purpose |
|---|---|
| `addMPRHeader` | Orange header bar + title + logo + PM info |
| `addSectionLabel` | Left-edge section labels (Vision, Features, etc.) |
| `addStatusPill` | Color-coded status: Shipped/In Progress/In Experiment/Planned/Blocked |
| Cover slide | Initiative name, PM, quarter, status badge |
| Vision & Thesis | Strategic context with problem bullets |
| Feature Grid | 4-6 features in 2-column grid with status pills |
| KPI Dashboard | 3 metric cards with trend arrows (▲ green / ▼ red / ● gray) |
| Roadmap | 3-phase timeline with deliverables |
| Risks & Next Steps | Risk matrix + decision asks |

**Status pill colors:**

| Status | Color |
|---|---|
| Shipped | Green `#2E7D32` |
| In Progress | Orange `#FF5900` |
| In Experiment | Amber `#F57F17` |
| Planned | Gray `#595959` |
| Blocked | Red `#C62828` |

**Metric display rules:**
- Positive or not significant → Lime highlight (`CFFF00`)
- Significant negative guardrail → Red highlight (`FFCDD2`) + warning
- Significant positive → Lime highlight + checkmark
- Always use CUPED-adjusted `percent_change` from Eppo
- Show "(stat sig)" or "(not sig)" after each metric
- KPI cards show trend: ▲ (green, up), ▼ (red, down), ● (gray, neutral)

Share the Google Slides link directly — no upload step needed.

### Step 5: Save to registry

Store the last artifact run so refreshes reuse the same scope:

```yaml
last_artifacts:
  experiments:
    presentation_id: "1abc..."
    url: "https://docs.google.com/presentation/d/1abc.../edit"
    experiments: ["TLBVAL-3", "TLBVAL-5", "TLBVAL-16"]
    generated: "2026-05-01"
  lightspeed:
    presentation_id: "2def..."
    url: "https://docs.google.com/presentation/d/2def.../edit"
    initiatives: ["HOMESQUAD-967", "HOMESQUAD-992"]
    generated: "2026-05-01"
  mpr:
    presentation_id: "3ghi..."
    url: "https://docs.google.com/presentation/d/3ghi.../edit"
    initiative: "HOMESQUAD-967"
    strategy_doc: "1wg2F4..."
    generated: "2026-05-01"
```

### Refresh behavior

When the user runs `/sync artifacts` and selects a type that was previously generated:
- **Default to same scope** as last run (same experiments, same initiatives)
- **Pull fresh data** from Eppo/Jira/Docs (always live, never cached)
- **Create a new Google Slides presentation** with updated data (new file, not overwrite)
- Share the new link
- Show: **"Refreshed {artifact type} deck with latest data. New file: {link}"**

The user can also change scope during refresh — "add TLBVAL-20" or "remove Coffee Tile".

---

## Sync Registry Structure (full reference)

```yaml
pm:
  name: ""
  email: ""
  jira_cloud_id: ""
  jira_project: ""

jira:
  initiatives: {}        # "Initiative Name" → "EPIC-KEY"

artifacts: []
# - type: google_doc
#   name: "Strategy Doc"
#   id: "doc_id"
#   url: "https://..."
#   write_access: true
#   tabs:
#     - tab_id: "t.xxxxx"
#       title: "Tab Name"
#       initiative: "Initiative Name"
#
# - type: google_slides
#   name: "Exec Deck"
#   id: "slides_id"
#   update_mode: append_on_top | update_existing
#   slides:
#     - slide_id: "p1"
#       initiative: "Initiative Name"

generated_deck: null
# presentation_id: "1abc..."
# url: "https://docs.google.com/presentation/d/1abc.../edit"
# created: "2026-04-26"
# last_updated: "2026-04-26"
# slides:
#   - object_id: "p1"
#     type: title
#   - object_id: "g2f3..."
#     type: initiative
#     epic_key: "HOMESQUAD-967"
#     kr_key: "TLBPT-319"
#   - object_id: "g6c3..."
#     type: risks
#   - object_id: "g7d4..."
#     type: next_steps

channels: []
# - type: slack
#   name: "Team Updates"
#   routes:
#     - channel_id: "C0XXXX"
#       channel_name: "#my-channel"
#       trigger: all | initiatives | significant | milestone
#       initiatives: ["KEY-1"]   # only if trigger = initiatives
#       format: detailed | summary | executive | digest
#
# - type: email
#   name: "Stakeholder Updates"
#   routes:
#     - recipients: ["name@company.com"]
#       trigger: significant
#       format: digest
#       frequency: immediate | daily_digest | weekly_digest

context_sources: {}
# {EPIC_KEY}:
#   slack_channels:
#     - id: "C0XXXX"
#       name: "#channel-name"
#   slack_keywords: ["keyword1", "keyword2"]
#   drive_docs:
#     - id: "doc_id"
#       name: "Doc Name"
#   gmail_contacts: ["email@company.com"]
#   gmail_keywords: ["keyword"]
```

---

## Talabat Brand Guidelines (for slides)

- **Primary orange**: `#FF5A00` — headers, accent bars
- **Dark text**: `#1A1A1A` — body text
- **Light orange bg**: `#FFF0E6` — section headers, highlight boxes
- **Green (on track)**: `#00B050`
- **Amber (at risk)**: `#FFA500`
- **Red (blocked)**: `#E60000`
- **Font**: Arial (Google Slides default)
- **Layout**: Clean, minimal — max 5 bullets per slide

---

## Rules

1. **PM-agnostic.** Never hardcode a project key, cloud ID, email, or channel. Everything comes from the sync registry.

2. **Never post to Jira without explicit approval.** Always show drafts first.

3. **Never write to artifacts without showing the routing plan.** Let the PM confirm before pushing.

4. **Inline first, log second.** Edit canonical fields (tables, key metrics) before appending status sections. A stale field with a correct log is a bug.

5. **Index discipline.** Process edits from highest index to lowest within each document section.

6. **Preserve formatting.** Re-apply text styles when replacing formatted text.

7. **All destinations or explicit failure.** Every registered destination for an affected initiative must be updated. If one fails, report it — don't skip silently.

8. **New tickets from action items.** If an update mentions an action item with an owner, create a Jira task automatically.

9. **Artifact-type-aware.** Each artifact type has its own read/write patterns. Never apply Doc logic to Slides or vice versa.

10. **Registry is the source of truth.** All mappings live in the sync registry memory file. To add a destination, update the registry — don't hardcode.

11. **Skip empty sections.** If Drive/Slack/Gmail finds nothing for an initiative, skip that section in the draft — don't include "No results found."

12. **Maximize parallel calls.** Search Slack, Drive, Gmail simultaneously per initiative. Fetch child issues in parallel with parent details.

13. **Always show the Jira tree first** when generating slides — let the PM pick what goes in the deck.

14. **Always show the slide outline** before generating — slides are hard to restructure after creation.
