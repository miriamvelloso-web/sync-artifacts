---
name: Opportunity Intake AI Automation
description: Automate talabat opportunity intake — auto-assign stakeholders, notify via Slack, map optimizations to OKRs
type: project
originSessionId: b226473b-f49d-405a-aeac-231659300f59
---
## Project: AI-powered Opportunity Intake Automation

**Goal:** Automate the talabat Opportunity Intake process using Claude MCP tools (Sheets + Slack).

**Key resources:**
- Process doc: `1o4uxHcPzfdI1e_e5FRga7Mn07f2JPJBHa5LhfTNPHq8`
- Intake Sheet: `1bYw6ise5wWpIrAviP5OTNdONIF0fVC5wIPPzKgHV900` (8 tabs: README, Intake Council, 6 bet tabs)
- Slides deck: `15620Ni_hKkOU5wsxFDnFlQWlHjjQAdF-qVycmI11zfI`
- Eoin's playbook (draft): `1a6XDvdoimIohkFrhKn7WNUVNivFGfoRBYsbxTlZHAJY`
- Slack channel: `#tlb_opportunityintake_product`

**Automation pipeline:**
1. Classify as New Bet vs Optimization (first step — drives downstream logic)
2. Detect new/unassigned rows across 6 bet tabs (Status empty or "NEW")
3. Quality Evaluate — check required fields, flag what's missing
4. Look up Theme → stakeholders from "Intake Council" tab; auto-fill CBO (col O), Product Tribe (col P), Product Owner (col R)
5. If Optimization → map to OKR/KR using metric keywords
6. Update Status (Ready for Review / Needs Clarification)
7. DM submitter via Slack bot every time status changes (NOT channel post):
   - If ready: tells them it's OK to review, when next intake is, who's assigned
   - If needs info: tells them what's missing, asks them to reply
   - Submitter replies to bot → bot writes reply as comments in the Sheet row

**Key design decision:** No channel posts. Bot sends direct messages only. Interactive — submitter can reply to bot and bot captures responses as sheet comments.

**Stakeholder mapping (from Intake Council tab):**
- Choice → Tribe: Tony Fadel, Bet: Sofia Simoes, CBO: Kedar Kulkarni
- Experience → Tribe: Rose Marsh, Bet: Islam Ameen, CBO: Khee Lim / Aanchal
- Value → Tribe: Rose Marsh, Bet: Emily Thomas, CBO: Alvaro Martinez
- Ecosystem & Growth → Tribe: Emily Thomas, CBO: Alvaro / Hussein Daher
- Foundations → Tribe: Sofia Simoes (from data)

**OKR mapping for optimizations (H1 2026):**
- GMV/KPP → O1. Secure top brands (Kedar)
- Affordability/VFD → O2. Improve affordability (Kedar/Alvaro)
- MAU/acquisition → O3. Boost MAUs (Alvaro)
- tPro/churn → O4. Grow tPro (Hussein)
- DineOut/H&B → O5. Growth initiatives (Moiza)
- Seamless/contact → O6. Experience (Khee Lim)

**Approach:** Build with MCP tools (no Python scripts). Claude reads sheets, writes assignments, sends Slack notifications. Can be run on-demand or scheduled.

**Colleague:** Eoin Hickey started a separate Python-based playbook (draft, incomplete). This project supersedes that approach with MCP-native tooling.
