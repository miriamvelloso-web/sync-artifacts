---
name: Toon Update daily Jira refresh
description: Daily workflow to refresh activity cache from Jira MCP for all 98 PM epics — triggered by "refresh toon data"
type: project
originSessionId: 0a7c76c2-30c0-4767-ab3e-4504916d9f24
---
## Daily Jira Activity Refresh

When Miriam says "refresh toon data" or "update toon", run this workflow:

### Steps
1. Call `get_all_pm_epic_keys()` from `services/jira_service.py` to get all epic keys (~98 across TLBVAL, TLBGROW, TLBPT)
2. Spawn 3 parallel agents to fetch via Atlassian MCP:
   - `mcp__atlassian__getJiraIssue` with `cloudId: "deliveryhero.atlassian.net"`, `responseContentFormat: "markdown"`, `fields: ["summary","status","description","comment"]`
   - Batch 5-6 epics per parallel call within each agent
3. Extract from each issue: summary, status, description (first 200 chars), comments (author, created date as YYYY-MM-DD, body first 300 chars)
4. Call `bulk_update_activity_cache(updates)` with the parsed data — this saves to `data/activity_cache.json` with current `week_start`
5. **NEW — Fetch child stories/tasks**: After step 4, call `refresh_activity_with_children(all_epic_keys)` from `services/jira_service.py`. This fetches stories/tasks under each epic that changed in the last 7 days via Jira REST API, classifies them into shipped/next/blockers, and updates the activity cache.

### Key details
- Jira REST API does NOT work for epic-level data (expired creds) — only MCP path works for that
- Jira REST API DOES work for child issue fetching via `fetch_epic_children()` — uses basic auth from config
- Comments in toon update page are filtered by selected week (Mon-Sun)
- Cache file: `data/activity_cache.json`
- Helper functions in `services/jira_service.py`: `get_all_pm_epic_keys()`, `bulk_update_activity_cache()`, `refresh_activity_with_children()`, `fetch_epic_children()`

**Why:** Miriam reviews PM updates daily and needs fresh Jira comment data + story/task movement in the Streamlit toon update page without manually checking each epic.

**How to apply:** When asked to refresh, run the full pipeline. Don't ask questions, just do it.
