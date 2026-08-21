import pg from 'pg';
import { hash } from 'bcryptjs';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  console.log('🚀 Starting schema patch and user data migration...');

  // 1. Ensure columns exist on Employees table
  console.log('1️⃣ Updating Employees table schema...');
  await pool.query(`
    ALTER TABLE "Employees" 
    ADD COLUMN IF NOT EXISTS "status" text NOT NULL DEFAULT 'Active',
    ADD COLUMN IF NOT EXISTS "leftDate" timestamp(3);
  `);

  // 2. Fetch all employees
  console.log('2️⃣ Fetching employees...');
  const empRes = await pool.query('SELECT * FROM "Employees"');
  console.log(`Found ${empRes.rowCount} employees in Employees table.`);

  // 3. Create Admin user if not exists
  const defaultPasswordHash = await hash('admin123', 10);
  const adminEmail = 'admin@msns.edu.pk';
  const adminUsername = 'ADMIN-001';
  
  const existingAdmin = await pool.query('SELECT id FROM "User" WHERE email = $1', [adminEmail]);
  if (existingAdmin.rowCount === 0) {
    const adminId = 'u_admin_' + crypto.randomBytes(8).toString('hex');
    await pool.query(
      `INSERT INTO "User" (id, "accountId", "accountType", password, username, email, "createdAt")
       VALUES ($1, $2, 'ADMIN', $3, $4, $5, NOW())`,
      [adminId, 'ADM-001', defaultPasswordHash, adminUsername, adminEmail]
    );
    console.log('✅ Created default Admin account: admin@msns.edu.pk / admin123');
  }

  // 4. Create User records for all Employees
  let empUserCount = 0;
  for (const emp of empRes.rows) {
    const regNum = emp.registrationNumber || emp.employeeId;
    const admNum = emp.admissionNumber || regNum;
    
    // Create clean email and username
    const cleanAdm = admNum.toLowerCase().replace(/[^a-z0-9]/g, '');
    const email = `${cleanAdm}@msns.edu.pk`;
    const username = regNum;
    const designation = emp.designation || 'TEACHER';

    // Check if user already exists by accountId or email
    const existing = await pool.query(
      'SELECT id FROM "User" WHERE "accountId" = $1 OR email = $2 OR username = $3',
      [regNum, email, username]
    );

    if (existing.rowCount === 0) {
      const userId = 'u_emp_' + crypto.randomBytes(8).toString('hex');
      const passHash = await hash('msns1234', 10);
      await pool.query(
        `INSERT INTO "User" (id, "accountId", "accountType", password, username, email, "createdAt")
         VALUES ($1, $2, $3::"Designation", $4, $5, $6, NOW())`,
        [userId, regNum, designation, passHash, username, email]
      );
      empUserCount++;
    }
  }
  console.log(`✅ Created ${empUserCount} User accounts for Employees.`);

  // 5. Create User records for all Students
  console.log('5️⃣ Fetching students...');
  const studRes = await pool.query('SELECT * FROM "Students"');
  console.log(`Found ${studRes.rowCount} students in Students table.`);

  let studUserCount = 0;
  for (const stud of studRes.rows) {
    const regNum = stud.registrationNumber || stud.admissionNumber || stud.studentId;
    const admNum = stud.admissionNumber || regNum;
    
    const cleanReg = regNum.toLowerCase().replace(/[^a-z0-9]/g, '');
    const email = `${cleanReg}@msns.edu.pk`;
    const username = regNum;

    const existing = await pool.query(
      'SELECT id FROM "User" WHERE "accountId" = $1 OR email = $2 OR username = $3',
      [regNum, email, username]
    );

    if (existing.rowCount === 0) {
      const userId = 'u_std_' + crypto.randomBytes(8).toString('hex');
      const passHash = await hash('msns1234', 10);
      await pool.query(
        `INSERT INTO "User" (id, "accountId", "accountType", password, username, email, "createdAt")
         VALUES ($1, $2, 'STUDENT', $3, $4, $5, NOW())`,
        [userId, regNum, passHash, username, email]
      );
      studUserCount++;
    }
  }
  console.log(`✅ Created ${studUserCount} User accounts for Students.`);

  // 6. Summary check
  const finalUsers = await pool.query('SELECT count(*) FROM "User"');
  const finalEmps = await pool.query('SELECT count(*) FROM "Employees"');
  const finalStuds = await pool.query('SELECT count(*) FROM "Students"');

  console.log('\n📊 Final Migration Summary:');
  console.log(`- Employees: ${finalEmps.rows[0].count}`);
  console.log(`- Students: ${finalStuds.rows[0].count}`);
  console.log(`- Total User Accounts: ${finalUsers.rows[0].count}`);

  await pool.end();
}

migrate().catch(e => console.error('Migration failed:', e));
