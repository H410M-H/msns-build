import fs from "fs";

const content = fs.readFileSync("scripts/Merged_Results_Data.md", "utf-8");
const sections = content.split(/## File:\s*/g).filter(Boolean);

console.log(`Total File sections: ${sections.length}`);
sections.forEach((sec, idx) => {
  const lines = sec.split("\n").map(l => l.trim()).filter(Boolean);
  const fileName = lines[0];
  const sheetLine = lines.find(l => l.startsWith("### Sheet:")) || "";
  const classLine = lines.find(l => l.includes("CLASS:")) || "";
  const headerLine = lines.find(l => l.includes("NAMES OF STUDENTS") || l.includes("NAME OF STUDENTS")) || "";
  console.log(`\nSection ${idx + 1}:`);
  console.log(`  File: ${fileName}`);
  console.log(`  Sheet: ${sheetLine}`);
  console.log(`  ClassLine: ${classLine}`);
  console.log(`  HeaderLine: ${headerLine}`);
});
