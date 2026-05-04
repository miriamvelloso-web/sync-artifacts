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
  lightOrange: "FFD1B3",
  paleOrange: "FFF3EB",
  red: "D32F2F",
  green: "2E7D32",
};

function addBaseLayout(slide, title) {
  slide.background = { color: C.cream };

  slide.addShape("roundRect", {
    x: 0.35, y: 0.0, w: 1.20, h: 0.07,
    fill: { color: C.orange }, rectRadius: 0.02,
  });

  slide.addImage({
    path: LOGO,
    x: 8.29, y: 0.24, w: 1.39, h: 0.46, rotate: 4.7,
  });

  slide.addText(title, {
    x: 0.35, y: 0.18, w: 7.5, h: 0.68,
    fontFace: "Poppins SemiBold", fontSize: 25, color: C.orange,
    valign: "bottom",
  });
}

function addColumnHeaders(slide) {
  slide.addShape("roundRect", {
    x: 0.35, y: 1.72, w: 4.65, h: 0.32,
    fill: { color: C.orange }, rectRadius: 0.04,
  });
  slide.addText("Experiment Setup", {
    x: 0.35, y: 1.72, w: 4.65, h: 0.32,
    fontFace: "Poppins SemiBold", fontSize: 11, color: C.white,
    align: "center", valign: "middle",
  });

  slide.addShape("roundRect", {
    x: 5.15, y: 1.72, w: 4.50, h: 0.32,
    fill: { color: C.burgundy }, rectRadius: 0.04,
  });
  slide.addText("Experiment Results", {
    x: 5.15, y: 1.72, w: 4.50, h: 0.32,
    fontFace: "Poppins SemiBold", fontSize: 11, color: C.white,
    align: "center", valign: "middle",
  });
}

function addHypothesis(slide, text) {
  slide.addShape("roundRect", {
    x: 0.35, y: 2.14, w: 1.15, h: 0.24,
    fill: { color: C.orange }, rectRadius: 0.12,
  });
  slide.addText("Hypothesis", {
    x: 0.35, y: 2.14, w: 1.15, h: 0.24,
    fontFace: "Poppins SemiBold", fontSize: 8, color: C.white,
    align: "center", valign: "middle",
  });
  slide.addText(text, {
    x: 0.35, y: 2.42, w: 4.65, h: 0.55,
    fontFace: "Poppins", fontSize: 7.5, color: C.burgundy,
    lineSpacingMultiple: 1.2, valign: "top",
  });
}

function addVariant(slide, label, color, desc, y) {
  slide.addShape("roundRect", {
    x: 0.35, y, w: 0.75, h: 0.22,
    fill: { color }, rectRadius: 0.11,
  });
  slide.addText(label, {
    x: 0.35, y, w: 0.75, h: 0.22,
    fontFace: "Poppins SemiBold", fontSize: 7, color: C.white,
    align: "center", valign: "middle",
  });
  slide.addText(desc, {
    x: 1.15, y, w: 3.85, h: 0.22,
    fontFace: "Poppins", fontSize: 7, color: C.burgundy,
    valign: "middle",
  });
}

function addFooter(slide, period, eppoId, dataPic, onePager, workingSheet) {
  slide.addText([
    { text: "Analysis period: ", options: { fontFace: "Poppins SemiBold", fontSize: 7, color: C.medGray } },
    { text: period, options: { fontFace: "Poppins", fontSize: 7, color: C.medGray } },
  ], { x: 0.35, y: 5.22, w: 3.0, h: 0.20 });

  slide.addShape("roundRect", {
    x: 3.5, y: 5.22, w: 6.15, h: 0.25,
    fill: { color: C.white }, rectRadius: 0.04,
  });
  slide.addText([
    { text: "1 Pager", options: { fontFace: "Poppins Medium", fontSize: 7, color: C.orange } },
    { text: "   |   ", options: { fontFace: "Poppins", fontSize: 7, color: C.lightGray } },
    { text: "Eppo " + eppoId, options: { fontFace: "Poppins Medium", fontSize: 7, color: C.orange } },
    { text: "   |   ", options: { fontFace: "Poppins", fontSize: 7, color: C.lightGray } },
    { text: workingSheet ? "Working Sheet" : "", options: { fontFace: "Poppins Medium", fontSize: 7, color: C.orange } },
    { text: workingSheet ? "   |   " : "", options: { fontFace: "Poppins", fontSize: 7, color: C.lightGray } },
    { text: "Data PIC: ", options: { fontFace: "Poppins Medium", fontSize: 7, color: C.medGray } },
    { text: dataPic, options: { fontFace: "Poppins", fontSize: 7, color: C.burgundy } },
  ], {
    x: 3.5, y: 5.22, w: 6.15, h: 0.25,
    align: "center", valign: "middle",
  });
}

