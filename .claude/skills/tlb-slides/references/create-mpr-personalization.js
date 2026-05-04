const pptxgen = require("pptxgenjs");
const path = require("path");

const ASSETS = "/Users/miriam.velloso/.claude/skills/tlb-slides/assets";
const LOGO = path.join(ASSETS, "logo/talabat-logo.png");
const OUTPUT = "/Users/miriam.velloso/Desktop";

const C = {
  orange: "FF5900",
  burgundy: "411517",
  cream: "F4EDE3",
  white: "FFFFFF",
  lime: "CFFF00",
  medGray: "595959",
  lightGray: "CCCCCC",
  darkOrange: "B34700",
  paleOrange: "FFF3EB",
  green: "2E7D32",
  red: "C62828",
  amber: "F57F17",
  lightCream: "FAF7F2",
};

// ── Shared helpers ──

function addMPRHeader(slide, title, subtitle, pageNum, totalPages) {
  slide.background = { color: C.cream };

  slide.addShape("roundRect", {
    x: 0.35, y: 0.0, w: 1.20, h: 0.07,
    fill: { color: C.orange },
    rectRadius: 0.02,
  });

  slide.addImage({
    path: LOGO,
    x: 8.29, y: 0.24, w: 1.39, h: 0.46, rotate: 4.7,
  });

  slide.addText(title, {
    x: 0.35, y: 0.18, w: 7.5, h: 0.50,
    fontFace: "Poppins SemiBold", fontSize: 22, color: C.orange,
    valign: "bottom",
  });

  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.35, y: 0.68, w: 7.5, h: 0.30,
      fontFace: "Poppins", fontSize: 10, color: C.medGray,
    });
  }

  if (pageNum && totalPages) {
    slide.addText(`${pageNum}/${totalPages}`, {
      x: 9.0, y: 5.25, w: 0.65, h: 0.25,
      fontFace: "Poppins Medium", fontSize: 7, color: C.lightGray,
      align: "right",
    });
  }
}

function addSectionLabel(slide, label, x, y, w) {
  slide.addShape("roundRect", {
    x, y, w: w || 1.4, h: 0.28,
    fill: { color: C.orange },
    rectRadius: 0.04,
  });
  slide.addText(label, {
    x, y, w: w || 1.4, h: 0.28,
    fontFace: "Poppins SemiBold", fontSize: 9, color: C.white,
    align: "center", valign: "middle",
  });
}

function addStatusPill(slide, status, x, y) {
  const colors = {
    "Shipped": C.green,
    "In Progress": C.orange,
    "In Experiment": C.amber,
    "Planned": C.medGray,
    "Blocked": C.red,
    "Done": C.green,
  };
  const color = colors[status] || C.medGray;
  slide.addShape("roundRect", {
    x, y, w: 1.1, h: 0.22,
    fill: { color },
    rectRadius: 0.11,
  });
  slide.addText(status, {
    x, y, w: 1.1, h: 0.22,
    fontFace: "Poppins SemiBold", fontSize: 7.5, color: C.white,
    align: "center", valign: "middle",
  });
}

function addScreenshotPlaceholder(slide, x, y, w, h, label) {
  slide.addShape("roundRect", {
    x, y, w, h,
    fill: { color: "FAFAFA" },
    line: { color: C.lightGray, width: 1.5, dashType: "dash" },
    rectRadius: 0.08,
  });
  slide.addText(label || "Screenshot\n(paste image here)", {
    x, y: y + h * 0.15, w, h: h * 0.7,
    fontFace: "Poppins Medium", fontSize: 8, color: C.lightGray,
    align: "center", valign: "middle",
  });
}

// ═══════════════════════════════════════════
// SLIDE 1: COVER
// ═══════════════════════════════════════════

