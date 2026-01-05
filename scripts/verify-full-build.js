const fs = require("fs");
const csso = require("csso");
const crypto = require("crypto");
const path = require("path");
const { execSync } = require("child_process");
const { minify } = require("html-minifier");
const { JSDOM } = require("jsdom");

const PATHS = {
  devDir: "_site_dev",
  prodDir: "_site",
  targetFile: "index.html",
  cssFile: "css/redesign.tmp.css",
};

const MINIFY_OPTIONS = {
  removeAttributeQuotes: true,
  collapseBooleanAttributes: true,
  collapseWhitespace: true,
  removeComments: true,
  sortClassName: true,
  sortAttributes: true,
  html5: true,
  decodeEntities: true,
  removeOptionalTags: true,
};

function getHash(content) {
  return crypto.createHash("md5").update(content).digest("hex").substring(0, 8);
}

function normalizeHtml(htmlContent) {
  const dom = new JSDOM(htmlContent);
  const doc = dom.window.document;

  const toRemove = [
    "script",
    "style",
    'link[rel="stylesheet"]',
    'meta[name="csrf-token"]',
  ];

  toRemove.forEach((selector) => {
    doc.querySelectorAll(selector).forEach((el) => el.remove());
  });

  return doc.body.innerHTML;
}

function verifyBuild() {
  console.log("🔍 Starting Full Build Verification (CSS + HTML)...\n");

  try {
    console.log("1️⃣  Building Development Version (to _site_dev)...");
    execSync("npm run build:css", { stdio: "ignore" });
    execSync("ELEVENTY_RUN_MODE=serve npx eleventy --output=_site_dev", {
      stdio: "inherit",
    });

    console.log("\n2️⃣  Building Production Version (to _site)...");
    execSync("npm run build", { stdio: "inherit" });
  } catch (e) {
    console.error("❌ Build process failed!", e.message);
    process.exit(1);
  }

  console.log("\n3️⃣  Verifying CSS...");

  const devCssPath = PATHS.cssFile;
  if (!fs.existsSync(devCssPath)) {
    console.error(`❌ Source CSS missing: ${devCssPath}`);
    process.exit(1);
  }
  const rawCss = fs.readFileSync(devCssPath, "utf8");

  let expectedCss = rawCss.replace(
    /@font-face {/g,
    "@font-face {font-display:optional;",
  );
  expectedCss = csso.minify(expectedCss).css;
  const expectedHash = getHash(expectedCss);

  const prodHtmlPath = path.join(PATHS.prodDir, PATHS.targetFile);
  const prodHtmlRaw = fs.readFileSync(prodHtmlPath, "utf8");
  const styleMatch = prodHtmlRaw.match(/<style>(.*?)<\/style>/s);

  if (!styleMatch) {
    console.error("❌ No <style> tag found in production HTML!");
    process.exit(1);
  }
  const actualCss = styleMatch[1];
  const actualHash = getHash(actualCss);

  if (expectedHash === actualHash) {
    console.log(`✅ CSS Verified! Hash: ${actualHash}`);
  } else {
    console.error(
      `❌ CSS Mismatch! Expected: ${expectedHash}, Actual: ${actualHash}`,
    );

    fs.writeFileSync("debug_expected.css", expectedCss);
    fs.writeFileSync("debug_actual.css", actualCss);
    console.log(
      "   📝 Debug files written: 'debug_expected.css' & 'debug_actual.css'",
    );

    process.exit(1);
  }

  console.log("\n4️⃣  Verifying HTML Content...");

  const devHtmlPath = path.join(PATHS.devDir, PATHS.targetFile);
  let devHtmlRaw = fs.readFileSync(devHtmlPath, "utf8");

  let devHtmlMinified;
  try {
    devHtmlMinified = minify(devHtmlRaw, MINIFY_OPTIONS);
  } catch (e) {
    console.error("❌ Failed to minify Dev HTML for comparison:", e);
    process.exit(1);
  }

  const devNormalized = normalizeHtml(devHtmlMinified);
  const prodNormalized = normalizeHtml(prodHtmlRaw);

  const devHtmlHash = getHash(devNormalized);
  const prodHtmlHash = getHash(prodNormalized);

  if (devHtmlHash === prodHtmlHash) {
    console.log(`✅ HTML Content Verified! Hash: ${prodHtmlHash}`);
    console.log(
      "   (Comparison matched after stripping scripts, styles, and normalizing structure)",
    );
  } else {
    console.error("❌ HTML Content Mismatch!");
    console.log(`   Dev Hash:  ${devHtmlHash}`);
    console.log(`   Prod Hash: ${prodHtmlHash}`);

    fs.writeFileSync("debug_dev_normalized.html", devNormalized);
    fs.writeFileSync("debug_prod_normalized.html", prodNormalized);
    console.log(
      "   📝 Debug files written: 'debug_dev_normalized.html' & 'debug_prod_normalized.html'",
    );

    const diffSize = Math.abs(devNormalized.length - prodNormalized.length);
    console.log(`   Length Diff: ${diffSize} chars`);

    process.exit(1);
  }

  console.log("\n✨ All Verifications Passed!");
}

verifyBuild();
