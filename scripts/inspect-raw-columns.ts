import fs from "fs";

const content = fs.readFileSync("scripts/Merged_Results_Data.md", "utf-8");
const sections = content.split(/## File:\s*/g).filter(Boolean);

for (const sec of sections) {
  const lines = sec.split("\n").map(l => l.trim()).filter(Boolean);
  const fileName = lines[0];
  const tableLines = lines.filter(l => l.startsWith("|"));
  
  let headerIdx = tableLines.findIndex(l => l.toUpperCase().includes("NAME") && l.toUpperCase().includes("STUDENT"));
  if (headerIdx === -1) continue;

  console.log(`\n======================================================`);
  console.log(`File: ${fileName}`);
  
  // Split without filtering empty to preserve exact column positions
  const rawHeaders = tableLines[headerIdx].split("|").map(c => c.trim());
  console.log("Raw Header count:", rawHeaders.length);
  rawHeaders.forEach((h, i) => {
    if (h) console.log(`  Header [${i}]: "${h}"`);
  });

  // Print first 2 data rows
  for (let i = headerIdx + 1; i < Math.min(tableLines.length, headerIdx + 4); i++) {
    if (tableLines[i].includes("---") || tableLines[i].includes(":---")) continue;
    const rawCols = tableLines[i].split("|").map(c => c.trim());
    console.log(`\n  Row ${i - headerIdx}: rawCols count = ${rawCols.length}`);
    rawCols.forEach((c, idx) => {
      if (c || (rawHeaders[idx] && rawHeaders[idx].length > 0)) {
        console.log(`    Col [${idx}] (${rawHeaders[idx] || 'no header'}): "${c}"`);
      }
    });
  }
}
