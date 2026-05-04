---
name: tlb-sync
description: '"Sync initiative updates to Jira and artifact SoTs (Google Docs, Slides,
  etc.) in one pass. Usage: /sync [updates as text, images, PDFs, or any format]"'
metadata:
  version: 0.1.0
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
## Steps

### 0. Onboarding (first run only)

Check if a sync registry reference memory exists (search MEMORY.md for a memory containing "sync registry" or "sync destinations"). If found, load it and skip to Step 1.

If no registry exists, run the onboarding flow:

#### a) Identify Jira project

If Jira is already configured (check `work/setup-log.yaml`), confirm: "I see your Jira project is [PROJECT]. Is that the one you want to sync updates to?"

If not configured, ask for the Jira project key.

#### b) Register artifacts

Ask: "What documents do you use as sources of truth for your initiatives? These can be Google Docs, Google Slides, or other documents. Paste the URL(s)."

Accept one or more URLs. For each:
1. Detect the artifact type from the URL (Google Doc, Google Slides, etc.)
2. Verify read+write access. If scope is insufficient, provide the gcloud command with the required scopes.
3. Discover the artifact's structure:
   - **Google Doc:** list all tabs (nested) with IDs and titles
   - **Google Slides:** list all slides with IDs, titles, and content summaries
4. Present the structure to the user

#### c) Map initiatives

For each artifact, ask: "Which sections/tabs/slides correspond to your initiatives? For each one, tell me the Jira epic key too."

Accept natural language mappings:
- "SR MVP rollout tab → HOMESQUAD-967"
- "Slide 3 (Coffee tile) → HOMESQUAD-992"

#### d) Register channels (optional)

Ask: "Do you want /sync to also notify stakeholders via Slack or email when updates are pushed? You can set this up now or later with `/sync add slack` or `/sync add email`."

If yes for **Slack:**
1. Check if Slack MCP tools are available
2. Ask: "Which Slack channel(s) should receive updates? And for each, should it get all updates, only specific initiatives, or only significant ones (launches, blockers)?"
3. Accept routing rules in natural language: "#personalization-updates gets everything, #home-squad only Screen Ranker and Coffee tile, DM Ahmed only for launches"
4. Ask about format preference per channel: detailed, summary, or executive

If yes for **email:**
1. Ask: "Who should receive email notifications? And for each, what triggers an email?"
2. Accept routing rules: "Ahmed gets significant updates immediately, leadership list only on milestones"
3. Ask about frequency: immediate, daily digest, or weekly digest

If no: skip, the registry stores an empty channels list. Can be added later.

#### e) Save the sync registry

Write a reference memory file containing the full registry (Jira config + all artifacts + all channels with their routing rules). Add to MEMORY.md index.

#### f) Confirm

Present: "Setup complete. /sync will push updates to:"
- Jira project [PROJECT] — [N] initiatives mapped
- [Artifact name] ([type]) — [N] sections mapped
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
- **`/sync weekly`** — Draft weekly update in Toon's 3-section format. See `/toon` command.
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
  ├── Step 1: Select type (Experiment, Lightspeed, or MPR)
  ├── Step 2: Select scope (which initiative, market, time period)
  ├── Step 3: Pull fresh data (Jira, Eppo, Drive)
  ├── Step 4: Create Google Slides directly via MCP tools
  │     └── Use .js reference files as design specs
  │         (colors, positions, content structure)
  └── Step 5: Save last run to registry
```

### Reference File Map

Each artifact type has a template file (design spec) and filled examples:

| Artifact | Template (design spec) | Filled examples |
|----------|------------------------|-----------------|
| **Experiment** | `create-experiment-v2.js` | `create-3-experiments.js` (SR, Flash Sale, Coffee) |
| **Lightspeed** | `create-lightspeed-v3.js` | `create-lightspeed-coffee-tile.js` |
| **MPR** | `create-mpr-template.js` | `create-mpr-fuf.js`, `create-mpr-personalization.js` |

All reference files are in `.claude/skills/tlb-slides/references/`.

### Step 1: Select type

Ask: "Which artifact type? Experiment, Lightspeed, or MPR?"

### Step 2: Select scope

Based on type:
- **Experiment** — which initiative? Which experiment in Eppo?
- **Lightspeed** — which initiative? Which market/slice?
- **MPR** — which PM/squad? Which quarter?

### Step 3: Pull fresh data

Fetch live data from registered sources:
- **Jira**: initiative details, child stories, recent activity
- **Eppo** (if experiment): metrics, variants, statistical significance
- **Drive**: related docs, PRDs, strategy docs

### Writing Experiment Results (for slides)

When generating experiment result content for slides, write as a data analyst summarizing for non-technical stakeholders (VPs, GMs, PMs). Use the **exec summary format**:

**Structure:**
- 1 short opening sentence stating what was tested and the headline result
- 3-5 bullet points covering: primary metric result, guardrail status, any notable secondary findings, and recommended action
- Bold (`**`) the single most important number
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

**Source:** Adapted from [`talabat-dhme/data-apps/exp-analysis-bot/llm.py`](https://github.com/talabat-dhme/data-apps/blob/main/exp-analysis-bot/llm.py) (exec summary prompt).

### Step 4: Create slides in Google Slides

Create the presentation directly using MCP tools — **do NOT generate .pptx files**.

```
mcp__google-workspace__create_presentation
  user_google_email: {PM's email}
  title: "{Artifact type} — {Initiative name}"
```

Build slides using `mcp__google-workspace__batch_update_presentation`.

Read the appropriate `.js` reference file for the design spec:
- Extract colors, positions, font sizes, and content structure
- Translate `pptxgenjs` calls into Google Slides API requests
- Use `createShape`, `insertText`, `updateTextStyle`, `updateShapeProperties`
- Inches to EMU: multiply by 914400

The `tlb-slides/SKILL.md` has the full brand design system (color palette, typography scale, layout rules, logo positions).

### Step 5: Save to registry

After generating, save the presentation ID and slide mapping to the sync registry so future `/sync [updates]` can update slides in place.

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
