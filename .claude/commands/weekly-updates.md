# Weekly TLBOPS Initiative Updates

Run the full weekly update cycle for Miriam's TLBOPS Jira board. Scans all active initiatives, gathers context from Slack, Google Drive, and Gmail, drafts Jira comments, and posts after approval.

**Trigger**: Miriam says "weekly updates", "run weekly", or invokes `/weekly-updates`
**Owner**: miriam.velloso@talabat.com
**Jira cloud ID**: `deliveryhero.atlassian.net`
**Google email**: `miriam.velloso@talabat.com`

---

## Step 1: Scan the TLBOPS board

Fetch all non-Done initiatives:

```
mcp__atlassian__searchJiraIssuesUsingJql
  cloudId: deliveryhero.atlassian.net
  jql: "project = TLBOPS AND status != Done ORDER BY key ASC"
  fields: ["summary", "status", "priority", "assignee", "updated", "description", "labels", "issuetype"]
  maxResults: 50
  responseContentFormat: markdown
```

List them to Miriam:
```
Found {N} active initiatives:
- TLBOPS-X — {Summary} ({status})
...
```

Identify which ones were **updated in the last 7 days** (check the `updated` field). These are the scope for weekly comments.

---

## Step 2: Gather context per initiative

For EACH initiative updated in the last 7 days, run ALL of the following in parallel:

### 2a. Jira details + child issues

Fetch the issue with changelog:
```
mcp__atlassian__getJiraIssue
  cloudId: deliveryhero.atlassian.net
  issueIdOrKey: {ISSUE_KEY}
  expand: "changelog"
  responseContentFormat: markdown
```

Fetch child issues updated recently:
```
mcp__atlassian__searchJiraIssuesUsingJql
  jql: "parent = {ISSUE_KEY} AND updated >= -7d ORDER BY updated DESC"
  fields: ["summary", "status", "assignee", "updated"]
  responseContentFormat: markdown
```

### 2b. Slack channels

Use `mcp__Slack__search_messages` (capital S) for keyword-based search, and `mcp__Slack__read_channel_history` for known channels.

**Initiative-specific channels (read history for last 7 days):**

| Initiative | Channel ID | Channel Name |
|---|---|---|
| TLBOPS-7 (Buying Signals) | `C0AQM2K2VRT` | #tlb-fresh-eg |
| TLBOPS-9 (Screen Ranker) | `C0ASYPBG7SS` | #eg-screenranker-vlp-ghome |
| TLBOPS-10 (World Cup) | `C0ARPBXASQM` | core-worldcup26-marketing-product |
| TLBOPS-10 (World Cup) | `C0ATF8QM5PE` | WC alignment (Rana/Sofia/Marta) |
| TLBOPS-10 (World Cup) | `C0ASQ6JF7KL` | floating-talabat-home-world-cup |

**Keyword searches** (for all other initiatives or supplementary context):

| Initiative | Keywords |
|---|---|
| TLBOPS-3 | AI intake, opportunity intake |
| TLBOPS-4 | artefacts, PM setup guide, experiment tracker, bet review |
| TLBOPS-5 | tMart ops hub |
| TLBOPS-7 | buying signals, fresh trust, handpicked, F&UF |
| TLBOPS-9 | screen ranker, VLP rollout, gHome, QCPL |
| TLBOPS-10 | world cup, gamification, predict and feast, bundles, WC 2026 |
| TLBOPS-12 | tPro |
| TLBOPS-13 | flash sale, reactivation, FS expansion, QC growth |
| TLBOPS-14 | migration ops portal |
| TLBOPS-19 | campaigns playbook |
| TLBOPS-20 | GTM net-new capabilities |
| TLBOPS-21 | transition component config |

### 2c. Google Drive

Search for docs updated in the past 7 days using `mcp__google-workspace__search_drive_files` with the initiative keywords.

Also check these **known doc IDs** for recent changes (use `mcp__google-workspace__get_drive_file_content` or check modification date):

