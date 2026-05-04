---
name: MD metrics style
description: MD experiment emails should name actual metrics and give analyst-quality insights, not generic labels
type: feedback
originSessionId: 237ac6d0-745c-42c0-be0f-873f8b50ca2c
---
Name the actual metrics (e.g. "Item_discounted_orders_per_user (Food)") and include guardrail results, not just the primary metric. Write like a data analyst — short but meaningful insights.

**Why:** Miriam said "you need to name the main metrics and the rest of them that are important, you are like a data analyst really short but with meaningful insights." Generic labels like "primary conversion metric" are not acceptable.

**How to apply:** When building experiment summaries or email cards, always pull metric names from Eppo cache (`metrics[id].name`), show primary + guardrail metrics with lift/p-value, and frame results in context of the OKR target they're driving toward.