function addCoverSlide(pptx, data) {
  const slide = pptx.addSlide();
  slide.background = { color: C.orange };

  slide.addImage({
    path: LOGO,
    x: 7.09, y: 0.40, w: 2.52, h: 0.84, rotate: 4.7,
  });

  slide.addText(data.title, {
    x: 0.50, y: 1.20, w: 8.5, h: 1.40,
    fontFace: "Poppins ExtraBold", fontSize: 42, color: C.cream,
    valign: "bottom",
  });

  slide.addText(data.subtitle || "Monthly Product Review", {
    x: 0.50, y: 2.70, w: 8.5, h: 0.50,
    fontFace: "Poppins Medium", fontSize: 18, color: C.burgundy,
  });

  const metaParts = [];
  if (data.pm) metaParts.push(data.pm);
  if (data.quarter) metaParts.push(data.quarter);
  if (data.date) metaParts.push(data.date);
  slide.addText(metaParts.join("  ·  "), {
    x: 0.50, y: 3.40, w: 8.5, h: 0.40,
    fontFace: "Poppins", fontSize: 12, color: C.cream,
  });

  if (data.status) {
    slide.addShape("roundRect", {
      x: 0.50, y: 4.10, w: 1.8, h: 0.35,
      fill: { color: C.lime },
      rectRadius: 0.05,
    });
    slide.addText(data.status, {
      x: 0.50, y: 4.10, w: 1.8, h: 0.35,
      fontFace: "Poppins SemiBold", fontSize: 11, color: C.burgundy,
      align: "center", valign: "middle",
    });
  }

  slide.addImage({
    path: LOGO,
    x: 6.63, y: 4.31, w: 2.99, h: 1.00,
  });
}

// ═══════════════════════════════════════════
// SLIDE 2: STRATEGY & CONTEXT
// ═══════════════════════════════════════════

function addStrategySlide(pptx, data) {
  const slide = pptx.addSlide();
  const totalPages = data.totalPages || 6;
  addMPRHeader(slide, "Strategy & Context", data.okr || null, 1, totalPages);

  slide.addShape("roundRect", {
    x: 0.35, y: 1.10, w: 9.30, h: 0.85,
    fill: { color: C.white },
    rectRadius: 0.06,
    shadow: { type: "outer", blur: 4, offset: 1, color: "E0E0E0" },
  });
  addSectionLabel(slide, "VISION", 0.50, 1.16, 0.85);
  slide.addText(data.vision, {
    x: 0.55, y: 1.48, w: 8.95, h: 0.42,
    fontFace: "Poppins", fontSize: 10, color: C.burgundy,
    lineSpacingMultiple: 1.3,
  });

  slide.addShape("roundRect", {
    x: 0.35, y: 2.10, w: 9.30, h: 0.75,
    fill: { color: C.white },
    rectRadius: 0.06,
    shadow: { type: "outer", blur: 4, offset: 1, color: "E0E0E0" },
  });
  addSectionLabel(slide, "THESIS", 0.50, 2.16, 0.85);
  slide.addText(data.thesis, {
    x: 0.55, y: 2.46, w: 8.95, h: 0.35,
    fontFace: "Poppins", fontSize: 10, color: C.burgundy,
    lineSpacingMultiple: 1.3,
  });

  slide.addText("Problems to Solve", {
    x: 0.35, y: 3.05, w: 5.0, h: 0.32,
    fontFace: "Poppins ExtraBold", fontSize: 14, color: C.burgundy,
  });

  const problems = data.problems;
  const cardW = (9.30 - 0.2 * (problems.length - 1)) / problems.length;
  problems.forEach((p, i) => {
    const cx = 0.35 + i * (cardW + 0.2);
    slide.addShape("roundRect", {
      x: cx, y: 3.45, w: cardW, h: 1.85,
      fill: { color: C.white },
      rectRadius: 0.06,
      shadow: { type: "outer", blur: 4, offset: 1, color: "E0E0E0" },
    });
    slide.addShape("roundRect", {
      x: cx + 0.15, y: 3.58, w: 0.32, h: 0.32,
      fill: { color: C.orange },
      rectRadius: 0.16,
    });
    slide.addText(p.num, {
      x: cx + 0.15, y: 3.58, w: 0.32, h: 0.32,
      fontFace: "Poppins ExtraBold", fontSize: 13, color: C.white,
      align: "center", valign: "middle",
    });
    slide.addText(p.title, {
      x: cx + 0.55, y: 3.55, w: cardW - 0.75, h: 0.38,
      fontFace: "Poppins SemiBold", fontSize: 10, color: C.burgundy,
      valign: "middle",
    });
    slide.addText(p.desc, {
      x: cx + 0.15, y: 4.0, w: cardW - 0.30, h: 1.20,
      fontFace: "Poppins", fontSize: 8.5, color: C.medGray,
      lineSpacingMultiple: 1.3,
      valign: "top",
    });
  });
}

// ═══════════════════════════════════════════
// SLIDE 3: WHAT WE SHIPPED
// ═══════════════════════════════════════════

