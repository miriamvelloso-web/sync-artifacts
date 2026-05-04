---
name: TLBOPS weekly initiative updates
description: Repeatable weekly process to scan all active TLBOPS initiatives, gather status from Drive/Slack/Gmail, draft Jira comments, and post after Miriam's approval.
type: project
originSessionId: 98d3619a-a5a9-4ca3-b890-1ad790db33b2
---
## Weekly TLBOPS Update Process

**Trigger**: Miriam asks to "run TLBOPS weekly updates" (or similar)
**Cadence**: Weekly
**Owner**: Miriam Velloso (miriam.velloso@talabat.com)

## Step-by-step

### 1. Scan the board
Query Jira for all active initiatives:
- Cloud ID: `89647aba-aaa1-4669-9f6d-a9ad8db6435e`
- Project: TLBOPS, board 9830
- JQL: `project = TLBOPS AND status != Done ORDER BY key ASC`
- List all non-Done initiatives — this is the scope for the week

### 2. Search Google Drive (per initiative)
- Search for docs/sheets/slides updated in the past 7 days related to each initiative
- Use known doc IDs below as starting points, plus keyword searches
- **Also search for Google Slides presentations** created or updated that week related to each initiative topic — include links in the Jira comment
- Email for Google Workspace: `miriam.velloso@talabat.com`

### 3. Search Slack (per initiative)
- Use `mcp__Slack__search_messages` (capitalized Slack) for keyword searches
- Read known channels for each initiative (see registry below)
- Look for updates from the past 7 days

### 4. Search Gmail (per initiative)
- Search `miriam.velloso@talabat.com` inbox for relevant threads from the past week
- Focus on threads with key contacts for each initiative

### 5. Draft comments
- Format: Status → key metrics/milestones → Related Docs (with links) → Next steps
- Use bold headers and bullet points for structure
- Include links to all relevant Google docs, sheets, AND slides/decks created or updated that week on the topic
- For Miriam's personal initiatives: only include **her** action items, not everyone's updates

### 6. Present for review
- Show all draft comments to Miriam in chat
- Wait for approval or edits before posting

### 7. Post to Jira
- Use `mcp__atlassian__addCommentToJiraIssue` with cloud ID above
- Post all approved comments

---

## Initiative Registry

### TLBOPS-4 — Implement Artefacts
**Keywords**: artefacts, PM setup guide, experiment tracker, bet review
**Drive docs**:
- PM Setup Guide: `1tIqVkOmpP1UGTLsWAQY2hiVkBTZRoIlZJqkC2PS0ntA`
- Experiment Tracker: `1WbF0e4KHF8xwyR7EKr58NUVjmGGQJO5ShVL4j940gKg`
**Slack channels**: general search
**Contacts**: Miriam

### TLBOPS-7 — Buying Signals (Trust) F&UF
**Keywords**: buying signals, fresh trust, handpicked, F&UF
**Drive docs**:
- S&F initiatives sheet: `14PQuuBziDUYqcv9HbJeO5OiO8TQlzT9xZnfGrTna9s4`
- Fresh & UF Q2 notes: `1FeJC_CO02BvpYoWT5SZnJXYG62cvp8mANl-rZacFAOw`
- Fresh-First strategy: `1tgm7pue-GrVMkphRnlVTuDUxLVi08ZvRFbIIgxn4Ask`
- Owning Fresh presentation: `1oO0GT9Fr56N6HS0c2xNOlnvBiDF3zFedwcio6gAEKNY`
**Slack channels**: #tlb-fresh-eg (`C0AQM2K2VRT`)
**Contacts**: Rana Hegazi

