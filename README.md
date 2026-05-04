# sync-artifacts

A Claude Code skill system for Product Managers at Talabat. Syncs initiative updates across Jira, Google Docs, Google Slides, Slack, and email — from a single input.

## What this repo contains

```
.claude/
├── commands/
│   └── toon.md                  # /toon — weekly CEO update in branded HTML
├── skills/
│   ├── sync/
│   │   ├── SKILL.md             # /sync — universal PM initiative router
│   │   └── jira-skill-docs.md   # /jira — Jira board management reference
│   └── tlb-slides/
│       ├── SKILL.md             # Talabat slide design system (brand guide)
│       ├── assets/
│       │   ├── fonts/           # Poppins, DM Sans, Open Sans (TTF)
│       │   ├── icons/           # Flat icon set
│       │   ├── illustrations/   # Decorative visuals
│       │   ├── logo/            # talabat-logo.png
│       │   ├── patches/         # Organic blob/circle shapes
│       │   ├── screenshots/     # 90+ reference screenshots of every slide type
│       │   └── stickers/        # Callout shapes
│       └── references/
│           ├── slide-patterns.md           # Layout specs + pptxgenjs code for all slide types
│           ├── create-experiment-v2.js     # Experiment slide design spec (template)
│           ├── create-3-experiments.js     # Experiment filled example
│           ├── create-lightspeed-v3.js     # Lightspeed slide design spec (template)
│           ├── create-lightspeed-coffee-tile.js  # Lightspeed filled example
│           ├── create-mpr-template.js      # MPR slide design spec (template)
│           ├── create-mpr-fuf.js           # MPR filled example (F&UF)
│           └── create-mpr-personalization.js    # MPR filled example (Personalization)
```

---

## `/sync` — Universal PM Initiative Router

Works for **any PM**. On first run, it onboards the PM by discovering their Jira project, mapping initiatives to epics, and registering artifact destinations.

Route initiative updates from any input format to all registered destinations:
- **Jira** — operational tracking (comments, transitions, new tickets)
- **Artifacts** — source-of-truth documents (Google Docs, Slides, etc.)
- **Channels** — stakeholder notifications (Slack, email, etc.)

One input, all systems updated, all stakeholders notified.

### Commands

| Command | What it does |
|---------|-------------|
| `/sync [updates]` | Parse updates from any input (text, images, PDFs, Slack messages), route to all registered destinations |
| `/sync artifacts` | Generate branded slide decks (Experiment, Lightspeed, MPR) from live Jira/Eppo data |
| `/sync weekly` | Draft weekly update in Toon's 3-section format (uses `/toon` command) |
| `/sync add [URL \| slack \| email]` | Register a new destination |
| `/sync status` | Show the current sync registry |
| `/sync remove [name]` | Remove a destination |
| `/sync test [destination]` | Send a test message to verify connectivity |

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

The sync registry is a per-PM YAML config stored in Claude memory. Maps initiatives to Jira epics, artifact sections, and notification channels. Created during onboarding, grows as PMs add destinations.

**Structure:**

```yaml
jira:
  project: ""                    # set during onboarding (e.g. "HOMESQUAD")
  initiatives: {}                # initiative name → epic key, mapped by user

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

## How `/sync [updates]` works

```
Input (any format)
  → Parse: extract structured updates per initiative
  → Route: match updates to destinations via sync registry
  → Update Jira: comments, transitions, new tickets
  → Update Artifacts: Google Docs (inline + append), Google Slides (update or create)
  → Notify Channels: Slack posts, email notifications
  → Verify & Report: confirm all destinations updated
