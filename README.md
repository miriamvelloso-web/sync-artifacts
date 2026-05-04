# sync-artifacts

A Claude Code skill system for Product Managers at Talabat. Syncs initiative updates across Jira, Google Docs, Google Slides, Slack, and email — from a single input.

## What this repo contains

```
.claude/
├── commands/
│   └── toon.md                  # /toon — weekly CEO update in branded HTML
├── skills/
│   ├── sync/
│   │   └── SKILL.md             # /sync — universal PM initiative router
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

## Skills overview

### `/sync` — Universal PM Initiative Router

The core skill. Works for any PM. On first run, it onboards the PM by discovering their Jira project, mapping initiatives to epics, and registering artifact destinations.

**Commands:**

| Command | What it does |
|---------|-------------|
| `/sync [updates]` | Parse updates from any input (text, images, PDFs, Slack messages), route to all registered destinations |
| `/sync artifacts` | Generate branded slide decks (Experiment, Lightspeed, MPR) from live Jira/Eppo data |
| `/sync weekly` | Draft weekly update in Toon's 3-section format (→ uses `/toon` command) |
| `/sync add [URL \| slack \| email]` | Register a new destination |
| `/sync status` | Show the current sync registry |
| `/sync remove [name]` | Remove a destination |
| `/sync test [destination]` | Send a test message to verify connectivity |

**How `/sync [updates]` works:**

```
Input (any format)
  → Parse: extract structured updates per initiative
  → Route: match updates to destinations via sync registry
  → Update Jira: comments, transitions, new tickets
  → Update Artifacts: Google Docs (inline + append), Google Slides (update or create)
  → Notify Channels: Slack posts, email notifications
  → Verify & Report: confirm all destinations updated
```

**Sync registry:** A per-PM YAML config stored in Claude memory. Maps initiatives to Jira epics, artifact sections, and notification channels. Created during onboarding, grows as PMs add destinations.

### `/sync artifacts` — Branded Slide Generation

Generates presentation slides directly in Google Slides using MCP tools. The `.js` reference files define the design specs — they are not executed, but translated into Google Slides API calls.

**Workflow:**

```
/sync artifacts
  ├── Step 1: Select type (Experiment, Lightspeed, or MPR)
  ├── Step 2: Select scope (initiative, market, time period)
  ├── Step 3: Pull fresh data (Jira, Eppo, Drive)
  ├── Step 4: Create Google Slides directly via MCP
  │     └── Use .js reference files as design specs
  └── Step 5: Save to registry for future updates
```

**Reference file map:**

| Artifact type | Template (design spec) | Filled examples |
|---------------|------------------------|-----------------|
| Experiment | `create-experiment-v2.js` | `create-3-experiments.js` |
| Lightspeed | `create-lightspeed-v3.js` | `create-lightspeed-coffee-tile.js` |
| MPR | `create-mpr-template.js` | `create-mpr-fuf.js`, `create-mpr-personalization.js` |

### `/toon` — Weekly CEO Update

Drafts the weekly P&T update in Toon's mandated format:

1. **Scan** — Fetch active initiatives from Jira
2. **Gather context** — Pull from Slack channels, Google Drive docs, Gmail threads per initiative
3. **Draft** — CEO-scannable HTML email with:
   - Squad + PM header with OKR/KR progress table
   - Section 1: What shipped / progressed (cards with status, demo, metrics)
   - Section 2: Focus for next week
   - Section 3: Blockers and support needed
4. **Review** — Present draft for PM approval before sending

Output: branded HTML email, subject line `[P&T update] [Week NN] - Value - Home & Personalization`

### `tlb-slides` — Talabat Slide Design System

The complete brand design system for presentations. Used by `/sync artifacts` to generate on-brand slides.

**What it contains:**

- **Brand colors:** Orange `#FF5900`, Burgundy `#411517`, Cream `#F4EDE3`, Lime `#CFFF00`, Purple `#8318D8`
- **Typography:** Poppins (primary), DM Sans (secondary), Open Sans (org charts) — all TTF fonts bundled
- **Layout system:** Standard content slide layout with measurements, logo positions, accent bar specs
- **90+ reference screenshots:** Every slide type rendered for visual reference
- **Slide type catalog:** Cover (7 variants), Section dividers (3), Content (8), Multi-column (4), Agenda (3), Charts/data (20+), Special (20+), Thank you (3)
- **pptxgenjs code patterns:** Full code examples in `references/slide-patterns.md` for every slide type

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
