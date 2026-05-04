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
};

async function createLightspeed() {
  const pptx = new pptxgen();
  pptx.defineLayout({ name: "TALABAT", width: 10, height: 5.63 });
  pptx.layout = "TALABAT";
  pptx.title = "Lightspeed Template";

  const slide = pptx.addSlide();
  slide.background = { color: C.white };

  // ── Accent bar (top-left) ──
  slide.addShape("roundRect", {
    x: 0.35, y: 0.0, w: 1.20, h: 0.07,
    fill: { color: C.orange },
    rectRadius: 0.02,
  });

  // ── Status badge (top-right) — orange rounded rect ──
  slide.addShape("roundRect", {
    x: 8.0, y: 0.0, w: 2.0, h: 0.45,
    fill: { color: C.orange },
    rectRadius: 0.0,
  });
  slide.addText("[Status Badge]", {
    x: 8.0, y: 0.0, w: 2.0, h: 0.45,
    fontFace: "Poppins SemiBold", fontSize: 13, color: C.white,
    align: "center", valign: "middle",
  });

  // ── Logo (top-right, slightly below badge) ──
  slide.addImage({
    path: LOGO,
    x: 8.29, y: 0.55, w: 1.39, h: 0.46, rotate: 4.7,
  });

  // ── Title (large, orange) ──
  slide.addText([
    { text: "[Initiative Title Here]", options: { fontFace: "Poppins ExtraBold", fontSize: 28, color: C.orange } },
    { text: "  (Slice X)", options: { fontFace: "Poppins Medium", fontSize: 14, color: C.medGray } },
  ], {
    x: 0.35, y: 0.22, w: 7.5, h: 0.75,
    valign: "bottom",
  });

  // ── Impact headline with highlighted numbers ──
  slide.addText([
    { text: "Saving ", options: { fontFace: "Poppins SemiBold", fontSize: 13, color: C.burgundy } },
    { text: " €000K+ ", options: { fontFace: "Poppins SemiBold", fontSize: 13, color: C.burgundy, highlight: C.lime } },
    { text: " from [metric 1] & ", options: { fontFace: "Poppins", fontSize: 13, color: C.burgundy } },
    { text: "bringing ", options: { fontFace: "Poppins SemiBold", fontSize: 13, color: C.burgundy } },
    { text: " €00M+ ", options: { fontFace: "Poppins SemiBold", fontSize: 13, color: C.burgundy, highlight: C.lime } },
    { text: " annualized [metric 2] uplift!", options: { fontFace: "Poppins", fontSize: 13, color: C.burgundy } },
  ], {
    x: 0.35, y: 1.0, w: 9.3, h: 0.4,
  });

  // ════════════════════════════════════════
  // LEFT COLUMN (x: 0.35, w: 5.0)
  // ════════════════════════════════════════

  // ── "What?" section ──
  slide.addText("What?", {
    x: 0.35, y: 1.55, w: 5.0, h: 0.38,
    fontFace: "Poppins ExtraBold", fontSize: 16, color: C.burgundy,
  });

  slide.addText([
    { text: "●  ", options: { fontSize: 10 } },
    { text: "Feature/change name: ", options: { fontFace: "Poppins SemiBold", fontSize: 10, color: C.burgundy } },
    { text: "description of what shipped\n", options: { fontFace: "Poppins", fontSize: 10, color: C.burgundy } },
    { text: "●  ", options: { fontSize: 10 } },
    { text: "Feature/change name: ", options: { fontFace: "Poppins SemiBold", fontSize: 10, color: C.burgundy } },
    { text: "description\n", options: { fontFace: "Poppins", fontSize: 10, color: C.burgundy } },
    { text: "      ○  Sub-detail or scope\n", options: { fontFace: "Poppins", fontSize: 9, color: C.burgundy } },
    { text: "      ○  Sub-detail or scope", options: { fontFace: "Poppins", fontSize: 9, color: C.burgundy } },
  ], {
    x: 0.55, y: 1.9, w: 4.8, h: 1.0,
    lineSpacingMultiple: 1.2,
  });

  // ── "Impact" section ──
  slide.addText([
    { text: "Impact ", options: { fontFace: "Poppins ExtraBold", fontSize: 16, color: C.orange } },
    { text: "(launched in all markets)", options: { fontFace: "Poppins", fontSize: 10, color: C.medGray } },
  ], {
    x: 0.35, y: 2.95, w: 5.0, h: 0.35,
  });

  slide.addText([
    { text: "●  Metric 1 decreased by ", options: { fontFace: "Poppins", fontSize: 10, color: C.burgundy } },
    { text: " -0.00% ", options: { fontFace: "Poppins SemiBold", fontSize: 10, color: C.burgundy, highlight: C.lime } },
    { text: "\n", options: { fontSize: 4 } },
    { text: "      ○  That represents ", options: { fontFace: "Poppins", fontSize: 9, color: C.burgundy } },
    { text: " -0.00% ", options: { fontFace: "Poppins SemiBold", fontSize: 9, color: C.orange } },
    { text: "drop in [OKR metric]\n", options: { fontFace: "Poppins", fontSize: 9, color: C.burgundy } },
    { text: "●  Metric 2 ", options: { fontFace: "Poppins", fontSize: 10, color: C.burgundy } },
    { text: " +0.00% ", options: { fontFace: "Poppins SemiBold", fontSize: 10, color: C.burgundy, highlight: C.lime } },
    { text: " uplift\n", options: { fontFace: "Poppins", fontSize: 10, color: C.burgundy } },
    { text: "●  Metric 3 drop of ", options: { fontFace: "Poppins", fontSize: 10, color: C.burgundy } },
    { text: " -0.00% ", options: { fontFace: "Poppins SemiBold", fontSize: 10, color: C.burgundy, highlight: C.lime } },
  ], {
    x: 0.55, y: 3.3, w: 4.8, h: 1.1,
    lineSpacingMultiple: 1.25,
  });

  // ── "Next steps" section ──
  slide.addText("Next steps", {
    x: 0.35, y: 4.4, w: 5.0, h: 0.33,
    fontFace: "Poppins ExtraBold", fontSize: 16, color: C.burgundy,
  });

  slide.addText([
    { text: "●  Next step action item 1\n", options: { fontFace: "Poppins", fontSize: 9.5, color: C.burgundy } },
    { text: "●  Next step action item 2", options: { fontFace: "Poppins", fontSize: 9.5, color: C.burgundy } },
  ], {
    x: 0.55, y: 4.72, w: 4.8, h: 0.7,
    lineSpacingMultiple: 1.2,
  });

  // ════════════════════════════════════════
  // RIGHT COLUMN — Image / screenshot area
  // ════════════════════════════════════════

  // Main image placeholder (large, with dashed border)
  slide.addShape("roundRect", {
    x: 5.6, y: 1.55, w: 4.05, h: 3.8,
    fill: { color: "FAFAFA" },
    line: { color: C.lightGray, width: 1.5, dashType: "dash" },
    rectRadius: 0.1,
  });

  // Placeholder label
  slide.addText("Screenshot / Product Visual\n(paste image here)", {
    x: 5.6, y: 2.8, w: 4.05, h: 1.0,
    fontFace: "Poppins Medium", fontSize: 11, color: C.lightGray,
    align: "center", valign: "middle",
  });

  // Caption area below image (for descriptive text around screenshots)
  slide.addText("[Caption: brief explanation of what the screenshot shows]", {
    x: 5.6, y: 5.0, w: 4.05, h: 0.4,
    fontFace: "Poppins", fontSize: 7, color: C.medGray,
    align: "center",
  });

  await pptx.writeFile({ fileName: path.join(OUTPUT, "Lightspeed-Template-v2.pptx") });
  console.log("✓ Lightspeed-Template-v2.pptx created");
}

createLightspeed().catch(console.error);