function addShippedSlide(pptx, data) {
  const slide = pptx.addSlide();
  const totalPages = data.totalPages || 6;
  addMPRHeader(slide, "What We Shipped", data.period || null, 2, totalPages);

  const features = data.features;
  const leftW = 5.0;
  const featureH = features.length <= 3 ? 1.05 : 0.85;
  features.forEach((f, i) => {
    const fy = 1.15 + i * (featureH + 0.12);
    slide.addShape("roundRect", {
      x: 0.35, y: fy, w: leftW, h: featureH,
      fill: { color: C.white },
      rectRadius: 0.06,
      shadow: { type: "outer", blur: 4, offset: 1, color: "E0E0E0" },
    });
    slide.addShape("rect", {
      x: 0.35, y: fy, w: 0.06, h: featureH,
      fill: { color: C.orange },
    });
    slide.addText(f.name, {
      x: 0.60, y: fy + 0.08, w: leftW - 1.6, h: 0.28,
      fontFace: "Poppins SemiBold", fontSize: 11, color: C.burgundy,
    });
    addStatusPill(slide, f.status, leftW - 0.80, fy + 0.10);
    slide.addText(f.desc, {
      x: 0.60, y: fy + 0.38, w: leftW - 0.40, h: featureH - 0.48,
      fontFace: "Poppins", fontSize: 9, color: C.medGray,
      lineSpacingMultiple: 1.25,
      valign: "top",
    });
  });

  const rightX = 5.65;
  const rightW = 4.0;

  slide.addText("Product Visuals", {
    x: rightX, y: 1.08, w: rightW, h: 0.28,
    fontFace: "Poppins SemiBold", fontSize: 10, color: C.burgundy,
    align: "center",
  });
  addScreenshotPlaceholder(slide, rightX + 0.2, 1.42, rightW - 0.4, 1.75, "Home Screen ranked layout\n(paste Eppo / app screenshot)");
  addScreenshotPlaceholder(slide, rightX + 0.2, 3.35, rightW - 0.4, 1.75, "Portal / Coffee tile visual\n(paste screenshot)");
}

// ═══════════════════════════════════════════
// SLIDE 4: METRICS & IMPACT
// ═══════════════════════════════════════════

function addMetricsSlide(pptx, data) {
  const slide = pptx.addSlide();
  const totalPages = data.totalPages || 6;
  addMPRHeader(slide, "Metrics & Impact", data.scope || null, 3, totalPages);

  const kpis = data.kpis;
  const kpiW = (9.30 - 0.15 * (kpis.length - 1)) / kpis.length;
  kpis.forEach((k, i) => {
    const kx = 0.35 + i * (kpiW + 0.15);
    slide.addShape("roundRect", {
      x: kx, y: 1.10, w: kpiW, h: 1.25,
      fill: { color: C.white },
      rectRadius: 0.06,
      shadow: { type: "outer", blur: 4, offset: 1, color: "E0E0E0" },
    });

    const trendColors = { up: C.green, down: C.red, neutral: C.medGray };
    const trendIcons = { up: "▲", down: "▼", neutral: "●" };
    const tc = trendColors[k.trend] || C.medGray;

    slide.addText(k.label, {
      x: kx + 0.15, y: 1.16, w: kpiW - 0.30, h: 0.25,
      fontFace: "Poppins Medium", fontSize: 9, color: C.medGray,
    });
    slide.addText([
      { text: k.value, options: { fontFace: "Poppins ExtraBold", fontSize: 28, color: tc } },
      { text: ` ${trendIcons[k.trend] || ""}`, options: { fontSize: 14, color: tc } },
    ], {
      x: kx + 0.15, y: 1.42, w: kpiW - 0.30, h: 0.55,
      valign: "middle",
    });
    slide.addText(k.context, {
      x: kx + 0.15, y: 2.0, w: kpiW - 0.30, h: 0.25,
      fontFace: "Poppins", fontSize: 8, color: C.medGray,
    });
  });

  slide.addText("Experiment Results", {
    x: 0.35, y: 2.55, w: 5.0, h: 0.32,
    fontFace: "Poppins ExtraBold", fontSize: 14, color: C.burgundy,
  });
  addScreenshotPlaceholder(slide, 0.35, 2.95, 5.60, 2.30, "Eppo experiment chart\n(paste data visualization)");

  slide.addText("Key Findings", {
    x: 6.15, y: 2.55, w: 3.50, h: 0.32,
    fontFace: "Poppins ExtraBold", fontSize: 14, color: C.burgundy,
  });

  const findings = data.findings;
  const findingParts = findings.map((f, i) => ({
    text: `●  ${f}${i < findings.length - 1 ? "\n" : ""}`,
    options: { fontFace: "Poppins", fontSize: 9, color: C.burgundy },
  }));
  slide.addText(findingParts, {
    x: 6.15, y: 2.95, w: 3.50, h: 2.30,
    lineSpacingMultiple: 1.35,
    valign: "top",
  });
}

