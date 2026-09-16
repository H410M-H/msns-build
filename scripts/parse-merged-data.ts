import fs from "fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function parseAndAnalyze() {
  const content = fs.readFileSync("scripts/Merged_Results_Data.md", "utf-8");
  
  // Let's see all sections in Merged_Results_Data.md
  console.log("File length:", content.length);
  
  const sections = content.split(/## File:/g).filter(Boolean);
  console.log(`Found ${sections.length} file sections in Merged_Results_Data.md`);
  
  for (let i = 0; i < sections.length; i++) {
    const lines = sections[i].split("\n").map(l => l.trim()).filter(Boolean);
    console.log(`\n--- Section ${i + 1} ---`);
    console.log("Header:", lines.slice(0, 5));
  }
}

parseAndAnalyze().catch(console.error).finally(() => prisma.$disconnect());
