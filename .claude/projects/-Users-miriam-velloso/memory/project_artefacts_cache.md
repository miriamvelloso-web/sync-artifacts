---
name: TLB Artefacts Jira cache refresh
description: Recurring task — refresh jira_cache.json via MCP (not API token), save dated snapshots for week-over-week comparison
type: project
originSessionId: ae2d79b3-40ba-4a2d-917e-1ccec6d1f935
---
## Process
1. Fetch TLBPT Q2Y26 issues via Atlassian MCP (cloudId: deliveryhero.atlassian.net)
2. Phase 1: `project = TLBPT AND issuetype in (Objectives, "Key Results", Initiative, Epic) AND summary ~ "[Q2Y26]"`
3. Phase 2: ALL children of ALL KR keys — `parent in (...) ORDER BY key ASC` (NO project filter — children live in TLBGROW, TLBVAL, TLBGR, TLBNMRSTR, GIC, etc). Paginate with `key > LAST_KEY` when isLast=false.
4. Phase 3: Epics under cross-project initiatives (same approach)
5. Remove excluded issues (e.g. TLBPT-301)
6. Save snapshot to `data/snapshots/jira_cache_YYYY-MM-DD.json` before overwriting
7. Write active cache to `data/jira_cache.json`

CRITICAL: Do NOT use `project != TLBPT` filter in Phase 2 — it causes TLBPT initiatives under KRs to be missed. Also, paginating with `key > X` can skip issues from projects alphabetically before the last key. Instead, fetch ALL children without project filter.

## Custom fields
- PRD link: `customfield_10364`
- Eppo link: `customfield_10513`

## Cache format
```json
{"fetched_at": "ISO timestamp", "issues": {"KEY": {"key", "summary", "status", "type", "parent", "prd_link", "eppo_link"}}}
```

## Notes
- .env has placeholder Jira credentials — always use Atlassian MCP instead
- TLBPT-301 (Order Tracking - Rider/stages clarity) was removed — doesn't belong to Adrian's scope
- Cross-project children come from: TLBGROW, TLBVAL, TLBGR, TLBNMRSTR, GIC, and potentially others
- Snapshots started 2026-04-21; compare counts/statuses between snapshots for period reporting
- Period selector changed from text input to dropdown (this week + last week)

**Why:** Miriam needs to refresh regularly and compare week-over-week changes for demos and reporting.
**How to apply:** Always save a snapshot before refreshing. Flag issue count changes vs previous snapshot.
