# /jira — Jira Board Management Skill

## What it does

Full Jira board management for PMs, covering the complete sprint lifecycle: quarterly planning, daily updates, sprint management, drift detection, and weekly reporting. Each mode maps to a real PM workflow.

## Prerequisites

- **Jira:** `JIRA_EMAIL`, `JIRA_TOKEN`, `JIRA_INSTANCE` environment variables (or `work/setup-log.yaml` config)
- **Tool:** `tools/jira_api.py` — CLI and Python API for all Jira operations
- **Optional:** `work/setup-log.yaml` for sprint cadence, label conventions, stakeholder config

## Usage

```
/jira                         → Quick board snapshot
/jira plan                    → Parse roadmap into epics, stories, sprints
/jira update [context]        → Apply changes from meetings, decisions, or instructions
/jira sprint [create|close|replan] → Sprint lifecycle management
/jira kickoff                 → Post sprint objectives to parent initiatives + Slack
/jira sync                    → Cross-reference Jira state with local context, surface drift
/jira weekly                  → Generate weekly update from live Jira data
```

## Modes

### `/jira` (no args) — Quick Snapshot
Shows active sprint status, completion rates, and next sprint preview in 5-10 lines.

### `/jira plan` — Quarter Planning
Parses a markdown roadmap (file, pasted text, or Google Doc URL) into Jira:
- Extracts epics, stories, sprint calendar
- Validates: acceptance criteria present, story vs task discipline, no duplicates
- Presents parsed plan for confirmation before creating
- Bulk creation (5+ epics) delegates to the jira-planner agent
- Reports: epics created, stories assigned, sprints built

### `/jira update [context]` — Day-to-Day Updates
The most-used mode. Accepts natural language, meeting notes, or direct instructions:
- Parses intent: description updates, sprint moves, new stories/tasks, status changes
- Fetches current state and proposes changes before executing
- Enforces story vs task discipline (action items → tasks, not stories)
- Posts update comments with @mentions to affected issues
- Rolls up changes to parent epics for stakeholder visibility
- Updates sprint goals when composition changes

### `/jira sprint` — Sprint Management
Three sub-modes:
- **create:** Suggests next sprint based on cadence config, creates and assigns stories
- **close:** Generates completion report, handles incomplete stories (move forward or backlog)
- **replan:** Reshuffles stories across future sprints from natural language instructions

### `/jira kickoff` — Sprint Kickoff
Runs after sprint planning:
- Maps sprint stories → epics → parent initiatives
- Tags domain-appropriate stakeholders (@mentions in comments)
- Posts structured initiative comments with sprint objectives
- Composes a Slack kickoff message (posts directly if Slack connected, or provides copyable text)

### `/jira sync` — Drift Detection
Cross-references Jira state with local context:
- Finds decisions from meetings not yet reflected in Jira
- Spots stories stuck in the same status for 5+ days
- Identifies epics with no stories in current/next sprint
- Flags sprint goals mismatched with actual story composition
- Offers to fix each discrepancy

### `/jira weekly` — Weekly Update
Generates a structured weekly update:
- Shipped this week (grouped by epic with impact statements)
- In progress (table: story, epic, assignee, status)
- Coming next week (next sprint goal + key stories)
- Epic progress (completion percentages)
- Blockers/risks and key decisions

## Quality Gates

Built-in PM discipline checks run across all modes:

- **Story quality:** Every story must have description, acceptance criteria (2+), and a "why" connecting to the epic goal
- **Task detection:** Action-item-style summaries are flagged — "should this be a task under [story] instead?"
- **Sprint goal consistency:** After sprint composition changes, checks if the goal still matches

## Jira API Tool

All operations go through `tools/jira_api.py`:

```bash
# Board & Sprint
python tools/jira_api.py board-info
python tools/jira_api.py get-sprints [--state active|future|closed]
python tools/jira_api.py sprint-report --sprint-id ID
python tools/jira_api.py create-sprint --name "..." --start DATE --end DATE --goal "..."

# Issues
python tools/jira_api.py get-issue KEY
python tools/jira_api.py search --jql "JQL query"
python tools/jira_api.py create-epic --summary "..." --description-file desc.json
python tools/jira_api.py create-story --summary "..." --epic KEY --description-file desc.json
python tools/jira_api.py create-task --summary "..." --parent KEY
python tools/jira_api.py update-issue KEY --summary "..." --description-file desc.json
python tools/jira_api.py transition KEY --name "Done"
python tools/jira_api.py move-to-sprint --sprint-id ID --issues KEY1,KEY2

# Comments & Labels
python tools/jira_api.py add-comment KEY --text "..." [or --body-file adf.json]
python tools/jira_api.py add-labels KEY --labels label1 label2

# Users & Reports
python tools/jira_api.py find-user --email user@company.com
python tools/jira_api.py weekly-summary
python tools/jira_api.py epic-progress
```

## Architecture

```
/jira [mode]
    │
    ├── Parse user input (natural language, files, images)
    │
    ├── Fetch current Jira state (sprints, issues, epics)
    │
    ├── Validate + propose changes (show before executing)
    │
    ├── Execute via tools/jira_api.py
    │     ├── Issue CRUD (create, update, transition)
    │     ├── Sprint management (create, assign, close)
    │     ├── Comments with ADF formatting + @mentions
    │     └── Stakeholder notifications
    │
    └── Report results
```

## File Location

`.claude/skills/jira/SKILL.md`
