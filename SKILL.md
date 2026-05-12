---
name: sync
description: >-
  Universal PM tool: route initiative updates to Jira, Google Docs, Google Slides,
  Slack, and email. Also generates branded slide decks and drafts weekly updates.
  Use when the user says "/sync", "sync updates", "push updates", "sync initiatives",
  "generate slides", "weekly update", or "draft updates".
metadata:
  version: 0.3.0
  team: product
  category: product
---

# /sync

<!-- Roles: PM -->

Route initiative updates from any input format to all registered destinations:
- **Jira** — operational tracking (comments, transitions, new tickets)
- **Artifacts** — source-of-truth documents (Google Docs, Slides, etc.)
- **Channels** — stakeholder notifications (Slack, email, etc.)

One input, all systems updated, all stakeholders notified.

---
## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     INPUT LAYER                         │
│  Text, images, screenshots, PDFs, Slack messages,       │
│  meeting notes, pasted content — any format             │
└────────────────────────┬────────────────────────────────┘
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
      │             │  │ • New slides│  │ Email             │
      │             │  │ • Update    │  │ • Stakeholder     │
      │             │  │             │  │   notifications   │
      │             │  │ (future...) │  │ • Digest summaries│
      └──────┬──────┘  └──────┬──────┘  └────────┬─────────┘
             │                │                   │
           ┌─▼────────────────▼───────────────────▼──┐
           │           VERIFY & REPORT                │
           └──────────────────────────────────────────┘
```

**Key design principle:** The parse layer, artifact layer, and channel layer are independent. Adding a new destination type (Slides, Slack, email, Notion) means registering a new destination in the sync registry — it does not change how input is parsed or how other destinations are updated.

**Three destination categories:**

| Category | Purpose | Examples | When it fires |
|----------|---------|----------|---------------|
| **Jira** | Operational state | Comments, transitions, new tickets | Always (every /sync) |
| **Artifacts** | Source-of-truth docs | Google Docs, Slides | When mapped sections are affected |
| **Channels** | Stakeholder comms | Slack, email | When the update is significant enough to notify |

---
## Sync Registry

The sync registry is a reference memory file that stores all destinations for a user. It is created during onboarding and grows as the user adds artifacts.

**Structure:**

```yaml
# Populated during onboarding — all sections start empty

pm:
  name: ""                       # PM display name (e.g. "Flossie Reynolds")
  account_id: ""                 # Jira account ID for assignee queries
  email: ""                      # used for Jira lookups AND Google Workspace API calls

jira:
  project: ""                    # set during onboarding (e.g. "TLBVAL")
  issue_levels: []               # trackable issue types detected from project hierarchy (e.g. ["Initiative", "Epic"])
  initiatives: {}                # initiative name → issue key, auto-discovered by assignee

okr_hierarchy:                   # auto-discovered by walking UP parent chain from initiatives
  # NOTE: parent chain often crosses project boundaries (e.g., initiatives in TLBVAL → KRs in TLBPT)
  # Example:
  # - objective:
  #     key: "TLBPT-256"
  #     name: "O5. Drive sustainable topline growth through relevant, earned value"
  #   key_results:
  #     - key: "TLBPT-266"
  #       name: "O5.KR2. Increase incentivised item orders/user by 2% through Best Sellers"
  #       initiatives:
  #         - key: "TLBVAL-16"
  #           name: "Replace MFO with Best Sellers Swimlane on HS (UAE)"
  #         - key: "TLBVAL-18"
  #           name: "Implement TOD relevancy"

artifacts: []
# Example after user registers a Google Doc:
#  - type: google_doc
#    name: "My Strategy Doc"
#    id: "abc123..."
#    url: "https://docs.google.com/document/d/abc123.../edit"
#    write_access: true
#    tabs:
#      - tab_id: t.xxxxx
#        title: "Initiative A"
#        initiative: "Initiative A"
#
# Example after user registers a Google Slides:
#  - type: google_slides
#    name: "Executive Update Deck"
#    id: "def456..."
#    update_mode: append_on_top  # or: update_existing
#    slides: []

