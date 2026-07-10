import pkg from 'pg';
const { Client } = pkg;
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connection String
const connectionString = process.env.DATABASE_URL || 'postgresql://u0_a535@localhost:5432/msns-auth';

// Helper to convert Month name to number
function getMonthNumber(monthName: string): number {
  const months: Record<string, number> = {
    'january': 1, 'february': 2, 'march': 3, 'april': 4,
    'may': 5, 'june': 6, 'july': 7, 'august': 8,
    'september': 9, 'october': 10, 'november': 11, 'december': 12
  };
  return months[monthName.toLowerCase().trim()] || 1;
}

// Helper to clean/normalize names for matching
function normalizeName(name: string): string {
  return name.toUpperCase().trim().replace(/\s+/g, ' ');
}

// Find existing employee from list
function findExistingEmployee(jsonName: string, employees: any[]) {
  const normJson = normalizeName(jsonName);
  
  // Manual mappings matching those in other codebase scripts and cleanup scripts
  const manualMappings: Record<string, string> = {
    'AMINA NOOR': 'AMINAH NOOR',
    'SHAGUFTA AKBAR': 'SHAGUFTA TAWAKUL',
    'MAHNOOR': 'MAHNOOR KHALID',
    'REHAN YOUNAS': 'M. REHAN YOUNUS',
    'WAQAS AHMED': 'SIR WAQAS',
    'MEHRAB TABASUM': 'MEHRAB TABASSUM'
  };

  const targetName = manualMappings[normJson] || normJson;

  return employees.find(emp => {
    const dbName = normalizeName(emp.employeeName);
    return dbName === targetName || dbName === normJson || dbName.replace(/[^A-Z]/g, '') === targetName.replace(/[^A-Z]/g, '');
  });
}

