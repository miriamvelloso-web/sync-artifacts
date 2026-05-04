---
name: Weekly updates must be personal and OKR-framed
description: Weekly Jira comments should only cover Miriam's own tickets, framed by her OKRs, pulling from ALL her Slack channels, meetings, recordings, and local terminal work
type: feedback
originSessionId: cdb32887-2beb-4e4b-a5b1-36b7fe1c1997
---
The first version of /weekly-updates was too broad and generic. Miriam doesn't want updates for every ticket on the board — only HER tickets (assigned to her).

**Why:** The board has 50+ initiatives from multiple PMs. Posting updates on tickets she doesn't own is noise. The updates need to reflect HER work, framed by HER OKRs.

**How to apply:**
1. Filter Jira by `assignee = currentUser()` not just `project = TLBOPS`
2. Frame updates around her OKRs and key initiatives, not just ticket status
3. Pull from ALL her active Slack channels (not just a hardcoded list)
4. Include meeting notes and recordings from Gmail/Calendar
5. Include local terminal work (what we built/shipped in Claude sessions)
6. Make it actually useful — actionable, not just a status dump
