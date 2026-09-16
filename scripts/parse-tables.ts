import fs from "fs";

function parseMergedResults() {
  const content = fs.readFileSync("scripts/Merged_Results_Data.md", "utf-8");
  const sections = content.split(/## File:\s*/g).filter(Boolean);

  const results: any[] = [];

  for (const sec of sections) {
    const lines = sec.split("\n").map(l => l.trim()).filter(Boolean);
    const fileName = lines[0];
    const sheetLine = lines.find(l => l.startsWith("### Sheet:")) || "";
    
    // Find class line
    const classLine = lines.find(l => l.includes("CLASS:")) || "";
    const classMatch = classLine.match(/CLASS:\s*([A-Za-z0-9\-\+\(\)\s\[\]]+)/i);
    const className = classMatch ? classMatch[1].trim() : fileName;

    // Find table header line
    const tableLines = lines.filter(l => l.startsWith("|"));
    if (tableLines.length < 2) continue;

    // Header is usually the row with "NAMES OF STUDENTS" or "NAME OF STUDENTS"
    let headerIdx = tableLines.findIndex(l => l.toUpperCase().includes("NAME") && l.toUpperCase().includes("STUDENT"));
    if (headerIdx === -1) {
      console.log(`Could not find header in ${fileName}`);
      continue;
    }

    const headerCols = tableLines[headerIdx].split("|").map(c => c.trim()).filter(Boolean);
    console.log(`\n========================================`);
    console.log(`File: ${fileName}`);
    console.log(`Class: ${className}`);
    console.log(`Header cols (${headerCols.length}):`, headerCols);

    // Data rows
    const rows = [];
    for (let i = headerIdx + 1; i < tableLines.length; i++) {
      const rowLine = tableLines[i];
      if (rowLine.includes("---") || rowLine.includes(":---")) continue;
      const cols = rowLine.split("|").map(c => c.trim()).filter(Boolean);
      if (cols.length === 0) continue;
      if (cols.some(c => c.toUpperCase().includes("GRAND TOTAL") || c.toUpperCase().includes("TOTAL") || c.toUpperCase().includes("SIGNATURE"))) {
        continue;
      }
      rows.push(cols);
    }
    console.log(`Found ${rows.length} student rows.`);
    for (const r of rows) {
      console.log(`  - ${r[1]} -> ${r.slice(2, 6).join(", ")} ... total: ${r[r.length - 5] || r[r.length - 4]}`);
    }

    results.push({
      fileName,
      className,
      headers: headerCols,
      rows
    });
  }

  return results;
}

parseMergedResults();