channels: []
# Example after user registers a Slack channel:
#  - type: slack
#    name: "Team Updates"
#    routes:
#      - channel: "#my-channel"
#        trigger: all            # all | initiatives | significant | milestone
#        format: summary         # detailed | summary | executive | digest
#
# Example after user registers email notifications:
#  - type: email
#    name: "Stakeholder Updates"
#    routes:
#      - recipients: ["name@company.com"]
#        trigger: significant
#        format: digest
#        frequency: immediate    # immediate | daily_digest | weekly_digest
```

**Channel trigger levels** (from most to least frequent):
- `all` — every /sync invocation posts to this channel
- `initiatives` — only when specific listed initiatives are updated
- `significant` — only for launches, blockers, scope changes, or major decisions
- `milestone` — only for major milestones (experiment launch, rollout, results readout)

**Channel format levels** (from most to least detailed):
- `detailed` — full update with context, metrics, links, action items
- `summary` — brief summary with links to artifacts
- `executive` — one-liner with key metric and link
- `digest` — structured multi-initiative roundup (for batched delivery)

---
## Steps

### 0. Onboarding (first run only)

Check if a sync registry reference memory exists (search MEMORY.md for a memory containing "sync registry" or "sync destinations"). If found, load it and skip to Step 1.

If no registry exists, run the onboarding flow:

#### a) Prerequisites check

Before asking the PM anything, silently verify that required integrations are available:

1. **Jira MCP** — check that `mcp__atlassian__*` tools are callable. If not, stop and guide: "I need Jira access to continue. Add the Atlassian MCP server to your Claude config."
2. **Google Workspace MCP** — check that `mcp__google-workspace__*` tools are callable. If not, stop and guide: "I need Google Workspace access to read/write your docs. Add the Google Workspace MCP server to your Claude config."
3. **Slack MCP** (optional) — check if `mcp__slack__*` or `mcp__Slack__*` tools exist. Note availability for step (f).

Only proceed once Jira + Google Workspace are confirmed working.

#### b) Identify PM

Ask: "What's your name?" (or infer from context if already known).

1. Look up the PM in Jira using `lookupJiraAccountId` with their name
2. If multiple matches, show them and ask which one
3. Store: `name`, `account_id`, `email` (from Jira profile)
4. This email is also used for all Google Workspace API calls (`user_google_email`)

#### c) Identify Jira project

Ask for the Jira project key (e.g., "TLBVAL", "HOMESQUAD").

Verify it exists using `getVisibleJiraProjects` with a search.

#### d) Discover initiatives and OKR hierarchy

**Do NOT hardcode `issuetype = Epic`.** Projects use different hierarchy levels, and the OKR hierarchy often spans across projects.

**Step 1 — Find the PM's initiatives:**

1. Read the project's available issue types via `getJiraProjectIssueTypesMetadata`
2. Identify all trackable levels by `hierarchyLevel` — typically:
   - Initiative (level 2) — the most common PM tracking unit
   - Epic (level 1) — used in simpler projects
3. Query **both Initiative and Epic** levels assigned to the PM:
   ```
   project = {KEY} AND issuetype in (Initiative, Epic) AND assignee = "{account_id}" ORDER BY created DESC
   ```
4. **If matches found** — present the list: "These are your initiatives. Correct?"
5. **If no matches found** — show ALL initiatives/epics in the project with a warning: "None of these are assigned to you in Jira. Which ones are yours?" Let PM pick by number.

**Step 2 — Walk UP the parent chain to discover OKR context:**

For each confirmed initiative, read the `parent` field and keep walking up until there is no parent. This builds the full hierarchy tree. **The parent chain often crosses project boundaries** (e.g., initiatives in TLBVAL → KRs and Objectives in TLBPT).

```
For each initiative:
  1. Read issue with parent field
  2. If parent exists → read parent, note its type (Key Result, Objective, Commitment, Big Bet)
  3. Keep walking up until no parent
  4. Store the full chain
```

**Step 3 — Deduplicate and present as a tree:**

Group initiatives by their KR and Objective. Present the full hierarchy:

```
Objective: TLBPT-256 — O5. Drive sustainable topline growth through relevant, earned value
  └── Key Result: TLBPT-266 — O5.KR2. Increase incentivised item orders/user by 2% through Best Sellers
        ├── TLBVAL-16 — Replace MFO with Best Sellers Swimlane on HS (UAE)
        ├── TLBVAL-18 — Implement TOD relevancy
        ├── TLBVAL-19 — Improve UX of item swimlane and best seller collection
        └── ... (more initiatives)
