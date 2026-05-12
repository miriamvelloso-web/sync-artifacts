---
name: Toon weekly update — official format
description: Toon's mandated format for P&T weekly updates — exact template with strict rules, no inflation
type: feedback
---
Toon specified the exact format for weekly P&T updates (sent as email, subject line: `[P&T update] [Week NN] - Value - Home & Personalization`).

## Required structure

**Header block:**
- Squad name (e.g. "Personalization Squad")
- PM name
- Full OKR hierarchy: Objective → each KR with progress % and status badge (On Track / At Risk / Blocked)
- Each initiative listed under its KR with Jira + Eppo links
- KR progress % and status come from Jira KR tickets, not estimated

**Section 1: What shipped / progressed this week**
Per initiative (card format, color-coded by status):
```
<initiative name + URL>
Status: <3 sentences on current state — prototype/live, shipped to whom, where>
Demo/prototype: <Image / GIF / Video>
Progress: <% complete>
Rationale: <1-2 sentences max>
Expected Impact: <1-2 sentences; include data where available>
```
That's it. No sub-sections, no "This week:" blocks, no embedded tables. Keep it flat and scannable.

**Section 2: Focus for next week**
```
Initiative name: <brief description and why we're doing it>
Initiative name: <brief description and why we're doing it>
```
One line per initiative. No bullets within bullets.

**Section 3: Blockers and support needed**
```
Blocker: <2-3 sentences max>
Decision/support needed: <What do you need, and from whom?>
```

**Sign-off:**
```
Regards.
<PM name>
```

## Branded HTML styling
- Orange header bar (#FF5900) with white text
- Dark burgundy squad bar (#411517) with lime squad name (#CFFF00)
- OKR context bar (pale orange #FFF3EB) with KR table showing progress % and colored status pills
- Cream background (#F4EDE3) for content area
- White cards per initiative with left border color matching status (green #00B050 = On Track, amber #FFA500 = At Risk, red #E60000 = Blocked)
- Lime highlight (#CFFF00) on progress % badges
- Orange (#FF5900) section headers with bottom border

## Rules (Toon's words)
1. Keep it short and on point
2. Include only updates that actually matter — quality over quantity, don't add things to make it look like we did more
3. No inflated text — simple formatting, easy to scan (do you really need that bullet point?)
4. Add visuals where possible
5. Sanity check before sending — read it as Toon would. If you were CEO, would anything feel vague or unnecessary? If so, cut it

**Why:** Toon wants substance, not volume. Every line must earn its place. Visuals > text. CEO-level scan test. The format is intentionally flat — no nested content, no sub-sections inside cards, no data tables. Just the fields listed above, filled concisely.

**How to apply:** When drafting Toon weekly updates (/sync weekly), follow the exact template: squad + PM header, OKR table with KR progress/status from Jira, then 3-section body with flat cards. Weave experiment data into the Status and Expected Impact sentences — don't create separate tables. Strip anything a CEO would find vague or filler. End with "Regards. <PM name>".
