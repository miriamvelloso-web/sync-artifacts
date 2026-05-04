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

  slide.addText(data.title || "[Initiative Title]", {
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
  slide.addText(metaParts.join("  ·  ") || "[PM Name]  ·  [Quarter]  ·  [Date]", {
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

  // Vision box
  slide.addShape("roundRect", {
    x: 0.35, y: 1.10, w: 9.30, h: 0.85,
    fill: { color: C.white },
    rectRadius: 0.06,
    shadow: { type: "outer", blur: 4, offset: 1, color: "E0E0E0" },
  });
  addSectionLabel(slide, "VISION", 0.50, 1.16, 0.85);
  slide.addText(data.vision || "[Vision statement from strategy doc]", {
    x: 0.55, y: 1.48, w: 8.95, h: 0.42,
    fontFace: "Poppins", fontSize: 10, color: C.burgundy,
    lineSpacingMultiple: 1.3,
  });

  // Thesis
  slide.addShape("roundRect", {
    x: 0.35, y: 2.10, w: 9.30, h: 0.75,
    fill: { color: C.white },
    rectRadius: 0.06,
    shadow: { type: "outer", blur: 4, offset: 1, color: "E0E0E0" },
  });
  addSectionLabel(slide, "THESIS", 0.50, 2.16, 0.85);
  slide.addText(data.thesis || "[Strategic thesis from strategy doc]", {
    x: 0.55, y: 2.46, w: 8.95, h: 0.35,
    fontFace: "Poppins", fontSize: 10, color: C.burgundy,
    lineSpacingMultiple: 1.3,
  });

  // Problems to solve (cards)
  slide.addText("Problems to Solve", {
    x: 0.35, y: 3.05, w: 5.0, h: 0.32,
    fontFace: "Poppins ExtraBold", fontSize: 14, color: C.burgundy,
  });

  const problems = data.problems || [
    { num: "1", title: "[Problem area]", desc: "[Brief description of the problem]" },
    { num: "2", title: "[Problem area]", desc: "[Brief description of the problem]" },
    { num: "3", title: "[Problem area]", desc: "[Brief description of the problem]" },
  ];

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

  const features = data.features || [
    { name: "[Feature 1]", desc: "[What it does, where it applies]", status: "Shipped" },
    { name: "[Feature 2]", desc: "[What it does, where it applies]", status: "In Progress" },
    { name: "[Feature 3]", desc: "[What it does, where it applies]", status: "In Experiment" },
  ];

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

  // Right column — screenshot placeholders
  const rightX = 5.65;
  const rightW = 4.0;

  slide.addText("Product Visuals", {
    x: rightX, y: 1.08, w: rightW, h: 0.28,
    fontFace: "Poppins SemiBold", fontSize: 10, color: C.burgundy,
    align: "center",
  });
  addScreenshotPlaceholder(slide, rightX + 0.2, 1.42, rightW - 0.4, 1.75, "Feature screenshot 1\n(paste image here)");
  addScreenshotPlaceholder(slide, rightX + 0.2, 3.35, rightW - 0.4, 1.75, "Feature screenshot 2\n(paste image here)");
}

// ═══════════════════════════════════════════
// SLIDE 4: METRICS & IMPACT
// ═══════════════════════════════════════════

function addMetricsSlide(pptx, data) {
  const slide = pptx.addSlide();
  const totalPages = data.totalPages || 6;
  addMPRHeader(slide, "Metrics & Impact", data.scope || null, 3, totalPages);

  // KPI cards (top row)
  const kpis = data.kpis || [
    { label: "[Primary Metric]", value: "[+X.X%]", context: "[vs control / vs baseline]", trend: "up" },
    { label: "[Secondary Metric]", value: "[+X.X%]", context: "[context]", trend: "up" },
    { label: "[Guardrail Metric]", value: "[neutral]", context: "[no negative impact]", trend: "neutral" },
  ];

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

  // Chart/data placeholder area
  slide.addText("Experiment Results", {
    x: 0.35, y: 2.55, w: 5.0, h: 0.32,
    fontFace: "Poppins ExtraBold", fontSize: 14, color: C.burgundy,
  });
  addScreenshotPlaceholder(slide, 0.35, 2.95, 5.60, 2.30, "Experiment chart / Eppo screenshot\n(paste data visualization here)");

  // Key findings
  slide.addText("Key Findings", {
    x: 6.15, y: 2.55, w: 3.50, h: 0.32,
    fontFace: "Poppins ExtraBold", fontSize: 14, color: C.burgundy,
  });

  const findings = data.findings || [
    "[Key finding 1 from experiment results]",
    "[Key finding 2 — what surprised us]",
    "[Key finding 3 — guardrail outcome]",
  ];
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

  const phases = data.phases || [
    {
      name: "Slice 1",
      status: "Shipped",
      items: ["[Feature A — shipped]", "[Feature B — shipped]"],
    },
    {
      name: "Slice 2",
      status: "In Progress",
      items: ["[Feature C — in development]", "[Feature D — in experiment]"],
    },
    {
      name: "Slice 3",
      status: "Planned",
      items: ["[Feature E — planned]", "[Feature F — discovery]"],
    },
  ];

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

    // Phase header bar
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

    // Arrow connector (except last)
    if (i < phases.length - 1) {
      slide.addText("→", {
        x: px + phaseW - 0.05, y: 1.15, w: 0.35, h: 0.40,
        fontFace: "Poppins ExtraBold", fontSize: 18, color: C.lightGray,
        align: "center", valign: "middle",
      });
    }

    // Phase card
    slide.addShape("roundRect", {
      x: px, y: 1.65, w: phaseW, h: 3.55,
      fill: { color: C.white },
      rectRadius: 0.06,
      shadow: { type: "outer", blur: 4, offset: 1, color: "E0E0E0" },
    });

    // Status pill
    addStatusPill(slide, p.status, px + phaseW - 1.25, 1.78);

    // Items
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

  // Left column — Risks
  slide.addText("Risks & Dependencies", {
    x: 0.35, y: 1.10, w: 4.60, h: 0.32,
    fontFace: "Poppins ExtraBold", fontSize: 14, color: C.red,
  });

  const risks = data.risks || [
    { risk: "[Risk/dependency 1]", mitigation: "[How we're mitigating it]" },
    { risk: "[Risk/dependency 2]", mitigation: "[How we're mitigating it]" },
  ];

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

  // Right column — Next Steps
  slide.addText("Next Steps", {
    x: 5.25, y: 1.10, w: 4.40, h: 0.32,
    fontFace: "Poppins ExtraBold", fontSize: 14, color: C.burgundy,
  });

  const nextSteps = data.nextSteps || [
    "[Next step 1 — what, who, when]",
    "[Next step 2 — what, who, when]",
    "[Next step 3 — what, who, when]",
  ];

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

  // Asks / Decision needed box (bottom)
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
// MAIN — Template with placeholders
// ═══════════════════════════════════════════

async function createMPRTemplate() {
  const pptx = new pptxgen();
  pptx.defineLayout({ name: "TALABAT", width: 10, height: 5.63 });
  pptx.layout = "TALABAT";
  pptx.title = "MPR Template";

  const totalPages = 6;

  // Slide 1: Cover
  addCoverSlide(pptx, {
    title: "[Initiative Title]",
    subtitle: "Monthly Product Review",
    pm: "[PM Name]",
    quarter: "Q2 Y26",
    date: "[Date]",
    status: "[Status]",
  });

  // Slide 2: Strategy
  addStrategySlide(pptx, {
    totalPages,
    okr: "[OKR reference]",
    vision: "[Vision statement — one sentence from strategy doc]",
    thesis: "[Strategic thesis — what must change and why]",
    problems: [
      { num: "1", title: "[Problem area]", desc: "[Brief problem description from strategy doc — 2-3 sentences max]" },
      { num: "2", title: "[Problem area]", desc: "[Brief problem description — 2-3 sentences max]" },
      { num: "3", title: "[Problem area]", desc: "[Brief problem description — 2-3 sentences max]" },
    ],
  });

  // Slide 3: Shipped
  addShippedSlide(pptx, {
    totalPages,
    period: "[This period]",
    features: [
      { name: "[Feature 1]", desc: "[What it does and where it applies — 1-2 sentences]", status: "Shipped" },
      { name: "[Feature 2]", desc: "[What it does and where it applies]", status: "In Experiment" },
      { name: "[Feature 3]", desc: "[What it does and where it applies]", status: "In Progress" },
    ],
  });

  // Slide 4: Metrics
  addMetricsSlide(pptx, {
    totalPages,
    scope: "[Markets / scope]",
    kpis: [
      { label: "[Primary Metric]", value: "+X.X%", context: "[vs control / vs baseline]", trend: "up" },
      { label: "[Secondary Metric]", value: "+X.X%", context: "[context]", trend: "up" },
      { label: "[Guardrail Metric]", value: "neutral", context: "[no negative impact]", trend: "neutral" },
    ],
    findings: [
      "[Key finding 1 from experiment results]",
      "[Key finding 2 — what surprised us]",
      "[Key finding 3 — guardrail outcome]",
    ],
  });

  // Slide 5: Roadmap
  addRoadmapSlide(pptx, {
    totalPages,
    timeline: "[Q1–Q2 Y26]",
    phases: [
      { name: "Slice 1", status: "Shipped", items: ["[Feature A]", "[Feature B]"] },
      { name: "Slice 2", status: "In Progress", items: ["[Feature C]", "[Feature D]"] },
      { name: "Slice 3", status: "Planned", items: ["[Feature E]", "[Feature F]"] },
    ],
  });

  // Slide 6: Risks & Next Steps
  addRisksNextStepsSlide(pptx, {
    totalPages,
    risks: [
      { risk: "[Risk/dependency 1]", mitigation: "[How we're mitigating it]" },
      { risk: "[Risk/dependency 2]", mitigation: "[How we're mitigating it]" },
    ],
    nextSteps: [
      "[Next step 1 — what, who, when]",
      "[Next step 2 — what, who, when]",
      "[Next step 3 — what, who, when]",
    ],
    asks: ["[Decision needed from leadership]"],
  });

  await pptx.writeFile({ fileName: path.join(OUTPUT, "MPR-Template.pptx") });
  console.log("✓ MPR-Template.pptx created");
}

createMPRTemplate().catch(console.error);
