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

// ── Shared helpers (same as template) ──

function addMPRHeader(slide, title, subtitle, pageNum, totalPages) {
  slide.background = { color: C.cream };
  slide.addShape("roundRect", {
    x: 0.35, y: 0.0, w: 1.20, h: 0.07,
    fill: { color: C.orange }, rectRadius: 0.02,
  });
  slide.addImage({ path: LOGO, x: 8.29, y: 0.24, w: 1.39, h: 0.46, rotate: 4.7 });
  slide.addText(title, {
    x: 0.35, y: 0.18, w: 7.5, h: 0.50,
    fontFace: "Poppins SemiBold", fontSize: 22, color: C.orange, valign: "bottom",
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
      fontFace: "Poppins Medium", fontSize: 7, color: C.lightGray, align: "right",
    });
  }
}

function addSectionLabel(slide, label, x, y, w) {
  slide.addShape("roundRect", {
    x, y, w: w || 1.4, h: 0.28,
    fill: { color: C.orange }, rectRadius: 0.04,
  });
  slide.addText(label, {
    x, y, w: w || 1.4, h: 0.28,
    fontFace: "Poppins SemiBold", fontSize: 9, color: C.white,
    align: "center", valign: "middle",
  });
}

function addStatusPill(slide, status, x, y) {
  const colors = { "Shipped": C.green, "In Progress": C.orange, "In Experiment": C.amber, "Planned": C.medGray, "Blocked": C.red, "Done": C.green };
  slide.addShape("roundRect", { x, y, w: 1.1, h: 0.22, fill: { color: colors[status] || C.medGray }, rectRadius: 0.11 });
  slide.addText(status, { x, y, w: 1.1, h: 0.22, fontFace: "Poppins SemiBold", fontSize: 7.5, color: C.white, align: "center", valign: "middle" });
}

function addScreenshotPlaceholder(slide, x, y, w, h, label) {
  slide.addShape("roundRect", { x, y, w, h, fill: { color: "FAFAFA" }, line: { color: C.lightGray, width: 1.5, dashType: "dash" }, rectRadius: 0.08 });
  slide.addText(label || "Screenshot\n(paste image here)", { x, y: y + h * 0.15, w, h: h * 0.7, fontFace: "Poppins Medium", fontSize: 8, color: C.lightGray, align: "center", valign: "middle" });
}

// ═══════════════════════════════════════════
// F&UF MPR — FILLED WITH REAL DATA
// ═══════════════════════════════════════════

