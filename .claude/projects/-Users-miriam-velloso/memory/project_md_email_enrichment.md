---
name: MD email enrichment
description: Pending work to enrich MD experiment email cards with richer summaries and named metrics from PRD/Eppo data
type: project
originSessionId: 237ac6d0-745c-42c0-be0f-873f8b50ca2c
---
MD experiment email cards need two improvements:

1. **Richer Summary/Brief**: Currently `brief` is just `_first_sentences(epic["description"], 2)` — first 2 sentences of Jira description. Should pull from PRD content and experiment plans to explain **what** the feature does and **why** it matters.

2. **Named Metrics with Insights**: Currently `metrics` comes from `exp_data.get("metrics")` in activity_cache — a bare `{key: value}` dict. Should use Eppo cache data (`data/eppo_cache.json`) to show actual metric names (primary, guardrail), lift values, p-values, and analyst-quality insights. Not just "primary conversion metric" — name each metric specifically.

**Why:** Miriam wants MD emails to read like a data analyst wrote them — short but meaningful, naming the actual metrics and explaining results in context.

**How to apply:**
- Code lives in `app.py` lines 1620-1760 (`page_md_update`) and `prompts/email_formatter.py` line 306 (`format_experiment_email_html`)
- The `run_analysis_pipeline` (app.py:684) already fetches PRD content and Eppo data for the slides flow — reuse that pattern for MD emails
- Eppo cache has `metrics` dict (keyed by metric_id, with `name`, `is_primary`, `is_guardrail`) and `results.metric_results` dict (with `lift`, `p_value`, `significant` per metric)
- Use `scan_for_experiment_ids` to find Eppo IDs from epic's eppo_link/description, then pull from Eppo cache
- The `brief` field is editable in the UI (line 1714) so enriched text should be the default but still overridable

**Bugs fixed this session (already applied):**
- `jira_service.py` KeyError at `_to_api_format` and `_calc_progress` — cache items don't have `"key"` field, fixed by passing key explicitly
- Eppo cache expanded to 12 experiments with 33 metric names backfilled and metric_results for 5 experiments
