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
};

async function createExperimentTemplate() {
  const pptx = new pptxgen();
  pptx.defineLayout({ name: "TALABAT", width: 10, height: 5.63 });
  pptx.layout = "TALABAT";
  pptx.title = "Experiment Review Template";

  const slide = pptx.addSlide();
  slide.background = { color: C.cream };

  // ── Accent bar (top-left) ──
  slide.addShape("roundRect", {
    x: 0.35, y: 0.0, w: 1.20, h: 0.07,
    fill: { color: C.orange },
    rectRadius: 0.02,
  });

  // ── Logo (top-right) ──
  slide.addImage({
    path: LOGO,
    x: 8.29, y: 0.24, w: 1.39, h: 0.46, rotate: 4.7,
  });

  // ── Title ──
  slide.addText("[Experiment Name]", {
    x: 0.35, y: 0.18, w: 7.5, h: 0.68,
    fontFace: "Poppins SemiBold", fontSize: 25, color: C.orange,
    valign: "bottom",
  });

  // ── Summary (analytical narrative bullets) ──
  slide.addText([
    { text: "●  ", options: { fontSize: 9 } },
    { text: "[Key finding 1 with metric]: ", options: { fontFace: "Poppins SemiBold", fontSize: 9, color: C.burgundy } },
    { text: "narrative interpretation of what happened and what it means\n", options: { fontFace: "Poppins", fontSize: 9, color: C.burgundy } },
    { text: "●  ", options: { fontSize: 9 } },
    { text: "[Key finding 2 with metric]: ", options: { fontFace: "Poppins SemiBold", fontSize: 9, color: C.burgundy } },
    { text: "narrative interpretation, including guardrail impacts\n", options: { fontFace: "Poppins", fontSize: 9, color: C.burgundy } },
    { text: "●  ", options: { fontSize: 9 } },
    { text: "Decision: ", options: { fontFace: "Poppins SemiBold", fontSize: 9, color: C.orange } },
    { text: "[Roll out / Kill / Iterate] — rationale for the decision", options: { fontFace: "Poppins", fontSize: 9, color: C.burgundy } },
  ], {
    x: 0.35, y: 0.92, w: 9.3, h: 0.72,
    lineSpacingMultiple: 1.3,
    valign: "top",
  });

  // ════════════════════════════════════════
  // TWO-COLUMN LAYOUT
  // ════════════════════════════════════════

  // ── Left column header: "Experiment Setup" ──
  slide.addShape("roundRect", {
    x: 0.35, y: 1.72, w: 4.65, h: 0.32,
    fill: { color: C.orange },
    rectRadius: 0.04,
  });
  slide.addText("Experiment Setup", {
    x: 0.35, y: 1.72, w: 4.65, h: 0.32,
    fontFace: "Poppins SemiBold", fontSize: 11, color: C.white,
    align: "center", valign: "middle",
  });

  // ── Right column header: "Experiment Results" ──
  slide.addShape("roundRect", {
    x: 5.15, y: 1.72, w: 4.50, h: 0.32,
    fill: { color: C.burgundy },
    rectRadius: 0.04,
  });
  slide.addText("Experiment Results", {
    x: 5.15, y: 1.72, w: 4.50, h: 0.32,
    fontFace: "Poppins SemiBold", fontSize: 11, color: C.white,
    align: "center", valign: "middle",
  });

  // ════════════════════════════════════════
  // LEFT COLUMN — Experiment Setup
  // ════════════════════════════════════════

  // ── Hypothesis badge ──
  slide.addShape("roundRect", {
    x: 0.35, y: 2.14, w: 1.15, h: 0.24,
    fill: { color: C.orange },
    rectRadius: 0.12,
  });
  slide.addText("Hypothesis", {
    x: 0.35, y: 2.14, w: 1.15, h: 0.24,
    fontFace: "Poppins SemiBold", fontSize: 8, color: C.white,
    align: "center", valign: "middle",
  });

  // ── Hypothesis content ──
  slide.addText("[State the hypothesis: We believe that [change] will [expected outcome] because [reasoning].]", {
    x: 0.35, y: 2.42, w: 4.65, h: 0.55,
    fontFace: "Poppins", fontSize: 8, color: C.burgundy,
    lineSpacingMultiple: 1.2,
    valign: "top",
  });

  // ── Variant labels + descriptions ──
  // Variant A
  slide.addShape("roundRect", {
    x: 0.35, y: 3.02, w: 0.65, h: 0.22,
    fill: { color: C.orange },
    rectRadius: 0.11,
  });
  slide.addText("A (50%)", {
    x: 0.35, y: 3.02, w: 0.65, h: 0.22,
    fontFace: "Poppins SemiBold", fontSize: 7, color: C.white,
    align: "center", valign: "middle",
  });
  slide.addText("[Control — describe the baseline experience]", {
    x: 1.05, y: 3.02, w: 3.95, h: 0.22,
    fontFace: "Poppins", fontSize: 7.5, color: C.burgundy,
    valign: "middle",
  });

  // Variant B
  slide.addShape("roundRect", {
    x: 0.35, y: 3.30, w: 0.65, h: 0.22,
    fill: { color: C.burgundy },
    rectRadius: 0.11,
  });
  slide.addText("B (50%)", {
    x: 0.35, y: 3.30, w: 0.65, h: 0.22,
    fontFace: "Poppins SemiBold", fontSize: 7, color: C.white,
    align: "center", valign: "middle",
  });
  slide.addText("[Treatment — describe the change being tested]", {
    x: 1.05, y: 3.30, w: 3.95, h: 0.22,
    fontFace: "Poppins", fontSize: 7.5, color: C.burgundy,
    valign: "middle",
  });

  // ── Market & Entry Point ──
  slide.addText([
    { text: "Market: ", options: { fontFace: "Poppins SemiBold", fontSize: 8, color: C.burgundy } },
    { text: "[All / UAE / KW / etc.]\n", options: { fontFace: "Poppins", fontSize: 8, color: C.burgundy } },
    { text: "Entry Point: ", options: { fontFace: "Poppins SemiBold", fontSize: 8, color: C.burgundy } },
    { text: "[Where users encounter the experiment]", options: { fontFace: "Poppins", fontSize: 8, color: C.burgundy } },
  ], {
    x: 0.35, y: 3.60, w: 4.65, h: 0.40,
    lineSpacingMultiple: 1.3,
  });

  // ── Mockup / Screenshot placeholder ──
  slide.addShape("roundRect", {
    x: 0.35, y: 4.05, w: 4.65, h: 1.15,
    fill: { color: C.white },
    line: { color: C.lightGray, width: 1, dashType: "dash" },
    rectRadius: 0.08,
  });
  slide.addText("Mockup / Screenshot\n(paste image here)", {
    x: 0.35, y: 4.35, w: 4.65, h: 0.55,
    fontFace: "Poppins Medium", fontSize: 9, color: C.lightGray,
    align: "center", valign: "middle",
  });

  // ════════════════════════════════════════
  // RIGHT COLUMN — Experiment Results
  // ════════════════════════════════════════

  // ── Results content (analytical bullet points) ──
  slide.addText([
    { text: "●  ", options: { fontSize: 9 } },
    { text: "Primary metric: ", options: { fontFace: "Poppins SemiBold", fontSize: 9, color: C.burgundy } },
    { text: "[Metric name] ", options: { fontFace: "Poppins", fontSize: 9, color: C.burgundy } },
    { text: " +0.00% ", options: { fontFace: "Poppins SemiBold", fontSize: 9, color: C.burgundy, highlight: C.lime } },
    { text: " (stat sig / not sig)\n", options: { fontFace: "Poppins", fontSize: 9, color: C.medGray } },
    { text: "\n", options: { fontSize: 4 } },
    { text: "●  ", options: { fontSize: 9 } },
    { text: "Secondary metric: ", options: { fontFace: "Poppins SemiBold", fontSize: 9, color: C.burgundy } },
    { text: "[Metric name] ", options: { fontFace: "Poppins", fontSize: 9, color: C.burgundy } },
    { text: " +0.00% ", options: { fontFace: "Poppins SemiBold", fontSize: 9, color: C.burgundy, highlight: C.lime } },
    { text: "\n", options: { fontSize: 4 } },
    { text: "●  ", options: { fontSize: 9 } },
    { text: "Guardrail: ", options: { fontFace: "Poppins SemiBold", fontSize: 9, color: C.orange } },
    { text: "[Guardrail metric] ", options: { fontFace: "Poppins", fontSize: 9, color: C.burgundy } },
    { text: " -0.00% ", options: { fontFace: "Poppins SemiBold", fontSize: 9, color: C.burgundy, highlight: C.lime } },
    { text: " ⚠️\n", options: { fontSize: 9 } },
    { text: "\n", options: { fontSize: 4 } },
    { text: "●  ", options: { fontSize: 9 } },
    { text: "Additional metric: ", options: { fontFace: "Poppins SemiBold", fontSize: 9, color: C.burgundy } },
    { text: "[Metric name] ", options: { fontFace: "Poppins", fontSize: 9, color: C.burgundy } },
    { text: " +0.00% ", options: { fontFace: "Poppins SemiBold", fontSize: 9, color: C.burgundy, highlight: C.lime } },
  ], {
    x: 5.15, y: 2.14, w: 4.50, h: 1.55,
    lineSpacingMultiple: 1.25,
    valign: "top",
  });

  // ── Note / Caveats ──
  slide.addShape("roundRect", {
    x: 5.15, y: 3.75, w: 4.50, h: 0.45,
    fill: { color: C.paleOrange },
    rectRadius: 0.06,
  });
  slide.addText([
    { text: "⚠️ Note: ", options: { fontFace: "Poppins SemiBold", fontSize: 7.5, color: C.orange } },
    { text: "[Caveats, data quality notes, or important context about the results]", options: { fontFace: "Poppins", fontSize: 7.5, color: C.burgundy } },
  ], {
    x: 5.30, y: 3.75, w: 4.20, h: 0.45,
    valign: "middle",
  });

  // ── Next steps ──
  slide.addText("Next steps", {
    x: 5.15, y: 4.25, w: 4.50, h: 0.28,
    fontFace: "Poppins SemiBold", fontSize: 10, color: C.orange,
  });
  slide.addText([
    { text: "●  [Action item 1 — who, what, when]\n", options: { fontFace: "Poppins", fontSize: 8, color: C.burgundy } },
    { text: "●  [Action item 2 — who, what, when]\n", options: { fontFace: "Poppins", fontSize: 8, color: C.burgundy } },
    { text: "●  [Action item 3 — who, what, when]", options: { fontFace: "Poppins", fontSize: 8, color: C.burgundy } },
  ], {
    x: 5.30, y: 4.52, w: 4.35, h: 0.55,
    lineSpacingMultiple: 1.2,
  });

  // ════════════════════════════════════════
  // FOOTER
  // ════════════════════════════════════════

  // ── Analysis period ──
  slide.addText([
    { text: "Analysis period: ", options: { fontFace: "Poppins SemiBold", fontSize: 7, color: C.medGray } },
    { text: "[Start date] — [End date]", options: { fontFace: "Poppins", fontSize: 7, color: C.medGray } },
  ], {
    x: 0.35, y: 5.22, w: 3.0, h: 0.20,
  });

  // ── Footer links ──
  slide.addShape("roundRect", {
    x: 3.5, y: 5.22, w: 6.15, h: 0.25,
    fill: { color: C.white },
    rectRadius: 0.04,
  });
  slide.addText([
    { text: "📄 1 Pager", options: { fontFace: "Poppins Medium", fontSize: 7, color: C.orange } },
    { text: "   |   ", options: { fontFace: "Poppins", fontSize: 7, color: C.lightGray } },
    { text: "📊 Eppo", options: { fontFace: "Poppins Medium", fontSize: 7, color: C.orange } },
    { text: "   |   ", options: { fontFace: "Poppins", fontSize: 7, color: C.lightGray } },
    { text: "📋 Working Sheet", options: { fontFace: "Poppins Medium", fontSize: 7, color: C.orange } },
    { text: "   |   ", options: { fontFace: "Poppins", fontSize: 7, color: C.lightGray } },
    { text: "Data PIC: ", options: { fontFace: "Poppins Medium", fontSize: 7, color: C.medGray } },
    { text: "[Name]", options: { fontFace: "Poppins", fontSize: 7, color: C.burgundy } },
  ], {
    x: 3.5, y: 5.22, w: 6.15, h: 0.25,
    align: "center", valign: "middle",
  });

  await pptx.writeFile({ fileName: path.join(OUTPUT, "Experiment-Review-Template-v2.pptx") });
  console.log("✓ Experiment-Review-Template-v2.pptx created");
}

createExperimentTemplate().catch(console.error);
