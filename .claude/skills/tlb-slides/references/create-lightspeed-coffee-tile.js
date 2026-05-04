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
};

// ── Reusable helpers ──

function addBaseLayout(slide, title, sliceLabel, statusBadge, statusColor) {
  slide.background = { color: C.white };

  slide.addShape("roundRect", {
    x: 0.35, y: 0.0, w: 1.20, h: 0.07,
    fill: { color: C.orange },
    rectRadius: 0.02,
  });

  slide.addShape("roundRect", {
    x: 8.0, y: 0.0, w: 2.0, h: 0.45,
    fill: { color: statusColor || C.orange },
    rectRadius: 0.0,
  });
  slide.addText(statusBadge || "[Status]", {
    x: 8.0, y: 0.0, w: 2.0, h: 0.45,
    fontFace: "Poppins SemiBold", fontSize: 13, color: C.white,
    align: "center", valign: "middle",
  });

  slide.addImage({
    path: LOGO,
    x: 8.29, y: 0.55, w: 1.39, h: 0.46, rotate: 4.7,
  });

  const titleParts = [
    { text: title, options: { fontFace: "Poppins ExtraBold", fontSize: 28, color: C.orange } },
  ];
  if (sliceLabel) {
    titleParts.push({ text: `  (${sliceLabel})`, options: { fontFace: "Poppins Medium", fontSize: 14, color: C.medGray } });
  }
  slide.addText(titleParts, {
    x: 0.35, y: 0.22, w: 7.5, h: 0.75,
    valign: "bottom",
  });
}

function addImpactHeadline(slide, parts) {
  const textParts = parts.map(p => ({
    text: p.text,
    options: {
      fontFace: p.bold ? "Poppins SemiBold" : "Poppins",
      fontSize: 13,
      color: C.burgundy,
      ...(p.highlight ? { highlight: C.lime } : {}),
    },
  }));
  slide.addText(textParts, {
    x: 0.35, y: 1.0, w: 9.3, h: 0.4,
  });
}

function addWhatSection(slide, bullets) {
  slide.addText("What?", {
    x: 0.35, y: 1.55, w: 5.0, h: 0.38,
    fontFace: "Poppins ExtraBold", fontSize: 16, color: C.burgundy,
  });

  const parts = [];
  bullets.forEach((b) => {
    parts.push({ text: "●  ", options: { fontSize: 10 } });
    parts.push({ text: `${b.label}: `, options: { fontFace: "Poppins SemiBold", fontSize: 10, color: C.burgundy } });
    parts.push({ text: `${b.desc}\n`, options: { fontFace: "Poppins", fontSize: 10, color: C.burgundy } });
    if (b.subs) {
      b.subs.forEach(s => {
        parts.push({ text: `      ○  ${s}\n`, options: { fontFace: "Poppins", fontSize: 9, color: C.burgundy } });
      });
    }
  });
  slide.addText(parts, {
    x: 0.55, y: 1.9, w: 4.8, h: 1.0,
    lineSpacingMultiple: 1.2,
  });
}

function addImpactSection(slide, scope, metrics) {
  slide.addText([
    { text: "Impact ", options: { fontFace: "Poppins ExtraBold", fontSize: 16, color: C.orange } },
    { text: scope ? `(${scope})` : "", options: { fontFace: "Poppins", fontSize: 10, color: C.medGray } },
  ], {
    x: 0.35, y: 2.95, w: 5.0, h: 0.35,
  });

  const parts = [];
  metrics.forEach(m => {
    parts.push({ text: `●  ${m.text} `, options: { fontFace: "Poppins", fontSize: 10, color: C.burgundy } });
    parts.push({ text: ` ${m.value} `, options: { fontFace: "Poppins SemiBold", fontSize: 10, color: C.burgundy, highlight: C.lime } });
    if (m.emoji) parts.push({ text: m.emoji, options: { fontSize: 10 } });
    parts.push({ text: "\n", options: { fontSize: 4 } });
    if (m.sub) {
      parts.push({ text: `      ○  ${m.sub}\n`, options: { fontFace: "Poppins", fontSize: 9, color: C.burgundy } });
    }
  });
  slide.addText(parts, {
    x: 0.55, y: 3.3, w: 4.8, h: 1.1,
    lineSpacingMultiple: 1.25,
  });
}

function addNextSteps(slide, steps) {
  slide.addText("Next steps", {
    x: 0.35, y: 4.4, w: 5.0, h: 0.33,
    fontFace: "Poppins ExtraBold", fontSize: 16, color: C.burgundy,
  });

  const parts = steps.map((s, i) => ({
    text: `●  ${s}${i < steps.length - 1 ? "\n" : ""}`,
    options: { fontFace: "Poppins", fontSize: 9.5, color: C.burgundy },
  }));
  slide.addText(parts, {
    x: 0.55, y: 4.72, w: 4.8, h: 0.7,
    lineSpacingMultiple: 1.2,
  });
}

