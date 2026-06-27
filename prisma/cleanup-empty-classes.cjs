const { Client } = require('pg');

async function main() {
  console.log('--- Cleaning Up Classes with No Students using Raw SQL ---');
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://u0_a535@localhost:5432/msns-auth'
  });
  
  await client.connect();
  console.log('Connected to database.');
  
  await client.query('BEGIN');
  try {
    // Find all classes (Grades) with 0 students associated in StudentClass
    const queryRes = await client.query(`
      SELECT g."classId", g."grade", g."section" 
      FROM "Grades" g 
      WHERE NOT EXISTS (
        SELECT 1 FROM "StudentClass" sc WHERE sc."classId" = g."classId"
      )
    `);
    
    const emptyGrades = queryRes.rows;
    console.log(`Found ${emptyGrades.length} class(es) with no students.`);
    
    for (const grade of emptyGrades) {
      console.log(`Deleting class: ${grade.grade} - ${grade.section} (ID: ${grade.classId})`);
      
      // Delete dependent records first to satisfy foreign key constraints
      
      // 1. Delete ClassSubject
      await client.query('DELETE FROM "ClassSubject" WHERE "classId" = $1', [grade.classId]);
      
      // 2. Delete Timetable
      await client.query('DELETE FROM "Timetable" WHERE "classId" = $1', [grade.classId]);
      
      // 3. Delete Exam-dependent Marks, ExamDatesheet, and Exam
      const examsRes = await client.query('SELECT "examId" FROM "Exam" WHERE "classId" = $1', [grade.classId]);
      const examIds = examsRes.rows.map(r => r.examId);
      if (examIds.length > 0) {
        const placeholders = examIds.map((_, idx) => `$${idx + 1}`).join(', ');
        await client.query(`DELETE FROM "Marks" WHERE "examId" IN (${placeholders})`, examIds);
        await client.query(`DELETE FROM "ExamDatesheet" WHERE "examId" IN (${placeholders})`, examIds);
        await client.query('DELETE FROM "Exam" WHERE "classId" = $1', [grade.classId]);
      }
      
      // 4. Delete ReportCardDetail and ReportCard
      const rcRes = await client.query('SELECT "reportCardId" FROM "ReportCard" WHERE "classId" = $1', [grade.classId]);
      const reportCardIds = rcRes.rows.map(r => r.reportCardId);
      if (reportCardIds.length > 0) {
        const placeholders = reportCardIds.map((_, idx) => `$${idx + 1}`).join(', ');
        await client.query(`DELETE FROM "ReportCardDetail" WHERE "reportCardId" IN (${placeholders})`, reportCardIds);
        await client.query('DELETE FROM "ReportCard" WHERE "classId" = $1', [grade.classId]);
      }
      
      // 5. Delete PromotionHistory
      await client.query('DELETE FROM "PromotionHistory" WHERE "fromClassId" = $1 OR "toClassId" = $1', [grade.classId]);
      
      // 6. Delete StudentAttendance
      await client.query('DELETE FROM "StudentAttendance" WHERE "classId" = $1', [grade.classId]);
      
      // 7. Delete BulkPromotionBatch
      await client.query('DELETE FROM "BulkPromotionBatch" WHERE "fromClassId" = $1 OR "toClassId" = $1', [grade.classId]);
      
      // 8. Delete Grades (Class)
      await client.query('DELETE FROM "Grades" WHERE "classId" = $1', [grade.classId]);
      
      console.log(`Successfully deleted class ${grade.classId}`);
    }
    
    await client.query('COMMIT');
    console.log('--- Cleanup Completed Successfully! ---');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error during cleanup:', error);
  } finally {
    await client.end();
  }
}

main().catch(console.error);
