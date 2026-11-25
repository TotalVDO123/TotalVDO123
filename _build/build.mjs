// Draws the pictures in assets/ for the profile README: the header (logo and headline), the "What we build" guide,
// the three contact buttons and the two product pictures.
// Run from the repo root in Git Bash:  node _build/build.mjs
// Needs the website repo at D:/projects/totalvdo-site (Archivo font, logo, product pictures, playwright-core, sharp),
// Chrome or Edge (to measure text exactly) and fontTools in D:/projects/tools/pylibs (to keep only the letters used).
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { BUTTONS, CHANNELS, HEADLINE } from "./content.mjs";

const SITE = "D:/projects/totalvdo-site";
const PYLIBS = "D:/projects/tools/pylibs";
const FONT = `${SITE}/node_modules/@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2`;
const LOGO = `${SITE}/src/assets/brand/logo-light.png`;
const GRAPHICS = `${SITE}/src/assets/graphics`;
const CHROME = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find((p) => existsSync(p));
const OUT = path.resolve("assets");

const siteRequire = createRequire(`${SITE}/package.json`);
const { chromium } = siteRequire("playwright-core");
const sharp = siteRequire("sharp");

// totalvdo.com colours. Logo red marks the one focused programme; buttons use the site's darker button red.
const C = { navy: "#0c1a3d", deep: "#07112a", cell: "#1a2c5e", focusCell: "#223a75", soft: "#b4bed8", red: "#fb2365", button: "#d90f4e", edge: "#31467f", white: "#ffffff" };

// Archivo styles: size in px, weight, width axis (62 narrow to 125 wide). Wide type for the headline, like a channel
// ident; narrow type for the listings, like a real TV guide.
const style = (size, weight, wdth, fill) => ({ size, weight, wdth, fill });
const S = {
  head: style(96, 800, 125, C.white),
  number: style(26, 500, 75, C.soft),
  channel: style(29, 700, 100, C.white),
  title: style(30, 650, 75, C.white),
  sub: style(23, 400, 75, C.soft),
  button: style(32, 650, 100, C.white),
};

const r = (n) => Math.round(n * 10) / 10;
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const sum = (list) => list.reduce((a, b) => a + b, 0);

/** Measures text in the real font, in a headless browser, so every box fits its words. */
async function openMeasurer() {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  const page = await browser.newPage();
  const font = readFileSync(FONT).toString("base64");
  await page.setContent(
    `<style>@font-face{font-family:A;src:url(data:font/woff2;base64,${font}) format("woff2");font-weight:100 900}</style>` +
      `<span id="s" style="font-family:A;white-space:pre"></span>`,
  );
  await page.evaluate(() => document.fonts.load("40px A"));
  const cache = new Map();
  return {
    async width(text, st) {
      const key = `${st.size}/${st.weight}/${st.wdth}/${text}`;
      if (!cache.has(key)) {
        const measured = await page.evaluate(([t, s]) => {
          const el = document.getElementById("s");
          Object.assign(el.style, { fontSize: `${s.size}px`, fontWeight: String(s.weight), fontVariationSettings: `"wdth" ${s.wdth}` });
          el.textContent = t;
          return el.getBoundingClientRect().width;
        }, [text, st]);
        cache.set(key, measured);
      }
      return cache.get(key);
    },
    close: () => browser.close(),
  };
}

