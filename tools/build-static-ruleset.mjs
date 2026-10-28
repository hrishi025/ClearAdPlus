#!/usr/bin/env node
// Build-time helper only. It never downloads a list and never runs list code.
// Supply a lawfully obtained filter-list text file, review its license, then
// add the generated JSON as a manifest static rule resource.
import { readFile, writeFile } from "node:fs/promises";
import { parseFilterText } from "../src/shared/filter-parser.js";
import { compileNetworkRules } from "../src/background/dnr.js";

function valueAfter(flag) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : null;
}

const input = valueAfter("--input");
const output = valueAfter("--output");
const maxRules = Number(valueAfter("--max-rules") || 30000);
if (!input || !output || !Number.isInteger(maxRules) || maxRules < 1) {
  console.error("Usage: node tools/build-static-ruleset.mjs --input LIST.txt --output rules/list.json [--max-rules 30000]");
  process.exit(2);
}

const source = await readFile(input, "utf8");
const parsed = parseFilterText(source);
const selected = parsed.network.slice(0, maxRules);
const rules = compileNetworkRules(selected, 1);
await writeFile(output, `${JSON.stringify(rules, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ output, rules: rules.length, unsupported: parsed.unsupported.length, truncated: parsed.network.length > selected.length }, null, 2));
