import fs from "fs";

const content = fs.readFileSync("scripts/Merged_Results_Data.md", "utf-8");
const sections = content.split(/## File:\s*/g).filter(Boolean);

const processedFiles = new Set<string>();

for (const sec of sections) {
  const lines = sec.split("\n").map(l => l.trim()).filter(Boolean);
  const fileName = lines[0];

  // Avoid duplicate files
  const baseName = fileName.replace(/\s*\(\d+\)\.xlsx$/i, ".xlsx");
  if (processedFiles.has(baseName)) {
    console.log(`Skipping duplicate file: ${fileName} (already processed ${baseName})`);
    continue;
  }
  processedFiles.add(baseName);

  const tableLines = lines.filter(l => l.startsWith("|"));
  const headerIdx = tableLines.findIndex(l => l.toUpperCase().includes("NAME") && l.toUpperCase().includes("STUDENT"));
  if (headerIdx === -1) continue;

  const rawHeaders = tableLines[headerIdx].split("|").map(c => c.trim());

  console.log(`\n======================================================`);
  console.log(`File: ${fileName}`);

  let studentCount = 0;
  for (let i = headerIdx + 1; i < tableLines.length; i++) {
    if (tableLines[i].includes("---") || tableLines[i].includes(":---")) continue;
    const rawCols = tableLines[i].split("|").map(c => c.trim());
    const rowObj: Record<string, string> = {};
    rawHeaders.forEach((h, idx) => {
      if (h) rowObj[h] = rawCols[idx] || "";
    });

    const nameKey = Object.keys(rowObj).find(k => k.toUpperCase().includes("NAME") && k.toUpperCase().includes("STUDENT"));
    if (!nameKey) continue;

    const studentName = rowObj[nameKey]?.trim();
    if (!studentName || studentName.toUpperCase().includes("TOTAL") || studentName.toUpperCase().includes("SIGNATURE")) continue;

    studentCount++;

    // Collect subjects
    const subjects: Record<string, string> = {};
    let sheetTotal = "";
    let sheetPct = "";
    let sheetGrade = "";

    Object.entries(rowObj).forEach(([k, v]) => {
      const up = k.toUpperCase();
      if (up === "NO." || up === "SR NO." || up === "SR. NO." || up.includes("NAME") || up.includes("ATTENDANCE") || up.includes("POSITION") || up.includes("STATUS")) {
        return;
      }
      if (up.includes("OBTAINED")) {
        sheetTotal = v;
      } else if (up.includes("PERCENT") || up === "%") {
        sheetPct = v;
      } else if (up.includes("GRADE") || up === "GRADES") {
        sheetGrade = v;
      } else {
        subjects[k] = v;
      }
    });

    console.log(`  Student ${studentCount}: "${studentName}" | Sheet Total: ${sheetTotal} (${sheetPct}) | Grade: ${sheetGrade} | Subjects (${Object.keys(subjects).length}):`, subjects);
  }
}
