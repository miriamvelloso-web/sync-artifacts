---
name: Create slides directly in Google Slides
description: Don't generate .pptx files — create presentations directly via Google Slides MCP tools
type: feedback
originSessionId: a8d9e505-2146-4839-9338-642e23db83e4
---
Create slides directly in Google Slides using the MCP tools (create_presentation, batch_update_presentation) instead of generating .pptx files with pptxgenjs and uploading.

**Why:** Removes the extra step of generating a file, copying to attachments, and uploading. Faster workflow, no local files to manage.

**How to apply:** When building any slide artifact (Experiment, Lightspeed, MPR), use the Google Workspace MCP tools directly. Keep the reference .js files in the skill for design specs (colors, positions, fonts, content structure) but don't run them — translate the layout into Google Slides API calls instead.
