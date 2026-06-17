import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const employeeMappings = [
  { duplicate: 'EMP-1781049275239-386', original: 'MSN-T-25-0004' }, // MALAIKA SHAHID -> MALIAKA SHAHID
  { duplicate: 'EMP-1781049211944-606', original: 'MSN-T-25-0002' }, // MEHRAB TABASUM -> MEHRAB TABASSUM
  { duplicate: 'EMP-2025-0002', original: 'MSN-H-25-0002' }, // FARAH NAZ -> FARAH NAZ 
  { duplicate: 'EMP-2025-1033', original: 'MSN-T-25-0012' }, // LARAIB SULTAN -> LARAIB SULTAN 
  { duplicate: 'EMP-2025-1034', original: 'MSN-T-25-0003' }, // SIR WAQAS -> WAQAS AHMAD
  { duplicate: 'EMP-2025-1035', original: 'MSN-T-25-0011' }, // ESHA MUNIR -> ESHA MUNIR 
  { duplicate: 'EMP-2025-1036', original: 'MSN-T-25-0006' }, // SHAGUFTA TAWAKUL -> SHAGUFTA AKBAR
  { duplicate: 'EMP-2025-1037', original: 'MSN-T-25-0005' }, // M. REHAN YOUNUS -> MUHAMMAD REHAN YOUNAS
];

function normalize(str: string | null): string {
  if (!str) return '';
  return str.toUpperCase().trim().replace(/[^A-Z0-9]/g, '');
}

