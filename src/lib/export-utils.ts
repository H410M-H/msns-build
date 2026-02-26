// Excel export utility functions
export interface ExportColumn {
  key: string;
  label: string;
  width?: number;
  format?: "currency" | "percent" | "date" | "text";
}

export interface ExportData {
  columns: ExportColumn[];
  rows: Record<string, unknown>[];
  sheetName?: string;
  title?: string;
}

// Generate CSV content from data
export function generateCSV(data: ExportData): string {
  const { columns, rows } = data;

  // Header row
  const header = columns.map((col) => `"${col.label}"`).join(",");

  // Data rows
  const dataRows = rows.map((row) =>
    columns
      .map((col) => {
        const value = row[col.key];
        if (value === null || value === undefined) return "";
        if (typeof value === "string")
          return value.includes(",") ? `"${value}"` : value;
        if (
          typeof value === "number" ||
          typeof value === "boolean" ||
          typeof value === "bigint"
        )
          return String(value);
        if (value instanceof Date) return value.toLocaleDateString();
        // Fix: Explicitly handle objects to satisfy no-base-to-string
        if (typeof value === "object") return JSON.stringify(value);
        // Fallback for symbols or guaranteed primitives
        return String(value as string | number | boolean | symbol | bigint);
      })
      .join(","),
  );

  return [header, ...dataRows].join("\n");
}

// Download file helper
export function downloadFile(
  content: string,
  filename: string,
  mimeType: string,
) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Export to CSV
export function exportToCSV(data: ExportData, filename: string) {
  const csv = generateCSV(data);
  downloadFile(csv, `${filename}.csv`, "text/csv;charset=utf-8;");
}

// Format value based on type
export function formatExportValue(
  value: unknown,
  format?: ExportColumn["format"],
): string {
  if (value === null || value === undefined) return "";

  switch (format) {
    case "currency":
      return `Rs. ${Number(value).toLocaleString()}`;
    case "percent":
      return `${Number(value).toFixed(1)}%`;
    case "date":
      if (value instanceof Date) return value.toLocaleDateString();
      // Fix: Handle non-Date objects before stringifying primitives
      if (typeof value === "object") return JSON.stringify(value);
      return String(value as string | number | boolean | symbol | bigint);
    default:
      // Fix: Check for object type before converting to string
      if (typeof value === "string") return value;
      if (
        typeof value === "number" ||
        typeof value === "boolean" ||
        typeof value === "bigint"
      )
        return String(value);
      if (value instanceof Date) return value.toLocaleDateString();
      if (typeof value === "object") return JSON.stringify(value);
      return String(value as string | number | boolean | symbol | bigint);
  }
}

// Generate monthly fee report data
export function generateMonthlyFeeReportData(
  classData: Array<{
    className: string;
    studentCount: number;
    yearlyTotals: {
      totalExpected: number;
      totalCollected: number;
      outstanding: number;
    };
    collectionRate: number;
    monthlyData: Array<{
      month: string;
      totalExpected: number;
      totalCollected: number;
    }>;
  }>,
  year: number,
): ExportData {
  const columns: ExportColumn[] = [
    { key: "className", label: "Class", width: 20 },
    { key: "studentCount", label: "Students", width: 10 },
    {
      key: "totalExpected",
      label: "Total Expected",
      width: 15,
      format: "currency",
    },
    {
      key: "totalCollected",
      label: "Total Collected",
      width: 15,
      format: "currency",
    },
    { key: "outstanding", label: "Outstanding", width: 15, format: "currency" },
    {
      key: "collectionRate",
      label: "Collection Rate",
      width: 15,
      format: "percent",
    },
  ];

  const rows = classData.map((cls) => ({
    className: cls.className,
    studentCount: cls.studentCount,
    totalExpected: cls.yearlyTotals.totalExpected,
    totalCollected: cls.yearlyTotals.totalCollected,
    outstanding: cls.yearlyTotals.outstanding,
    collectionRate: cls.collectionRate,
  }));

  return {
    columns,
    rows,
    sheetName: `Fee Report ${year}`,
    title: `Monthly Fee Collection Report - ${year}`,
  };
}

// Generate student fee ledger data
export function generateStudentLedgerData(
  student: { studentName: string; registrationNumber: string },
  ledger: Array<{
    month?: number;
    year?: number;
    baseFee: number;
    paidAmount: number;
    outstanding: number;
    isPaid: boolean;
    discountAmount: number;
    lateFee?: number;
  }>,
): ExportData {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const columns: ExportColumn[] = [
    { key: "period", label: "Period", width: 15 },
    { key: "baseFee", label: "Base Fee", width: 12, format: "currency" },
    { key: "discount", label: "Discount", width: 12, format: "currency" },
    { key: "lateFee", label: "Late Fee", width: 12, format: "currency" },
    { key: "paidAmount", label: "Paid", width: 12, format: "currency" },
    { key: "outstanding", label: "Outstanding", width: 12, format: "currency" },
    { key: "status", label: "Status", width: 10 },
  ];

  const rows = ledger.map((entry) => ({
    period: `${monthNames[(entry.month ?? 1) - 1]} ${entry.year}`,
    baseFee: entry.baseFee,
    discount: entry.discountAmount,
    lateFee: entry.lateFee ?? 0,
    paidAmount: entry.paidAmount,
    outstanding: entry.outstanding,
    status: entry.isPaid ? "Paid" : "Pending",
  }));

  return {
    columns,
    rows,
    sheetName: "Fee Ledger",
    title: `Fee Ledger - ${student.studentName} (${student.registrationNumber})`,
  };
}

// Generate defaulters report data
export function generateDefaultersReportData(
  defaulters: Array<{
    student: {
      studentName: string;
      registrationNumber: string;
      fatherMobile?: string;
    };
    class: { grade: string; section: string };
    dueAmount: number;
    month?: number;
    year?: number;
  }>,
  month: number,
  year: number,
): ExportData {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const columns: ExportColumn[] = [
    { key: "regNo", label: "Reg. No.", width: 15 },
    { key: "studentName", label: "Student Name", width: 25 },
    { key: "class", label: "Class", width: 15 },
    { key: "contact", label: "Contact", width: 15 },
    { key: "dueAmount", label: "Due Amount", width: 15, format: "currency" },
  ];

  const rows = defaulters.map((d) => ({
    regNo: d.student.registrationNumber,
    studentName: d.student.studentName,
    class: `${d.class.grade} - ${d.class.section}`,
    contact: d.student.fatherMobile ?? "N/A",
    dueAmount: d.dueAmount,
  }));

  return {
    columns,
    rows,
    sheetName: "Defaulters",
    title: `Fee Defaulters List - ${monthNames[month - 1]} ${year}`,
  };
}
