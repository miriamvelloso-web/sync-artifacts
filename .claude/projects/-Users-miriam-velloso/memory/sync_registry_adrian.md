---
name: Sync Registry — Adrian Alvarez
description: /sync config for Adrian (HOMESQUAD PM) — Jira initiatives, strategy doc tabs, no channels yet
type: reference
originSessionId: 0b3d8afd-25b1-48b0-addd-ddd78607b9f9
---
```yaml
pm:
  name: "Adrian Alvarez"
  email: "adrian.alvarez@talabat.com"
  jira_cloud_id: "deliveryhero.atlassian.net"
  jira_project: "HOMESQUAD"
  jira_account_id: "712020:ba3a2551-235b-4657-b6e2-800f42197eab"

okr_hierarchy:
  objective:
    key: "TLBPT-317"
    name: "O6. Establish a personalisation engine that drives growth across all verticals"
  key_results:
    - key: "TLBPT-319"
      name: "O6.KR1. Increase component clicks per session on Home through personalized component ranking by 1.5%"
      initiatives: ["HOMESQUAD-967"]
    - key: "TLBPT-318"
      name: "O6.KR2. Increase Home orders per user through time-context relevance by 0.3%"
      initiatives: ["HOMESQUAD-992"]
    - key: "TLBPT-327"
      name: "O6.KR3. Enable personalization decision-making at scale"
      initiatives: ["HOMESQUAD-1012"]

jira:
  initiatives:
    "Screen Ranker Home - Experimentation & Rollout":
      epic_key: "HOMESQUAD-967"
      initiative_key: "TLBVAL-3"
      kr_key: "TLBPT-319"
      status: "Experiment"
    "Coffee Tile Time-Based Experiment (UAE)":
      epic_key: "HOMESQUAD-992"
      initiative_key: "TLBVAL-5"
      kr_key: "TLBPT-318"
      status: "Experiment"
    "Personalization Orchestrator MVP":
      epic_key: "HOMESQUAD-1012"
      initiative_key: "TLBVAL-10"
      kr_key: "TLBPT-327"
      status: "In Progress"

artifacts:
  - type: google_doc
    name: "Adrian's Strategy Doc"
    id: "1wg2F4poOgoarnkdceaIofayn-nkf7AYm0jI4l6uDNno"
    url: "https://docs.google.com/document/d/1wg2F4poOgoarnkdceaIofayn-nkf7AYm0jI4l6uDNno/edit"
    write_access: true
    tabs:
      - tab_id: "t.1qdk1r5f22t6"
        title: "SR MVP rollout"
        initiative: "Screen Ranker Home - Experimentation & Rollout"
        epic_key: "HOMESQUAD-967"
      - tab_id: "t.wn1kfom5p01g"
        title: "Coffee tile time-based experiment"
        initiative: "Coffee Tile Time-Based Experiment (UAE)"
        epic_key: "HOMESQUAD-992"
      - tab_id: "t.9gp62tm5wnho"
        title: "Perso Orchestrator MVP"
        initiative: "Personalization Orchestrator MVP"
        epic_key: "HOMESQUAD-1012"
      # Additional Q2 tabs (not in tracked initiatives but in doc):
      - tab_id: "t.xp1okmps9j77"
        title: "SR continuous learning"
        epic_key: "HOMESQUAD-985"
      - tab_id: "t.qgup9iqqlrpu"
        title: "SR automation"
        epic_key: "HOMESQUAD-1039"
      - tab_id: "t.safbdont69t6"
        title: "GenAI time-context generated item metadata"
        epic_key: "HOMESQUAD-1000"
      - tab_id: "t.f8zjfrxg20ja"
        title: "NBA discovery"
        epic_key: "HOMESQUAD-1020"

channels: []
  # Not configured yet. Add with /sync add slack or /sync add email

context_sources:
  HOMESQUAD-967:
    slack_keywords: ["screen ranker", "SR MVP", "gHome", "QCPL", "VLP rollout"]
    drive_docs: []
    gmail_contacts: []
    gmail_keywords: ["screen ranker"]
  HOMESQUAD-992:
    slack_keywords: ["coffee tile", "time-based", "DineOut"]
    drive_docs: []
    gmail_contacts: []
    gmail_keywords: ["coffee tile"]
  HOMESQUAD-1012:
    slack_keywords: ["personalization orchestrator", "perso orchestrator"]
    drive_docs: []
    gmail_contacts: []
    gmail_keywords: ["orchestrator"]
```