### TLBOPS-9 — Screen Ranker VLP
**Keywords**: screen ranker, VLP rollout, gHome, QCPL
**Drive docs**:
- Operating Model V1: `15rDEQJr9Z-vilm04DEh448URQFkit7cM0eeOFWHORTA`
- Market Rollout Timeline: `1FaEVOLa8o74PQWctubcNopu5kvVHAXXYT1loLUM-irE`
**Slack channels**: #eg-screenranker-vlp-ghome (`C0ASYPBG7SS`)
**Contacts**: Rana Hegazi (Product), Dhiren Mudgil (Tech), Huey Qing Tan (Data)
**Note**: SR Notification Hub dashboard (React app) at ~/Desktop/sr-notification-hub

### TLBOPS-10 — World Cup QC Moment
**Keywords**: world cup, gamification, predict and feast, bundles, WC 2026
**Drive docs**:
- WC QC plan: `1J51qSlnKJ5hjGwxwEaMSULbm2AczFC-TPRAgHfw8JVc`
- WC milestones sheet: `1oCdaJHCk4zMHrjt286Sjl3N8jAmysHPjSdOkLstKeyU`
**Slack channels**:
- core-worldcup26-marketing-product: `C0ARPBXASQM`
- WC alignment (Rana/Sofia/Marta): `C0ATF8QM5PE`
- floating-talabat-home-world-cup: `C0ASQ6JF7KL`
**Gmail**: search for threads with Emma (Emmanuelle Buntinx)
**Contacts**: Marta Madrigal Saez (UAG8GB7QA), Rana Hegazi (U020PQKPG8K), Sofia Simoes de Almeida (U02E4KRUH9N), Emmanuelle Buntinx (Emma)
**Special rule**: Only include Miriam's own action items, not everyone's updates

### TLBOPS-13 — FS Expansion
**Keywords**: flash sale, reactivation, FS expansion, QC growth
**Drive docs**:
- QC Growth Stream sheet: `1oUOWYpTzDjDAxEB8_h1u9GJHNRysTeJG3GVKUPeGzp8`
**Slack channels**: general search
**Contacts**: —

### Other initiatives (scan board for these)
- TLBOPS-3 — AI Intake
- TLBOPS-5 — tMart Ops Hub
- TLBOPS-12 — tPro
- TLBOPS-14 — Migration Ops Portal
- TLBOPS-19 — Campaigns Playbook
- TLBOPS-20 — GTM Net-New Capabilities
- TLBOPS-21 — Transition Component Config

---

## TLBOPS Hierarchy (for reference)
- TLBOPS-2 (KR) → TLBOPS-3 (AI intake), TLBOPS-4 (Artefacts), TLBOPS-5 (tMart Ops Hub)
- TLBOPS-6 (KR) → TLBOPS-7 (Buying Signals F&UF)
- TLBOPS-8 (KR) → TLBOPS-9 (Screen Ranker VLP), TLBOPS-10 (World Cup)
- TLBOPS-11 (KR) → TLBOPS-12 (tPro), TLBOPS-13 (FS Expansion)
- TLBOPS-14 (Migration Ops portal) — no children
- TLBOPS-15 (KR) → TLBOPS-19 (Campaigns playbook)
- TLBOPS-17 (KR) → TLBOPS-21 (Transition component config)
- TLBOPS-18 (KR) → TLBOPS-20 (GTM net-new capabilities)

## Last run
- **May 3, 2026**: Posted 8 comments: TLBOPS-3 (Intake), 4 (Artefacts), 7 (F&UF), 9 (Screen Ranker), 10 (World Cup), 12 (tPro), 13 (Flash Sale), 20 (NMR Gamification). OKR-structured format with "done this week / to do next week". Added Sampling, Copilot, and Gamification topics. Miriam provided manual corrections before posting.
- **Apr 24, 2026**: Posted corrected comments on TLBOPS-7, 9, 10, 12, 13. Redone with market-by-market breakdown and proper PM attribution. TLBOPS-3 and TLBOPS-4 left as-is (existing comments from Apr 17).
- **Apr 17, 2026**: Posted comments on TLBOPS-4, 7, 9, 10, 13. Sources: Drive + Slack + Gmail.