| Initiative | Doc ID | Doc Name |
|---|---|---|
| TLBOPS-4 | `1tIqVkOmpP1UGTLsWAQY2hiVkBTZRoIlZJqkC2PS0ntA` | PM Setup Guide |
| TLBOPS-4 | `1WbF0e4KHF8xwyR7EKr58NUVjmGGQJO5ShVL4j940gKg` | Experiment Tracker |
| TLBOPS-7 | `14PQuuBziDUYqcv9HbJeO5OiO8TQlzT9xZnfGrTna9s4` | S&F initiatives sheet |
| TLBOPS-7 | `1FeJC_CO02BvpYoWT5SZnJXYG62cvp8mANl-rZacFAOw` | Fresh & UF Q2 notes |
| TLBOPS-7 | `1tgm7pue-GrVMkphRnlVTuDUxLVi08ZvRFbIIgxn4Ask` | Fresh-First strategy |
| TLBOPS-7 | `1oO0GT9Fr56N6HS0c2xNOlnvBiDF3zFedwcio6gAEKNY` | Owning Fresh pres. |
| TLBOPS-9 | `15rDEQJr9Z-vilm04DEh448URQFkit7cM0eeOFWHORTA` | Operating Model V1 |
| TLBOPS-9 | `1FaEVOLa8o74PQWctubcNopu5kvVHAXXYT1loLUM-irE` | Market Rollout Timeline |
| TLBOPS-10 | `1J51qSlnKJ5hjGwxwEaMSULbm2AczFC-TPRAgHfw8JVc` | WC QC plan |
| TLBOPS-10 | `1oCdaJHCk4zMHrjt286Sjl3N8jAmysHPjSdOkLstKeyU` | WC milestones sheet |
| TLBOPS-13 | `1oUOWYpTzDjDAxEB8_h1u9GJHNRysTeJG3GVKUPeGzp8` | QC Growth Stream sheet |

Also search for **Google Slides** updated this week related to each initiative topic.

### 2d. Gmail

Search `miriam.velloso@talabat.com` inbox for threads from the past 7 days related to each initiative.

Key contacts per initiative:
- **TLBOPS-7**: Rana Hegazi
- **TLBOPS-9**: Rana Hegazi, Dhiren Mudgil, Huey Qing Tan
- **TLBOPS-10**: Emmanuelle Buntinx (Emma), Marta Madrigal Saez, Rana Hegazi, Sofia Simoes de Almeida

```
mcp__google-workspace__search_gmail_messages
  user_google_email: miriam.velloso@talabat.com
  query: "{keywords OR contact name} newer_than:7d"
  page_size: 5
```

---

## Step 3: Draft comments

For each initiative with activity, draft a Jira comment in this format:

```
**Weekly Update — Week of {Mon DD} to {Fri DD, YYYY}**

**Status:** {In Progress / On Track / At Risk / Blocked}

**Progress this week:**
- {concise bullet points of what moved}
- {child issues completed or progressed}

**Related docs:**
- [{Doc title}]({Google Drive link}) — updated {date}
- [{Slides title}]({link}) — new/updated this week

**Key discussions:**
- Slack #{channel}: {1-line summary}
- Email thread with {contact}: {1-line summary}

**Next steps:**
- {What's planned, inferred from context}

**Blockers:**
- {Any blockers, or "None"}
```

### Special rules:
- **TLBOPS-10 (World Cup)**: Only include **Miriam's own action items**, not everyone's updates
- Keep each update **concise** — 5-8 bullet points max
- Include links to Jira issues: `https://deliveryhero.atlassian.net/browse/{ISSUE_KEY}`
- If a source (Drive/Slack/Gmail) finds nothing for an initiative, skip that section

---

## Step 4: Present for review

Show ALL drafted comments clearly separated:

```
---
## TLBOPS-4 — Implement Artefacts
{draft comment}

---
## TLBOPS-9 — Screen Ranker VLP
{draft comment}

---
```

List initiatives with **no activity** this week at the bottom:
```
No activity this week: TLBOPS-5, TLBOPS-12, ...
```

Ask: **"Want me to post these as Jira comments? You can also edit any before posting."**

---

## Step 5: Post to Jira

**ONLY after Miriam explicitly approves** (e.g., "post them", "yes", "go ahead").

For each approved comment:
```
mcp__atlassian__addCommentToJiraIssue
  cloudId: deliveryhero.atlassian.net
  issueIdOrKey: {ISSUE_KEY}
  commentBody: {the draft comment text}
  contentFormat: markdown
```

Report back:
```
Posted {N} weekly comments:
- TLBOPS-4 — done
- TLBOPS-9 — done
...
```

---

## Step 6: Update last-run date

After posting, update the memory file `project_tlbops_weekly_process.md` with the new last-run date.

---

## TLBOPS hierarchy (for context)

- TLBOPS-2 (KR) -> TLBOPS-3, TLBOPS-4, TLBOPS-5
- TLBOPS-6 (KR) -> TLBOPS-7
- TLBOPS-8 (KR) -> TLBOPS-9, TLBOPS-10
- TLBOPS-11 (KR) -> TLBOPS-12, TLBOPS-13
- TLBOPS-14 (standalone)
- TLBOPS-15 (KR) -> TLBOPS-19
- TLBOPS-17 (KR) -> TLBOPS-21
- TLBOPS-18 (KR) -> TLBOPS-20

---

## Rules

1. **Never post to Jira without explicit approval** — always show drafts first
2. Skip initiatives with no activity, but list them
3. Maximize parallel tool calls — search Slack, Drive, Gmail simultaneously per initiative
4. Use `mcp__Slack__search_messages` (capital S Slack)
5. For Gmail, use `newer_than:7d` in queries
6. Include links to all relevant docs, sheets, AND slides
7. For Miriam's personal initiatives, only include HER action items
