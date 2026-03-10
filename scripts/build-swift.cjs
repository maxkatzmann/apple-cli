#!/usr/bin/env node
/**
 * Build script: compiles Swift EventKit helper binaries for apple-mcp/calendar
 * and apple-mcp/reminders. Binaries are placed in their respective src/ dirs
 * so tsx can resolve them at runtime via __dirname.
 */

const { execSync } = require("node:child_process");
const { existsSync } = require("node:fs");
const { join } = require("node:path");

const root = join(__dirname, "..");

function buildBinary({ swiftSrc, outDir, binName }) {
  const outBin = join(outDir, binName);
  const arm64 = join(outDir, `${binName}-arm64`);
  const x86 = join(outDir, `${binName}-x86_64`);

  if (!existsSync(swiftSrc)) {
    console.error(`Swift source not found (${swiftSrc}) — skipping ${binName} build.`);
    return;
  }

  if (existsSync(outBin)) {
    console.log(`${binName} already built, skipping.`);
    return;
  }

  console.log(`Building ${binName} Swift binary...`);
  try {
    execSync(
      `swiftc -O -target arm64-apple-macosx13.0 -o "${arm64}" "${swiftSrc}" -framework EventKit -framework Foundation`,
      { stdio: "inherit" }
    );
    execSync(
      `swiftc -O -target x86_64-apple-macosx13.0 -o "${x86}" "${swiftSrc}" -framework EventKit -framework Foundation`,
      { stdio: "inherit" }
    );
    execSync(`lipo -create "${arm64}" "${x86}" -output "${outBin}"`, { stdio: "inherit" });
    execSync(`rm "${arm64}" "${x86}"`);
    console.log(`${binName} built successfully.`);
  } catch (err) {
    console.error(`Failed to build ${binName}:`, err.message);
    console.error(`Install Xcode command-line tools and re-run npm install.`);
  }
}

buildBinary({
  swiftSrc: join(root, "apple-mcp/calendar/swift/CalendarHelper.swift"),
  outDir:   join(root, "apple-mcp/calendar/src"),
  binName:  "calendar-helper",
});

buildBinary({
  swiftSrc: join(root, "apple-mcp/reminders/swift/RemindersHelper.swift"),
  outDir:   join(root, "apple-mcp/reminders/src"),
  binName:  "reminders-helper",
});