async function main() {
  console.log('=== STARTING DATABASE CLEANUP & DEDUPLICATION ===');

  // --- PART 1: DEDUPLICATE EMPLOYEES ---
  console.log('\n--- Part 1: Deduplicating Employees ---');
  for (const mapping of employeeMappings) {
    const duplicateEmp = await prisma.employees.findUnique({
      where: { registrationNumber: mapping.duplicate }
    });
    const originalEmp = await prisma.employees.findUnique({
      where: { registrationNumber: mapping.original }
    });

    if (!duplicateEmp) {
      console.log(`Duplicate employee ${mapping.duplicate} not found, skipping.`);
      continue;
    }
    if (!originalEmp) {
      console.log(`Original employee ${mapping.original} not found, skipping.`);
      continue;
    }

    console.log(`Merging duplicate employee "${duplicateEmp.employeeName}" (${duplicateEmp.registrationNumber}) into original "${originalEmp.employeeName}" (${originalEmp.registrationNumber})`);

    const dupId = duplicateEmp.employeeId;
    const origId = originalEmp.employeeId;

    // A. ClassSubject
    const dupClassSubjects = await prisma.classSubject.findMany({ where: { employeeId: dupId } });
    for (const cs of dupClassSubjects) {
      const origCs = await prisma.classSubject.findFirst({
        where: {
          classId: cs.classId,
          subjectId: cs.subjectId,
          sessionId: cs.sessionId,
          employeeId: origId
        }
      });

      if (origCs) {
        // Redirect Marks and SubjectDiary pointing to duplicate ClassSubject to the original ClassSubject
        await prisma.marks.updateMany({
          where: { classSubjectId: cs.csId },
          data: { classSubjectId: origCs.csId }
        });
        await prisma.subjectDiary.updateMany({
          where: { classSubjectId: cs.csId },
          data: { classSubjectId: origCs.csId }
        });
        // Delete duplicate ClassSubject
        await prisma.classSubject.delete({ where: { csId: cs.csId } });
      } else {
        // Re-assign to original employee
        await prisma.classSubject.update({
          where: { csId: cs.csId },
          data: { employeeId: origId }
        });
      }
    }

    // B. Timetable
    const dupTimetables = await prisma.timetable.findMany({ where: { employeeId: dupId } });
    for (const tt of dupTimetables) {
      const origTt = await prisma.timetable.findFirst({
        where: {
          classId: tt.classId,
          sessionId: tt.sessionId,
          dayOfWeek: tt.dayOfWeek,
          lectureNumber: tt.lectureNumber
        }
      });
      if (origTt) {
        await prisma.timetable.delete({ where: { timetableId: tt.timetableId } });
      } else {
        await prisma.timetable.update({
          where: { timetableId: tt.timetableId },
          data: { employeeId: origId }
        });
      }
    }

    // C. Salary & Payroll relations
    await prisma.salary.updateMany({ where: { employeeId: dupId }, data: { employeeId: origId } });
    await prisma.salaryAssignment.updateMany({ where: { employeeId: dupId }, data: { employeeId: origId } });
    await prisma.salaryIncrement.updateMany({ where: { employeeId: dupId }, data: { employeeId: origId } });

    // D. Attendance
    const dupAttendances = await prisma.employeeAttendance.findMany({ where: { employeeId: dupId } });
    for (const att of dupAttendances) {
      const origAtt = await prisma.employeeAttendance.findFirst({
        where: { employeeId: origId, date: att.date }
      });
      if (origAtt) {
        await prisma.employeeAttendance.delete({ where: { employeeAttendanceId: att.employeeAttendanceId } });
      } else {
        await prisma.employeeAttendance.update({
          where: { employeeAttendanceId: att.employeeAttendanceId },
          data: { employeeId: origId }
        });
      }
    }

    // E. Leaves
    await prisma.leaveApplication.updateMany({ where: { employeeId: dupId }, data: { employeeId: origId } });
    const dupLeaveBalances = await prisma.leaveBalance.findMany({ where: { employeeId: dupId } });
    for (const bal of dupLeaveBalances) {
      const origBal = await prisma.leaveBalance.findFirst({
        where: { employeeId: origId, leaveTypeId: bal.leaveTypeId, sessionId: bal.sessionId }
      });
      if (origBal) {
        await prisma.leaveBalance.delete({ where: { balanceId: bal.balanceId } });
      } else {
        await prisma.leaveBalance.update({
          where: { balanceId: bal.balanceId },
          data: { employeeId: origId }
        });
      }
    }

    // F. Marks and other references
    await prisma.marks.updateMany({ where: { uploadedBy: dupId }, data: { uploadedBy: origId } });
    await prisma.promotionHistory.updateMany({ where: { promotedBy: dupId }, data: { promotedBy: origId } });
    await prisma.subjectDiary.updateMany({ where: { teacherId: dupId }, data: { teacherId: origId } });
    await prisma.bulkSalaryCreationItem.updateMany({ where: { employeeId: dupId }, data: { employeeId: origId } });

    // G. ERP tables
    await prisma.costCentre.updateMany({ where: { managerId: dupId }, data: { managerId: origId } });
    await prisma.budgetReallocation.updateMany({ where: { authorisedBy: dupId }, data: { authorisedBy: origId } });
    await prisma.purchaseOrder.updateMany({ where: { createdBy: dupId }, data: { createdBy: origId } });
    await prisma.purchaseOrder.updateMany({ where: { approvalL1By: dupId }, data: { approvalL1By: origId } });
    await prisma.purchaseOrder.updateMany({ where: { approvalL2By: dupId }, data: { approvalL2By: origId } });
    await prisma.goodsReceiptNote.updateMany({ where: { receivedBy: dupId }, data: { receivedBy: origId } });
    await prisma.directExpense.updateMany({ where: { createdBy: dupId }, data: { createdBy: origId } });
    await prisma.directExpense.updateMany({ where: { approvedBy: dupId }, data: { approvedBy: origId } });
    await prisma.stockTransaction.updateMany({ where: { recipientId: dupId }, data: { recipientId: origId } });
    await prisma.stockReconciliation.updateMany({ where: { performedBy: dupId }, data: { performedBy: origId } });
    await prisma.asset.updateMany({ where: { assignedToId: dupId }, data: { assignedToId: origId } });
    await prisma.assetTransfer.updateMany({ where: { authorisedBy: dupId }, data: { authorisedBy: origId } });
    await prisma.pettyCashDisbursement.updateMany({ where: { recordedBy: dupId }, data: { recordedBy: origId } });
    await prisma.pettyCashReconciliation.updateMany({ where: { performedBy: dupId }, data: { performedBy: origId } });
    await prisma.financialLedgerEntry.updateMany({ where: { createdBy: dupId }, data: { createdBy: origId } });
    await prisma.approvalRecord.updateMany({ where: { approverId: dupId }, data: { approverId: origId } });
    await prisma.approvalDelegation.updateMany({ where: { delegatorId: dupId }, data: { delegatorId: origId } });
    await prisma.approvalDelegation.updateMany({ where: { delegateId: dupId }, data: { delegateId: origId } });
    await prisma.bulkPromotionBatch.updateMany({ where: { initiatedBy: dupId }, data: { initiatedBy: origId } });
    await prisma.bulkSalaryCreationBatch.updateMany({ where: { initiatedBy: dupId }, data: { initiatedBy: origId } });
    await prisma.leaveApproval.updateMany({ where: { approverId: dupId }, data: { approverId: origId } });

    // H. BioMetric and User Account Deletion
    await prisma.bioMetric.deleteMany({ where: { employeeId: dupId } });
    await prisma.user.deleteMany({ where: { accountId: duplicateEmp.registrationNumber } });
    await prisma.employees.delete({ where: { employeeId: dupId } });

    console.log(`Successfully merged employee ${mapping.duplicate} into ${mapping.original}.`);
  }

  // --- PART 2: DEDUPLICATE STUDENTS ---
  console.log('\n--- Part 2: Deduplicating Students ---');
  const allStudents = await prisma.students.findMany({
    include: {
      StudentClass: true,
      Marks: true,
      ReportCard: true,
      PromotionHistory: true,
      StudentAttendance: true,
    }
  });

  const studentGroups: { [key: string]: typeof allStudents } = {};
  for (const s of allStudents) {
    const key = `${normalize(s.studentName)}|${normalize(s.fatherName)}`;
    if (!studentGroups[key]) studentGroups[key] = [];
    studentGroups[key].push(s);
  }

  let studentDeduplicationCount = 0;

  for (const [key, group] of Object.entries(studentGroups)) {
    if (group.length <= 1) continue;

    console.log(`Found duplicate group with ${group.length} students for key: "${key}"`);

    // Rank students by their relations count to pick the one to keep
    const ranked = group.map(s => {
      const relationsCount = 
        s.StudentClass.length * 10 + 
        s.Marks.length * 5 + 
        s.ReportCard.length * 5 + 
        s.PromotionHistory.length * 2 + 
        s.StudentAttendance.length;
      return { student: s, score: relationsCount };
    }).sort((a, b) => b.score - a.score);

    const kept = ranked[0].student;
    const duplicates = ranked.slice(1).map(r => r.student);

    console.log(`  Keeping student: ${kept.registrationNumber} (${kept.studentName}) with score ${ranked[0].score}`);

    for (const dup of duplicates) {
      console.log(`  Merging duplicate student: ${dup.registrationNumber} (${dup.studentName})`);
      const dupId = dup.studentId;
      const keptId = kept.studentId;

      // A. StudentClass & FeeStudentClass
      const dupStudentClasses = await prisma.studentClass.findMany({ where: { studentId: dupId } });
      for (const sc of dupStudentClasses) {
        const origSc = await prisma.studentClass.findFirst({
          where: { studentId: keptId, classId: sc.classId, sessionId: sc.sessionId }
        });

        if (origSc) {
          // Point all FeeStudentClasses of duplicate StudentClass to original StudentClass
          const dupFees = await prisma.feeStudentClass.findMany({ where: { studentClassId: sc.scId } });
          for (const fee of dupFees) {
            const origFee = await prisma.feeStudentClass.findFirst({
              where: {
                studentClassId: origSc.scId,
                feeId: fee.feeId,
                month: fee.month,
                year: fee.year
              }
            });
            if (origFee) {
              await prisma.feeStudentClass.delete({ where: { sfcId: fee.sfcId } });
            } else {
              await prisma.feeStudentClass.update({
                where: { sfcId: fee.sfcId },
                data: { studentClassId: origSc.scId }
              });
            }
          }
          // Delete duplicate StudentClass
          await prisma.studentClass.delete({ where: { scId: sc.scId } });
        } else {
          // Re-assign to kept student
          await prisma.studentClass.update({
            where: { scId: sc.scId },
            data: { studentId: keptId }
          });
        }
      }

      // B. Marks
      const dupMarks = await prisma.marks.findMany({ where: { studentId: dupId } });
      for (const m of dupMarks) {
        const origM = await prisma.marks.findFirst({
          where: { examId: m.examId, studentId: keptId, subjectId: m.subjectId }
        });
        if (origM) {
          await prisma.marks.delete({ where: { marksId: m.marksId } });
        } else {
          await prisma.marks.update({
            where: { marksId: m.marksId },
            data: { studentId: keptId }
          });
        }
      }

      // C. ReportCard & ReportCardDetail
      const dupReportCards = await prisma.reportCard.findMany({ where: { studentId: dupId } });
      for (const rc of dupReportCards) {
        const origRc = await prisma.reportCard.findFirst({
          where: { studentId: keptId, examId: rc.examId, sessionId: rc.sessionId, classId: rc.classId }
        });
        if (origRc) {
          // Delete details first
          await prisma.reportCardDetail.deleteMany({ where: { reportCardId: rc.reportCardId } });
          await prisma.reportCard.delete({ where: { reportCardId: rc.reportCardId } });
        } else {
          await prisma.reportCard.update({
            where: { reportCardId: rc.reportCardId },
            data: { studentId: keptId }
          });
        }
      }

      // D. PromotionHistory
      await prisma.promotionHistory.updateMany({ where: { studentId: dupId }, data: { studentId: keptId } });

      // E. StudentAttendance
      const dupAttendances = await prisma.studentAttendance.findMany({ where: { studentId: dupId } });
      for (const att of dupAttendances) {
        const origAtt = await prisma.studentAttendance.findFirst({
          where: { studentId: keptId, classId: att.classId, sessionId: att.sessionId, date: att.date }
        });
        if (origAtt) {
          await prisma.studentAttendance.delete({ where: { studentAttendanceId: att.studentAttendanceId } });
        } else {
          await prisma.studentAttendance.update({
            where: { studentAttendanceId: att.studentAttendanceId },
            data: { studentId: keptId }
          });
        }
      }

      // F. PromotionEligibilityResult
      const dupElig = await prisma.promotionEligibilityResult.findMany({ where: { studentId: dupId } });
      for (const el of dupElig) {
        const origEl = await prisma.promotionEligibilityResult.findFirst({
          where: { studentId: keptId, examId: el.examId }
        });
        if (origEl) {
          await prisma.promotionEligibilityResult.delete({ where: { resultId: el.resultId } });
        } else {
          await prisma.promotionEligibilityResult.update({
            where: { resultId: el.resultId },
            data: { studentId: keptId }
          });
        }
      }

      // G. BulkPromotionBatchItem
      await prisma.bulkPromotionBatchItem.updateMany({ where: { studentId: dupId }, data: { studentId: keptId } });

      // H. Delete duplicate User account and Student record
      await prisma.user.deleteMany({ where: { accountId: dup.registrationNumber } });
      await prisma.students.delete({ where: { studentId: dupId } });

      studentDeduplicationCount++;
    }
  }

  console.log(`\nCompleted student deduplication. Merged and removed ${studentDeduplicationCount} duplicate student records.`);
  console.log('=== DATABASE CLEANUP COMPLETED SUCCESSFULLY ===');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
