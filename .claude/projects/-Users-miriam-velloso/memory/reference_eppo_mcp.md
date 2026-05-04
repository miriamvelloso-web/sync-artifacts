---
name: Eppo MCP gateway
description: Eppo experiment platform MCP server — HTTP gateway for pulling experiment results, metrics, variants
type: reference
originSessionId: 0b3d8afd-25b1-48b0-addd-ddd78607b9f9
---
- **URL**: `https://talabatai.dhhmena.com/mcp/gateway/eppo/mcp`
- **Transport**: HTTP
- **Added via**: `claude mcp add --transport http eppo "https://talabatai.dhhmena.com/mcp/gateway/eppo/mcp"`
- **Config file**: `/Users/miriam.velloso/.claude.json` (local scope)
- **Auth**: OAuth via Talabat gateway (same pattern as BigQuery, Slack, Tableau)
- **Status**: Added 2026-04-28, needs session restart to load tools

**Use case**: Pull experiment results directly from Eppo for:
- Experiment review slides (replaces manual Slack readout data)
- `/experiment` skill (auto-populate END email metrics)
- `/sync` weekly updates (experiment status + metrics)

**BigQuery fallback**: `tlb-data-prod.data_platform_fwf.fwf_experiments_v2` has experiment metadata but current account lacks query permissions.
