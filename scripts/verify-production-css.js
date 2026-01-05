const fs = require("fs");
const csso = require("csso");
const crypto = require("crypto");
const path = require("path");
const { execSync } = require("child_process");

const PATHS = {
  srcCss: "css/redesign.tmp.css",
  prodHtml: "_site/index.html",
  prodCss: "_site/css/redesign.tmp.css",
};

function getHash(content) {
  return crypto.createHash("md5").update(content).digest("hex").substring(0, 8);
}

function verifyBuild() {
  console.log("🔍 Starting Build Verification Process...\n");

  console.log("1️⃣  Running Production Build...");
  try {
    execSync("npm run build", { stdio: "inherit" });
  } catch (e) {
    console.error("❌ Build failed!");
    process.exit(1);
  }

  if (!fs.existsSync(PATHS.srcCss)) {
    console.error(`❌ Source CSS missing: ${PATHS.srcCss}`);
    process.exit(1);
  }
  if (!fs.existsSync(PATHS.prodHtml)) {
    console.error(`❌ Production HTML missing: ${PATHS.prodHtml}`);
    process.exit(1);
  }

  console.log("\n2️⃣  Analyzing CSS Integrity...");

  const rawCss = fs.readFileSync(PATHS.srcCss, "utf8");

  let expectedCss = rawCss.replace(
    /@font-face {/g,
    "@font-face {font-display:optional;",
  );
  expectedCss = csso.minify(expectedCss).css;

  const expectedHash = getHash(expectedCss);
  console.log(`   Expected CSS Hash (Dev Logic + Minify): ${expectedHash}`);
  console.log(`   Expected Size: ${(expectedCss.length / 1024).toFixed(2)} KB`);

  const htmlContent = fs.readFileSync(PATHS.prodHtml, "utf8");
  const styleMatch = htmlContent.match(/<style>(.*?)<\/style>/s);

  if (!styleMatch) {
    console.error("❌ No <style> tag found in production HTML!");
    process.exit(1);
  }

  const actualCss = styleMatch[1];
  const actualHash = getHash(actualCss);
  console.log(`   Actual Inlined CSS Hash:               ${actualHash}`);
  console.log(`   Actual Size:   ${(actualCss.length / 1024).toFixed(2)} KB`);

  console.log("\n3️⃣  Comparison Results:");
  if (expectedHash === actualHash) {
    console.log(
      "✅ SUCCESS: Production inlined CSS exactly matches the processed development CSS.",
    );
    console.log("   The build pipeline is consistent.");
  } else {
    console.error("❌ FAILURE: Hashes do not match.");

    console.log("\n   Diagnostics:");
    if (Math.abs(expectedCss.length - actualCss.length) < 50) {
      console.log(
        "   ⚠️  Size is very similar. Likely a minor formatting/minification difference.",
      );
    } else {
      console.log(
        "   ⚠️  Significant size difference. Major processing mismatch.",
      );
    }

    fs.writeFileSync("debug_expected.css", expectedCss);
    fs.writeFileSync("debug_actual.css", actualCss);
    console.log(
      "   📝 Debug files written: 'debug_expected.css' & 'debug_actual.css'",
    );
    process.exit(1);
  }
}

verifyBuild();