/** Breaks text into lines no wider than max. */
async function wrap(m, text, st, max) {
  const lines = [];
  let line = "";
  for (const word of text.split(" ")) {
    const next = line ? `${line} ${word}` : word;
    if (line && (await m.width(next, st)) > max) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  lines.push(line);
  return lines;
}

/** Keeps only the letters a picture uses, so each SVG carries a few KB of font instead of 90 KB. */
function subsetFont(chars) {
  const dir = mkdtempSync(path.join(tmpdir(), "profile-font-"));
  try {
    const textFile = path.join(dir, "text.txt");
    const out = path.join(dir, "font.woff2");
    writeFileSync(textFile, [...new Set(`${chars} `)].join(""), "utf8");
    const py = `import sys; sys.path.insert(0, r"${PYLIBS}"); from fontTools.subset import main; main(sys.argv[1:])`;
    execFileSync("py", ["-3", "-I", "-c", py, FONT, `--text-file=${textFile}`, `--output-file=${out}`, "--flavor=woff2", "--layout-features=*"]);
    return readFileSync(out).toString("base64");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/** Collects SVG shapes and the letters they use; finish() wraps them with the embedded font. */
function canvas() {
  const parts = [];
  let chars = "";
  return {
    rect(x, y, w, h, { fill = "none", rx = 10, stroke, sw } = {}) {
      const line = stroke ? ` stroke="${stroke}" stroke-width="${sw}"` : "";
      parts.push(`<rect x="${r(x)}" y="${r(y)}" width="${r(w)}" height="${r(h)}" rx="${rx}" fill="${fill}"${line}/>`);
    },
    text(x, y, t, st) {
      chars += t;
      parts.push(
        `<text x="${r(x)}" y="${r(y)}" font-size="${st.size}" font-weight="${st.weight}" ` +
          `style="font-variation-settings:'wdth' ${st.wdth}" fill="${st.fill}">${esc(t)}</text>`,
      );
    },
    image(x, y, w, h, uri) {
      parts.push(`<image x="${r(x)}" y="${r(y)}" width="${r(w)}" height="${r(h)}" href="${uri}"/>`);
    },
    finish(w, h, background) {
      const bg = background ? `<rect width="${w}" height="${r(h)}" rx="28" fill="${background}"/>` : "";
      const font = `@font-face{font-family:A;src:url(data:font/woff2;base64,${subsetFont(chars)}) format("woff2");font-weight:100 900}`;
      return (
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${r(h)}" width="${w}" height="${r(h)}">` +
        `<style>${font}text{font-family:A}</style>${bg}${parts.join("")}</svg>\n`
      );
    },
  };
}

const programmeWidth = async (m, [title, line], titleStyle, subStyle, pad) =>
  Math.max(await m.width(title, titleStyle), await m.width(line, subStyle)) + 2 * pad;

/** The header: logo and headline. Computers get one line per HEADLINE entry; phones wrap to fit. */
async function header(m, logo) {
  const W = 1600, P = 72, st = S.head, logoW = 270;
  const c = canvas();
  let y = P;
  c.image(P, y, logoW, (logoW * logo.height) / logo.width, logo.uri);
  y += (logoW * logo.height) / logo.width + 76;
  for (const [i, line] of HEADLINE.entries()) {
    if ((await m.width(line, st)) > W - 2 * P) throw new Error(`Headline line too wide: ${line}`);
    c.text(P, y + st.size * (0.78 + i * 1.04), line, st);
  }
  y += st.size * (HEADLINE.length * 1.04 - 0.26);
  return c.finish(W, y + P + 6, C.navy);
}

/**
 * The guide: channel names on the left, programmes in rows. One wide picture for every screen: GitHub wraps README
 * images in its own link, which stops <picture> from switching to a phone version, so phones show it smaller and
 * open it full size on a tap.
 */
async function guide(m) {
  const W = 1600, P = 56, CH = 330, G = 10, R = 116, PAD = 22, BETWEEN = 18;
  const c = canvas();
  let y = P;
  const area = W - 2 * P - CH - G;
  for (const [n, ch] of CHANNELS.entries()) {
    const height = ch.rows.length * R + (ch.rows.length - 1) * G;
    c.rect(P, y, CH, height, { fill: C.deep });
    c.text(P + 24, y + 48, String(n + 1), S.number);
    const names = await wrap(m, ch.name, S.channel, CH - 64 - 20);
    names.forEach((line, i) => c.text(P + 64, y + 48 + i * 36, line, S.channel));
    for (const [ri, row] of ch.rows.entries()) {
      const top = y + ri * (R + G);
      const natural = [];
      for (const p of row) natural.push(await programmeWidth(m, p, S.title, S.sub, PAD));
      const free = area - sum(natural) - (row.length - 1) * G;
      if (free < 0) throw new Error(`Guide row ${row.map((p) => p[0]).join(", ")} is ${Math.ceil(-free)} px too long`);
      let x = P + CH + G;
      for (const [k, [title, line]] of row.entries()) {
        const w = natural[k] + free / row.length;
        const focused = n === 0 && ri === 0 && k === 0;
        c.rect(x, top, w, R, { fill: focused ? C.focusCell : C.cell });
        if (focused) c.rect(x - 5, top - 5, w + 10, R + 10, { rx: 14, stroke: C.red, sw: 4 });
        c.text(x + PAD, top + 48, title, S.title);
        c.text(x + PAD, top + 86, line, S.sub);
        x += w + G;
      }
    }
    y += height + G + BETWEEN;
  }
  return c.finish(W, y - G - BETWEEN + P, C.navy);
}

/** A contact button at twice the size it is shown, so it stays sharp on high-density screens. */
async function button(m, { label, primary }) {
  const H = 96, PX = 40;
  const W = Math.ceil((await m.width(label, S.button)) + 2 * PX);
  const c = canvas();
  c.rect(1.5, 1.5, W - 3, H - 3, { fill: primary ? C.button : C.navy, rx: 14, stroke: primary ? C.button : C.edge, sw: 3 });
  c.text(PX, H / 2 + S.button.size * 0.36, label, S.button);
  return c.finish(W, H, null);
}

/** The two product pictures as 16:9 with rounded corners, so they line up side by side. */
async function productPictures() {
  const rounded = (input) =>
    sharp(input)
      .composite([{ input: Buffer.from('<svg width="1280" height="720"><rect width="1280" height="720" rx="20"/></svg>'), blend: "dest-in" }])
      .webp({ quality: 86 });
  const tscreen = await sharp(`${GRAPHICS}/tscreen-restaurant.png`).resize(1280, 720).png().toBuffer();
  await rounded(tscreen).toFile(`${OUT}/tscreen-tv.webp`);
  // The Total Sports page shot has a light 11 px strip and a 2 px edge on its left: cut 13 px, then place it on deep
  // navy at 16:9.
  const source = `${GRAPHICS}/total-sports-home.png`;
  const { width, height } = await sharp(source).metadata();
  const page = await sharp(source).extract({ left: 13, top: 0, width: width - 13, height }).resize({ width: 1280 }).png().toBuffer();
  const pageHeight = (await sharp(page).metadata()).height;
  const boxed = await sharp({ create: { width: 1280, height: 720, channels: 4, background: C.deep } })
    .composite([{ input: page, top: Math.round((720 - pageHeight) / 2), left: 0 }])
    .png()
    .toBuffer();
  await rounded(boxed).toFile(`${OUT}/total-sports.webp`);
}

mkdirSync(OUT, { recursive: true });
const logoPng = await sharp(LOGO).resize({ width: 540 }).png({ compressionLevel: 9 }).toBuffer();
const logoMeta = await sharp(logoPng).metadata();
const logo = { uri: `data:image/png;base64,${logoPng.toString("base64")}`, width: logoMeta.width, height: logoMeta.height };
const m = await openMeasurer();
try {
  writeFileSync(`${OUT}/header.svg`, await header(m, logo));
  writeFileSync(`${OUT}/guide.svg`, await guide(m));
  for (const b of BUTTONS) writeFileSync(`${OUT}/${b.file}.svg`, await button(m, b));
} finally {
  await m.close();
}
await productPictures();
const built = ["header.svg", "guide.svg", ...BUTTONS.map((b) => `${b.file}.svg`), "tscreen-tv.webp", "total-sports.webp"];
for (const f of built) {
  console.log(`${f.padEnd(22)} ${Math.round(statSync(`${OUT}/${f}`).size / 1024)} KB`);
}
