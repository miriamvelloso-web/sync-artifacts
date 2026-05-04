---
name: Experiment Slide — Work in Progress
description: WIP experiment slide template workflow — SR Home (TLBVAL-3) ready except Eppo results, Flash Sale KW filled
type: project
originSessionId: 8725d436-5059-4a20-90aa-9ce35bc132f8
---
## Current State

Building reusable experiment review slides using the reference template.

**Reference template** (DO NOT modify):
- ID: `11EfLL2HTFKrJaX6hyBx1qg7zfpox_1igV-IZcJ2Z9Rk`
- Slide 2 (page ID `g3f292ff81d6_0_0`) = experiment results layout
- 22 elements: title, summary, hypothesis badge+content, experiment setup/results headers, variant labels (A/B), market/entry point, note, next steps, footer (1-pager, Eppo, working sheet, Data PIC)

**Filled example deck (3 outcome types):**
- ID: `1hDwTATweas-6ADql_lj_kd43SfodWWZ798UM5HYHHyQ` ("Flash Sale KW — Experiment Review v2")
- Slide 1: Inconclusive / Kill outcome
- Slide 2: Positive with watch-outs outcome
- Slide 3: Clear win / Roll out outcome

**Completed slides:**

1. **tmart Flash Sale KW** (Eppo 148385)
   - Deck: `1KD3xwu-CvmKNiLgwCf0NEYovJ9rp1hwQOC90MCJZKZY`
   - Experiment ID: `qc-promo-tb-product-spotlight-kw-prospect`
   - 1-Pager doc: `1uryF1q1oCR1oNTlquSnicN7sFcZLLJOwL0w4LRKuARk`
   - Results slide deck: `119XITdc_PLRdNvJbSWA-biPg8wBz7p-G1tmtaO4NAJM`
   - Status: Filled with Slack readout data (from n8n/Eppo bot). Needs Eppo MCP for actual metric pull.
   - Key results (from Slack): Grocery Acq +4.7% (ns), Platform GMV +1.1% (ns), QC GMV +1.8% (ns), Spotlight CTR -31.5% (ns). Final: +1.09% directional only -> kill.
   - POC: Howaida Thabet | Data PIC: Huey Qing Tan

2. **Screen Ranker MVP Rollout — Home** (TLBVAL-3 / Eppo 162758) — SLIDE DONE (v2)
   - Deck (v2): `19rH_8ox6gE8cfm1n2-ya-I5-dlLUeb1NxeAAYTQSV8Q`
   - Old broken deck: `1wxk25OTwMhEZSmP_r_ohzTv81H_H6R2-V6mec6-KBTU` (discard)
   - Jira: TLBVAL-3 (status: Experiment, last comment Apr 29)
   - Eppo experiment ID: 162758
   - PRD/1-Pager: `1wg2F4poOgoarnkdceaIofayn-nkf7AYm0jI4l6uDNno`
   - Working sheet: `1BEQMsrpbBAPRnZCalpu8dGFukl_NcB8jWvSNWgS5T6g`
   - Data PIC: Yassine Achour
   - Status: Rebuilt from clean template copy using replaceAllText only (May 1). Eppo metrics pulled via MCP. Experiment still running, no significance.
   - TODO: Footer hyperlinks need manual update (1 Pager, Eppo, Working sheet). Mockup images from template need swap.

   **Setup data ready to fill:**
   - Title: Screen Ranker MVP Rollout (Home)
   - Hypothesis: Building on Option 1, this experiment tests whether dynamically ranking the Campaign Carousel alongside other components — rather than fixing it at the top — drives incremental GMV and engagement uplift. By allowing the ML model to optimize the full Home Screen layout including the carousel, we hypothesize we can improve conversion and order value while maintaining ad revenue.
   - Variant A (Control, 50%): Home Screen as is (BAU) — current static component ordering
   - Variant B (25%): Carousel pinned at top, remaining components reranked by ML model (MVC/HVC segments)
   - Variant C (25%): All components including carousel ranked by ML model (MVC/HVC segments)
   - Markets: All except JO and BH
   - Entry Point: MVC/HVC segments on Home Screen
   - Primary metric: QC GMV
   - Guardrails: CPC revenue, GEM revenue/user, Food GMV
   - Analysis period: Launched ~Apr 23, 2026 (still running as of Apr 29)
   - Note: 50/25/25 split (Option 2 from PRD). Three variants = need to adapt template (template has A/B only, this is A/B/C)
   - 1-Pager link: `1wg2F4poOgoarnkdceaIofayn-nkf7AYm0jI4l6uDNno`
   - Eppo link: experiment/162758
   - Working sheet: `1BEQMsrpbBAPRnZCalpu8dGFukl_NcB8jWvSNWgS5T6g`
   - Data PIC: Yassine Achour

## Eppo MCP

- Gateway: `https://talabatai.dhhmena.com/mcp/gateway/eppo/mcp`
- Status: Shows "Connected" in `claude mcp list` but tools didn't load in previous session
- **After restart:** Try `get_experiment_details` and `get_experiment_results` with experiment_id 162758
- If Eppo fails, search Slack channel `tlb_gr_discovery_experiments` (C09U3078537) for readout

## BigQuery

- Gateway: `https://talabatai.dhhmena.com/mcp/gateway/bigquery/mcp`
- Status: Failed to connect (as of 2026-05-01)
- Default project: `tlb-data-mlops` (no query perms)
- `tlb-data-prod` has `data_platform_fwf.fwf_experiments_v2` table with experiment metadata

## Template element mapping (page `g3f292ff81d6_0_0`)

| Element | Type | Content |
|---------|------|---------|
| 0_1 | RECTANGLE | Experiment Results (content area — use insertText) |
| 0_2 | TEXT_BOX | Title |
| 0_3 | TEXT_BOX | Summary |
| 0_4 | IMAGE | Mockup/screenshot |
| 0_5 | RECTANGLE | "Next steps" header label |
| **0_6** | **RECTANGLE** | **B variant description (empty in template — use insertText)** |
| 0_7 | TEXT_BOX | Analysis period |
| 0_8–0_14 | RECTANGLE | Various labels (Experiment Setup, Experiment Results headers, A/B labels, footer links) |
| 0_18 | RECTANGLE | "Hypothesis" header label |
| 0_19 | RECTANGLE | Hypothesis content |
| 0_20 | RECTANGLE | Market / Entry Point |
| 0_30, 0_35, 0_36 | IMAGE | Mockup/screenshots |
| 0_34 | TEXT_BOX | Safety note |
| 0_37 | RECTANGLE | Next steps content (use insertText) |

## Template workflow (replaceAllText + insertText)

To fill a new experiment slide:
1. Copy reference template `11EfLL2HTFKrJaX6hyBx1qg7zfpox_1igV-IZcJ2Z9Rk`
2. Replace "xxx" FIRST (hypothesis content) — avoids substring match with "xx"
3. Replace "xx" SECOND (variant A description)
4. Replace remaining placeholders: Title, Summary, A (50%), B (50%), analysis period, Market, Entry Point, Note, Next steps, 1 Pager, Eppo, Working sheet, Data PIC
5. All via `replaceAllText` in a single batch — 14-15 operations
6. **Use insertText** for 3 empty content areas: Results (0_1), B description (0_6), Next steps (0_37)
7. Reference images (mockups, screenshots) remain from template — need manual swap
