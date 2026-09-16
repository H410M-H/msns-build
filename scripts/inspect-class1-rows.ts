import fs from "fs";

const content = fs.readFileSync("scripts/Merged_Results_Data.md", "utf-8");
const sec = content.split(/## File:\s*/g).find(s => s.includes("FIRST TERM RESULT -2026 ONE - ZAINAB JAMSHAD.xlsx"))!;

const lines = sec.split("\n").map(l => l.trim()).filter(Boolean);
const tableLines = lines.filter(l => l.startsWith("|"));

const headerIdx = tableLines.findIndex(l => l.toUpperCase().includes("NAME") && l.toUpperCase().includes("STUDENT"));
const rawHeaders = tableLines[headerIdx].split("|").map(c => c.trim());

for (let i = headerIdx + 1; i < tableLines.length; i++) {
  if (tableLines[i].includes("---") || tableLines[i].includes(":---")) continue;
  const rawCols = tableLines[i].split("|").map(c => c.trim());
  const rowObj: any = {};
  rawHeaders.forEach((h, idx) => {
    if (h) rowObj[h] = rawCols[idx];
  });
  console.log(`Row ${i}:`, JSON.stringify(rowObj));
}