// ═══════════════════════════════════════════
// SLIDE 5: ROADMAP
// ═══════════════════════════════════════════

function addRoadmapSlide(pptx, data) {
  const slide = pptx.addSlide();
  const totalPages = data.totalPages || 6;
  addMPRHeader(slide, "Roadmap", data.timeline || null, 4, totalPages);

  const phases = data.phases;
  const phaseW = (9.30 - 0.15 * (phases.length - 1)) / phases.length;
  const phaseColors = {
    "Shipped": C.green,
    "In Progress": C.orange,
    "Planned": C.medGray,
    "In Experiment": C.amber,
  };

  phases.forEach((p, i) => {
    const px = 0.35 + i * (phaseW + 0.15);
    const phaseColor = phaseColors[p.status] || C.medGray;

    slide.addShape("roundRect", {
      x: px, y: 1.15, w: phaseW, h: 0.40,
      fill: { color: phaseColor },
      rectRadius: 0.04,
    });
    slide.addText(p.name, {
      x: px + 0.12, y: 1.15, w: phaseW - 0.24, h: 0.40,
      fontFace: "Poppins SemiBold", fontSize: 12, color: C.white,
      valign: "middle",
    });

    if (i < phases.length - 1) {
      slide.addText("→", {
        x: px + phaseW - 0.05, y: 1.15, w: 0.35, h: 0.40,
        fontFace: "Poppins ExtraBold", fontSize: 18, color: C.lightGray,
        align: "center", valign: "middle",
      });
    }

    slide.addShape("roundRect", {
      x: px, y: 1.65, w: phaseW, h: 3.55,
      fill: { color: C.white },
      rectRadius: 0.06,
      shadow: { type: "outer", blur: 4, offset: 1, color: "E0E0E0" },
    });

    addStatusPill(slide, p.status, px + phaseW - 1.25, 1.78);

    const itemParts = p.items.map((item, j) => ({
      text: `●  ${item}${j < p.items.length - 1 ? "\n" : ""}`,
      options: { fontFace: "Poppins", fontSize: 9, color: C.burgundy },
    }));
    slide.addText(itemParts, {
      x: px + 0.15, y: 2.15, w: phaseW - 0.30, h: 2.90,
      lineSpacingMultiple: 1.4,
      valign: "top",
    });
  });
}

// ═══════════════════════════════════════════
// SLIDE 6: RISKS & NEXT STEPS
// ═══════════════════════════════════════════

