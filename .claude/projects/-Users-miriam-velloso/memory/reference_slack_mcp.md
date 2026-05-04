---
name: Slack MCP gateway
description: Talabat internal Slack MCP via HTTP gateway — has search_messages, list_channels, read_channel_history, read_thread, send_message, get_user_profile, search_files
type: reference
originSessionId: 44b61418-05bf-4098-9676-d70d8c6c4df0
---
Slack MCP is at `https://talabatai.dhhmena.com/mcp/gateway/slack/mcp` (HTTP transport).
Configured as MCP server named "Slack" in user scope.

Available tools: search_messages, search_files, list_channels, read_channel_history, read_thread, send_message, get_user_profile.

**Do NOT use the old `@modelcontextprotocol/server-slack` npm package** — it was replaced by this HTTP gateway.
