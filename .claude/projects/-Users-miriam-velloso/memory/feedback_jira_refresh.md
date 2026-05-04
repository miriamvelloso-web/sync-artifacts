---
name: Skip static OKR/KR data on Jira refresh
description: Don't re-fetch Objectives and Key Results during cache refresh — they're fixed within the quarter. Only fetch initiative status updates and new children.
type: feedback
originSessionId: 237ac6d0-745c-42c0-be0f-873f8b50ca2c
---
When refreshing the Jira cache, don't pull the full OKR tree every time. Objectives and Key Results are static within the quarter.

**Why:** Re-fetching 50+ Objectives/KRs that never change wastes MCP calls and time. Only initiatives and their children change week to week.

**How to apply:** On "refresh jira cache" or "refresh cache", only fetch initiatives and epics (the leaves that actually update). Merge status/field changes into the existing cache rather than rebuilding from scratch. Only do a full tree fetch if explicitly asked or at start of a new quarter.
