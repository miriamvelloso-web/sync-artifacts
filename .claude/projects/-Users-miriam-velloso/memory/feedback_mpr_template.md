---
name: MPR deck structure
description: Monthly Product Review deck structure — agenda, OKR status, deep dives per initiative with experiment slides or Jira updates, artifact registration
type: feedback
originSessionId: a8d9e505-2146-4839-9338-642e23db83e4
---
MPR (Monthly Product Review) deck structure per PM/squad:

## Slide order

1. **Agenda** — table of contents
2. **OKR status overview** — KR-level progress and status (same format as weekly: KR name, %, On Track/At Risk/Blocked)
3. **Deep dives — one per initiative:**
   - If the initiative is an **experiment** → use the Experiment slide template (from `/sync artifacts`)
   - If not an experiment → pull latest update from Jira (description, child story status, recent activity)
4. **New artifacts** — if the PM has new docs/decks/dashboards to register, offer `/sync add [URL]` to save them to their sync registry for future updates

**Why:** MPR is the monthly deep-dive counterpart to the weekly Toon update. Weekly = status scan. MPR = full picture per initiative with the right slide type based on what the initiative actually is (experiment vs build vs rollout).

**How to apply:** When generating an MPR deck (`/sync slides` or dedicated MPR mode), follow this structure. For experiment initiatives, pull the experiment slide template and fill with Eppo data. For non-experiment initiatives, synthesize from Jira. Always ask if there are new artifacts to register at the end.