function metricLine(label, value, sig, isGuardrail) {
  const pct = (value * 100).toFixed(2);
  const sign = value >= 0 ? "+" : "";
  const highlightColor = sig ? (value >= 0 ? C.lime : "FFCDD2") : C.lime;
  const labelPrefix = isGuardrail ? "Guardrail" : "Primary metric";
  const labelColor = isGuardrail ? C.orange : C.burgundy;
  const sigText = sig ? " (stat sig)" : " (not sig)";
  const warningEmoji = (isGuardrail && sig && value < 0) ? " ⚠️" : "";

  return [
    { text: "●  ", options: { fontSize: 8.5 } },
    { text: label + ": ", options: { fontFace: "Poppins SemiBold", fontSize: 8.5, color: labelColor } },
    { text: " " + sign + pct + "% ", options: { fontFace: "Poppins SemiBold", fontSize: 8.5, color: C.burgundy, highlight: highlightColor } },
    { text: sigText + warningEmoji + "\n", options: { fontFace: "Poppins", fontSize: 8, color: C.medGray } },
    { text: "\n", options: { fontSize: 3 } },
  ];
}

async function createDeck() {
  const pptx = new pptxgen();
  pptx.defineLayout({ name: "TALABAT", width: 10, height: 5.63 });
  pptx.layout = "TALABAT";
  pptx.title = "TLBVAL Experiment Reviews";

  // ════════════════════════════════════════════════════
  // SLIDE 1: Screen Ranker MVP Rollout (Home)
  // ════════════════════════════════════════════════════
  const s1 = pptx.addSlide();
  addBaseLayout(s1, "Screen Ranker MVP Rollout (Home)");

  s1.addText([
    { text: "●  ", options: { fontSize: 9 } },
    { text: "All metrics directionally positive but not statistically significant: ", options: { fontFace: "Poppins SemiBold", fontSize: 9, color: C.burgundy } },
    { text: "QC GMV/user +0.46% (V2), Platform Orders +0.34%. Experiment still building sample.\n", options: { fontFace: "Poppins", fontSize: 9, color: C.burgundy } },
    { text: "●  ", options: { fontSize: 9 } },
    { text: "Both treatment variants show similar directional lift, ", options: { fontFace: "Poppins SemiBold", fontSize: 9, color: C.burgundy } },
    { text: "suggesting full ML ranking (V2) performs comparably to carousel-pinned (V1).\n", options: { fontFace: "Poppins", fontSize: 9, color: C.burgundy } },
    { text: "●  ", options: { fontSize: 9 } },
    { text: "Decision: ", options: { fontFace: "Poppins SemiBold", fontSize: 9, color: C.orange } },
    { text: "Continue running — insufficient sample for conclusive read", options: { fontFace: "Poppins", fontSize: 9, color: C.burgundy } },
  ], {
    x: 0.35, y: 0.92, w: 9.3, h: 0.72,
    lineSpacingMultiple: 1.3, valign: "top",
  });

  addColumnHeaders(s1);

  addHypothesis(s1, "Dynamically ranking the Campaign Carousel alongside other components — rather than fixing it at the top — will drive incremental GMV and engagement uplift by allowing the ML model to optimize the full Home Screen layout.");

  addVariant(s1, "A (50%)", C.orange, "Control — Home Screen as-is (BAU), static component ordering", 3.02);
  addVariant(s1, "B (25%)", C.burgundy, "Carousel pinned at top, remaining components reranked by ML (MVC/HVC)", 3.28);
  addVariant(s1, "C (25%)", C.medGray, "All components incl. carousel ranked by ML model (MVC/HVC)", 3.54);

  s1.addText([
    { text: "Market: ", options: { fontFace: "Poppins SemiBold", fontSize: 8, color: C.burgundy } },
    { text: "All except JO and BH\n", options: { fontFace: "Poppins", fontSize: 8, color: C.burgundy } },
    { text: "Entry Point: ", options: { fontFace: "Poppins SemiBold", fontSize: 8, color: C.burgundy } },
    { text: "MVC/HVC segments on Home Screen", options: { fontFace: "Poppins", fontSize: 8, color: C.burgundy } },
  ], { x: 0.35, y: 3.82, w: 4.65, h: 0.40, lineSpacingMultiple: 1.3 });

  s1.addShape("roundRect", {
    x: 0.35, y: 4.27, w: 4.65, h: 0.93,
    fill: { color: C.white },
    line: { color: C.lightGray, width: 1, dashType: "dash" },
    rectRadius: 0.08,
  });
  s1.addText("Mockup / Screenshot\n(paste image here)", {
    x: 0.35, y: 4.45, w: 4.65, h: 0.55,
    fontFace: "Poppins Medium", fontSize: 9, color: C.lightGray,
    align: "center", valign: "middle",
  });

  // Results — Screen Ranker (CUPED values)
  const sr_results = [
    ...metricLine("QC GMV/customer", 0.004560824490386151, false, false),
    ...metricLine("Platform GMV/customer", 0.0003038695527779232, false, false),
    ...metricLine("Platform Orders/customer", 0.0034131564214587577, false, false),
    ...metricLine("Food GMV/customer", -0.0026176924319704, false, true),
    ...metricLine("QC Orders/customer", 0.005675169790948201, false, false),
    ...metricLine("Food Orders/customer", 0.002545766226666951, false, false),
  ];
  s1.addText(sr_results, {
    x: 5.15, y: 2.14, w: 4.50, h: 1.55,
    lineSpacingMultiple: 1.15, valign: "top",
  });

  s1.addShape("roundRect", {
    x: 5.15, y: 3.75, w: 4.50, h: 0.45,
    fill: { color: C.paleOrange }, rectRadius: 0.06,
  });
  s1.addText([
    { text: "⚠️ Note: ", options: { fontFace: "Poppins SemiBold", fontSize: 7.5, color: C.orange } },
    { text: "Showing best variant (V2 — full ML ranking) results. 50/25/25 split means treatment arms need more time to reach significance. ~741K users per arm.", options: { fontFace: "Poppins", fontSize: 7.5, color: C.burgundy } },
  ], { x: 5.30, y: 3.75, w: 4.20, h: 0.45, valign: "middle" });

  s1.addText("Next steps", {
    x: 5.15, y: 4.25, w: 4.50, h: 0.28,
    fontFace: "Poppins SemiBold", fontSize: 10, color: C.orange,
  });
  s1.addText([
    { text: "●  Continue running until statistical significance is reached\n", options: { fontFace: "Poppins", fontSize: 8, color: C.burgundy } },
    { text: "●  Monitor Food GMV guardrail for potential negative impact\n", options: { fontFace: "Poppins", fontSize: 8, color: C.burgundy } },
    { text: "●  Assess V1 vs V2 for carousel pinning decision", options: { fontFace: "Poppins", fontSize: 8, color: C.burgundy } },
  ], { x: 5.30, y: 4.52, w: 4.35, h: 0.55, lineSpacingMultiple: 1.2 });

  addFooter(s1, "Apr 23, 2026 — ongoing", "162758", "Yassine Achour", "1wg2F4poOgoarnkdceaIofayn-nkf7AYm0jI4l6uDNno", "1BEQMsrpbBAPRnZCalpu8dGFukl_NcB8jWvSNWgS5T6g");

  // ════════════════════════════════════════════════════
  // SLIDE 2: Coffee Tile Time-Based (UAE)
  // ════════════════════════════════════════════════════
  const s2 = pptx.addSlide();
  addBaseLayout(s2, "Coffee Tile Time-Based (UAE)");

  s2.addText([
    { text: "●  ", options: { fontSize: 9 } },
    { text: "Primary metric (HS Orders/User) shows +0.37% directional lift ", options: { fontFace: "Poppins SemiBold", fontSize: 9, color: C.burgundy } },
    { text: "but far from statistical significance. Coffee-specific orders metric -2.0% (also not sig).\n", options: { fontFace: "Poppins", fontSize: 9, color: C.burgundy } },
    { text: "●  ", options: { fontSize: 9 } },
    { text: "Platform-level metrics neutral to slightly negative ", options: { fontFace: "Poppins SemiBold", fontSize: 9, color: C.burgundy } },
    { text: "— no meaningful impact detected on GMV, orders, or QC metrics.\n", options: { fontFace: "Poppins", fontSize: 9, color: C.burgundy } },
    { text: "●  ", options: { fontSize: 9 } },
    { text: "Decision: ", options: { fontFace: "Poppins SemiBold", fontSize: 9, color: C.orange } },
    { text: "Continue running through May 11 end date", options: { fontFace: "Poppins", fontSize: 9, color: C.burgundy } },
  ], {
    x: 0.35, y: 0.92, w: 9.3, h: 0.72,
    lineSpacingMultiple: 1.3, valign: "top",
  });

  addColumnHeaders(s2);

  addHypothesis(s2, "Showing a coffee tile during breakfast hours (8–11 AM) on the Home Screen will increase coffee orders per user by providing a timely, contextual entry point to the coffee vertical.");

  addVariant(s2, "A (50%)", C.orange, "Control — DineOut tile shown in default position", 3.02);
  addVariant(s2, "B (50%)", C.burgundy, "Coffee tile replaces DineOut tile during 8–11 AM (UAE only)", 3.30);

  s2.addText([
    { text: "Market: ", options: { fontFace: "Poppins SemiBold", fontSize: 8, color: C.burgundy } },
    { text: "UAE only\n", options: { fontFace: "Poppins", fontSize: 8, color: C.burgundy } },
    { text: "Entry Point: ", options: { fontFace: "Poppins SemiBold", fontSize: 8, color: C.burgundy } },
    { text: "Home Screen tile (8–11 AM local time)", options: { fontFace: "Poppins", fontSize: 8, color: C.burgundy } },
  ], { x: 0.35, y: 3.60, w: 4.65, h: 0.40, lineSpacingMultiple: 1.3 });

  s2.addShape("roundRect", {
    x: 0.35, y: 4.05, w: 4.65, h: 1.15,
    fill: { color: C.white },
    line: { color: C.lightGray, width: 1, dashType: "dash" },
    rectRadius: 0.08,
  });
  s2.addText("Mockup / Screenshot\n(paste image here)", {
    x: 0.35, y: 4.35, w: 4.65, h: 0.55,
    fontFace: "Poppins Medium", fontSize: 9, color: C.lightGray,
    align: "center", valign: "middle",
  });

  // Results — Coffee Tile
  const ct_results = [
    ...metricLine("HS Orders/User (SAM)", 0.0037076920017164146, false, false),
    ...metricLine("Platform GMV/customer", -0.0024055534347468973, false, true),
    ...metricLine("Platform Orders/customer", -0.0013571855831918916, false, true),
    ...metricLine("QC GMV/customer", -0.004733032360080482, false, true),
    ...metricLine("Food Orders/customer", -0.0012823316418443186, false, true),
    ...metricLine("QC Orders/customer", -0.0007130709694478072, false, true),
  ];
  s2.addText(ct_results, {
    x: 5.15, y: 2.14, w: 4.50, h: 1.55,
    lineSpacingMultiple: 1.15, valign: "top",
  });

  s2.addShape("roundRect", {
    x: 5.15, y: 3.75, w: 4.50, h: 0.45,
    fill: { color: C.paleOrange }, rectRadius: 0.06,
  });
  s2.addText([
    { text: "⚠️ Note: ", options: { fontFace: "Poppins SemiBold", fontSize: 7.5, color: C.orange } },
    { text: "Design changed mid-experiment — originally Give Back tile was control; swapped to DineOut tile after DineOut launch. Experiment ends May 11. ~1.07M users per arm.", options: { fontFace: "Poppins", fontSize: 7.5, color: C.burgundy } },
  ], { x: 5.30, y: 3.75, w: 4.20, h: 0.45, valign: "middle" });

  s2.addText("Next steps", {
    x: 5.15, y: 4.25, w: 4.50, h: 0.28,
    fontFace: "Poppins SemiBold", fontSize: 10, color: C.orange,
  });
  s2.addText([
    { text: "●  Let experiment run through planned end date (May 11)\n", options: { fontFace: "Poppins", fontSize: 8, color: C.burgundy } },
    { text: "●  Assess coffee-specific conversion funnel (tile CTR → order)\n", options: { fontFace: "Poppins", fontSize: 8, color: C.burgundy } },
    { text: "●  Consider expanding time window or markets if directional", options: { fontFace: "Poppins", fontSize: 8, color: C.burgundy } },
  ], { x: 5.30, y: 4.52, w: 4.35, h: 0.55, lineSpacingMultiple: 1.2 });

  addFooter(s2, "Apr 20, 2026 — May 11, 2026", "163267", "Yassine Achour", null, null);

  // ════════════════════════════════════════════════════
  // SLIDE 3: Best Sellers Swimlane (UAE)
  // ════════════════════════════════════════════════════
  const s3 = pptx.addSlide();
  addBaseLayout(s3, "Best Sellers Swimlane (UAE)");

  s3.addText([
    { text: "●  ", options: { fontSize: 9 } },
    { text: "Primary metric hit: Item Discounted Orders +1.35% (stat sig, p<0.001). ", options: { fontFace: "Poppins SemiBold", fontSize: 9, color: C.burgundy } },
    { text: "Best Seller orders +3.52%, Best Seller GMV +1.91% also significant.\n", options: { fontFace: "Poppins", fontSize: 9, color: C.burgundy } },
    { text: "●  ", options: { fontSize: 9 } },
    { text: "Guardrail concerns: ", options: { fontFace: "Poppins SemiBold", fontSize: 9, color: C.orange } },
    { text: "HS GMV/User -1.28%, HS Orders -1.15%, Display Ads Revenue -4.64% — all statistically significant.\n", options: { fontFace: "Poppins", fontSize: 9, color: C.burgundy } },
    { text: "●  ", options: { fontSize: 9 } },
    { text: "Decision: ", options: { fontFace: "Poppins SemiBold", fontSize: 9, color: C.orange } },
    { text: "Iterate — positive on primary but guardrail violations need resolution", options: { fontFace: "Poppins", fontSize: 9, color: C.burgundy } },
  ], {
    x: 0.35, y: 0.92, w: 9.3, h: 0.72,
    lineSpacingMultiple: 1.3, valign: "top",
  });

  addColumnHeaders(s3);

  addHypothesis(s3, "Replacing the MFO (Most Frequently Ordered) swimlane with a Best Sellers swimlane featuring HQ vendor incentivized items on the Home Screen will increase incentivized item orders per user.");

  addVariant(s3, "A (50%)", C.orange, "Control — MFO swimlane on Home Screen (BAU)", 3.02);
  addVariant(s3, "B (50%)", C.burgundy, "Best Sellers swimlane replaces MFO on Home Screen", 3.30);

  s3.addText([
    { text: "Market: ", options: { fontFace: "Poppins SemiBold", fontSize: 8, color: C.burgundy } },
    { text: "UAE\n", options: { fontFace: "Poppins", fontSize: 8, color: C.burgundy } },
    { text: "Entry Point: ", options: { fontFace: "Poppins SemiBold", fontSize: 8, color: C.burgundy } },
    { text: "Home Screen swimlane (Food vertical)", options: { fontFace: "Poppins", fontSize: 8, color: C.burgundy } },
  ], { x: 0.35, y: 3.60, w: 4.65, h: 0.40, lineSpacingMultiple: 1.3 });

  s3.addShape("roundRect", {
    x: 0.35, y: 4.05, w: 4.65, h: 1.15,
    fill: { color: C.white },
    line: { color: C.lightGray, width: 1, dashType: "dash" },
    rectRadius: 0.08,
  });
  s3.addText("Mockup / Screenshot\n(paste image here)", {
    x: 0.35, y: 4.35, w: 4.65, h: 0.55,
    fontFace: "Poppins Medium", fontSize: 9, color: C.lightGray,
    align: "center", valign: "middle",
  });

  // Results — Best Sellers (mixed significant)
  const bs_results = [
    { text: "●  ", options: { fontSize: 8.5 } },
    { text: "Item Discounted Orders/user: ", options: { fontFace: "Poppins SemiBold", fontSize: 8.5, color: C.burgundy } },
    { text: " +1.35% ", options: { fontFace: "Poppins SemiBold", fontSize: 8.5, color: C.burgundy, highlight: C.lime } },
    { text: " (stat sig, p<0.001) ✅\n", options: { fontFace: "Poppins", fontSize: 8, color: C.green } },
    { text: "\n", options: { fontSize: 3 } },
    { text: "●  ", options: { fontSize: 8.5 } },
    { text: "Best Seller Orders/user: ", options: { fontFace: "Poppins SemiBold", fontSize: 8.5, color: C.burgundy } },
    { text: " +3.52% ", options: { fontFace: "Poppins SemiBold", fontSize: 8.5, color: C.burgundy, highlight: C.lime } },
    { text: " (stat sig) ✅\n", options: { fontFace: "Poppins", fontSize: 8, color: C.green } },
    { text: "\n", options: { fontSize: 3 } },
    { text: "●  ", options: { fontSize: 8.5 } },
    { text: "Guardrail — HS GMV/User: ", options: { fontFace: "Poppins SemiBold", fontSize: 8.5, color: C.orange } },
    { text: " -1.28% ", options: { fontFace: "Poppins SemiBold", fontSize: 8.5, color: C.burgundy, highlight: "FFCDD2" } },
    { text: " (stat sig) ⚠️\n", options: { fontFace: "Poppins", fontSize: 8, color: C.red } },
    { text: "\n", options: { fontSize: 3 } },
    { text: "●  ", options: { fontSize: 8.5 } },
    { text: "Guardrail — HS Orders/User: ", options: { fontFace: "Poppins SemiBold", fontSize: 8.5, color: C.orange } },
    { text: " -1.15% ", options: { fontFace: "Poppins SemiBold", fontSize: 8.5, color: C.burgundy, highlight: "FFCDD2" } },
    { text: " (stat sig) ⚠️\n", options: { fontFace: "Poppins", fontSize: 8, color: C.red } },
    { text: "\n", options: { fontSize: 3 } },
    { text: "●  ", options: { fontSize: 8.5 } },
    { text: "Guardrail — Display Ads Rev/User: ", options: { fontFace: "Poppins SemiBold", fontSize: 8.5, color: C.orange } },
    { text: " -4.64% ", options: { fontFace: "Poppins SemiBold", fontSize: 8.5, color: C.burgundy, highlight: "FFCDD2" } },
    { text: " (stat sig) ⚠️\n", options: { fontFace: "Poppins", fontSize: 8, color: C.red } },
  ];
  s3.addText(bs_results, {
    x: 5.15, y: 2.14, w: 4.50, h: 1.55,
    lineSpacingMultiple: 1.1, valign: "top",
  });

  s3.addShape("roundRect", {
    x: 5.15, y: 3.75, w: 4.50, h: 0.45,
    fill: { color: C.paleOrange }, rectRadius: 0.06,
  });
  s3.addText([
    { text: "⚠️ Note: ", options: { fontFace: "Poppins SemiBold", fontSize: 7.5, color: C.orange } },
    { text: "Primary metric positive but HS-level metrics and ad revenue significantly negative. Replacing MFO with Best Sellers may cannibalize organic discovery. ~1.33M users per arm.", options: { fontFace: "Poppins", fontSize: 7.5, color: C.burgundy } },
  ], { x: 5.30, y: 3.75, w: 4.20, h: 0.45, valign: "middle" });

  s3.addText("Next steps", {
    x: 5.15, y: 4.25, w: 4.50, h: 0.28,
    fontFace: "Poppins SemiBold", fontSize: 10, color: C.orange,
  });
  s3.addText([
    { text: "●  Investigate HS orders/GMV drop — is it cannibalization or displacement?\n", options: { fontFace: "Poppins", fontSize: 8, color: C.burgundy } },
    { text: "●  Assess display ads revenue impact with AdTech team\n", options: { fontFace: "Poppins", fontSize: 8, color: C.burgundy } },
    { text: "●  Consider coexistence model (Best Sellers + MFO) instead of replacement", options: { fontFace: "Poppins", fontSize: 8, color: C.burgundy } },
  ], { x: 5.30, y: 4.52, w: 4.35, h: 0.55, lineSpacingMultiple: 1.2 });

  addFooter(s3, "Apr 9, 2026 — ongoing", "160215", "Flossie Reynolds", null, null);

  await pptx.writeFile({ fileName: path.join(OUTPUT, "TLBVAL-Experiment-Reviews.pptx") });
  console.log("✓ TLBVAL-Experiment-Reviews.pptx created (3 slides)");
}

createDeck().catch(console.error);