function addRisksNextStepsSlide(pptx, data) {
  const slide = pptx.addSlide();
  const totalPages = data.totalPages || 6;
  addMPRHeader(slide, "Risks & Next Steps", null, 5, totalPages);

  slide.addText("Risks & Dependencies", {
    x: 0.35, y: 1.10, w: 4.60, h: 0.32,
    fontFace: "Poppins ExtraBold", fontSize: 14, color: C.red,
  });

  const risks = data.risks;
  risks.forEach((r, i) => {
    const ry = 1.55 + i * 1.05;
    slide.addShape("roundRect", {
      x: 0.35, y: ry, w: 4.60, h: 0.90,
      fill: { color: C.white },
      rectRadius: 0.06,
      shadow: { type: "outer", blur: 4, offset: 1, color: "E0E0E0" },
    });
    slide.addShape("rect", {
      x: 0.35, y: ry, w: 0.06, h: 0.90,
      fill: { color: C.red },
    });
    slide.addText([
      { text: "⚠️  ", options: { fontSize: 10 } },
      { text: r.risk, options: { fontFace: "Poppins SemiBold", fontSize: 10, color: C.burgundy } },
    ], {
      x: 0.55, y: ry + 0.06, w: 4.25, h: 0.30,
    });
    slide.addText([
      { text: "Mitigation: ", options: { fontFace: "Poppins SemiBold", fontSize: 8.5, color: C.medGray } },
      { text: r.mitigation, options: { fontFace: "Poppins", fontSize: 8.5, color: C.medGray } },
    ], {
      x: 0.55, y: ry + 0.40, w: 4.25, h: 0.40,
      lineSpacingMultiple: 1.2,
    });
  });

  slide.addText("Next Steps", {
    x: 5.25, y: 1.10, w: 4.40, h: 0.32,
    fontFace: "Poppins ExtraBold", fontSize: 14, color: C.burgundy,
  });

  const nextSteps = data.nextSteps;
  nextSteps.forEach((s, i) => {
    const sy = 1.55 + i * 0.58;
    slide.addShape("roundRect", {
      x: 5.25, y: sy, w: 4.40, h: 0.48,
      fill: { color: C.white },
      rectRadius: 0.06,
      shadow: { type: "outer", blur: 4, offset: 1, color: "E0E0E0" },
    });
    slide.addText([
      { text: `${i + 1}. `, options: { fontFace: "Poppins ExtraBold", fontSize: 10, color: C.orange } },
      { text: s, options: { fontFace: "Poppins", fontSize: 9.5, color: C.burgundy } },
    ], {
      x: 5.40, y: sy, w: 4.10, h: 0.48,
      valign: "middle",
    });
  });

  const asksY = 1.55 + nextSteps.length * 0.58 + 0.20;
  if (data.asks && data.asks.length > 0) {
    slide.addShape("roundRect", {
      x: 5.25, y: asksY, w: 4.40, h: 0.80,
      fill: { color: C.paleOrange },
      rectRadius: 0.06,
    });
    addSectionLabel(slide, "DECISION NEEDED", 5.35, asksY + 0.08, 1.50);
    const askParts = data.asks.map((a, i) => ({
      text: `●  ${a}${i < data.asks.length - 1 ? "\n" : ""}`,
      options: { fontFace: "Poppins", fontSize: 9, color: C.burgundy },
    }));
    slide.addText(askParts, {
      x: 5.40, y: asksY + 0.38, w: 4.10, h: 0.38,
      lineSpacingMultiple: 1.2,
    });
  }
}

// ═══════════════════════════════════════════
// FILLED: Personalization — Screen Ranker
// ═══════════════════════════════════════════

