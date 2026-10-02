import { PDFDocument, StandardFonts, rgb, type PDFPage } from "pdf-lib";
import * as XLSX from "xlsx";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  HeadingLevel,
  ShadingType,
  PageOrientation,
} from "docx";
import type { ReportColumn, ExportFormat } from "./report-types";

export interface ExportReportOptions {
  title: string;
  subtitle?: string;
  filterSummary?: string[];
  columns: ReportColumn[];
  rows: Record<string, unknown>[];
  orientation?: "portrait" | "landscape";
}

// ================= UTILITIES =================
export function formatCellValue(value: unknown, format?: ReportColumn["format"]): string {
  if (value === null || value === undefined) return "-";
  if (typeof value === "boolean") return value ? "Yes" : "No";

  if (typeof value === "number") {
    if (format === "currency") {
      return `Rs. ${value.toLocaleString("en-PK", { maximumFractionDigits: 0 })}`;
    }
    if (format === "percent") {
      return `${value.toFixed(1)}%`;
    }
    return String(value);
  }

  if (typeof value === "string") {
    if (format === "currency") {
      const num = parseFloat(value);
      if (isNaN(num)) return "-";
      return `Rs. ${num.toLocaleString("en-PK", { maximumFractionDigits: 0 })}`;
    }
    if (format === "percent") {
      const num = parseFloat(value);
      if (isNaN(num)) return "-";
      return `${num.toFixed(1)}%`;
    }
    if (format === "date") {
      const d = new Date(value);
      if (!isNaN(d.getTime()) && value.length >= 8) {
        return d.toLocaleDateString("en-PK", { year: "numeric", month: "short", day: "numeric" });
      }
    }
    return value;
  }

  if (value instanceof Date) {
    if (format === "date") {
      return value.toLocaleDateString("en-PK", { year: "numeric", month: "short", day: "numeric" });
    }
    return value.toLocaleDateString("en-PK");
  }

  if (typeof value === "bigint") {
    return value.toString();
  }

  return JSON.stringify(value);
}

// Sanitize text for standard Helvetica font in pdf-lib (WinAnsi encoding)
export function sanitizeForPdf(text: string): string {
  if (!text) return "";
  let out = "";
  for (let i = 0; i < text.length; i++) {
    const char = text[i]!;
    const code = text.charCodeAt(i);
    if (code >= 0x20 && code <= 0x7e) {
      out += char;
    } else if (code === 0x0a || code === 0x0d || code === 0x09) {
      out += " ";
    } else if (code >= 0xa0 && code <= 0xff) {
      out += char;
    } else if (code === 0x2018 || code === 0x2019) {
      out += "'";
    } else if (code === 0x201c || code === 0x201d) {
      out += '"';
    } else if (code === 0x2013 || code === 0x2014) {
      out += "-";
    } else if (code === 0x2022) {
      out += "*";
    } else if (code === 0x2026) {
      out += "...";
    } else if (code === 0x20ac) {
      out += "EUR";
    } else {
      out += "?";
    }
  }
  return out;
}

