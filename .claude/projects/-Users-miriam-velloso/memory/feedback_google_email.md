---
name: Use talabat.com email for Google Workspace
description: Always use miriam.velloso@talabat.com (not @deliveryhero.com) for all Google Workspace MCP calls
type: feedback
originSessionId: a8d9e505-2146-4839-9338-642e23db83e4
---
Use `miriam.velloso@talabat.com` for all Google Workspace tool calls (Drive, Docs, Slides, Sheets, Gmail, Calendar).

**Why:** The @deliveryhero.com email triggers re-authentication loops. The @talabat.com account is the one with active Google Workspace auth.

**How to apply:** Every `user_google_email` parameter in Google Workspace MCP tools must be `miriam.velloso@talabat.com`.
