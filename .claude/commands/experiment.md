# Experiment Email Generator

Generate experiment communication emails — for launch (start) and wrap-up (end) of A/B tests and experiments. Outputs a ready-to-send email draft in Gmail.

> **Eppo integration**: Eppo MCP is not yet available. When it ships, this skill will auto-pull experiment results, metrics, and variant data directly from Eppo. For now, the PM provides experiment details manually.

## First-time setup

Ask the PM for:
- **Google email** (for drafting/sending via Gmail)
- **Jira cloud ID** (optional — to link experiment to a Jira ticket)

---

## Workflow

### Step 1: Collect experiment details

Ask the PM:

1. **Email type**: `start` (experiment launching) or `end` (experiment concluding)?
2. **Experiment name**: What is this experiment called?
3. **Hypothesis**: What are you testing and why?
4. **Variants**: What are the control and treatment groups?
5. **Primary metric**: What KPI determines success?
6. **Secondary metrics**: Any other metrics being tracked?
7. **Markets / segments**: Which countries or user segments?
8. **Traffic split**: e.g. 50/50, 90/10
9. **Expected duration**: How long will it run?
10. **Jira ticket** (optional): Link to the related epic/story?

For **end** emails, also ask:
11. **Result**: Win / Loss / Inconclusive?
12. **Key numbers**: What were the metric results? (lift %, p-value, confidence)
13. **Decision**: Ship / Kill / Iterate?
14. **Learnings**: What did you learn?

> **Future (Eppo MCP)**: When Eppo MCP is available, steps 11-13 will be auto-populated by querying:
> ```
> mcp__eppo__get_experiment_results
>   experiment_key: {experiment_key}
> ```
> The PM will just provide the experiment key and the skill will pull results, confidence intervals, and variant metrics automatically.

### Step 2: Draft the email

#### START email template

```
Subject: [Experiment Launch] {Experiment Name} — {Markets}

Hi team,

We're launching a new experiment today. Here are the details:

**Experiment:** {Experiment Name}
**Jira:** {ISSUE_KEY link, if provided}
**Hypothesis:** {Hypothesis}

**Setup:**
- Control: {control description}
- Treatment: {treatment description}
- Traffic split: {split}
- Markets: {markets/segments}

**What we're measuring:**
- Primary: {primary metric}
- Secondary: {secondary metrics}

**Timeline:**
- Start: {start date}
- Expected end: {end date}
- Duration: {X weeks}

**What to watch for:**
- {Any guardrail metrics or red flags to monitor}

I'll share results once we have statistical significance. Reach out if you have questions.

Best,
{PM name}
```

#### END email template

```
Subject: [Experiment Results] {Experiment Name} — {Result: Win/Loss/Inconclusive}

Hi team,

The {Experiment Name} experiment has concluded. Here's the summary:

**Result: {WIN / LOSS / INCONCLUSIVE}**

**Experiment:** {Experiment Name}
**Jira:** {ISSUE_KEY link, if provided}
**Duration:** {start date} → {end date} ({X weeks})
**Markets:** {markets}

**Results:**
| Metric | Control | Treatment | Lift | Confidence |
|--------|---------|-----------|------|------------|
| {Primary metric} | {value} | {value} | {+X%} | {confidence}% |
| {Secondary metric} | {value} | {value} | {+X%} | {confidence}% |

**Decision:** {Ship to 100% / Kill experiment / Iterate with changes}

**Key learnings:**
- {Learning 1}
- {Learning 2}
- {Learning 3}

**Next steps:**
- {What happens now — rollout plan, follow-up experiment, etc.}

Full results: {Eppo link if available, or "available on request"}

Best,
{PM name}
```

### Step 3: Show draft and ask for review

Display the full email to the PM. Ask:

**"Here's the draft. Want me to:**
1. **Create as Gmail draft** — saves to your drafts folder
2. **Send it now** — need the recipient list
3. **Edit something** — tell me what to change
4. **Export as Markdown** — save to Desktop"

### Step 4: Act on PM's choice

**Gmail draft:**
```
mcp__google-workspace__draft_gmail_message
  user_google_email: {PM's email}
  subject: {subject line}
  body: {email body}
  body_format: html
```

**Send directly:**
```
mcp__google-workspace__send_gmail_message
  user_google_email: {PM's email}
  to: {recipients}
  subject: {subject line}
  body: {email body}
  body_format: html
```

**Export as MD:**
Save to `~/Desktop/experiment-{name}-{start|end}-{YYYY-MM-DD}.md`

---

## Rules

1. **Always show the draft** before sending or creating — never send without explicit approval
2. Keep the email **scannable**: headers, tables, bold key numbers
3. For END emails with no Eppo data yet, clearly mark metric fields that the PM needs to fill in: `{FILL: primary metric result}`
4. When Eppo MCP becomes available, auto-populate results and note the data source: "Results pulled from Eppo on {date}"
5. If the PM provides a Jira ticket, fetch the issue summary to enrich the email context
6. **Never fabricate experiment results** — if numbers aren't provided, leave placeholders
