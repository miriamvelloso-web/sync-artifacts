---
name: Experiment Slide — Template & Workflow
description: Experiment review slide template (TLBVAL-Experiment-Reviews), workflow for creating new experiment slides via copy+replaceAllText
type: reference
---

## Experiment Review Template

**Master deck (DO NOT modify — copy slides from here):**
- ID: `1fXhEnGOHRhgjzR2fZWdGkfZA1pbU4MHcUuB5JRzU2Tg`
- Name: "TLBVAL-Experiment-Reviews"
- URL: https://docs.google.com/presentation/d/1fXhEnGOHRhgjzR2fZWdGkfZA1pbU4MHcUuB5JRzU2Tg/edit
- Slide size: 9144000 x 5148050 EMU
- 3 slides (p1, p2, p3) — each is a fully formatted experiment review with talabat brand design

**Slide structure (28 elements per slide):**
- Title, summary (3 narrative bullets), hypothesis, variant labels + descriptions
- Two-column layout: Experiment Setup (left) | Experiment Results (right)
- Market & Entry Point, mockup placeholder
- Results: metric bullets with bold labels, lime highlight on %, guardrail labels in orange
- Note box, Next steps, Analysis period, Footer with linked 1 Pager + Eppo + Data PIC

**Footer element:** Last RECTANGLE in the element list (e.g. p3_i29). Contains:
`1 Pager   |   Eppo {ID}   |   Data PIC: {Name}`
- "1 Pager" = indices 0–7, link to strategy doc tab
- "Eppo {ID}" = indices 14–25 (for 6-digit ID), link to https://eppo.cloud/experiments/{ID}

## Workflow: Create New Experiment Slide

1. **Copy** the master deck → new file in the PM's artifact folder
2. **Delete** slides that aren't needed (keep only 1 slide as base)
3. **replaceAllText** — swap all content (title, summary, hypothesis, variants, market, metrics, note, next steps, period, footer)
4. **updateTextStyle** — add hyperlinks to footer ("1 Pager" → doc URL, "Eppo {ID}" → Eppo URL)
5. **Register** in sync registry under `generated_decks`

**Key rule:** Always copy from this master deck. Never build slides from scratch. The template already has logo, Poppins fonts, brand colors, and correct layout.

## Completed Slides

1. **Screen Ranker MVP Rollout — Home** (TLBVAL-3 / Eppo 162758)
   - Deck: `19rH_8ox6gE8cfm1n2-ya-I5-dlLUeb1NxeAAYTQSV8Q` (v2)
   - Status: Running, no significance yet

2. **Coffee Tile Time-Based (UAE)** (TLBVAL-5 / Eppo 163267)
   - Deck: `1dDP43xvVhcXqiTTTCsUM04fmpD3TBLdrIxZ1L9-YJkI`
   - Template source: master deck slide p3
   - Status: Kill — no signal, all p=1

3. **tmart Flash Sale KW** (Eppo 148385)
   - Deck: `1KD3xwu-CvmKNiLgwCf0NEYovJ9rp1hwQOC90MCJZKZY`
   - Status: Kill — directional only, not significant
