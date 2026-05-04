---
name: Intake Bot (Apps Script)
description: Slack channel-thread bot that auto-triages, scores, and notifies via channel threads — runs hourly via Apps Script
type: project
originSessionId: aa929dcf-d3de-495e-b356-26d4ead35df3
---
## Intake Bot — Channel Thread Bot

**What it does:** Hourly pipeline: triage NEW rows → score Ready for Intake rows → detect status changes → post to Slack channel thread with @mentions → write timestamps → capture thread replies back to sheet.

**Infrastructure:**
- Apps Script project: `1Bx7TVmhrF0May7SA1i8i5bbiVvOcioDDZqoZR3g2sL7PfdAO9j0h_VnR`
- Local code: `Desktop/AI-Projects/intake-bot/Code.gs`
- GitHub: `miriamvelloso-web/opportunity-intake-deck` (intake-bot/ directory)
- Production channel: `#tlb_opportunityintake_product` (C03TZK6G4P8)
- Test channel: C0AV8UKETJB (public)
- Local Code.gs currently points to TEST channel C0AV8UKETJB
- Trigger: hourly via Apps Script time trigger
- State: Script Properties (BOT_STATE key) — tracks `{ status, notified, threadTs, lastReplyCheck }` per initiative

**Pipeline (in checkIntakeStatuses):**
1. `checkThreadReplies_()` — reads Slack thread replies, writes as cell notes (BLOCKED: needs `channels:history` scope reinstall approval)
2. `triageNewRows_()` — quality check 4 fields, assign CBO+Tribe, set status ("Ready for Intake" or "Needs Clarification")
3. `scoreReadyRows_()` — heuristic scoring on "Ready for Intake" rows, writes to cols U-Z
4. Detect status changes → `postToChannel_()` with @mentions per thread
5. Write timestamps: AA (every status change), AB (Approved by Intake), AC (Approved by Product)
6. `[TEST]` filter active in triageNewRows_ — remove after E2E test

**Status flow:**
NEW → (auto-triage) → Ready for Intake (pass) or Needs Clarification (fail)
Ready for Intake → (council) → Approved by Intake → Product Review → Approved by Product / Backlog / Rejected
Fast-Track = manual council override (never auto-assigned)

**Column layout (varies by tab — S-T area is inconsistent):**
- A-R (0-17): Original intake columns (standard)
- S-T area: VARIES per tab:
  - 1/ Choice: S=Quality: Impact estimation?, T=Quality: impact analysis?
  - 2/Experience: S=P&T OKR Mapping, T=(blank)
  - 3/Value: NO gap cols — Q-R have duplicate score headers (layout is broken)
  - 4/Ecosystem & Growth: S=P&T OKR Mapping, T=Recommended PM (only complete tab)
  - 5/Foundations: S=Supporting Pd Product owner, T=P&T OKR Mapping
  - 6/No Related Bet: S=Supporting Pd Product owner, T=Quality: Impact estimation?
- U-Z (20-25): Strategic Impact, Confidence, Priority, Total, Tier, Rationale (score columns)
- AA-AC (26-28): Status Updated, Intake Approved Date, Product Approved Date (timestamp columns)

**Bot token scopes (actual):** `incoming-webhook`, `chat:write` — `channels:history` configured but not yet active (needs app reinstall, pending DH admin approval as of 2026-04-28)

**Pending:**
- `channels:history` scope approval → enables thread reply capture
- After approval: re-test reply capture, then remove `[TEST]` filter, switch channel to production C03TZK6G4P8
- Fix inconsistent column layouts across tabs (3/Value is broken, others vary)

**Why:** Replaces manual triage/scoring/notification with automated hourly pipeline. Channel threads give visibility to the whole team, not just DMs.

**How to apply:** Code updates via `clasp push --force` from `Desktop/AI-Projects/intake-bot/`. GitHub copy has placeholder token and production channel ID.
