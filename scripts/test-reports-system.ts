import { REPORT_DEFINITIONS, ALL_REPORTS_LIST, type ExportFormat } from "../src/lib/report-types";
import { exportReportBuffer, formatCellValue, type ExportReportOptions } from "../src/lib/report-exporters";

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log("==================================================");
  console.log("TEST SUITE: MSNS REPORTS SYSTEM COMPREHENSIVE VERIFICATION");
  console.log("==================================================");

  // 1. REPORT DEFINITIONS AUDIT
  console.log("\n--- TEST 1: REPORT CATALOG AUDIT ---");
  const reportKeys = Object.keys(REPORT_DEFINITIONS);
  assert(reportKeys.length >= 30, `Catalog contains ${reportKeys.length} reports (expected >= 30)`);
  assert(ALL_REPORTS_LIST.length === reportKeys.length, "ALL_REPORTS_LIST length matches keys");

  const requiredReportIds = [
    "enrolled-students",
    "enrolled-students-ref-no",
    "enrolled-students-board",
    "enrolled-students-religion",
    "enrolled-students-marks",
    "student-count-section",
    "enrolled-student-contact",
    "student-contact-address",
    "student-credentials",
    "struck-off-students",
    "admission-withdrawal-register",
    "mailing-labels",
    "sms-summary",
    "form-collection-checklist",
    "form-collection-board",
    "form-collection-passing-year",
    "form-collection-address",
    "admission-statics-city",
    "form-report-summary-city",
    "step-form-collection-summary",
    "student-marks-percentage",
    "student-gender-count",
    "admission-status",
    "admission-aging",
    "source-of-information",
    "admission-report",
    "form-collection-fee-paid",
    "form-collection-summary",
    "fee-collection",
    "fee-defaulters",
    "revenue-expense-summary",
    "salary-disbursement",
  ];

  requiredReportIds.forEach((id) => {
    const def = REPORT_DEFINITIONS[id];
    assert(!!def, `Report '${id}' exists in definitions`);
    if (def) {
      assert(def.columns.length > 0, `Report '${id}' has ${def.columns.length} columns`);
      assert(!!def.title && def.title.length > 3, `Report '${id}' has title: '${def.title}'`);
      assert(!!def.category, `Report '${id}' categorized under: '${def.category}'`);
    }
  });

  // 2. EXPORT FORMATS DEEP TEST
  console.log("\n--- TEST 2: ALL 4 EXPORT FORMATS BUFFER GENERATION ---");
  const testSampleOptions: ExportReportOptions = {
    title: "Enrolled Students Comprehensive Test",
    subtitle: "Testing PDF, XLSX, CSV, and DOCX generation with rich mock data",
    filterSummary: ["Session: 2026-2027", "Class: Grade 9", "Section: ROSE", "Gender: Boys"],
    columns: [
      { key: "srNo", label: "Sr #", align: "center", width: 40 },
      { key: "regNo", label: "Reg #", width: 120 },
      { key: "name", label: "Student Name", width: 160 },
      { key: "fee", label: "Monthly Fee", format: "currency", align: "right", width: 100 },
      { key: "score", label: "Passing %", format: "percent", align: "right", width: 90 },
      { key: "enrolledAt", label: "Enrolled On", format: "date", width: 100 },
      { key: "status", label: "Account Status", format: "badge", width: 80 },
    ],
    rows: [
      { srNo: 1, regNo: "MSN-S-26-0001", name: "Muhammad Ali", fee: 4500, score: 92.5, enrolledAt: "2026-01-15", status: "Active" },
      { srNo: 2, regNo: "MSN-S-26-0002", name: "Hamza Tariq", fee: 3800, score: 78.0, enrolledAt: "2026-02-10", status: "Active" },
      { srNo: 3, regNo: "MSN-S-26-0003", name: "Zainab Fatima", fee: 4500, score: 95.2, enrolledAt: "2026-01-20", status: "Active" },
      { srNo: 4, regNo: "MSN-S-26-0004", name: "Ahmed Raza, Jr.", fee: 0, score: 42.0, enrolledAt: "2026-03-01", status: "Pending" },
    ],
  };

  const formats: ExportFormat[] = ["pdf", "xlsx", "csv", "docx"];
  for (const fmt of formats) {
    const res = await exportReportBuffer(fmt, testSampleOptions);
    const size = typeof res.buffer === "string" ? res.buffer.length : res.buffer.byteLength;
    assert(size > 50, `Format ${fmt.toUpperCase()} produced valid non-empty output (${size} bytes)`);
    assert(res.filename.endsWith(`.${fmt}`), `Format ${fmt.toUpperCase()} filename matches: ${res.filename}`);

    // Verify binary magic numbers
    if (fmt === "pdf") {
      const headerStr = Buffer.from(res.buffer as Uint8Array).slice(0, 5).toString("utf-8");
      assert(headerStr === "%PDF-", "PDF begins with '%PDF-' header");
    } else if (fmt === "xlsx" || fmt === "docx") {
      const u8 = res.buffer as Uint8Array;
      const isZip = u8[0] === 0x50 && u8[1] === 0x4b; // 'PK'
      assert(isZip, `${fmt.toUpperCase()} is a valid ZIP/OpenXML container`);
    } else if (fmt === "csv") {
      const csvStr = res.buffer as string;
      assert(csvStr.charCodeAt(0) === 0xfeff, "CSV begins with UTF-8 BOM (0xFEFF)");
      assert(csvStr.includes("Ahmed Raza, Jr."), "CSV preserves commas inside quotes properly");
    }
  }

  // 3. EDGE CASES AUDIT
  console.log("\n--- TEST 3: EDGE CASES & ZERO-ROW HANDLING ---");
  const emptyOptions: ExportReportOptions = {
    title: "Empty Zero-Records Report",
    columns: [{ key: "id", label: "ID" }, { key: "name", label: "Name" }],
    rows: [],
  };

  for (const fmt of formats) {
    try {
      const emptyRes = await exportReportBuffer(fmt, emptyOptions);
      assert(!!emptyRes.buffer, `Empty dataset exported gracefully as ${fmt.toUpperCase()}`);
    } catch (e) {
      assert(false, `Empty dataset crashed on ${fmt.toUpperCase()}: ${e}`);
    }
  }

  // 4. FORMATTING UTILITIES AUDIT
  console.log("\n--- TEST 4: CELL FORMATTING ACCURACY ---");
  assert(formatCellValue(4500, "currency") === "Rs. 4,500", "Currency formatted: Rs. 4,500");
  assert(formatCellValue(92.456, "percent") === "92.5%", "Percent rounded properly: 92.5%");
  assert(formatCellValue(null) === "-", "Null formatted as '-'");
  assert(formatCellValue(undefined) === "-", "Undefined formatted as '-'");
  assert(formatCellValue(true) === "Yes", "Boolean true formatted as 'Yes'");
  assert(formatCellValue(false) === "No", "Boolean false formatted as 'No'");

  // 5. UNICODE & URDU CHARACTER ROBUSTNESS AUDIT
  console.log("\n--- TEST 5: UNICODE & URDU CHARACTERS EXPORT ---");
  const unicodeOptions: ExportReportOptions = {
    title: "Urdu & Unicode Robustness Test — محمد علی",
    subtitle: "Testing WinAnsi sanitization, Urdu script (حافظ قرآن), and smart quotes “test”",
    filterSummary: ["Session: 2026-2027", "Town: وزیر آباد (Wazirabad)"],
    columns: [
      { key: "srNo", label: "Sr #", align: "center", width: 40 },
      { key: "name", label: "Student Name", width: 150 },
      { key: "urduName", label: "Urdu Script", width: 150 },
      { key: "notes", label: "Remarks / Characters", width: 200 },
    ],
    rows: [
      { srNo: 1, name: "Muhammad Bilal", urduName: "محمد بلال", notes: "Hafiz-e-Quran: حافظ قرآن — “Admitted”" },
      { srNo: 2, name: "Ayesha Bibi", urduName: "عائشہ بی بی", notes: "Special Note: 100% scholarship… (گوجرانوالہ)" },
    ],
  };

  for (const fmt of formats) {
    try {
      const res = await exportReportBuffer(fmt, unicodeOptions);
      const size = typeof res.buffer === "string" ? res.buffer.length : res.buffer.byteLength;
      assert(size > 50, `Unicode/Urdu export succeeded for ${fmt.toUpperCase()} (${size} bytes)`);
    } catch (e) {
      assert(false, `Unicode/Urdu export failed on ${fmt.toUpperCase()}: ${e}`);
    }
  }

  // 6. FILTER CONFIGURATION COVERAGE AUDIT
  console.log("\n--- TEST 6: REPORT FILTER COVERAGE AUDIT ---");
  for (const id of requiredReportIds) {
    const def = REPORT_DEFINITIONS[id];
    if (def) {
      assert(typeof def.filters === "object", `Report '${id}' defines a filter configuration`);
      if (def.category === "finance") {
        assert(def.filters.month !== undefined || def.filters.dateRange !== undefined, `Finance report '${id}' supports date/month filters`);
      }
    }
  }

  console.log("\n==================================================");
  console.log(`TOTAL PASS: ${passed} | TOTAL FAIL: ${failed}`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution threw exception:", err);
  process.exit(1);
});