async function main() {
  console.log('🚀 Starting Salary Seeding Script for 2026...');

  const client = new Client({ connectionString });
  await client.connect();

  try {
    // 1. Fetch Session
    const sessionRes = await client.query('SELECT * FROM "Sessions" WHERE "sessionName" = $1', ['2025-2026']);
    let sessionId = '';
    if (sessionRes.rows.length > 0) {
      sessionId = sessionRes.rows[0].sessionId;
      console.log(`📌 Found active session: 2025-2026 (ID: ${sessionId})`);
    } else {
      // Fallback: fetch any active or the first session
      const fallbackRes = await client.query('SELECT * FROM "Sessions" ORDER BY "isActive" DESC LIMIT 1');
      if (fallbackRes.rows.length === 0) {
        throw new Error('No sessions found in the database. Please seed sessions first.');
      }
      sessionId = fallbackRes.rows[0].sessionId;
      console.log(`⚠️ Session "2025-2026" not found. Using fallback session: ${fallbackRes.rows[0].sessionName} (ID: ${sessionId})`);
    }

    // 2. Fetch all existing employees
    const empRes = await client.query('SELECT * FROM "Employees"');
    const existingEmployees = empRes.rows;
    console.log(`👥 Loaded ${existingEmployees.length} existing employees from database.`);

    // 3. Find the maximum registration suffix for new employees
    let maxSuffix = 15; // default starting point based on existing records
    for (const emp of existingEmployees) {
      const regNum = emp.registrationNumber || '';
      const match = regNum.match(/EMP-2025-(\d+)/);
      if (match) {
        const val = parseInt(match[1], 10);
        if (val > maxSuffix) maxSuffix = val;
      }
    }
    let nextSuffix = maxSuffix + 1;
    console.log(`🔢 Suffix counter for auto-created employees will start at ${nextSuffix}`);

    // 4. Load JSON file
    const jsonPath = path.join(__dirname, 'msns_salaries_2026.json');
    if (!fs.existsSync(jsonPath)) {
      throw new Error(`Data file not found at: ${jsonPath}`);
    }
    const fileData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    const monthsObject = fileData.months;
    const monthKeys = Object.keys(monthsObject);

    let totalInserted = 0;
    let totalSkipped = 0;
    let employeesCreated = 0;

    // We will keep a local array of employees to avoid creating duplicate employees during the loop
    const localEmployees = [...existingEmployees];

    // Transaction start
    await client.query('BEGIN');

    for (const monthKey of monthKeys) {
      const monthData = monthsObject[monthKey];
      const monthNum = getMonthNumber(monthData.month);
      const year = monthData.year;

      console.log(`\n📅 Processing Month: ${monthData.month} ${year}`);

      // Combine female and male staff arrays from JSON
      const staffList = [
        ...(monthData.female_staff || []).map((s: any) => ({ ...s, gender: 'FEMALE' })),
        ...(monthData.male_staff || []).map((s: any) => ({ ...s, gender: 'MALE' }))
      ];

      for (const staff of staffList) {
        // AZAM SIDDIQUE etc., have no pay recorded (they are listed as helpers or signature registers but not paid)
        if (staff.basic_pay === null && staff.net_payable === null) {
          // Log and skip silently (not an error, they are just not part of the payroll)
          continue;
        }

        const basicPay = staff.basic_pay || 0;
        const netPayable = staff.net_payable || 0;

        // Find or create employee
        let employee = findExistingEmployee(staff.name, localEmployees);
        if (!employee) {
          // Create the employee record
          const suffixStr = String(nextSuffix).padStart(4, '0');
          const newEmpId = `emp-emp-2025-${suffixStr}`;
          const newRegNum = `EMP-2025-${suffixStr}`;
          const newAdmNum = `ADM-EMP-${suffixStr}`;
          nextSuffix++;

          console.log(`➕ Auto-creating missing employee: "${staff.name}" -> ${newRegNum} (Gender: ${staff.gender})`);

          await client.query(`
            INSERT INTO "Employees" (
              "employeeId", "registrationNumber", "employeeName", "fatherName", 
              "admissionNumber", "gender", "dob", "cnic", "maritalStatus", 
              "doj", "designation", "residentialAddress", "mobileNo", 
              "education", "isAssign"
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
          `, [
            newEmpId, newRegNum, staff.name.toUpperCase().trim(), `Father of ${staff.name}`,
            newAdmNum, staff.gender, 'none', '0000-0000000-0', 'Unmarried',
            'none', 'TEACHER', 'Unknown', 'none',
            'none', false
          ]);

          // Create localized object
          employee = {
            employeeId: newEmpId,
            employeeName: staff.name,
            registrationNumber: newRegNum,
            gender: staff.gender,
            designation: 'TEACHER'
          };
          localEmployees.push(employee);
          employeesCreated++;
        }

        // Calculate deductions and allowances
        let deductions = 0;
        let allowances = 0;
        if (basicPay > netPayable) {
          deductions = basicPay - netPayable;
        } else if (netPayable > basicPay) {
          allowances = netPayable - basicPay;
        }

        // Check if salary already exists
        const salCheck = await client.query(
          'SELECT "id" FROM "Salary" WHERE "employeeId" = $1 AND "month" = $2 AND "year" = $3',
          [employee.employeeId, monthNum, year]
        );

        if (salCheck.rows.length > 0) {
          console.log(`  ⏭️ Skipping: Salary record already exists for ${employee.employeeName} in ${monthData.month} ${year}`);
          totalSkipped++;
          continue;
        }

        // Insert salary record
        const salaryId = `sal-${employee.employeeId}-${year}-${monthNum}`;
        const paymentDate = new Date(year, monthNum - 1, 28);

        await client.query(`
          INSERT INTO "Salary" (
            "id", "employeeId", "amount", "month", "year", "status", 
            "paymentDate", "deductions", "allowances", "bonus", "sessionId", 
            "createdAt", "updatedAt"
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
          ON CONFLICT ("id") DO NOTHING
        `, [
          salaryId, employee.employeeId, netPayable, monthNum, year, 'PAID',
          paymentDate, deductions, allowances, 0, sessionId
        ]);

        totalInserted++;
      }
    }

    await client.query('COMMIT');
    console.log('\n======================================');
    console.log('✅ Salary seeding successfully completed!');
    console.log(`   - Salary records inserted: ${totalInserted}`);
    console.log(`   - Salary records skipped: ${totalSkipped}`);
    console.log(`   - Missing employees created: ${employeesCreated}`);
    console.log('======================================');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding failed, transaction rolled back:', err);
    throw err;
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
