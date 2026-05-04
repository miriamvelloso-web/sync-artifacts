---
name: Use HTTP MCP gateways, not tokens
description: Never debug or modify bot tokens for Slack/Tableau — use the Talabat HTTP MCP gateways instead
type: feedback
originSessionId: 44b61418-05bf-4098-9676-d70d8c6c4df0
---
Use Talabat's internal HTTP MCP gateways for third-party services (Slack, Tableau) instead of configuring bot tokens directly.

**Why:** User got frustrated when I spent time diagnosing Slack bot token scopes. The correct approach is the HTTP gateway at talabatai.dhhmena.com which handles auth internally.

**How to apply:** When a third-party MCP tool fails with auth/scope errors, ask the user if there's an HTTP gateway URL rather than trying to fix tokens. Talabat pattern: `https://talabatai.dhhmena.com/mcp/gateway/{service}/mcp`