```

### 0. Onboarding (first run only)

Check if a sync registry reference memory exists. If found, load it and skip to Step 1.

If no registry exists, run the onboarding flow:

1. **Identify Jira project** — confirm or ask for the project key
2. **Register artifacts** — accept Google Doc/Slides URLs, verify access, discover structure (tabs, slides)
3. **Map initiatives** — ask which sections/tabs/slides correspond to which Jira epics
4. **Register channels (optional)** — Slack channels and/or email notifications with trigger/format rules
5. **Save the sync registry** — write to memory, confirm setup

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

### 5. Update Artifacts

For each registered artifact that has mapped sections for the affected initiatives, apply the appropriate update strategy:

#### Google Doc adapter

- **Read current state:** fetch with `includeTabsContent=True`, inspect structure
- **Edit canonical fields inline (CRITICAL):** update table cells, summary rows, key figures directly. Process from highest index to lowest to avoid shifts. Preserve formatting.
- **Append status log entry:** timestamped section at end of tab
- **Execute:** batch all requests per tab, inline edits before appends

#### Google Slides adapter

**Update modes:**
- `append_on_top`: new slides at position 0, existing slides = history
- `update_existing`: find mapped slides, update text/tables in place

### 6. Notify Channels

Runs last — notifications link to already-updated artifacts.

#### Slack adapter
- Use Slack MCP tools (`send_message`, `post_to_channel`)
- Formats: `detailed` (full context), `summary` (one-liner with links), `executive` (key outcome only)
- Thread behavior: reply in existing thread if same initiative, otherwise new message

#### Email adapter
- Use Gmail API or compose for manual send
- Formats: `digest` (HTML with sections per initiative), `executive` (2-3 sentences), `detailed` (full narrative)
- Frequency: immediate, daily digest, weekly digest

### 7. Verify & Report

Re-read modified sections, confirm Jira comments posted, report failures. Present summary table:

```
| Initiative         | Jira            | Artifacts          | Channels              | Changes                     |
|--------------------|-----------------|--------------------|----------------------|------------------------------|
| Screen Ranker MVP  | HOMESQUAD-967 ✓ | Doc ✓ Slides ✓    | #perso-updates ✓     | Launched, 33/33/33, 6 weeks  |
| Coffee tile        | HOMESQUAD-992 ✓ | Doc ✓             | #perso-updates ✓     | Released, DineOut swap       |
```

---

## `/sync artifacts` — Branded Slide Generation

Generates presentation slides directly in Google Slides using MCP tools. The `.js` reference files define the design specs — they are not executed, but translated into Google Slides API calls.

### Workflow

```
/sync artifacts
  ├── Step 1: Select type (Experiment, Lightspeed, or MPR)
  ├── Step 2: Select scope (initiative, market, time period)
  ├── Step 3: Pull fresh data (Jira, Eppo, Drive)
  ├── Step 4: Create Google Slides directly via MCP
  │     └── Use .js reference files as design specs
  └── Step 5: Save to registry for future updates