```

Ask: "Does this OKR tree look right?"

Store the full hierarchy in the registry under `okr_hierarchy`.

#### e) Register artifacts

Ask: "What documents do you use as sources of truth for your initiatives? These can be Google Docs, Google Slides, or other documents. Paste the URL(s). You can also skip and add them later with `/sync add [URL]`."

Accept one or more URLs. For each:
1. Detect the artifact type from the URL (Google Doc, Google Slides, etc.)
2. Verify read+write access using `inspect_doc_structure` (Docs) or `get_presentation` (Slides). If access fails, report the error clearly.
3. Discover the artifact's structure:
   - **Google Doc:** list all tabs (nested) with IDs and titles
   - **Google Slides:** list all slides with IDs, titles, and content summaries
4. Present the structure as a visual tree to the PM

#### f) Auto-match artifact sections to initiatives

**Do NOT ask the PM to manually map every tab/slide.** Auto-match first, then confirm.

1. Compare each tab title (or slide title) against the initiative names from step (d) using fuzzy string matching (substring, keyword overlap, common abbreviations)
2. Present a proposed mapping table:
   ```
   | Doc Tab / Slide         | Matched Initiative                    | Key        | Confidence |
   |-------------------------|---------------------------------------|------------|------------|
   | BS swimlane (UAE)       | Replace MFO with Best Sellers (UAE)   | TLBVAL-16  | strong     |
   | TOD on BS swimlane      | Implement TOD relevancy               | TLBVAL-18  | strong     |
   | Savings amount tag      | Show savings tag in item details      | TLBVAL-50  | strong     |
   | Commercial GTM          | —                                     | —          | no match   |
   ```
3. Ask: "Does this mapping look right? You can correct any row or add missing ones."
4. Accept corrections in natural language: "Commercial GTM is not an initiative, skip it" or "Breakfast Swimlane → TLBVAL-44"
5. Tabs with no match are stored as unmapped — they won't receive updates but stay in the registry for future mapping.

#### g) Register channels (optional)

Ask: "Do you want /sync to also notify stakeholders via Slack or email when updates are pushed? You can set this up now or later with `/sync add slack` or `/sync add email`."

If Slack MCP is not available (from step a), note: "Slack integration isn't connected yet — you can add it later."

If yes for **Slack:**
1. Ask: "Which Slack channel(s) should receive updates? And for each, should it get all updates, only specific initiatives, or only significant ones (launches, blockers)?"
2. Accept routing rules in natural language: "#personalization-updates gets everything, #home-squad only Screen Ranker and Coffee tile, DM Ahmed only for launches"
3. Ask about format preference per channel: detailed, summary, or executive

If yes for **email:**
1. Ask: "Who should receive email notifications? And for each, what triggers an email?"
2. Accept routing rules: "Ahmed gets significant updates immediately, leadership list only on milestones"
3. Ask about frequency: immediate, daily digest, or weekly digest

If no: skip, the registry stores an empty channels list. Can be added later.

#### h) Save the sync registry

Write a reference memory file containing the full registry (PM identity + Jira config + all artifacts with mappings + all channels with routing rules). Add to MEMORY.md index.

#### i) Confirm

Present: "Setup complete. /sync will push updates to:"
- Jira project [PROJECT] — [N] initiatives mapped
- [Artifact name] ([type]) — [N] sections mapped ([M] auto-matched, [K] unmapped)
- [Channel name] ([type]) — [routing summary]
- ...

"Add more destinations anytime with `/sync add [URL | slack | email]`."

---
### 1. Parse Updates

Read the user's input and extract structured updates per initiative:
- **Input formats accepted:** plain text, images/screenshots, PDFs, pasted Slack messages, meeting notes, Google Doc URLs, any combination
- **Extract per initiative:**
  - What changed (status, scope, metrics, design, setup, decisions)
  - Which canonical fields are affected (targeting, traffic split, expected impact, timeline, etc.)
  - New artifacts (dashboard links, documents, design mockups)
  - Action items or new tickets needed (with owner and priority if mentioned)

### 2. Load Sync Registry

Read the sync registry from memory. Identify:
- Which initiatives are mentioned in the updates
- Which Jira epics they map to
- Which artifacts contain sections for those initiatives

### 3. Route Updates to Destinations

For each update, build a routing plan:

```
Update: "Screen Ranker experiment launched, 33/33/33 split"
  → Jira: HOMESQUAD-967 (comment + child story transitions)
  → Google Doc: tab t.1qdk1r5f22t6 (inline: traffic split table cell + append: status log)
  → Google Slides: slide 5 (update key metrics) [if registered]
```

Present the routing plan to the user: "Here's what I'll update. Proceed?"

### 4. Update Jira

For each affected initiative:
1. Add a comment to the epic with the update summary
2. Add comments to relevant child stories if directly affected
3. Transition story statuses where appropriate (e.g., To Do → In Progress)
4. Create new tickets if action items were identified (with assignee and priority)
5. Update issue descriptions if scope/setup changed

Use `tools/jira_api.py` — see `/jira` skill for CLI patterns.

### 5. Update Artifacts

For each registered artifact that has mapped sections for the affected initiatives, apply the appropriate update strategy:

#### Google Doc adapter

**a) Read current state:**
- Fetch with `includeTabsContent=True`
- Find target tab, inspect structure (tables, headings, paragraphs)
- Identify exact indices of canonical fields that need updating

**b) Edit canonical fields inline (CRITICAL):**
- Update table cells, summary rows, key figures directly
- Process edits from **highest index to lowest** within each tab to avoid index shifts
- Preserve formatting (bold, italic) when replacing text in styled cells
- Use `deleteContentRange` + `insertText` + `updateTextStyle` for formatted cells

**c) Append status log entry:**
- Add a timestamped section at the end of the tab: `## [Date] Title`
- Include narrative update, setup changes, links, action items