function addRightVisuals(slide, visual1, visual2) {
  const colX = 5.6;
  const colW = 4.05;

  slide.addText(visual1.title, {
    x: colX, y: 1.55, w: colW, h: 0.30,
    fontFace: "Poppins SemiBold", fontSize: 9, color: C.burgundy,
    align: "center", valign: "middle",
  });
  if (visual1.description) {
    slide.addText(visual1.description, {
      x: colX, y: 1.82, w: colW, h: 0.22,
      fontFace: "Poppins", fontSize: 7, color: C.medGray,
      align: "center",
    });
  }
  slide.addShape("roundRect", {
    x: colX + 0.3, y: 2.08, w: colW - 0.6, h: 1.55,
    fill: { color: "FAFAFA" },
    line: { color: C.lightGray, width: 1.5, dashType: "dash" },
    rectRadius: 0.08,
  });
  slide.addText("Screenshot\n(paste image here)", {
    x: colX + 0.3, y: 2.45, w: colW - 0.6, h: 0.8,
    fontFace: "Poppins Medium", fontSize: 9, color: C.lightGray,
    align: "center", valign: "middle",
  });

  slide.addText(visual2.title, {
    x: colX, y: 3.72, w: colW, h: 0.30,
    fontFace: "Poppins SemiBold", fontSize: 9, color: C.burgundy,
    align: "center", valign: "middle",
  });
  if (visual2.description) {
    slide.addText(visual2.description, {
      x: colX, y: 4.0, w: colW, h: 0.55,
      fontFace: "Poppins", fontSize: 7, color: C.medGray,
      align: "center",
      lineSpacingMultiple: 1.15,
    });
  }
  slide.addShape("roundRect", {
    x: colX + 0.3, y: 4.58, w: colW - 0.6, h: 0.85,
    fill: { color: "FAFAFA" },
    line: { color: C.lightGray, width: 1.5, dashType: "dash" },
    rectRadius: 0.08,
  });
  slide.addText("Screenshot\n(paste here)", {
    x: colX + 0.3, y: 4.68, w: colW - 0.6, h: 0.65,
    fontFace: "Poppins Medium", fontSize: 8, color: C.lightGray,
    align: "center", valign: "middle",
  });
}

// ════════════════════════════════════════
// FILLED SLIDE — Coffee Tile (TLBVAL-5)
// ════════════════════════════════════════

async function createCoffeeTileSlide() {
  const pptx = new pptxgen();
  pptx.defineLayout({ name: "TALABAT", width: 10, height: 5.63 });
  pptx.layout = "TALABAT";
  pptx.title = "Coffee Tile — Lightspeed Update";

  const slide = pptx.addSlide();

  addBaseLayout(
    slide,
    "Coffee Tile Time-Based Experiment",
    "UAE",
    "In Experiment",
    C.orange
  );

  addImpactHeadline(slide, [
    { text: "Validating ", bold: true },
    { text: "contextual ranking", bold: true, highlight: true },
    { text: " as a growth lever — Coffee grew ", bold: false },
    { text: " 64% YoY ", bold: true, highlight: true },
    { text: " with demand concentrated in 8–11 AM window", bold: false },
  ]);

  addWhatSection(slide, [
    {
      label: "Time-based tile swap",
      desc: "on Home screen during breakfast hours (8–11 AM)",
      subs: [
        "Replaces DineOut tile with Coffee tile",
        "50/50 traffic split in UAE",
      ],
    },
    {
      label: "Contextual personalization test",
      desc: "validating time-of-day relevance as a ranking signal",
    },
  ]);

  addImpactSection(slide, "UAE — experiment running", [
    {
      text: "Coffee orders per user",
      value: "awaiting sig",
      sub: "Primary metric — targeting incremental coffee orders",
    },
    {
      text: "Coffee conversion rate",
      value: "awaiting sig",
    },
    {
      text: "DineOut transactions (guardrail)",
      value: "monitoring",
      emoji: "⚠️",
    },
  ]);

  addNextSteps(slide, [
    "Monitor experiment until statistical significance is reached",
    "Evaluate guardrail impact on DineOut transactions",
    "Go/no-go decision based on pre-defined decision framework",
  ]);

  addRightVisuals(slide,
    {
      title: "Coffee tile on Home screen (8–11 AM)",
      description: "Time-based swap replacing DineOut tile during breakfast hours",
    },
    {
      title: "Control: DineOut tile (default experience)",
      description: "Standard Home screen layout shown outside breakfast hours\nand to the control group",
    }
  );

  await pptx.writeFile({ fileName: path.join(OUTPUT, "Lightspeed-CoffeeTile-TLBVAL5.pptx") });
  console.log("✓ Lightspeed-CoffeeTile-TLBVAL5.pptx created");
}

createCoffeeTileSlide().catch(console.error);
