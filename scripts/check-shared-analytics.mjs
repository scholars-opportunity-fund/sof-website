// Drift guard for the analytics files this site shares byte for byte with the
// platform repo, scholars-opportunity-fund/sof-web (lib/analytics/ there,
// src/lib/analytics/ here). Neither repo can read the other's files, so each
// pins the same hashes: src/lib/analytics/shared-manifest.json here, and
// lib/analytics/website-copy.test.ts in sof-web. A hash is the SHA-256 of the
// file's UTF-8 text with CRLF normalised to LF, so a Windows checkout hashes
// the same as CI.
//
// Run by the quality workflow and by `npm run check:shared`.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST = "src/lib/analytics/shared-manifest.json";

const sha256 = (text) => createHash("sha256").update(text.replace(/\r\n/g, "\n")).digest("hex");
const manifest = JSON.parse(readFileSync(path.join(ROOT, MANIFEST), "utf8"));
const entries = Object.entries(manifest.files ?? {});
if (entries.length === 0) {
  console.error(`${MANIFEST} lists no files.`);
  process.exit(1);
}

const failures = [];
for (const [file, expected] of entries) {
  let text;
  try {
    text = readFileSync(path.join(ROOT, file), "utf8");
  } catch {
    failures.push({ file, message: `${file} is listed in ${MANIFEST} but does not exist.` });
    continue;
  }
  const actual = sha256(text);
  if (actual !== expected) {
    failures.push({ file, message: `${file} no longer matches its pinned hash (pinned ${expected}, now ${actual}).` });
  }
  // sof-web resolves "@/" to its repo root and this site to src/, so a shared
  // file must use relative imports to work in both.
  if (/from "@\//.test(text)) {
    failures.push({ file, message: `${file} imports from "@/". Shared files must use relative imports.` });
  }
}

if (failures.length > 0) {
  for (const { file, message } of failures) {
    if (process.env.GITHUB_ACTIONS) console.log(`::error file=${file}::${message}`);
    console.error(message);
  }
  console.error(
    [
      "",
      "These files are shared with scholars-opportunity-fund/sof-web, where each lives under",
      "lib/analytics/ with the same name. Make the same edit to the file in sof-web, byte for",
      "byte, then update its sha256 in both manifests: src/lib/analytics/shared-manifest.json",
      "here and lib/analytics/website-copy.test.ts in sof-web.",
    ].join("\n"),
  );
  process.exit(1);
}

console.log(`${entries.length} shared analytics files match ${MANIFEST}.`);
