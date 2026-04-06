#!/usr/bin/env bun
import { $ } from "bun";

async function main() {
  console.log("🔒 Running security gate...\n");

  // osv-scanner: dependency vulnerability scanning
  console.log("📦 Checking dependencies with osv-scanner...");
  const osv = await $`osv-scanner --lockfile=bun.lockb`.quiet().nothrow();
  if (osv.exitCode !== 0) {
    console.error("❌ osv-scanner found vulnerabilities:");
    console.error(osv.stderr.toString());
    process.exit(1);
  }
  console.log("✅ No known vulnerabilities\n");

  // gitleaks: secrets leak detection
  console.log("🔑 Checking for secrets with gitleaks...");
  const gitleaks = await $`gitleaks detect --no-banner`.quiet().nothrow();
  if (gitleaks.exitCode !== 0) {
    console.error("❌ gitleaks found secrets:");
    console.error(gitleaks.stdout.toString());
    process.exit(1);
  }
  console.log("✅ No secrets detected\n");

  console.log("🎉 Security gate passed!");
}

main();
