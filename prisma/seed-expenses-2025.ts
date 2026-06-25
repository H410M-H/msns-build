import { PrismaClient, ExpenseCategory } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// ── Category classification based on expense description keywords ──
function categorize(details: string): ExpenseCategory {
  const d = details.toUpperCase();

  // UTILITIES — electricity, internet, gas, water, phone/call packages
  if (
    d.includes('ELECTRICITY') ||
    d.includes('INTERNET') ||
    d.includes('GAS') ||
    d.includes('CALL PACKAGE') ||
    d.includes('WATER PUMP') ||
    d.includes('DOMAIN') ||
    d.includes('GAS BILL') ||
    d.includes('GAS CYLINDER') ||
    d.includes('BATTERY WATER') ||
    d.includes('BATTERIES WATER')
  ) {
    return ExpenseCategory.UTILITIES;
  }

  // BISE — board affiliation, PEPRIS license
  if (
    d.includes('AFFILIATION') ||
    d.includes('PEPRIS') ||
    d.includes('BISE') ||
    d.includes('BOARD') && d.includes('EXTENSION')
  ) {
    return ExpenseCategory.BISE;
  }

  // SALARIES — salary, wages, old age benefit, social security, advance payments to staff
  if (
    d.includes('SALARY') ||
    d.includes('WAGES') ||
    d.includes('OLD AGE') ||
    d.includes('SOCIAL SECURITY') ||
    d.includes('MAZDOORI') ||
    d.includes('MAZOORI') ||
    d.includes('WELDOR') && (d.includes('PAYMENT') || d.includes('ADVANCE')) ||
    d.includes('MISTRI')
  ) {
    return ExpenseCategory.SALARIES;
  }

  // EQUIPMENT — computers, printers, monitors, sound system, solar, furniture, steel, wood work
  if (
    d.includes('PC BUILD') ||
    d.includes('PRINTER') ||
    d.includes('LED') ||
    d.includes('MONITOR') ||
    d.includes('HDD') ||
    d.includes('RAM ') ||
    d.includes('MOUSE') ||
    d.includes('HDMI') ||
    d.includes('SOUND SYSTEM') ||
    d.includes('AMPLIFIER') ||
    d.includes('BIOMETRIC') ||
    d.includes('SOLAR') ||
    d.includes('INVERTER') ||
    d.includes('FURNITURE') ||
    d.includes('WOOD WORK') ||
    d.includes('WOODWORK') ||
    d.includes('STEEL') ||
    d.includes('WELDING') ||
    d.includes('CHAIRS') ||
    d.includes('BENCHES') ||
    d.includes('TABLES') ||
    d.includes('DESKS') ||
    d.includes('COOLER') ||
    d.includes('HEATER') ||
    d.includes('FLOOD LIGHT') ||
    d.includes('BREAKER') ||
    d.includes('CALCULATOR') ||
    d.includes('SPEAKER') ||
    d.includes('USB') ||
    d.includes('NETWORKING HUB') ||
    d.includes('SD CARD') ||
    d.includes('COMPUTER') ||
    d.includes('CLOCK') && d.includes('BATTER') ||
    d.includes('STAPLER') ||
    d.includes('CLIPBOARD')
  ) {
    return ExpenseCategory.EQUIPMENT;
  }

  // MAINTENANCE — repair, electrician, plumber, cleaning, painting, gutter, construction
  if (
    d.includes('REPAIR') ||
    d.includes('REPAIRING') ||
    d.includes('ELECTRICIAN') ||
    d.includes('ELECTRITION') ||
    d.includes('PLUMBER') ||
    d.includes('MASON') ||
    d.includes('PAINT') ||
    d.includes('GUTTER') ||
    d.includes('CEMENT') ||
    d.includes('BRICKS') ||
    d.includes('SAFAYI') ||
    d.includes('CLEANING') ||
    d.includes('TEZAB') ||
    d.includes('ACID') ||
    d.includes('JHAROO') ||
    d.includes('SPRAY') && d.includes('PEST') ||
    d.includes('THINNER') ||
    d.includes('CAPACITOR') ||
    d.includes('FILTER') && d.includes('CHANGE') ||
    d.includes('DOOR FIXED') ||
    d.includes('WIRE CHANGE') ||
    d.includes('NALKA') ||
    d.includes('TAPS') ||
    d.includes('HANDLE VALVE') ||
    d.includes('SWITCH') ||
    d.includes('FUSE') ||
    d.includes('SCREWS') && !d.includes('STATIONERY') ||
    d.includes('HAMMER') ||
    d.includes('SCREW DRIVER') ||
    d.includes('CURTAIN')
  ) {
    return ExpenseCategory.MAINTENANCE;
  }

  // FOOD — drinks, tea, food, samosa, biryani, cake, juice, khana
  if (
    d.includes('DRINKS') ||
    d.includes('TEA ') ||
    d.includes('FOOD') ||
    d.includes('SAMOSA') ||
    d.includes('BIRYANI') ||
    d.includes('CAKE') ||
    d.includes('JUICE') ||
    d.includes('KHANA') ||
    d.includes('COKE') ||
    d.includes('SHWARMA') ||
    d.includes('BISCUIT') ||
    d.includes('COLD DRINK') ||
    d.includes('PARYA')
  ) {
    return ExpenseCategory.FOOD;
  }

  // TRANSPORT — petrol, loader, karaya (transport charges), shipping
  if (
    d.includes('PETROL') ||
    d.includes('LOADER') ||
    d.includes('KARAYA') ||
    d.includes('BILLITY') ||
    d.includes('SHIPPING')
  ) {
    return ExpenseCategory.TRANSPORT;
  }

  // SUPPLIES — stationery, books, notebooks, paper, toner, ink, pens, markers, envelopes, etc.
  if (
    d.includes('BOOK') ||
    d.includes('NOTEBOOK') ||
    d.includes('REAM') ||
    d.includes('COPYMATE') ||
    d.includes('FOLDER') ||
    d.includes('ENVELOPE') ||
    d.includes('TONER') ||
    d.includes('INK') ||
    d.includes('MARKER') ||
    d.includes('PEN') ||
    d.includes('PENCIL') ||
    d.includes('ERASER') ||
    d.includes('SHARPENER') ||
    d.includes('DUSTER') ||
    d.includes('CHART') ||
    d.includes('GLAZE') ||
    d.includes('PAPER') ||
    d.includes('TISSUE') ||
    d.includes('STICKER') ||
    d.includes('GLUE') ||
    d.includes('UHU') ||
    d.includes('TAPE') && !d.includes('TEFLON') ||
    d.includes('RIBBON') ||
    d.includes('BALLOON') ||
    d.includes('CREPE') ||
    d.includes('FOAMING') ||
    d.includes('GLITTER') ||
    d.includes('FLEX') ||
    d.includes('STAND') ||
    d.includes('SHIELD') ||
    d.includes('BOUQUET') ||
    d.includes('CUPS') ||
    d.includes('CLOTH') ||
    d.includes('KAPRA') ||
    d.includes('ANSWER SHEET') ||
    d.includes('COLOUR') ||
    d.includes('SOAP') ||
    d.includes('DETERGENT') ||
    d.includes('SARF') ||
    d.includes('REGISTER') ||
    d.includes('STAMP') ||
    d.includes('HIGHLIGHTER') ||
    d.includes('WASHING') ||
    d.includes('HAND WASH') ||
    d.includes('CANDLE') ||
    d.includes('FERNILE') ||
    d.includes('MORTIN') ||
    d.includes('FLUSH') ||
    d.includes('SCRUBBING') ||
    d.includes('WIPER') ||
    d.includes('SHOVEL') ||
    d.includes('LOTTAY') ||
    d.includes('BROOM') ||
    d.includes('GLASS') && d.includes('SET') ||
    d.includes('STEEL GLASS')
  ) {
    return ExpenseCategory.SUPPLIES;
  }

  // Default fallback
  return ExpenseCategory.OTHER;
}

