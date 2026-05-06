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
│   ├── tlb-sync/
│   │   └── SKILL.md             # /tlb-sync — extended sync with slides, weekly, experiment modes
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

Works for **any PM**. On first run, it onboards the PM by discovering their Jira project, mapping initiatives to epics, and registering artifact destinations. The onboarded PM is always used — no selection prompts.

Route initiative updates from any input format to all registered destinations:
- **Jira** — operational tracking (comments, transitions, new tickets)
- **Artifacts** — source-of-truth documents (Google Docs, Slides, etc.)
- **Channels** — stakeholder notifications (Slack, email, etc.)

One input, all systems updated, all stakeholders notified.

### Commands

| Command | What it does |
|---------|-------------|
| `/sync [updates]` | Parse updates from any input (text, images, PDFs, Slack messages), route to all registered destinations |
| `/sync artifacts` | Generate branded Google Slides decks from live Jira/Eppo data (see below) |
| `/sync slides` | Generate an OKR-based Jira deck with one slide per initiative |
| `/sync weekly` | Draft weekly update in Toon's 3-section format (uses `/toon` command) |
| `/sync experiment` | Draft an experiment launch or results email for an initiative |
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

**Key design principle:** The parse layer, artifact layer, and channel layer are independent. Adding a new destination type means registering it in the sync registry — it does not change how input is parsed or how other destinations are updated.

| Category | Purpose | Examples | When it fires |
|----------|---------|----------|---------------|
| **Jira** | Operational state | Comments, transitions, new tickets | Always (every /sync) |
| **Artifacts** | Source-of-truth docs | Google Docs, Slides | When mapped sections are affected |
| **Channels** | Stakeholder comms | Slack, email | When the update is significant enough to notify |

---

## `/sync artifacts` — Branded Slide Generation

**Google Slides only.** Generates presentation decks directly via Google Slides API using the `tlb-slides` brand design system.

### Dynamic Menu

When invoked, `/sync artifacts` shows a **dynamic selection menu** built from:

1. **Experiment** — experiment review deck (always available)
2. **Lightspeed** — eng/product sync deck (always available)
3. **MPR** — monthly product review deck (always available)
4. **Previously registered decks** — any Google Slides decks the PM registered in past sessions
5. **+ New deck** — register a brand new Google Slides presentation on the spot

Once a PM registers a new deck via option 5, it persists permanently in their sync registry and appears in the menu on every future run.

### Create-or-Update Logic

When the PM selects a type (e.g. "Experiment"):

1. **Show current initiatives** — pull live data from Jira for the quarter's active initiatives
2. **PM picks one** — e.g. "Screen Ranker Home"
3. **Check if deck already exists** — look in the sync registry for a matching presentation
   - **No deck exists** → create a new Google Slides presentation
   - **Deck already exists** → update it in place with fresh data (no duplicates)
4. **Save/update the registry** — store presentation ID, folder, slide mapping, last_updated timestamp

### Drive Folder Structure

All generated decks are organized in Google Drive:

```
Q{quarter}Y{year} PM: {PM Name} BET: {Bet Name}/
├── Experiments/
│   ├── Screen Ranker Experiment Review
│   └── Coffee Tile Experiment Review
├── MPR/
│   └── May 2026 MPR — Personalization
├── Lightspeed/
│   └── Perso Orchestrator Lightspeed
└── (other registered decks)/
```

- Root folder + subfolders created on first run if they don't exist
- Folder IDs saved in the sync registry for reuse
- Every generated deck goes into the correct subfolder by type

### MPR Deck

The MPR (Monthly Product Review) uses an existing master template (Google Slides). Workflow:

1. **Duplicate the master template** via `copy_drive_file` — never recreate from scratch
2. **Fill with live data** from the onboarded PM's Jira board
3. **Structure:** Agenda → OKR status overview → Deep dive per initiative → Register new artifacts
4. **Deep dive types:** Experiment initiatives get the experiment slide template; non-experiment initiatives get Jira update format

### Experiment Results Writing

When generating experiment result content for slides, write as a data analyst summarizing for non-technical stakeholders:

- 1 opening sentence stating what was tested and the headline result
- 3-5 narrative bullet points with bold metrics
- Under 150 words total
- No jargon (no MDE, p-value, confidence interval, CUPED)
- Say "reliable" not "statistically significant", "flat" not "non-significant"
- Every bullet references actual numbers
- Confirm guardrails are safe or flag if hurt

### Reference File Map

| Artifact type | Template (design spec) | Filled examples |
|---------------|------------------------|-----------------|
| Experiment | `create-experiment-v2.js` | `create-3-experiments.js` |
| Lightspeed | `create-lightspeed-v3.js` | `create-lightspeed-coffee-tile.js` |
| MPR | `create-mpr-template.js` | `create-mpr-fuf.js`, `create-mpr-personalization.js` |

All reference files are in `.claude/skills/tlb-slides/references/`.

---

## Sync Registry

The sync registry is a per-PM YAML config stored in Claude memory. Maps initiatives to Jira epics, artifact sections, and notification channels. Created during onboarding, grows as PMs add destinations.

