# /sync — PM Initiative Sync Skill

Route initiative updates from any input format to all registered destinations — Jira, Google Docs, Google Slides, Slack, and email. One input, all systems updated, all stakeholders notified.

## What it does

| Command | Description |
|---------|-------------|
| `/sync` | Push updates to Jira + artifacts + channels |
| `/sync artifacts` | Generate branded slide decks (experiment reviews, lightspeed, MPR) |
| `/sync add [URL]` | Register a new Google Doc or Slides artifact |
| `/sync add slack` | Add Slack channel notifications |
| `/sync weekly` | Draft weekly initiative updates |

## Setup

1. Install as a Claude Code skill (copy `SKILL.md` to your `.claude/skills/` directory)
2. Run `/sync` — first run triggers onboarding (Jira project, initiatives, OKR discovery)
3. Add artifacts: paste Google Doc/Slides URLs when prompted
4. Optional: add Slack/email notification channels

## Requirements

- **Jira MCP** — Atlassian MCP server connected
- **Google Workspace MCP** — for reading/writing Docs and Slides
- **Slack MCP** (optional) — for channel notifications
- **Eppo MCP** (optional) — for pulling live experiment data into slides

## Files

| File | Description |
|------|-------------|
| [`SKILL.md`](SKILL.md) | Full skill definition (install this) |
| [`.claude/skills/sync/SKILL.md`](.claude/skills/sync/SKILL.md) | Same file, Claude Code auto-load path |

## Built by

Miriam Velloso — Product Ops, Growth @ Talabat