**d) Execute:**
- Batch all requests per tab
- Order: inline edits (high-to-low index) before appends within same tab
- Cross-tab requests don't affect each other's indices

#### Google Slides adapter (future)

**Update modes:**
- `append_on_top`: Add new slides at the beginning of the deck with the latest update. Existing slides remain as history. Good for executive decks where the latest status should be first.
- `update_existing`: Find the slide(s) mapped to the initiative and update text/tables in place. Good for recurring status decks with a fixed structure.

**Operations:**
- Read slide structure via Slides API
- For `append_on_top`: create new slide(s) with update content, insert at position 0 (or after title slide)
- For `update_existing`: find text placeholders or table cells, replace content
- Preserve slide master/layout styling

#### Future adapters

The pattern for any new artifact type:
1. **Detect** from URL or user declaration
2. **Discover** structure (sections, pages, blocks)
3. **Map** sections to initiatives during onboarding
4. **Read** current state before updating
5. **Edit inline** canonical fields + **append** status entries
6. **Verify** changes landed

### 6. Notify Channels

After Jira and artifacts are updated, send notifications to registered channels. This step runs last because notifications should link to the already-updated artifacts.

For each registered channel, evaluate the routing rules:
1. Check the **trigger level** — does this update qualify? (all, initiatives, significant, milestone)
2. If it qualifies, generate the message in the appropriate **format** (detailed, summary, executive, digest)
3. Deliver via the channel adapter

#### Slack adapter (planned)

**Delivery:**
- Use Slack MCP tools if available (`send_message`, `post_to_channel`)
- If Slack MCP is not connected, present the message as copyable text and suggest `/setup connect slack`

**Message formatting (by format level):**
- `detailed`: Bold initiative name, what changed, key metrics, links to Jira epic + artifact section, action items
- `summary`: One-line per initiative with link to artifact. Example: ":rocket: *Screen Ranker* launched — all markets except UAE, 33/33/33, targeting €7M GMV. [Doc](link) | [Jira](link)"
- `executive`: Single line with key outcome. Example: ":white_check_mark: Screen Ranker live — €7M GMV target"

**Thread behavior:**
- If a previous /sync posted to the same channel about the same initiative, reply in the existing thread (if thread ID is tracked in the registry)
- Otherwise, post as a new message

#### Email adapter (planned)

**Delivery:**
- Use Gmail API via ADC (requires `gmail.send` scope) or compose and present for manual send
- For `daily_digest` or `weekly_digest` frequency: queue the update and batch-send at the configured interval

**Email formatting (by format level):**
- `digest`: Structured HTML email with sections per initiative, key metrics table, links to artifacts and Jira
- `executive`: Plain text, 2-3 sentences max, one key metric, one link
- `detailed`: Full narrative with embedded context, similar to a stakeholder update

**Subject line:** Auto-generated from initiatives and update type. Example: "[Personalization] Screen Ranker launched — Coffee tile released"

### 7. Verify

After pushing to all destinations:
- Re-read modified artifact sections and confirm canonical fields reflect new values
- Confirm Jira comments posted successfully
- Report any failures explicitly

### 8. Report

Present a summary table:

```
| Initiative         | Jira            | Artifacts          | Channels              | Changes                     |
|--------------------|-----------------|--------------------|----------------------|------------------------------|
| Screen Ranker MVP  | HOMESQUAD-967 ✓ | Doc ✓ Slides ✓    | #perso-updates ✓     | Launched, 33/33/33, 6 weeks  |
| Coffee tile        | HOMESQUAD-992 ✓ | Doc ✓             | #perso-updates ✓     | Released, DineOut swap       |
```

Flag any action items that need follow-up.

---
## Commands

- **`/sync [updates]`** — Main flow. Parse updates, route to all destinations.
- **`/sync artifacts`** — Generate branded slide decks (Experiments, Lightspeed, MPR) from live data. See **`/sync artifacts` Mode** below.
- **`/sync weekly`** — Draft weekly update in Toon's 3-section format. See **`/sync weekly` Mode** below.
- **`/sync add [URL | slack | email]`** — Register a new destination. Accepts artifact URLs or channel types.
- **`/sync status`** — Show the current sync registry: all destinations, mapped initiatives, routing rules.
- **`/sync remove [destination name]`** — Remove a destination from the registry.
- **`/sync test [destination]`** — Send a test message to a specific channel to verify connectivity.