```

### Reference file map

| Artifact type | Template (design spec) | Filled examples |
|---------------|------------------------|-----------------|
| Experiment | `create-experiment-v2.js` | `create-3-experiments.js` |
| Lightspeed | `create-lightspeed-v3.js` | `create-lightspeed-coffee-tile.js` |
| MPR | `create-mpr-template.js` | `create-mpr-fuf.js`, `create-mpr-personalization.js` |

All reference files are in `.claude/skills/tlb-slides/references/`.

### Step-by-step

1. **Select type** — Experiment, Lightspeed, or MPR
2. **Select scope** — which initiative/experiment/market/quarter
3. **Pull fresh data** — Jira (initiative details, child stories), Eppo (experiment metrics, variants, significance), Drive (related docs, PRDs)
4. **Create slides** — create presentation via `mcp__google-workspace__create_presentation`, build slides via `mcp__google-workspace__batch_update_presentation`. Read the `.js` reference file for colors, positions, fonts, and content structure. Translate `pptxgenjs` calls into Google Slides API requests. Use `createShape`, `insertText`, `updateTextStyle`, `updateShapeProperties`. Inches to EMU: multiply by 914400.
5. **Save to registry** — store presentation ID and slide mapping so future `/sync [updates]` can update slides in place

### MCP API Patterns for Slides

```python
# Create presentation
mcp__google-workspace__create_presentation
  user_google_email: {PM's email}
  title: "{Artifact type} — {Initiative name}"

# Build slides
mcp__google-workspace__batch_update_presentation
  presentation_id: {id}
  user_google_email: {PM's email}
  requests: [
    # Create a slide
    {"createSlide": {"insertionIndex": 1, "slideLayoutReference": {"predefinedLayout": "BLANK"}}},
    # Create a shape
    {"createShape": {"objectId": "myShape", "shapeType": "RECTANGLE",
      "elementProperties": {"pageObjectId": "slideId",
        "size": {"width": {"magnitude": 914400, "unit": "EMU"}, ...},
        "transform": {"scaleX": 1, "scaleY": 1, "translateX": 0, "translateY": 0, "unit": "EMU"}}}},
    # Insert text
    {"insertText": {"objectId": "myShape", "text": "Hello World"}},
    # Style text
    {"updateTextStyle": {"objectId": "myShape",
      "style": {"foregroundColor": {"opaqueColor": {"rgbColor": {"red": 1, "green": 0.345, "blue": 0}}},
        "fontSize": {"magnitude": 25, "unit": "PT"}, "fontFamily": "Poppins", "bold": true},
      "fields": "foregroundColor,fontSize,fontFamily,bold"}},
    # Replace text
    {"replaceAllText": {"containsText": {"text": "{{placeholder}}", "matchCase": true},
      "replaceText": "Actual value", "pageObjectIds": ["slideId"]}}
  ]
```

---

## `/toon` — Weekly CEO Update

Drafts the weekly P&T update in Toon's mandated format:

1. **Scan** — Fetch active initiatives from Jira
2. **Gather context** — Pull from Slack channels, Google Drive docs, Gmail threads per initiative
3. **Draft** — CEO-scannable HTML email with:
   - Squad + PM header with OKR/KR progress table
   - Section 1: What shipped / progressed (cards with status, demo, metrics)
   - Section 2: Focus for next week
   - Section 3: Blockers and support needed
4. **Review** — Present draft for PM approval before sending

**Output:** branded HTML email, subject line `[P&T update] [Week NN] - Value - Home & Personalization`

---

## `tlb-slides` — Talabat Slide Design System

The complete brand design system for presentations. Used by `/sync artifacts` to generate on-brand slides.

**What it contains:**

- **Brand colors:** Orange `#FF5900`, Burgundy `#411517`, Cream `#F4EDE3`, Lime `#CFFF00`, Purple `#8318D8`
- **Typography:** Poppins (primary), DM Sans (secondary), Open Sans (org charts) — all TTF fonts bundled
- **Layout system:** Standard content slide layout with measurements, logo positions, accent bar specs
- **90+ reference screenshots:** Every slide type rendered for visual reference
- **Slide type catalog:** Cover (7 variants), Section dividers (3), Content (8), Multi-column (4), Agenda (3), Charts/data (20+), Special (20+), Thank you (3)
- **pptxgenjs code patterns:** Full code examples in `references/slide-patterns.md` for every slide type

---

## Rules

1. **Inline first, log second.** Always edit canonical fields (tables, summary rows, key metrics) before appending status sections. The canonical record IS the source of truth — a stale field with a correct log is a bug.

2. **Index discipline.** When making multiple edits in the same document section, process from highest index to lowest. This prevents index shifts from invalidating subsequent operations.

3. **Preserve formatting.** When replacing text in formatted cells (bold, italic, colored), re-apply the text style after insertion.

4. **All destinations or explicit failure.** Every registered destination for an affected initiative must be updated. If one fails, report it explicitly — don't silently skip.

5. **New tickets from action items.** If an update mentions an action item with an owner, create a Jira task automatically (with parent epic, assignee, priority).

6. **Artifact-type-aware operations.** Each artifact type has its own read/write patterns. Never apply Google Doc edit logic to Slides or vice versa. Use the correct adapter.

7. **Registry is the source of mapping truth.** All initiative-to-destination mappings live in the sync registry memory. If the user says "also sync to this new doc," update the registry — don't hardcode.

---

## How it all connects

```
PM says: "/sync Screen Ranker launched in UAE, 33/33/33 split, monitoring for 6 weeks"

                    ┌──────────────────────────────────┐
                    │         /sync parses input        │
                    └──────────┬───────────────────────┘
                               │
           ┌───────────────────┼───────────────────────┐
           │                   │                       │
     ┌─────▼─────┐     ┌──────▼──────┐        ┌───────▼───────┐
     │   Jira    │     │  Artifacts  │        │   Channels    │
     │           │     │             │        │               │
     │ Comment   │     │ Google Doc: │        │ Slack:        │
     │ on epic   │     │ update tab  │        │ #perso-updates│
     │ HOMESQUAD │     │ inline +    │        │ summary post  │
     │ -967      │     │ status log  │        │               │
     │           │     │             │        │ Email:        │
     │ Transition│     │ Google      │        │ stakeholder   │
     │ stories   │     │ Slides:     │        │ notification  │
     └───────────┘     │ update deck │        └───────────────┘
                       │ slide       │
                       └─────────────┘
```

When the PM later runs `/sync artifacts`, it generates a new branded deck pulling live data from Jira and Eppo, using the `tlb-slides` design system for colors, fonts, and layout.

When the PM runs `/toon` or `/sync weekly`, it scans the board, gathers context from all registered sources, and drafts a polished weekly email.

---

## Requirements

- **Claude Code** with MCP tools enabled
- **Jira** (Atlassian MCP) — for initiative tracking
- **Google Workspace** (Google MCP) — for Docs, Slides, Gmail, Drive
- **Slack** (Slack MCP) — for channel notifications
- **Eppo** (Eppo MCP, optional) — for experiment metrics

## Setup

1. Clone this repo into your Claude Code skills directory
2. Run `/sync` — the onboarding flow will configure your Jira project, map initiatives, and register artifact destinations
3. Start syncing: `/sync [paste your update here]`