async function createFuFMPR() {
  const pptx = new pptxgen();
  pptx.defineLayout({ name: "TALABAT", width: 10, height: 5.63 });
  pptx.layout = "TALABAT";
  pptx.title = "F&UF — Monthly Product Review";

  const totalPages = 6;

  // ── SLIDE 1: COVER ──
  const s1 = pptx.addSlide();
  s1.background = { color: C.orange };
  s1.addImage({ path: LOGO, x: 7.09, y: 0.40, w: 2.52, h: 0.84, rotate: 4.7 });
  s1.addText("Fresh & Ultra-Fresh", {
    x: 0.50, y: 1.20, w: 8.5, h: 1.40,
    fontFace: "Poppins ExtraBold", fontSize: 42, color: C.cream, valign: "bottom",
  });
  s1.addText("Monthly Product Review", {
    x: 0.50, y: 2.70, w: 8.5, h: 0.50,
    fontFace: "Poppins Medium", fontSize: 18, color: C.burgundy,
  });
  s1.addText("Firas Alashram Gomez  ·  Q2 Y26  ·  May 2026", {
    x: 0.50, y: 3.40, w: 8.5, h: 0.40,
    fontFace: "Poppins", fontSize: 12, color: C.cream,
  });
  s1.addShape("roundRect", {
    x: 0.50, y: 4.10, w: 1.8, h: 0.35,
    fill: { color: C.lime }, rectRadius: 0.05,
  });
  s1.addText("In Experiment", {
    x: 0.50, y: 4.10, w: 1.8, h: 0.35,
    fontFace: "Poppins SemiBold", fontSize: 11, color: C.burgundy,
    align: "center", valign: "middle",
  });
  s1.addImage({ path: LOGO, x: 6.63, y: 4.31, w: 2.99, h: 1.00 });

  // ── SLIDE 2: STRATEGY & CONTEXT ──
  const s2 = pptx.addSlide();
  addMPRHeader(s2, "Strategy & Context", "O6.KR2 — Increase Home orders per user through time-context relevance", 1, totalPages);

  // Vision
  s2.addShape("roundRect", { x: 0.35, y: 1.10, w: 9.30, h: 0.85, fill: { color: C.white }, rectRadius: 0.06, shadow: { type: "outer", blur: 4, offset: 1, color: "E0E0E0" } });
  addSectionLabel(s2, "VISION", 0.50, 1.16, 0.85);
  s2.addText("Make talabat the most trusted destination for fresh groceries by delivering an experience that mirrors how customers naturally shop, evaluate, and decide.", {
    x: 0.55, y: 1.48, w: 8.95, h: 0.42,
    fontFace: "Poppins", fontSize: 10, color: C.burgundy, lineSpacingMultiple: 1.3,
  });

  // Thesis
  s2.addShape("roundRect", { x: 0.35, y: 2.10, w: 9.30, h: 0.75, fill: { color: C.white }, rectRadius: 0.06, shadow: { type: "outer", blur: 4, offset: 1, color: "E0E0E0" } });
  addSectionLabel(s2, "THESIS", 0.50, 2.16, 0.85);
  s2.addText("Winning in fresh requires a trust-first shopping system that builds confidence through a cohesive experience grounded in what matters most to customers in each category.", {
    x: 0.55, y: 2.46, w: 8.95, h: 0.35,
    fontFace: "Poppins", fontSize: 10, color: C.burgundy, lineSpacingMultiple: 1.3,
  });

  // Problems
  s2.addText("Problems to Solve", {
    x: 0.35, y: 3.05, w: 5.0, h: 0.32,
    fontFace: "Poppins ExtraBold", fontSize: 14, color: C.burgundy,
  });

  const problems = [
    { num: "1", title: "Intent", desc: "Customer thought process for F&UF clashes with how we categorize our stores. Fresh items are presented in mixed, non-intuitive sequences." },
    { num: "2", title: "Information", desc: "Missing information and data inconsistency across items. Customers can't confidently judge quantity, value, or suitability." },
    { num: "3", title: "Messaging", desc: "No shared understanding of our quality promise. Customers have no visibility into tMart's selection, sorting, and transport processes." },
  ];
  const cardW = (9.30 - 0.40) / 3;
  problems.forEach((p, i) => {
    const cx = 0.35 + i * (cardW + 0.2);
    s2.addShape("roundRect", { x: cx, y: 3.45, w: cardW, h: 1.85, fill: { color: C.white }, rectRadius: 0.06, shadow: { type: "outer", blur: 4, offset: 1, color: "E0E0E0" } });
    s2.addShape("roundRect", { x: cx + 0.15, y: 3.58, w: 0.32, h: 0.32, fill: { color: C.orange }, rectRadius: 0.16 });
    s2.addText(p.num, { x: cx + 0.15, y: 3.58, w: 0.32, h: 0.32, fontFace: "Poppins ExtraBold", fontSize: 13, color: C.white, align: "center", valign: "middle" });
    s2.addText(p.title, { x: cx + 0.55, y: 3.55, w: cardW - 0.75, h: 0.38, fontFace: "Poppins SemiBold", fontSize: 10, color: C.burgundy, valign: "middle" });
    s2.addText(p.desc, { x: cx + 0.15, y: 4.0, w: cardW - 0.30, h: 1.20, fontFace: "Poppins", fontSize: 8.5, color: C.medGray, lineSpacingMultiple: 1.3, valign: "top" });
  });

  // ── SLIDE 3: WHAT WE SHIPPED ──
  const s3 = pptx.addSlide();
  addMPRHeader(s3, "What We Shipped", "Q1–Q2 2026 · UAE", 2, totalPages);

  const features = [
    { name: "Fresh Stories", desc: "Visual storytelling showing sourcing, quality checks, and handling processes. Replaces Freshness Guarantee banner. Triggered on first F&UF category visit.", status: "In Experiment" },
    { name: "Fresh Component (Hero)", desc: "Centralized F&UF entry point on gHome and VLP. Groups all fresh categories together. Sets 'tMart = fresh' tone above the fold.", status: "In Experiment" },
    { name: "Tab Bar Fresh Entry Point", desc: "Dedicated navigation tab for fresh-only shopping. Early version redirects to Fruits & Vegetables. Full vision with dedicated landing page in progress.", status: "In Experiment" },
  ];
  const leftW = 5.0;
  features.forEach((f, i) => {
    const fy = 1.15 + i * 1.17;
    s3.addShape("roundRect", { x: 0.35, y: fy, w: leftW, h: 1.05, fill: { color: C.white }, rectRadius: 0.06, shadow: { type: "outer", blur: 4, offset: 1, color: "E0E0E0" } });
    s3.addShape("rect", { x: 0.35, y: fy, w: 0.06, h: 1.05, fill: { color: C.orange } });
    s3.addText(f.name, { x: 0.60, y: fy + 0.08, w: leftW - 1.6, h: 0.28, fontFace: "Poppins SemiBold", fontSize: 11, color: C.burgundy });
    addStatusPill(s3, f.status, leftW - 0.80, fy + 0.10);
    s3.addText(f.desc, { x: 0.60, y: fy + 0.38, w: leftW - 0.40, h: 0.57, fontFace: "Poppins", fontSize: 9, color: C.medGray, lineSpacingMultiple: 1.25, valign: "top" });
  });

  // Right screenshots
  s3.addText("Product Visuals", { x: 5.65, y: 1.08, w: 4.0, h: 0.28, fontFace: "Poppins SemiBold", fontSize: 10, color: C.burgundy, align: "center" });
  addScreenshotPlaceholder(s3, 5.85, 1.42, 3.6, 1.75, "Fresh component on gHome\n(paste screenshot here)");
  addScreenshotPlaceholder(s3, 5.85, 3.35, 3.6, 1.75, "Fresh Stories experience\n(paste screenshot here)");

  // ── SLIDE 4: METRICS & IMPACT ──
  const s4 = pptx.addSlide();
  addMPRHeader(s4, "Metrics & Impact", "UAE — Incremental A/B test running", 3, totalPages);

  const kpis = [
    { label: "F&UF ATC Rate", value: "awaiting", context: "Guardrail — neutral = success", trend: "neutral" },
    { label: "Component Engagement", value: "awaiting", context: "Fresh category views uplift", trend: "neutral" },
    { label: "Story Completion Rate", value: "awaiting", context: "Engagement with trust messaging", trend: "neutral" },
  ];
  const kpiW = (9.30 - 0.30) / 3;
  kpis.forEach((k, i) => {
    const kx = 0.35 + i * (kpiW + 0.15);
    s4.addShape("roundRect", { x: kx, y: 1.10, w: kpiW, h: 1.25, fill: { color: C.white }, rectRadius: 0.06, shadow: { type: "outer", blur: 4, offset: 1, color: "E0E0E0" } });
    const tc = C.medGray;
    s4.addText(k.label, { x: kx + 0.15, y: 1.16, w: kpiW - 0.30, h: 0.25, fontFace: "Poppins Medium", fontSize: 9, color: C.medGray });
    s4.addText(k.value, { x: kx + 0.15, y: 1.42, w: kpiW - 0.30, h: 0.55, fontFace: "Poppins ExtraBold", fontSize: 24, color: tc, valign: "middle" });
    s4.addText(k.context, { x: kx + 0.15, y: 2.0, w: kpiW - 0.30, h: 0.25, fontFace: "Poppins", fontSize: 8, color: C.medGray });
  });

  s4.addText("Experiment Results", { x: 0.35, y: 2.55, w: 5.0, h: 0.32, fontFace: "Poppins ExtraBold", fontSize: 14, color: C.burgundy });
  addScreenshotPlaceholder(s4, 0.35, 2.95, 5.60, 2.30, "Eppo experiment results\n(paste chart here)");

  s4.addText("Key Findings", { x: 6.15, y: 2.55, w: 3.50, h: 0.32, fontFace: "Poppins ExtraBold", fontSize: 14, color: C.burgundy });
  const findings = [
    "Incremental A/B test approach: each feature added to variant cumulatively",
    "Success = neutral ATC + high engagement with trust messaging",
    "DineOut transactions monitored as guardrail",
    "Story engagement correlation with F&UF ATC to be measured",
  ];
  s4.addText(findings.map((f, i) => ({
    text: `●  ${f}${i < findings.length - 1 ? "\n" : ""}`,
    options: { fontFace: "Poppins", fontSize: 9, color: C.burgundy },
  })), { x: 6.15, y: 2.95, w: 3.50, h: 2.30, lineSpacingMultiple: 1.35, valign: "top" });

  // ── SLIDE 5: ROADMAP ──
  const s5 = pptx.addSlide();
  addMPRHeader(s5, "Roadmap", "Q1–Q2 2026", 4, totalPages);

  const phases = [
    { name: "Immediate (No-code)", status: "Shipped", items: ["TrendMart — Op. excellence messaging", "SiS Fresh takeover"] },
    { name: "Slice 1 (Q1)", status: "In Experiment", items: ["Tab bar Fresh entry point", "Fresh Stories (trust messaging)", "Fresh Component (hero)", "Fresh Landing Page"] },
    { name: "Slice 2 (Q2)", status: "Planned", items: ["Category banners", "Contextual product info", "Fresh tab full vision", "Cross-category recommendations"] },
  ];
  const phaseW = (9.30 - 0.30) / 3;
  const phaseColors = { "Shipped": C.green, "In Experiment": C.amber, "Planned": C.medGray };
  phases.forEach((p, i) => {
    const px = 0.35 + i * (phaseW + 0.15);
    s5.addShape("roundRect", { x: px, y: 1.15, w: phaseW, h: 0.40, fill: { color: phaseColors[p.status] || C.medGray }, rectRadius: 0.04 });
    s5.addText(p.name, { x: px + 0.12, y: 1.15, w: phaseW - 0.24, h: 0.40, fontFace: "Poppins SemiBold", fontSize: 12, color: C.white, valign: "middle" });
    if (i < phases.length - 1) {
      s5.addText("→", { x: px + phaseW - 0.05, y: 1.15, w: 0.35, h: 0.40, fontFace: "Poppins ExtraBold", fontSize: 18, color: C.lightGray, align: "center", valign: "middle" });
    }
    s5.addShape("roundRect", { x: px, y: 1.65, w: phaseW, h: 3.55, fill: { color: C.white }, rectRadius: 0.06, shadow: { type: "outer", blur: 4, offset: 1, color: "E0E0E0" } });
    addStatusPill(s5, p.status, px + phaseW - 1.25, 1.78);
    s5.addText(p.items.map((item, j) => ({
      text: `●  ${item}${j < p.items.length - 1 ? "\n" : ""}`,
      options: { fontFace: "Poppins", fontSize: 9, color: C.burgundy },
    })), { x: px + 0.15, y: 2.15, w: phaseW - 0.30, h: 2.90, lineSpacingMultiple: 1.4, valign: "top" });
  });

  // ── SLIDE 6: RISKS & NEXT STEPS ──
  const s6 = pptx.addSlide();
  addMPRHeader(s6, "Risks & Next Steps", null, 5, totalPages);

  s6.addText("Risks & Dependencies", { x: 0.35, y: 1.10, w: 4.60, h: 0.32, fontFace: "Poppins ExtraBold", fontSize: 14, color: C.red });

  const risks = [
    { risk: "Stories may interrupt shopping flow and hurt ATC", mitigation: "Skippable, triggered only in high-intent fresh contexts. Monitor ATC as strict guardrail." },
    { risk: "Quality/availability gap between messaging and reality", mitigation: "Align messaging with ops capabilities per country. Coordinate with local teams. Kill switch if complaints rise." },
    { risk: "Dark background support needed in Marshmallow", mitigation: "Ticket escalated to platform team. Fresh component blocked until resolved." },
  ];
  risks.forEach((r, i) => {
    const ry = 1.55 + i * 1.05;
    s6.addShape("roundRect", { x: 0.35, y: ry, w: 4.60, h: 0.90, fill: { color: C.white }, rectRadius: 0.06, shadow: { type: "outer", blur: 4, offset: 1, color: "E0E0E0" } });
    s6.addShape("rect", { x: 0.35, y: ry, w: 0.06, h: 0.90, fill: { color: C.red } });
    s6.addText([
      { text: "⚠️  ", options: { fontSize: 10 } },
      { text: r.risk, options: { fontFace: "Poppins SemiBold", fontSize: 10, color: C.burgundy } },
    ], { x: 0.55, y: ry + 0.06, w: 4.25, h: 0.30 });
    s6.addText([
      { text: "Mitigation: ", options: { fontFace: "Poppins SemiBold", fontSize: 8.5, color: C.medGray } },
      { text: r.mitigation, options: { fontFace: "Poppins", fontSize: 8.5, color: C.medGray } },
    ], { x: 0.55, y: ry + 0.40, w: 4.25, h: 0.40, lineSpacingMultiple: 1.2 });
  });

  s6.addText("Next Steps", { x: 5.25, y: 1.10, w: 4.40, h: 0.32, fontFace: "Poppins ExtraBold", fontSize: 14, color: C.burgundy });
  const nextSteps = [
    "Deep dive into experiment data — new vs existing fresh buyers",
    "Measure incremental impact by surface: VLP vs gHome",
    "Identify which fresh categories drive strongest uplift",
    "Validate Story engagement → ATC correlation",
  ];
  nextSteps.forEach((s, i) => {
    const sy = 1.55 + i * 0.58;
    s6.addShape("roundRect", { x: 5.25, y: sy, w: 4.40, h: 0.48, fill: { color: C.white }, rectRadius: 0.06, shadow: { type: "outer", blur: 4, offset: 1, color: "E0E0E0" } });
    s6.addText([
      { text: `${i + 1}. `, options: { fontFace: "Poppins ExtraBold", fontSize: 10, color: C.orange } },
      { text: s, options: { fontFace: "Poppins", fontSize: 9.5, color: C.burgundy } },
    ], { x: 5.40, y: sy, w: 4.10, h: 0.48, valign: "middle" });
  });

  // Decision needed
  s6.addShape("roundRect", { x: 5.25, y: 3.95, w: 4.40, h: 0.80, fill: { color: C.paleOrange }, rectRadius: 0.06 });
  addSectionLabel(s6, "DECISION NEEDED", 5.35, 4.03, 1.50);
  s6.addText("●  Prioritize Marshmallow dark background ticket for Fresh component", {
    x: 5.40, y: 4.35, w: 4.10, h: 0.38,
    fontFace: "Poppins", fontSize: 9, color: C.burgundy,
  });

  await pptx.writeFile({ fileName: path.join(OUTPUT, "MPR-FreshUltraFresh.pptx") });
  console.log("✓ MPR-FreshUltraFresh.pptx created");
}

createFuFMPR().catch(console.error);