---

## `/sync artifacts` Mode

Generate branded presentation slides directly in Google Slides using the MCP tools. The `.js` reference files in `tlb-slides/references/` define the design specs (colors, positions, fonts, content structure) — don't run them, translate the layout into Google Slides API calls instead.

### Workflow

```
/sync artifacts
  ├── Step 0: Check data source availability (Eppo, BQ)
  ├── Step 1: Select type (menu with descriptions)
  ├── Step 2: Select scope (smart-suggest from Jira status)
  ├── Step 3: Pull fresh data (Jira, Eppo if available, Drive)
  ├── Step 4: Ensure Drive folder exists (auto-create if not)
  ├── Step 5: Create or update Google Slides via MCP tools
  │     └── Use .js reference files as design specs
  │         (colors, positions, content structure)
  └── Step 6: Save to registry
```

### Reference File Map

Each artifact type has a template file (design spec) and filled examples:

| Artifact | Template (design spec) | Filled examples |
|----------|------------------------|-----------------|
| **Experiment** | `create-experiment-v2.js` | `create-3-experiments.js` (SR, Flash Sale, Coffee) |
| **Lightspeed** | `create-lightspeed-v3.js` | `create-lightspeed-coffee-tile.js` |
| **MPR** | `create-mpr-template.js` | `create-mpr-fuf.js`, `create-mpr-personalization.js` |

All reference files are in `.claude/skills/tlb-slides/references/`.

### Step 0: Check data source availability

Before showing the menu, silently check which data sources are available. Use this concrete detection strategy:

1. **Eppo MCP** — look for any tool whose name starts with `mcp__eppo__`. Three possible states:
   - **Tools exist** (e.g., `mcp__eppo__get_experiment`) → `eppo_available: true`
   - **Only `mcp__eppo__authenticate` exists** → Eppo is configured but needs OAuth. Run the authenticate tool to start the flow, then re-check.
   - **No `mcp__eppo__*` tools at all** → Eppo is either not configured or the gateway is unreachable. Store `eppo_available: false`.
2. **BigQuery MCP** — same pattern: look for `mcp__bigquery__*` tools. If only `mcp__bigquery__authenticate` exists, run it.

These checks determine what data can be pulled in Step 3. If a source is unavailable, the skill still works — it just uses Jira + manual input instead. Do NOT prompt the PM about these checks unless they directly affect the selected artifact type (e.g., Eppo for Experiment decks).

### Step 1: Select type

Present the menu **with descriptions** so any PM understands what each type is:

```
What would you like to create?

1. Experiment — slide deck summarizing an A/B test: hypothesis, setup, results, recommendation
2. Lightspeed — eng/product sync deck: initiative status, blockers, upcoming milestones
3. MPR — Monthly Product Review: OKR progress, initiative deep dives for leadership
4. [Previously registered decks, if any, listed by name]
5. + New deck — create or register a new Google Slides presentation
```

If the PM has previously generated decks (stored in registry under `generated_decks`), show those between the fixed types and "+ New deck".

### Step 2: Select scope (smart-suggest)

**Do NOT just show a flat list.** Use Jira status to smart-suggest the most relevant initiative.

Based on type:
- **Experiment** — scan the PM's initiatives for status = "Experiment" or issues with experiment-related labels. If found, auto-suggest: "I see TLBVAL-16 (Replace MFO with Best Sellers) is in Experiment status. Is this the one?" Show the full list as fallback.
- **Lightspeed** — suggest initiatives with status = "In Progress". Ask which market/slice if the initiative spans multiple.
- **MPR** — auto-scope to the PM's full OKR tree (from `okr_hierarchy` in registry). Ask which quarter if ambiguous.

### Step 3: Pull fresh data

Fetch live data from registered sources:

- **Jira** (always): initiative details, child stories, recent activity, status. **Also parse the description for embedded links** — extract:
  - Eppo experiment URLs (pattern: `eppo.cloud/experiments/{id}`) → store the experiment ID for Eppo pull
  - PRD / Google Doc URLs → store for footer links on the slide
  - Working sheet URLs → store for footer links