async function createPersonalizationMPR() {
  const pptx = new pptxgen();
  pptx.defineLayout({ name: "TALABAT", width: 10, height: 5.63 });
  pptx.layout = "TALABAT";
  pptx.title = "Personalization — Monthly Product Review";

  const totalPages = 6;

  // Slide 1: Cover
  addCoverSlide(pptx, {
    title: "Personalization",
    subtitle: "Monthly Product Review",
    pm: "Adrian Alvarez",
    quarter: "Q2 Y26",
    date: "May 2026",
    status: "In Experiment",
  });

  // Slide 2: Strategy & Context
  addStrategySlide(pptx, {
    totalPages,
    okr: "KR1: +1.2% component clicks/session · KR2: +0.3% home orders/user · KR3: 90% portal completion",
    vision: "Globalize a personalization engine that drives growth across all entities — evolving from manual screen optimization to a full experience orchestration engine.",
    thesis: "High-value surfaces are shaped by arbitrary placement decisions. Q4 proved data-driven ranking drives +39.49% CTR and +22.32% orders/user for HVCs (~€20M QC GMV). Q2 turns this into production impact at scale.",
    problems: [
      {
        num: "1",
        title: "Arbitrary placements",
        desc: "Placement on Home is manual and inconsistent across markets. We're leaving ~€20M QC GMV unrealized because ranking is not systematically applied.",
      },
      {
        num: "2",
        title: "No trust or visibility",
        desc: "Stakeholders can't see how configs perform or why decisions are made. This slows adoption and keeps teams dependent on manual decisions.",
      },
      {
        num: "3",
        title: "No structured learning",
        desc: "Experiments run in isolation without holdout/test/rollout standards. Learnings can't be trusted or scaled across markets.",
      },
    ],
  });

  // Slide 3: What We Shipped
  addShippedSlide(pptx, {
    totalPages,
    period: "Q2 Y26 — April/May",
    features: [
      {
        name: "Screen Ranker MVP Experiment",
        desc: "Home Screen experiment for MVC/HVC across all markets (ex JO & BH). 3-variant test: Control, Carousel+Ranked, Fully Ranked. Launched Apr 13.",
        status: "In Experiment",
      },
      {
        name: "Coffee Tile Time-Based Swap",
        desc: "UAE breakfast hours (8–11 AM) — replaces DineOut tile with Coffee tile. 50/50 split validating time-based personalization.",
        status: "In Experiment",
      },
      {
        name: "Personalization Portal MVP",
        desc: "Explore & Compare configurations across segments, markets, and time. Ranking recommendations in UI. Enables visibility and data-driven decisions.",
        status: "In Progress",
      },
      {
        name: "GenAI Time-Context Metadata",
        desc: "LLM-generated time-of-day relevance tags for items (breakfast, lunch, dinner). Enables contextual ranking signals for Screen Ranker.",
        status: "In Progress",
      },
    ],
  });

  // Slide 4: Metrics & Impact
  addMetricsSlide(pptx, {
    totalPages,
    scope: "All markets ex JO & BH — experiment running since Apr 13",
    kpis: [
      {
        label: "QC GMV (primary)",
        value: "awaiting",
        context: "Target: +€10M · Q4 validated +0.46%",
        trend: "neutral",
      },
      {
        label: "Component Clicks/Session",
        value: "awaiting",
        context: "KR1 target: +1.2% uplift",
        trend: "neutral",
      },
      {
        label: "CPC Revenue (guardrail)",
        value: "monitoring",
        context: "Q4 Iter 2: -0.31% (-€580K/yr)",
        trend: "neutral",
      },
    ],
    findings: [
      "Q4 Iteration 1: +19.47% HS engagement, +0.45% QC GMV (+€11M/yr), but -2.78% CPC (-€3M/yr)",
      "Q4 Iteration 2: Targeted MVC/HVC + de-ranked Order Again → +0.46% QC GMV, CPC drop reduced 5x to -€580K/yr",
      "Coffee tile experiment launched Apr 23 — validating time-based personalization hypothesis in UAE",
      "Experiment needs 3-4 weeks for statistical significance — decision expected mid-May",
    ],
  });

  // Slide 5: Roadmap
  addRoadmapSlide(pptx, {
    totalPages,
    timeline: "Q2–Q4 Y26",
    phases: [
      {
        name: "Phase 1 (Apr–May)",
        status: "In Experiment",
        items: [
          "SR MVP experiment on Home (3 variants)",
          "Coffee tile UAE morning experiment",
          "SR experimentation setup (holdout/test/rollout)",
          "Portal MVP: Explore + Compare",
        ],
      },
      {
        name: "Phase 2 (May–Jun)",
        status: "Planned",
        items: [
          "SR production rollout on Home (MVC/HVC)",
          "Multi-surface exploration (HoF, HoG, OTP)",
          "GenAI time-context metadata integration",
          "NBA discovery (logic, triggers, formats)",
          "CRM consistency experiments",
        ],
      },
      {
        name: "Q3–Q4",
        status: "Planned",
        items: [
          "SR expansion to Discovery, Search, VLP",
          "Archetype-based experimentation",
          "Full experience configs + conflict detection",
          "Cross-surface orchestration",
          "Campaign orchestration system",
        ],
      },
    ],
  });

  // Slide 6: Risks & Next Steps
  addRisksNextStepsSlide(pptx, {
    totalPages,
    risks: [
      {
        risk: "SR rollout does not generalize across markets",
        mitigation: "Gradual rollout + market-level monitoring. Q4 validated in multiple markets.",
      },
      {
        risk: "Coffee experiment signal is weak",
        mitigation: "Clear success metrics + sufficient exposure defined. DineOut swap chosen to avoid donation guardrail.",
      },
      {
        risk: "CPC revenue trade-off too large",
        mitigation: "Iter 2 design reduced CPC impact 5x. Guardrail metrics in place. Components driving CPC stay in similar positions.",
      },
      {
        risk: "Portal MVP not adopted by stakeholders",
        mitigation: "Focus on visibility + recommendations first, defer complexity. Early stakeholder involvement.",
      },
    ],
    nextSteps: [
      "Monitor SR experiment until statistical significance (mid-May target)",
      "Go/no-go decision on SR production rollout based on predefined success criteria",
      "Evaluate Coffee tile guardrail impact on DineOut transactions",
      "Deliver Portal MVP Explore + Compare for stakeholder testing",
    ],
    asks: [
      "Approve SR production rollout timeline if experiment validates (Phase 2: May 11–15)",
      "Align on CPC revenue trade-off threshold with Commercial team",
    ],
  });

  await pptx.writeFile({ fileName: path.join(OUTPUT, "MPR-Personalization.pptx") });
  console.log("✓ MPR-Personalization.pptx created");
}

createPersonalizationMPR().catch(console.error);