```yaml
pm:
  name: "Adrian Alvarez"
  email: "adrian.alvarez@talabat.com"
  jira_cloud_id: "deliveryhero.atlassian.net"
  jira_project: "HOMESQUAD"

okr_hierarchy:
  objective:
    key: "TLBPT-317"
    name: "O6. Establish a personalisation engine..."
  key_results:
    - key: "TLBPT-319"
      name: "O6.KR1. Increase component clicks/session..."
      initiatives: ["HOMESQUAD-967"]

jira:
  initiatives:
    "Screen Ranker Home": { epic_key: "HOMESQUAD-967", status: "Experiment" }
    "Coffee Tile Time-Based": { epic_key: "HOMESQUAD-992", status: "Experiment" }
    "Perso Orchestrator MVP": { epic_key: "HOMESQUAD-1012", status: "In Progress" }

artifacts:
  - type: google_doc
    name: "Strategy Doc"
    id: "abc123..."
    tabs:
      - tab_id: t.xxxxx
        title: "SR MVP rollout"
        initiative: "Screen Ranker Home"
        epic_key: "HOMESQUAD-967"

drive_folders:
  root: "folder_id"
  experiments: "folder_id"
  mpr: "folder_id"
  lightspeed: "folder_id"

generated_decks:
  - presentation_id: "1abc..."
    type: experiment
    epic_key: "HOMESQUAD-967"
    folder_id: "folder_id"
    last_updated: "2026-05-06"

channels: []
  # Slack channels, email routes with trigger/format/frequency rules

context_sources:
  HOMESQUAD-967:
    slack_keywords: ["screen ranker", "SR MVP"]
    drive_docs: []
    gmail_keywords: ["screen ranker"]
```

---

## How `/sync [updates]` Works

```
Input (any format)
  → Parse: extract structured updates per initiative
  → Route: match updates to destinations via sync registry
  → Update Jira: comments, transitions, new tickets
  → Update Artifacts: Google Docs (inline + append), Google Slides (update or create)
  → Notify Channels: Slack posts, email notifications
  → Verify & Report: confirm all destinations updated
```

### Onboarding (first run only)

1. **Identify Jira project** — confirm or ask for the project key
2. **Discover Jira structure** — fetch full epic/initiative hierarchy
3. **Register artifacts** — accept Google Doc/Slides URLs, verify access, discover structure
4. **Map initiatives** — link sections/tabs/slides to Jira epics
5. **Register channels (optional)** — Slack and/or email with trigger/format rules
6. **Discover context sources** — Slack channels, Drive docs, Gmail contacts per initiative
7. **Save the sync registry** — write to memory, confirm setup

### Update Flow

1. **Parse** — extract per-initiative updates from any input format
2. **Load registry** — identify affected initiatives, epics, artifacts, channels
3. **Route** — build routing plan, present for approval
4. **Update Jira** — comments, transitions, new tickets, field edits
5. **Update Artifacts** — Google Docs (inline edits + status log), Google Slides (update existing or create)
6. **Notify Channels** — Slack (detailed/summary/executive), email (immediate/digest)
7. **Verify & Report** — re-read, confirm, summary table

---

## `/toon` — Weekly CEO Update

Drafts the weekly P&T update in Toon's mandated format:

1. **Scan** — Fetch active initiatives from Jira
2. **Gather context** — Pull from Slack channels, Google Drive docs, Gmail threads per initiative
3. **Draft** — CEO-scannable HTML email with:
   - Squad + PM header with OKR/KR progress table
   - Section 1: What shipped / progressed
   - Section 2: Focus for next week
   - Section 3: Blockers and support needed
4. **Review** — Present draft for PM approval before sending

---

## `tlb-slides` — Talabat Slide Design System

The complete brand design system for presentations. **Always use this skill when creating any slides** — never build slides without consulting the brand system.

- **Brand colors:** Orange `#FF5900`, Burgundy `#411517`, Cream `#F4EDE3`, Lime `#CFFF00`, Purple `#8318D8`
- **Typography:** Poppins (primary), DM Sans (secondary), Open Sans (org charts) — TTF fonts bundled
- **Layout system:** 10" x 5.63" (16:9), standard content layout with measurements, logo positions, accent bar specs
- **90+ reference screenshots:** Every slide type rendered for visual reference
- **Slide type catalog:** Cover (7 variants), Section dividers (3), Content (8), Multi-column (4), Agenda (3), Charts/data (20+), Special (20+), Thank you (3)
- **Code patterns:** Full pptxgenjs examples in `references/slide-patterns.md` for every slide type

Slides are created directly via Google Slides API — **never generate .pptx files**.

---

## Rules

1. **Always use `/tlb-slides`** — never create slides without the Talabat brand design system
2. **Always use the onboarded PM** — never ask which PM; use the one from the sync registry
3. **MPR uses the master template** — duplicate via `copy_drive_file`, never recreate from scratch
4. **Inline first, log second** — edit canonical fields before appending status sections
5. **Index discipline** — process edits from highest index to lowest within each tab
6. **Preserve formatting** — re-apply text style after insertion in formatted cells
7. **All destinations or explicit failure** — every registered destination must be updated or reported as failed
8. **Create new tickets from action items** — if an update mentions an action item with an owner, create a Jira task
9. **Artifacts = Google Slides only** — `/sync artifacts` is exclusively for slide decks
10. **Create or update, never duplicate** — check if a deck exists before creating; update in place if it does
11. **Organize in Drive folders** — all generated decks go into `Q{q}Y{yy} PM: {Name} BET: {Bet}/{Type}/`
12. **Registry is truth** — all mappings live in the sync registry memory file

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
