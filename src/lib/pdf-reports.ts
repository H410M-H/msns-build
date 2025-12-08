import { PDFDocument, StandardFonts, rgb, type PDFPage, type PDFFont } from "pdf-lib";

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
  fileName?: string;
  orientation?: "portrait" | "landscape";
}

// Helper to calculate column widths based on label length
function calculateColumnWidths(
  headers: Array<{ key: string; label: string }>,
  totalWidth: number
): number[] {
  const colCount = headers.length;
  if (colCount === 0) return [];
  
  const baseWidth = totalWidth / colCount;
  return headers.map((header) => {
    const labelLength = header.label.length;
    if (labelLength > 15) {
      return baseWidth * 1.5;
    } else if (labelLength > 10) {
      return baseWidth * 1.2;
    }
    return baseWidth;
  });
}

// Helper to format values safely for PDF
function formatValueForPDF(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number") {
    if (Number.isInteger(value)) {
      return value.toLocaleString('en-IN');
    } else {
      return value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  if (value instanceof Date) {
    return value.toLocaleDateString('en-IN');
  }
  if (Array.isArray(value)) {
    return value.map(formatValueForPDF).join(", ");
  }
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return "[Object]";
    }
  }
  // Explicitly assert types to satisfy no-base-to-string rule
  return String(value as string | number | boolean | symbol | bigint);
}

// Helper to add page footer
function addPageFooter(
  page: PDFPage, 
  pageNumber: number, 
  width: number, 
  _height: number, 
  margin: number, 
  font: PDFFont
) {
  page.drawText(`Page ${pageNumber}`, {
    x: width - margin - 40,
    y: margin - 10,
    size: 9,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
}

// Main PDF generation function
export async function generatePdf(
  data: Array<Record<string, unknown>>,
  headers: Array<{ key: string; label: string }>,
  title: string
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let currentPage = pdfDoc.addPage([595.28, 841.89]); // A4 size
  let { width, height } = currentPage.getSize();
  const margin = 50;

  // Header Section
  currentPage.drawText("ACADEMIC INSTITUTE", {
    x: margin,
    y: height - 40,
    size: 18,
    font: boldFont,
    color: rgb(0, 0, 0),
  });

  currentPage.drawText(title, {
    x: margin,
    y: height - 70,
    size: 14,
    font: boldFont,
    color: rgb(0, 0, 0),
  });

  // Add current date
  const currentDate = new Date().toLocaleDateString();
  currentPage.drawText(`Generated on: ${currentDate}`, {
    x: width - margin - 100,
    y: height - 70,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });

  // Table Configuration
  const startY = height - 100;
  const rowHeight = 20;
  const colWidths = calculateColumnWidths(headers, width - margin * 2);

  // Draw Table Headers
  let xPos = margin;
  headers.forEach((header, index) => {
    const colWidth = colWidths[index] ?? 100; 

    currentPage.drawRectangle({
      x: xPos - 2,
      y: startY - 15,
      width: colWidth + 4,
      height: rowHeight,
      color: rgb(0.9, 0.9, 0.9),
    });

    currentPage.drawText(header.label, {
      x: xPos + 5,
      y: startY,
      size: 10,
      font: boldFont,
      maxWidth: colWidth - 10,
    });

    xPos += colWidth;
  });

  // Draw Table Rows
  let currentY = startY - rowHeight;
  let pageNumber = 1;

  data.forEach((row, rowIndex) => {
    // Check if we need a new page
    if (currentY < margin + rowHeight) {
      addPageFooter(currentPage, pageNumber, width, height, margin, font);
      currentPage = pdfDoc.addPage([595.28, 841.89]);
      ({ width, height } = currentPage.getSize()); 
      pageNumber++;
      currentY = height - margin - rowHeight;
      
      // Draw headers on new page
      xPos = margin;
      headers.forEach((header, index) => {
        const colWidth = colWidths[index] ?? 100;

        currentPage.drawRectangle({
          x: xPos - 2,
          y: currentY + 5,
          width: colWidth + 4,
          height: rowHeight,
          color: rgb(0.9, 0.9, 0.9),
        });
        
        currentPage.drawText(header.label, {
          x: xPos + 5,
          y: currentY + 20,
          size: 10,
          font: boldFont,
          maxWidth: colWidth - 10,
        });
        xPos += colWidth;
      });
      currentY -= rowHeight * 2;
    }

    // Alternate row colors
    if (rowIndex % 2 === 0) {
      xPos = margin;
      headers.forEach((_, colIndex) => {
        const colWidth = colWidths[colIndex] ?? 100;
        currentPage.drawRectangle({
          x: xPos - 2,
          y: currentY - 15,
          width: colWidth + 4,
          height: rowHeight,
          color: rgb(0.98, 0.98, 0.98),
          borderColor: rgb(0.8, 0.8, 0.8),
          borderWidth: 0.5,
        });
        xPos += colWidth;
      });
    }

    xPos = margin;
    headers.forEach((header, colIndex) => {
      const colWidth = colWidths[colIndex] ?? 100;
      const rawValue = row[header.key];
      const value = formatValueForPDF(rawValue);
      
      currentPage.drawText(value, {
        x: xPos + 5,
        y: currentY,
        size: 9,
        font,
        maxWidth: colWidth - 10,
      });
      xPos += colWidth;
    });

    currentY -= rowHeight;
  });

  // Add footer to last page
  addPageFooter(currentPage, pageNumber, width, height, margin, font);

  return pdfDoc.save();
}

// Format value based on type for exports
export function formatExportValue(value: unknown, format?: ExportColumn["format"]): string {
  if (value === null || value === undefined) return ""

  switch (format) {
    case "currency":
      const numValue = typeof value === 'string' ? parseFloat(value) : Number(value)
      return `Rs. ${isNaN(numValue) ? '0' : numValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    case "percent":
      const percentValue = typeof value === 'string' ? parseFloat(value) : Number(value)
      return `${isNaN(percentValue) ? '0.0' : percentValue.toFixed(1)}%`
    case "date":
      if (value instanceof Date) return value.toLocaleDateString('en-IN')
      if (typeof value === "string") {
        try {
          return new Date(value).toLocaleDateString('en-IN')
        } catch {
          return value
        }
      }
      if (typeof value === "number") {
        return new Date(value).toLocaleDateString('en-IN')
      }
      return formatValueForPDF(value)
    default:
      return formatValueForPDF(value)
  }
}

// Enhanced PDF generation with ExportData interface
export async function generateReportPdf(data: ExportData): Promise<Uint8Array> {
  const headers = data.columns.map(col => ({ key: col.key, label: col.label }));
  
  const formattedRows = data.rows.map(row => {
    const formattedRow: Record<string, unknown> = {};
    data.columns.forEach(col => {
      const value = row[col.key];
      formattedRow[col.key] = formatExportValue(value, col.format);
    });
    return formattedRow;
  });

  const title = data.title ?? "Report";
  return generatePdf(formattedRows, headers, title);
}

// Download PDF helper
export function downloadPdf(pdfBytes: Uint8Array, filename: string) {
  // Fix: Cast to any to resolve ArrayBufferLike mismatch in strict TS environments
  // This satisfies the Blob constructor which expects strictly ArrayBuffer, 
  // while Uint8Array might be inferred as having SharedArrayBuffer
  const blob = new Blob([pdfBytes as never], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Export to PDF
export async function exportToPDF(data: ExportData) {
  try {
    const pdfBytes = await generateReportPdf(data);
    const fileName = data.fileName ?? data.sheetName ?? 'export';
    downloadPdf(pdfBytes, fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}