// ================= 1. PDF EXPORTER =================
export async function generatePdfReport(options: ExportReportOptions): Promise<Uint8Array> {
  const { title, subtitle, filterSummary, columns, rows } = options;
  const isLandscape = options.orientation === "landscape" || columns.length > 6;
  const pageWidth = isLandscape ? 841.89 : 595.28;
  const pageHeight = isLandscape ? 595.28 : 841.89;
  const margin = 35;

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let pageNumber = 1;
  let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);

  const safeDraw = (
    page: PDFPage,
    rawText: string,
    opts: Parameters<PDFPage["drawText"]>[1],
  ) => {
    try {
      const sanitized = sanitizeForPdf(rawText);
      page.drawText(sanitized, opts);
    } catch {
      try {
        const asciiOnly = rawText.replace(/[^\x20-\x7E]/g, "?");
        page.drawText(asciiOnly, opts);
      } catch {
        // Fallback gracefully without throwing
      }
    }
  };

  const drawHeader = (page: PDFPage) => {
    // School Title
    safeDraw(page, "M.S. NAZ HIGH SCHOOL", {
      x: margin,
      y: pageHeight - 35,
      size: 14,
      font: boldFont,
      color: rgb(0.04, 0.45, 0.35), // emerald-700
    });

    safeDraw(page, "Affiliated with BISE Gujranwala | School ERP Academic System", {
      x: margin,
      y: pageHeight - 48,
      size: 8,
      font,
      color: rgb(0.35, 0.4, 0.45),
    });

    // Report Title
    safeDraw(page, title.toUpperCase(), {
      x: margin,
      y: pageHeight - 65,
      size: 11,
      font: boldFont,
      color: rgb(0.1, 0.1, 0.1),
    });

    // Subtitle / Filters
    const filterText = filterSummary && filterSummary.length > 0
      ? `Filters: ${filterSummary.join(" | ")}`
      : subtitle ?? "";

    if (filterText) {
      safeDraw(page, filterText.slice(0, 120), {
        x: margin,
        y: pageHeight - 78,
        size: 8,
        font,
        color: rgb(0.4, 0.4, 0.4),
      });
    }

    // Generated Date / Time
    const dateStr = `Generated: ${new Date().toLocaleDateString("en-PK")} ${new Date().toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" })}`;
    safeDraw(page, dateStr, {
      x: pageWidth - margin - 150,
      y: pageHeight - 35,
      size: 7.5,
      font,
      color: rgb(0.45, 0.45, 0.45),
    });
  };

  const drawFooter = (page: PDFPage, currentPg: number) => {
    safeDraw(page, `Page ${currentPg}`, {
      x: pageWidth - margin - 45,
      y: margin - 15,
      size: 8,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
    safeDraw(page, "Confidential - For M.S. Naz High School Administration & Regulatory Filing", {
      x: margin,
      y: margin - 15,
      size: 7,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
  };

  // Table setup
  const totalUsableWidth = pageWidth - margin * 2;
  const totalWeight = columns.reduce((acc, col) => acc + (col.width ?? 100), 0);
  const colWidths = columns.map((col) => ((col.width ?? 100) / totalWeight) * totalUsableWidth);

  const startY = pageHeight - 95;
  const rowHeight = 18;
  const headerHeight = 20;

  const drawTableHeader = (page: PDFPage, y: number) => {
    let x = margin;
    columns.forEach((col, idx) => {
      const w = colWidths[idx] ?? 80;
      page.drawRectangle({
        x,
        y: y - 5,
        width: w,
        height: headerHeight,
        color: rgb(0.04, 0.45, 0.35),
      });

      const label = col.label;
      safeDraw(page, label, {
        x: x + 4,
        y: y + 5,
        size: 8,
        font: boldFont,
        color: rgb(1, 1, 1),
        maxWidth: w - 8,
      });
      x += w;
    });
  };

  drawHeader(currentPage);
  drawTableHeader(currentPage, startY);

  let currentY = startY - headerHeight;

  rows.forEach((row, rowIndex) => {
    if (currentY < margin + rowHeight + 10) {
      drawFooter(currentPage, pageNumber);
      currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      pageNumber++;
      drawHeader(currentPage);
      drawTableHeader(currentPage, startY);
      currentY = startY - headerHeight;
    }

    const isEven = rowIndex % 2 === 0;
    let x = margin;

    columns.forEach((col, colIndex) => {
      const w = colWidths[colIndex] ?? 80;

      // Draw background
      currentPage.drawRectangle({
        x,
        y: currentY - 4,
        width: w,
        height: rowHeight,
        color: isEven ? rgb(0.97, 0.98, 0.99) : rgb(1, 1, 1),
        borderColor: rgb(0.88, 0.9, 0.92),
        borderWidth: 0.5,
      });

      const rawVal = row[col.key];
      const textVal = formatCellValue(rawVal, col.format);

      safeDraw(currentPage, textVal, {
        x: x + 4,
        y: currentY + 3,
        size: 7.5,
        font,
        color: rgb(0.15, 0.15, 0.15),
        maxWidth: w - 8,
      });

      x += w;
    });

    currentY -= rowHeight;
  });

  drawFooter(currentPage, pageNumber);

  return pdfDoc.save();
}

// ================= 2. XLSX EXPORTER =================
export function generateXlsxReport(options: ExportReportOptions): Uint8Array {
  const { title, filterSummary, columns, rows } = options;

  const aoa: unknown[][] = [
    ["M.S. NAZ HIGH SCHOOL - OFFICIAL ERP REPORT"],
    [title.toUpperCase()],
    [`Generated: ${new Date().toLocaleString("en-PK")}`],
  ];

  if (filterSummary && filterSummary.length > 0) {
    aoa.push([`Filters: ${filterSummary.join(" | ")}`]);
  } else {
    aoa.push([]);
  }
  aoa.push([]); // blank separator

  // Header row
  aoa.push(columns.map((c) => c.label));

  // Data rows
  rows.forEach((row) => {
    const rowValues = columns.map((col) => {
      const raw = row[col.key];
      if (raw === null || raw === undefined) return "";
      if (col.format === "currency" || col.format === "percent") {
        if (typeof raw === "number") return raw;
        if (typeof raw === "string") {
          const num = parseFloat(raw);
          return isNaN(num) ? raw : num;
        }
        return formatCellValue(raw, col.format);
      }
      if (col.format === "date") {
        return formatCellValue(raw, "date");
      }
      if (typeof raw === "string" || typeof raw === "number" || typeof raw === "boolean") {
        return raw;
      }
      return formatCellValue(raw, col.format);
    });
    aoa.push(rowValues);
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // Auto-width computation
  const colWidths = columns.map((col) => {
    let maxLen = col.label.length;
    rows.slice(0, 100).forEach((row) => {
      const val = formatCellValue(row[col.key], col.format);
      if (val.length > maxLen) maxLen = val.length;
    });
    return { wch: Math.min(Math.max(maxLen + 3, 10), 40) };
  });

  ws["!cols"] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, "Report");
  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
  return new Uint8Array(buffer);
}

// ================= 3. CSV EXPORTER =================
export function generateCsvReport(options: ExportReportOptions): string {
  const { columns, rows } = options;

  const escapeCsv = (val: string): string => {
    if (val.includes(",") || val.includes('"') || val.includes("\n") || val.includes("\r")) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const headerLine = columns.map((c) => escapeCsv(c.label)).join(",");
  const dataLines = rows.map((row) => {
    return columns
      .map((col) => {
        const text = formatCellValue(row[col.key], col.format);
        return escapeCsv(text);
      })
      .join(",");
  });

  // UTF-8 BOM for Excel compatibility
  return "\uFEFF" + [headerLine, ...dataLines].join("\r\n");
}

// ================= 4. DOCX EXPORTER =================
export async function generateDocxReport(options: ExportReportOptions): Promise<Uint8Array> {
  const { title, subtitle, filterSummary, columns, rows } = options;
  const isLandscape = options.orientation === "landscape" || columns.length > 6;

  const filterText = filterSummary && filterSummary.length > 0
    ? `Filters Applied: ${filterSummary.join(" | ")}`
    : subtitle ?? "";

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              orientation: isLandscape ? PageOrientation.LANDSCAPE : PageOrientation.PORTRAIT,
            },
            margin: { top: 720, bottom: 720, left: 720, right: 720 },
          },
        },
        children: [
          new Paragraph({
            text: "M.S. NAZ HIGH SCHOOL",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 80 },
          }),
          new Paragraph({
            text: "Affiliated with BISE Gujranwala — School ERP Academic Management System",
            alignment: AlignmentType.CENTER,
            spacing: { after: 140 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: title.toUpperCase(), bold: true, size: 24 }),
            ],
            alignment: AlignmentType.LEFT,
            spacing: { after: 80 },
          }),
          ...(filterText
            ? [
                new Paragraph({
                  children: [
                    new TextRun({ text: filterText, italics: true, size: 18, color: "555555" }),
                  ],
                  spacing: { after: 120 },
                }),
              ]
            : []),
          new Paragraph({
            children: [
              new TextRun({
                text: `Generated on: ${new Date().toLocaleDateString("en-PK")} ${new Date().toLocaleTimeString("en-PK")}`,
                size: 16,
                color: "777777",
              }),
            ],
            spacing: { after: 200 },
          }),

          // Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              // Header Row
              new TableRow({
                tableHeader: true,
                children: columns.map(
                  (col) =>
                    new TableCell({
                      shading: { type: ShadingType.CLEAR, fill: "047857" }, // emerald-700
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({ text: col.label, bold: true, color: "FFFFFF", size: 16 }),
                          ],
                          alignment: col.align === "right" ? AlignmentType.RIGHT : AlignmentType.LEFT,
                        }),
                      ],
                    }),
                ),
              }),

              // Data Rows
              ...rows.map((row, idx) => {
                const isEven = idx % 2 === 0;
                return new TableRow({
                  children: columns.map((col) => {
                    const text = formatCellValue(row[col.key], col.format);
                    return new TableCell({
                      shading: {
                        type: ShadingType.CLEAR,
                        fill: isEven ? "F8FAFC" : "FFFFFF",
                      },
                      children: [
                        new Paragraph({
                          children: [new TextRun({ text, size: 16 })],
                          alignment: col.align === "right" ? AlignmentType.RIGHT : AlignmentType.LEFT,
                        }),
                      ],
                    });
                  }),
                });
              }),
            ],
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return new Uint8Array(buffer);
}

// ================= UNIFIED EXPORT DISPATCHER =================
export async function exportReportBuffer(
  format: ExportFormat,
  options: ExportReportOptions,
): Promise<{ buffer: Uint8Array | string; mimeType: string; filename: string }> {
  const sanitizedTitle = options.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const timestamp = new Date().toISOString().slice(0, 10);
  const baseFilename = `${sanitizedTitle}-${timestamp}`;

  switch (format) {
    case "pdf": {
      const pdfBytes = await generatePdfReport(options);
      return {
        buffer: pdfBytes,
        mimeType: "application/pdf",
        filename: `${baseFilename}.pdf`,
      };
    }
    case "xlsx": {
      const xlsxBytes = generateXlsxReport(options);
      return {
        buffer: xlsxBytes,
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filename: `${baseFilename}.xlsx`,
      };
    }
    case "csv": {
      const csvStr = generateCsvReport(options);
      return {
        buffer: csvStr,
        mimeType: "text/csv;charset=utf-8;",
        filename: `${baseFilename}.csv`,
      };
    }
    case "docx": {
      const docxBytes = await generateDocxReport(options);
      return {
        buffer: docxBytes,
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename: `${baseFilename}.docx`,
      };
    }
  }
}