- **Eppo** (if `eppo_available` AND type = Experiment): use the experiment ID extracted from Jira (or ask the PM if not found). Pull data in this order:
  1. `find_experiment(query)` — match by name or key to get experiment_id
  2. `get_experiment_details(experiment_id)` — metadata, variants, hypothesis, dates, owner
  3. `get_experiment_results(experiment_id)` — per-variant CUPED-adjusted metrics with p-values
  4. `get_metric_details(metric_id)` **for every metric** in the results — gets human-readable name, description, and `desired_change` direction. Call these in parallel (batch all metric_id calls at once). **Never skip this step** — metric_ids alone are meaningless; you need names to write the summary and to classify guardrails.
  If Eppo is NOT available:
  - If `mcp__eppo__authenticate` exists → offer: "Eppo isn't connected yet. I can start the authentication now — it takes 30 seconds. Want to connect?"
  - If no Eppo tools at all → warn: "Eppo MCP isn't configured. I'll build the slide from Jira data. You can paste experiment results manually, or run `claude mcp add --transport http eppo 'https://talabatai.dhhmena.com/mcp/gateway/eppo/mcp'` to add it."
  - Either way, proceed with Jira data and offer manual paste as fallback.
- **Drive**: related docs, PRDs, strategy docs from registered artifacts

### Step 4: Ensure Drive folder exists

Before creating the presentation, ensure the target folder exists. The folder structure is:

```
Q{quarter}Y{year} PM: {PM Name} — {Top-level name}/
├── Experiments/
├── MPR/
├── Lightspeed/
└── (other registered deck types)/
```

1. Search Drive for the folder name using `search_drive_files`
2. **If found** — use it
3. **If NOT found** — auto-create the folder hierarchy using `create_drive_folder`:
   - Create the parent folder: `Q{quarter}Y{year} PM: {PM Name} — {Top-level name}`
   - Create the type subfolder inside it (e.g., `Experiments/`)
4. Store the folder ID in the registry for future runs

Derive `{Top-level name}` from the highest node in the PM's OKR hierarchy — this could be a Big Bet, Commitment, or Objective depending on the project's hierarchy depth. Use whatever is at the root. **Clean up the name:** strip `[Q2Y26]` prefixes and truncate to ~50 chars if too long (e.g., "O5. Drive sustainable topline growth..." → "O5. Drive sustainable topline growth").

Derive `{quarter}` and `{year}` from the current date.

### Writing Experiment Results (for slides)

Before writing any experiment content, **prepare the data** — do NOT skip this step and free-write from raw Eppo output.

#### Step A: Classify metrics

For every metric returned by `get_experiment_results`, call `get_metric_details(metric_id)` to get:
- **name** — human-readable label (use this everywhere, never show raw metric_ids)
- **description** — the SQL definition and what it measures
- **desired_change** — `"increase"` or `"decrease"` — critical for guardrail interpretation

Then bucket each metric:
- **Primary** — the metric flagged as primary in Eppo (usually 1, sometimes 2)
- **Guardrail** — metrics where the result direction opposes `desired_change` AND the result is reliable (p < 0.05). These are guardrail hits. Also flag any metric whose name contains "GMV", "orders", "revenue" at a level above the experiment scope (e.g., homepage-level when testing a single swimlane)
- **Secondary** — everything else that is statistically reliable

#### Step B: Build structured input

Assemble a structured summary before writing. Format:

```
Experiment: {name}
Variants: Control ({n} users) vs Treatment ({n} users)
Market: {market}

PRIMARY METRICS:
- {metric_name}: {+/-X.XX%} (p={value}, desired={direction}) → {PASS/FAIL}

GUARDRAIL METRICS:
- {metric_name}: {+/-X.XX%} (p={value}, desired={direction}) → GUARDRAIL HIT / SAFE

SECONDARY METRICS:
- {metric_name}: {+/-X.XX%} (p={value})

Hypothesis: {from Jira or Eppo, or "Not documented"}
```

Use CUPED-adjusted values (`metric_value_cuped`, `cuped.percent_change`) when available — these are more robust. Fall back to raw values only if CUPED fields are missing.

#### Step C: Write exec summary

Now write the summary for the `summary_box` slide element. Adopt this persona:

> You are a data analyst at Talabat writing a concise executive summary of an experiment for senior leadership (non-technical audience: VPs, GMs, PMs).

**Structure — exact:**
- 1 short opening sentence stating what was tested and the headline result
- 3-5 bullet points covering: primary metric result, guardrail status, any notable secondary findings, and recommended action
- **Bold** the single most important number (use `**` in the draft, render as bold in Slides)
- Keep the whole summary **under 150 words**

**Writing rules — strict:**
- No technical jargon whatsoever. Forbidden words: MDE, p-value, confidence interval, statistical significance, CUPED, variance, regression, null hypothesis, power, effect size, sample size
- Instead of "statistically significant", say the result is "reliable" or "a clear signal"
- Instead of "MDE", say "the smallest change we could reliably detect"
- Instead of "non-significant", say "flat" or "directionally positive/negative"
- Explain results in plain business language: what happened, why it matters, what to do next
- Always state the direction: "+X% (reliable)" or "+X% (directional, not yet conclusive)"
- For guardrail metrics: explicitly confirm they are safe, or flag if hurt
- If a metric should decrease (e.g. refund_rate) and it decreased, that is a **positive** result — interpret correctly
- Explain mechanisms where visible: "driven by", "offset by", "suggesting that"
- Every bullet must reference actual numbers from the data — no generic filler

