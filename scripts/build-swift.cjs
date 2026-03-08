#!/usr/bin/env node
/**
 * Build script: compiles the Swift EventKit helper binary used by apple-mcp/calendar.
 * The binary is placed in apple-mcp/calendar/src/ so tsx can resolve it at runtime
 * via __dirname when importing eventkit.ts directly from source.
 */

const { execSync } = require("node:child_process");
const { existsSync } = require("node:fs");
const { join } = require("node:path");

const root = join(__dirname, "..");
const swiftSrc = join(root, "apple-mcp/calendar/swift/CalendarHelper.swift");
const outDir = join(root, "apple-mcp/calendar/src");
const outBin = join(outDir, "calendar-helper");
const arm64 = join(outDir, "calendar-helper-arm64");
const x86 = join(outDir, "calendar-helper-x86_64");

if (!existsSync(swiftSrc)) {
  console.error("Swift source not found — skipping calendar-helper build.");
  process.exit(0);
}

if (existsSync(outBin)) {
  console.log("calendar-helper already built, skipping.");
  process.exit(0);
}

console.log("Building calendar-helper Swift binary...");
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
  console.log("calendar-helper built successfully.");
} catch (err) {
  console.error("Failed to build calendar-helper:", err.message);
  console.error("Calendar read operations will not work. Install Xcode command-line tools and re-run npm install.");
  process.exit(0); // Non-fatal — other apps still work
}