// ── Month name → number mapping ──
function parseMonthFromLabel(label: string): number {
  const map: Record<string, number> = {
    JANUARY: 1, FEBRUARY: 2, MARCH: 3, APRIL: 4,
    MAY: 5, JUNE: 6, JULY: 7, AUGUST: 8,
    SEPTEMBER: 9, OCTOBER: 10, NOVEMBER: 11, DECEMBER: 12,
  };
  const key = label.split(',')[0].trim().toUpperCase();
  return map[key] ?? 0;
}

interface ExpenseEntry {
  sr_no: number;
  details: string;
  amount: number;
  date: string;
}

interface MonthBlock {
  month: string;
  month_total: number;
  entries: ExpenseEntry[];
}

interface ExpensesFile {
  title: string;
  months: MonthBlock[];
  grand_total: number;
}

async function main() {
  const filePath = path.join(__dirname, 'expenses_2025.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  const data: ExpensesFile = JSON.parse(raw);

  console.log(`📄 Loaded: ${data.title}`);
  console.log(`📅 Months: ${data.months.length}`);

  let totalInserted = 0;
  let totalSkipped = 0;

  for (const monthBlock of data.months) {
    const monthNum = parseMonthFromLabel(monthBlock.month);
    const year = 2025;

    console.log(`\n── ${monthBlock.month} (${monthBlock.entries.length} entries) ──`);

    for (const entry of monthBlock.entries) {
      const category = categorize(entry.details);
      const expenseId = `exp-2025-${String(entry.sr_no).padStart(4, '0')}`;

      try {
        await prisma.expenses.upsert({
          where: { expenseId },
          update: {
            title: entry.details,
            amount: entry.amount,
            category,
            month: monthNum,
            year,
            date: new Date(entry.date),
          },
          create: {
            expenseId,
            title: entry.details,
            amount: entry.amount,
            category,
            month: monthNum,
            year,
            date: new Date(entry.date),
          },
        });
        totalInserted++;
      } catch (err) {
        console.error(`  ❌ Failed sr_no=${entry.sr_no}: ${(err as Error).message}`);
        totalSkipped++;
      }
    }

    console.log(`  ✅ Month total from JSON: ${monthBlock.month_total.toLocaleString()}`);
  }

  console.log(`\n══════════════════════════════════════`);
  console.log(`✅ Seeded: ${totalInserted} expenses`);
  if (totalSkipped > 0) console.log(`⚠️  Skipped: ${totalSkipped}`);
  console.log(`💰 Grand Total: ${data.grand_total.toLocaleString()}`);
  console.log(`══════════════════════════════════════`);
}

main()
  .catch((e) => {
    console.error('Error during expense seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