#### Step D: Write results_box

The `results_box` uses a tighter bullet format:
```
●  Primary metric: {Metric Name}  {+/-X.X%}  (reliable)
●  Secondary: {Metric Name}  {+/-X.X%}  (reliable)
●  Guardrail: {Metric Name}  {+/-X.X%}  (negative)
●  Guardrail: {Metric Name}  {+/-X.X%}  (negative)
●  Side effect: {Metric Name}  {+/-X.X%}  (negative)
```

Use the classified buckets from Step A. Max 6 lines — pick the most important metrics. Use human-readable names from `get_metric_details`, never raw metric_ids.

**Source:** Adapted from [`talabat-dhme/data-apps/exp-analysis-bot/llm.py`](https://github.com/talabat-dhme/data-apps/blob/main/exp-analysis-bot/llm.py) (exec summary prompt).

### Step 5: Create or update slides in Google Slides

**Check if a deck already exists** for this initiative + type in the registry (`generated_decks`):
- **If YES** — update the existing deck in place (no duplicates). Find the presentation by stored ID, update slides with fresh data.
- **If NO** — create a new presentation in the Drive folder from Step 4.

Create the presentation directly using MCP tools — **do NOT generate .pptx files**.

```
mcp__google-workspace__create_presentation
  user_google_email: {PM's email from registry}
  title: "{Artifact type} — {Initiative name}"
```

**Immediately after creating**, delete the default empty text boxes (`i0`, `i1`) that every new Google Slides presentation creates:
```
batch_update_presentation: [{"deleteObject": {"objectId": "i0"}}, {"deleteObject": {"objectId": "i1"}}]
```

Build slides using `mcp__google-workspace__batch_update_presentation`.

Read the appropriate `.js` reference file for the design spec:
- Extract colors, positions, font sizes, and content structure
- Translate `pptxgenjs` calls into Google Slides API requests
- Use `createShape`, `insertText`, `updateTextStyle`, `updateShapeProperties`
- Inches to EMU: multiply by 914400
- For outlines: use `"outline": {"propertyState": "NOT_RENDERED"}` to hide outlines (weight=0 throws an error)

The `tlb-slides/SKILL.md` has the full brand design system (color palette, typography scale, layout rules, logo positions).

**Logo insertion:** Corporate Google Workspace blocks public file sharing, so the Slides API `createImage` with a Drive URL will fail. Workaround: insert a styled text placeholder (`"talabat"` in Poppins Bold 20pt, orange #FF5900, aligned right, top-right corner). The PM can manually replace it with the logo image from their Drive after the deck is created.

**Footer links:** Parse the Jira description for embedded URLs (PRD doc, Eppo experiment, working sheet) and add them as hyperlinked text in the footer bar using `updateTextStyle` with `link.url`.

Move the presentation to the correct Drive folder using `update_drive_file` with `add_parents`.

### Step 6: Save to registry

After generating, save to the sync registry under `generated_decks`:
```yaml
generated_decks:
  - type: experiment
    initiative_key: "TLBVAL-16"
    presentation_id: "abc123..."
    folder_id: "folder456..."
    last_updated: "2026-05-06"
    slide_mapping:
      - slide_id: "slide_001"
        content: "hypothesis"
      - slide_id: "slide_002"
        content: "results"
```

This enables future `/sync [updates]` and `/sync artifacts` runs to update the deck in place instead of creating duplicates.

---

## `/sync weekly` Mode

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

## Sync Registry Structure (full reference)

```yaml
pm:
  name: ""
  email: ""
  jira_cloud_id: ""
  jira_project: ""

jira:
  initiatives: {}        # "Initiative Name" → "EPIC-KEY"

okr_hierarchy: []        # auto-discovered by walking UP parent chain from initiatives

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

generated_decks: []
# - type: experiment | lightspeed | mpr
#   initiative_key: "TLBVAL-16"
#   presentation_id: "1abc..."
#   folder_id: "folder456..."
#   last_updated: "2026-05-06"
#   slide_mapping:
#     - slide_id: "slide_001"
#       content: "hypothesis"

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

**Primary palette:**
- **Orange** `#FF5900` — headers, accent bars, CTAs
- **Burgundy** `#411517` — dark backgrounds, section dividers
- **Cream** `#F4EDE3` / `#FFF5EB` — slide backgrounds, cards
- **Lime** `#CFFF00` — highlights, metric callouts, positive indicators

**Status colors:**
- On Track: `#2E7D32` (green)
- At Risk: `#F57F17` (amber)
- Blocked: `#E60000` (red)
- Shipped: `#2E7D32` (green)
- In Progress: `#FF5900` (orange)
- In Experiment: `#F57F17` (amber)
- Planned: `#595959` (gray)

**Typography:**
- **Poppins Bold** — slide titles, headers
- **Poppins SemiBold** — section headers, labels
- **DM Sans** — body text, bullets
- **JetBrains Mono** — metric values, data callouts

**Layout rules:**
- Clean, minimal — max 5 bullets per slide
- Logo: top-right corner (text placeholder "talabat" in Poppins Bold 20pt orange if image insert fails)
- Inches to EMU: multiply by 914400
- For outlines: use `"outline": {"propertyState": "NOT_RENDERED"}` to hide (weight=0 throws error)

Full design system with layout specs, reference files, and examples: see `tlb-slides/SKILL.md`.

---
## Rules

1. **PM-agnostic.** Never hardcode a project key, cloud ID, email, or channel. Everything comes from the sync registry.

2. **Never post to Jira without explicit approval.** Always show drafts first.

3. **Never write to artifacts without showing the routing plan.** Let the PM confirm before pushing.

4. **Inline first, log second.** Always edit canonical fields (tables, summary rows, key metrics) before appending status sections. The canonical record IS the source of truth — a stale field with a correct log is a bug.

5. **Index discipline.** When making multiple edits in the same document section, process from highest index to lowest. This prevents index shifts from invalidating subsequent operations.

6. **Preserve formatting.** When replacing text in formatted cells (bold, italic, colored), re-apply the text style after insertion.

7. **All destinations or explicit failure.** Every registered destination for an affected initiative must be updated. If one fails, report it explicitly — don't silently skip.

8. **New tickets from action items.** If an update mentions an action item with an owner, create a Jira task automatically (with parent epic, assignee, priority).

9. **Artifact-type-aware operations.** Each artifact type has its own read/write patterns. Never apply Google Doc edit logic to Slides or vice versa. Use the correct adapter.

10. **Registry is the source of mapping truth.** All initiative-to-destination mappings live in the sync registry memory. If the user says "also sync to this new doc," update the registry — don't hardcode.

11. **Skip empty sections.** If Drive/Slack/Gmail finds nothing for an initiative, skip that section in the draft — don't include "No results found."

12. **Maximize parallel calls.** Search Slack, Drive, Gmail simultaneously per initiative. Fetch child issues in parallel with parent details.

13. **Always show the Jira tree first** when generating slides — let the PM pick what goes in the deck.

14. **Always show the slide outline** before generating — slides are hard to restructure after creation.

---
## API Patterns

### Google Docs

#### Reading a tab's content
```python
from google_helper import get_docs_service
service = get_docs_service()
doc = service.documents().get(
    documentId=DOC_ID, includeTabsContent=True
).execute()
```

#### Inline text replacement in a table cell
```python
requests = [
    {'deleteContentRange': {'range': {'startIndex': START, 'endIndex': END, 'tabId': TAB_ID}}},
    {'insertText': {'location': {'index': START, 'tabId': TAB_ID}, 'text': NEW_TEXT}},
    {'updateTextStyle': {
        'range': {'startIndex': START, 'endIndex': START + len(NEW_TEXT), 'tabId': TAB_ID},
        'textStyle': {'bold': True},
        'fields': 'bold'
    }},
]
```

#### Appending a section with heading
```python
requests = [
    {'insertText': {'location': {'index': END_IDX, 'tabId': TAB_ID}, 'text': '\n\nSection Title\n\nContent...'}},
    {'updateParagraphStyle': {
        'range': {'startIndex': HEADING_START, 'endIndex': HEADING_END, 'tabId': TAB_ID},
        'paragraphStyle': {'namedStyleType': 'HEADING_1'},
        'fields': 'namedStyleType'
    }},
]
```

### Google Slides (reference for future implementation)

#### Reading slide structure
```python
from google_helper import get_slides_service
service = get_slides_service()
presentation = service.presentations().get(presentationId=SLIDES_ID).execute()
```

#### Replacing text in a slide
```python
requests = [
    {'replaceAllText': {
        'containsText': {'text': '{{metric_value}}', 'matchCase': True},
        'replaceText': '+€7M GMV',
        'pageObjectIds': [SLIDE_ID]
    }}
]
```

#### Inserting a new slide
```python
requests = [
    {'createSlide': {
        'insertionIndex': 1,  # after title slide
        'slideLayoutReference': {'predefinedLayout': 'TITLE_AND_BODY'}
    }}
]
```
