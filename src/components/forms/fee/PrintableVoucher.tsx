"use client";

import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { format } from "date-fns";
import { Scissors } from "lucide-react";
import { cn, getParentagePrefix } from "~/lib/utils";
import { type PaymentStatus, type VoucherType, type ConcessionCategory } from "@prisma/client";

// ==========================================
// Types & Contracts
// ==========================================

export interface SchoolBankDetails {
  bankId?: string;
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  iban?: string | null;
  branchCode?: string | null;
  branchName?: string | null;
  isDefault?: boolean;
}

export interface SchoolInfo {
  name: string;
  campus?: string;
  phone?: string;
  email?: string;
  address?: string;
  logoUrl?: string;
}

export interface VoucherStudent {
  studentId?: string;
  studentName: string;
  registrationNumber: string;
  admissionNumber?: string;
  fatherName: string;
  rollNumber?: string;
  gender?: string | null;
}

export interface VoucherGrade {
  grade: string;
  section: string;
  category?: string;
}

export interface VoucherSession {
  sessionName: string;
}

export interface VoucherBreakdown {
  tuitionFee: number;
  examFund?: number;
  computerLabFund?: number;
  studentIdCardFee?: number;
  infoAndCallsFee?: number;
  admissionFee?: number;
  arrears?: number;
  concessionCategory?: ConcessionCategory | string | null;
  concessionAmount?: number;
  exemptionAmount?: number;
  totalDiscount?: number;
  lateFee?: number;
  netPayableBeforeDue: number;
  netPayableAfterDue: number;
  amountPaid?: number;
  outstandingBalance?: number;
  paymentStatus?: PaymentStatus | string;
}

export interface PrintableVoucherData {
  sfcId: string;
  voucherNumber: string;
  voucherType: VoucherType | string;
  installmentNo: number;
  month: number;
  year: number;
  issueDate: Date | string;
  dueDate: Date | string;
  validityDate?: Date | string;
  subInstallmentIndex?: number | null;
  totalSubInstallments?: number | null;
  student: VoucherStudent;
  grade: VoucherGrade;
  session: VoucherSession;
  breakdown: VoucherBreakdown;
  qrPayload?: string;
  bankDetails?: SchoolBankDetails[];
}

export interface PrintableVoucherProps {
  data?: PrintableVoucherData | any;
  voucher?: PrintableVoucherData | any; // convenient alias
  bankDetails?: SchoolBankDetails | SchoolBankDetails[] | null;
  schoolInfo?: Partial<SchoolInfo>;
  className?: string;
}

// ==========================================
// Default Branding & Bank Details
// ==========================================

export const DEFAULT_SCHOOL_INFO: SchoolInfo = {
  name: "MUHAMMADAN SCIENCE NATIONAL SCHOOL",
  campus: "Main Campus • Excellence in Education",
  phone: "055-3882200",
  email: "info@msns.edu.pk",
  address: "Ghakhar, Gujranwala",
};

export const DEFAULT_BANK_DETAILS: SchoolBankDetails = {
  bankName: "Meezan Bank Limited",
  accountTitle: "Muhammadan Science National School",
  accountNumber: "02130104859682",
  iban: "PK45MEZN0002130104859682",
  branchCode: "0213",
  branchName: "Main Branch",
  isDefault: true,
};

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// ==========================================
// Helper Utilities
// ==========================================

export function formatPKR(amount?: number | null): string {
  const rounded = Math.round(Number(amount) || 0);
  return `Rs. ${rounded.toLocaleString("en-PK")}`;
}

export function formatSafeDate(date: Date | string | null | undefined, formatStr = "dd MMM yyyy"): string {
  if (!date) return "N/A";
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return "N/A";
    return format(d, formatStr);
  } catch {
    return "N/A";
  }
}

export function formatSafeISO(date: Date | string | null | undefined): string {
  if (!date) return new Date().toISOString().slice(0, 10);
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
    return d.toISOString().slice(0, 10);
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

/**
 * Normalizes input record (whether already formatted by getVoucherPrintData
 * or a raw database record) into a consistent PrintableVoucherData shape.
 */
export function normalizePrintableVoucherData(raw: any): PrintableVoucherData {
  if (!raw) {
    return {
      sfcId: "unknown-sfc",
      voucherNumber: "VCH-0000",
      voucherType: "REGULAR_INSTALLMENT",
      installmentNo: 1,
      month: 1,
      year: new Date().getFullYear(),
      issueDate: new Date(),
      dueDate: new Date(),
      student: {
        studentName: "Student Name",
        registrationNumber: "REG-0000",
        fatherName: "Father Name",
        gender: "MALE",
      },
      grade: {
        grade: "Grade",
        section: "Section",
      },
      session: {
        sessionName: "Current Session",
      },
      breakdown: {
        tuitionFee: 0,
        netPayableBeforeDue: 0,
        netPayableAfterDue: 300,
        lateFee: 300,
      },
    };
  }

  // Check if already in PrintableVoucherData shape
  if (raw.student && raw.grade && raw.breakdown) {
    return raw as PrintableVoucherData;
  }

  // Fallback normalization for raw FeeStudentClass records
  const studentClass = raw.StudentClass;
  const student = studentClass?.Students;
  const grade = studentClass?.Grades;
  const session = studentClass?.Sessions;
  const fee = raw.fees || {};

  const tuitionFee = Number(fee.tuitionFee ?? raw.tuitionFee ?? 0);
  const examFund = Number(fee.examFund ?? raw.examFund ?? 0);
  const computerLabFund = Number(fee.computerLabFund ?? raw.computerLabFund ?? 0);
  const studentIdCardFee = Number(fee.studentIdCardFee ?? raw.studentIdCardFee ?? 0);
  const infoAndCallsFee = Number(fee.infoAndCallsFee ?? raw.infoAndCallsFee ?? 0);
  const admissionFee = Number(fee.admissionFee ?? raw.admissionFee ?? 0);
  const arrears = Number(raw.adjustmentAmount > 0 ? raw.adjustmentAmount : (raw.arrears ?? 0));
  const lateFee = Number(raw.lateFee ?? 300);
  const concessionAmount = Number(raw.concessionAmount ?? 0);
  const exemptionAmount = Number(raw.exemptionAmount ?? 0);
  const totalDiscount = Number(raw.discount ?? (concessionAmount + exemptionAmount));

  const grossFee = tuitionFee + examFund + computerLabFund + studentIdCardFee + infoAndCallsFee + admissionFee + arrears;
  const netPayableBeforeDue = Math.max(0, grossFee - totalDiscount);
  const netPayableAfterDue = netPayableBeforeDue + (lateFee > 0 ? lateFee : 300);
  const amountPaid = Number(raw.amountPaid ?? (raw.isPaid ? netPayableBeforeDue : 0));
  const outstandingBalance = Math.max(0, netPayableBeforeDue - amountPaid);

  return {
    sfcId: raw.sfcId || raw.voucherId || "sfc-default",
    voucherNumber: raw.voucherNumber || raw.sfcId?.slice(-8)?.toUpperCase() || "VCH-PENDING",
    voucherType: raw.voucherType || "REGULAR_INSTALLMENT",
    installmentNo: raw.installmentNo ?? 1,
    month: raw.month ?? (new Date().getMonth() + 1),
    year: raw.year ?? new Date().getFullYear(),
    issueDate: raw.issueDate ?? new Date(),
    dueDate: raw.dueDate ?? new Date(),
    validityDate: raw.validityDate,
    subInstallmentIndex: raw.subInstallmentIndex,
    totalSubInstallments: raw.totalSubInstallments,
    student: {
      studentId: student?.studentId ?? raw.studentId,
      studentName: student?.studentName ?? raw.studentName ?? "Student Name",
      registrationNumber: student?.registrationNumber ?? raw.registrationNumber ?? "REG-0000",
      admissionNumber: student?.admissionNumber ?? raw.admissionNumber,
      fatherName: student?.fatherName ?? raw.fatherName ?? "Father Name",
      rollNumber: student?.admissionNumber ?? raw.rollNumber,
      gender: student?.gender ?? raw.gender ?? "MALE",
    },
    grade: {
      grade: grade?.grade ?? raw.className ?? raw.grade ?? "Grade",
      section: grade?.section ?? raw.section ?? "A",
      category: grade?.category ?? raw.category,
    },
    session: {
      sessionName: session?.sessionName ?? raw.sessionName ?? "Session",
    },
    breakdown: {
      tuitionFee,
      examFund,
      computerLabFund,
      studentIdCardFee,
      infoAndCallsFee,
      admissionFee,
      arrears,
      concessionCategory: raw.concessionCategory,
      concessionAmount,
      exemptionAmount,
      totalDiscount,
      lateFee,
      netPayableBeforeDue,
      netPayableAfterDue,
      amountPaid,
      outstandingBalance,
      paymentStatus: raw.paymentStatus ?? (raw.isPaid ? "PAID" : "PENDING"),
    },
    bankDetails: raw.bankDetails,
    qrPayload: raw.qrPayload,
  };
}

// ==========================================
// School Crest SVG Graphic
// ==========================================

function SchoolCrestSVG({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Outer Shield Border */}
      <path
        d="M50 4L88 20V48C88 72 50 96 50 96C50 96 12 72 12 48V20L50 4Z"
        fill="#0f172a"
        stroke="#1e293b"
        strokeWidth="3"
      />
      {/* Inner Accent Infill */}
      <path
        d="M50 9L82 22V46C82 67 50 89 50 89C50 89 18 67 18 46V22L50 9Z"
        fill="#047857"
      />
      {/* Open Book Motif */}
      <path
        d="M50 40C44 36 34 36 28 38V64C34 62 44 62 50 66C56 62 66 62 72 64V38C66 36 56 36 50 40Z"
        fill="#ffffff"
      />
      {/* Book Center Spine */}
      <line x1="50" y1="40" x2="50" y2="66" stroke="#047857" strokeWidth="2" />
      {/* Guiding Star */}
      <polygon
        points="50,20 53,27 60,28 55,33 56,40 50,36 44,40 45,33 40,28 47,27"
        fill="#fbbf24"
      />
    </svg>
  );
}

// ==========================================
// Single Voucher Copy Component
// (School Copy or Student Copy)
// ==========================================

interface VoucherCopyProps {
  voucher: PrintableVoucherData;
  bank: SchoolBankDetails;
  school: SchoolInfo;
  copyTitle: string;
  copySubtitle: string;
  copyBadgeColor: string;
}

function VoucherCopy({
  voucher,
  bank,
  school,
  copyTitle,
  copySubtitle,
  copyBadgeColor,
}: VoucherCopyProps) {
  const b = voucher.breakdown;
  const monthName = MONTH_NAMES[(voucher.month || 1) - 1] ?? `Month ${voucher.month}`;

  const issueDateStr = formatSafeDate(voucher.issueDate);
  const dueDateStr = formatSafeDate(voucher.dueDate);
  
  // Validity date: explicit or fallback to 15 days after due date
  const validityDateStr = voucher.validityDate
    ? formatSafeDate(voucher.validityDate)
    : voucher.dueDate
    ? formatSafeDate(new Date(new Date(voucher.dueDate).getTime() + 15 * 24 * 60 * 60 * 1000))
    : "N/A";

  const lateFeeFine = Number((b.lateFee ?? 0) > 0 ? b.lateFee : 300);
  const isPaid = b.paymentStatus === "PAID";
  const isPartiallyPaid = b.paymentStatus === "PARTIALLY_PAID" || (b.amountPaid !== undefined && b.amountPaid > 0 && !isPaid);

  // Sub-installment formatting
  const isSubInstallment = voucher.voucherType === "SUB_INSTALLMENT" && Boolean(voucher.subInstallmentIndex);
  const installmentLabel = isSubInstallment
    ? `Inst #${voucher.installmentNo} (Part ${voucher.subInstallmentIndex}/${voucher.totalSubInstallments || 2})`
    : `Installment #${voucher.installmentNo}`;

  // QR Payload: compact JSON payload { v, reg, amt, due, type }
  const netPayable = b.netPayableBeforeDue;
  const qrString =
    voucher.qrPayload && voucher.qrPayload.trim().length > 0
      ? voucher.qrPayload
      : JSON.stringify({
          v: voucher.voucherNumber,
          reg: voucher.student.registrationNumber || voucher.student.rollNumber || "REG-0000",
          amt: netPayable,
          due: formatSafeISO(voucher.dueDate),
          type: voucher.voucherType,
        });

  return (
    <div className="relative flex flex-col justify-between bg-white text-slate-900 border border-slate-300 rounded p-2.5 text-[10px] leading-tight select-none print:border-slate-400">
      {/* Watermark for Paid Status */}
      {isPaid && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
          <span className="text-7xl font-black tracking-widest text-emerald-800 rotate-[-25deg] uppercase">
            PAID RECEIPT
          </span>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. Header Section */}
      {/* ========================================================= */}
      <div>
        <div className="border-b border-slate-700 pb-1.5 mb-1.5">
          <div className="flex items-center justify-between gap-2">
            {/* School Crest & Identity */}
            <div className="flex items-center gap-2">
              <SchoolCrestSVG className="w-8 h-8 flex-shrink-0" />
              <div className="text-left">
                <h2 className="text-[12px] font-black tracking-wide text-slate-900 uppercase leading-none">
                  {school.name}
                </h2>
                <p className="text-[8px] text-slate-600 font-medium mt-0.5">
                  {school.campus} • Tel: {school.phone}
                </p>
              </div>
            </div>

            {/* Copy Badge & Voucher No */}
            <div className="text-right flex flex-col items-end">
              <span
                className={cn(
                  "inline-block font-bold text-[8.5px] px-2 py-0.5 rounded tracking-wider uppercase text-white shadow-xs",
                  copyBadgeColor
                )}
              >
                {copyTitle}
              </span>
              <span className="text-[7.5px] text-slate-500 italic mt-0.5">
                {copySubtitle}
              </span>
            </div>
          </div>

          {/* Sub-header Banner */}
          <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-200">
            <div className="font-mono font-bold text-[9px] text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300">
              Challan #: <span className="text-slate-950 font-black">{voucher.voucherNumber}</span>
            </div>
            <div className="inline-block bg-emerald-50 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded text-[8.5px] font-bold uppercase">
              Fee Challan • {monthName} {voucher.year} ({installmentLabel})
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. Student & Class Meta Grid */}
        {/* ========================================================= */}
        <div className="bg-slate-50/80 border border-slate-200 rounded p-1.5 mb-1.5 grid grid-cols-3 gap-x-2 gap-y-1 text-[9.5px]">
          <div>
            <span className="text-slate-500">Student Name:</span>{" "}
            <strong className="text-slate-900 uppercase block truncate">
              {voucher.student.studentName}
            </strong>
          </div>
          <div>
            <span className="text-slate-500">
              {getParentagePrefix(voucher.student.gender)}:
            </span>{" "}
            <strong className="text-slate-900 uppercase block truncate">
              {voucher.student.fatherName}
            </strong>
          </div>
          <div>
            <span className="text-slate-500">Reg / Roll No:</span>{" "}
            <strong className="font-mono text-slate-900 block truncate">
              {voucher.student.registrationNumber || voucher.student.rollNumber || "N/A"}
            </strong>
          </div>
          <div>
            <span className="text-slate-500">Class & Sec:</span>{" "}
            <strong className="text-slate-900 block">
              {voucher.grade.grade} - {voucher.grade.section}
            </strong>
          </div>
          <div>
            <span className="text-slate-500">Academic Session:</span>{" "}
            <strong className="text-slate-900 block truncate">
              {voucher.session.sessionName}
            </strong>
          </div>
          <div>
            <span className="text-slate-500">Challan Type:</span>{" "}
            <strong className="text-slate-900 uppercase block truncate">
              {voucher.voucherType.replace(/_/g, " ")}
            </strong>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. Challan Validity Panel */}
        {/* ========================================================= */}
        <div className="grid grid-cols-4 gap-1 mb-1.5 text-center text-[8.5px] bg-slate-100/90 p-1 rounded border border-slate-300">
          <div>
            <span className="block text-slate-500 uppercase text-[7.5px]">Voucher No</span>
            <strong className="font-mono text-slate-900 block truncate">{voucher.voucherNumber}</strong>
          </div>
          <div className="border-l border-slate-300">
            <span className="block text-slate-500 uppercase text-[7.5px]">Issue Date</span>
            <strong className="text-slate-800 block">{issueDateStr}</strong>
          </div>
          <div className="border-l border-slate-300 bg-red-50/70">
            <span className="block text-red-700 font-bold uppercase text-[7.5px]">Due Date</span>
            <strong className="text-red-700 font-black block">{dueDateStr}</strong>
          </div>
          <div className="border-l border-slate-300">
            <span className="block text-slate-500 uppercase text-[7.5px]">Validity Expiry</span>
            <strong className="text-slate-800 block">{validityDateStr}</strong>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 4. Itemized Fee Table */}
        {/* ========================================================= */}
        <table className="w-full text-[9px] border-collapse border border-slate-300 mb-1.5">
          <thead>
            <tr className="bg-slate-200 text-slate-800 font-bold border-b border-slate-300">
              <th className="text-left px-1.5 py-0.5">Itemized Fee Description</th>
              <th className="text-right px-1.5 py-0.5 w-24">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            <tr>
              <td className="px-1.5 py-0.5 text-slate-700">Tuition Fee</td>
              <td className="px-1.5 py-0.5 text-right font-medium">{formatPKR(b.tuitionFee)}</td>
            </tr>
            {Number(b.examFund) > 0 && (
              <tr>
                <td className="px-1.5 py-0.5 text-slate-700">Examination Fund</td>
                <td className="px-1.5 py-0.5 text-right font-medium">{formatPKR(b.examFund)}</td>
              </tr>
            )}
            {Number(b.computerLabFund) > 0 && (
              <tr>
                <td className="px-1.5 py-0.5 text-slate-700">Science / Computer Lab Fund</td>
                <td className="px-1.5 py-0.5 text-right font-medium">{formatPKR(b.computerLabFund)}</td>
              </tr>
            )}
            {Number(b.admissionFee) > 0 && (
              <tr>
                <td className="px-1.5 py-0.5 text-slate-700">Admission Fee</td>
                <td className="px-1.5 py-0.5 text-right font-medium">{formatPKR(b.admissionFee)}</td>
              </tr>
            )}
            {Number(b.studentIdCardFee) > 0 && (
              <tr>
                <td className="px-1.5 py-0.5 text-slate-700">Student ID Card Fee</td>
                <td className="px-1.5 py-0.5 text-right font-medium">{formatPKR(b.studentIdCardFee)}</td>
              </tr>
            )}
            {Number(b.infoAndCallsFee) > 0 && (
              <tr>
                <td className="px-1.5 py-0.5 text-slate-700">Info & Calls SMS Alerts</td>
                <td className="px-1.5 py-0.5 text-right font-medium">{formatPKR(b.infoAndCallsFee)}</td>
              </tr>
            )}
            {Number(b.arrears) > 0 && (
              <tr className="bg-amber-50">
                <td className="px-1.5 py-0.5 text-amber-900 font-semibold">Arrears Carried Forward</td>
                <td className="px-1.5 py-0.5 text-right font-bold text-amber-900">{formatPKR(b.arrears)}</td>
              </tr>
            )}
            {Number(b.concessionAmount) > 0 && (
              <tr className="bg-red-50/50 text-red-600 font-medium">
                <td className="px-1.5 py-0.5">
                  Concession / Scholarship ({b.concessionCategory ? String(b.concessionCategory).replace(/_/g, " ") : "Policy"})
                </td>
                <td className="px-1.5 py-0.5 text-right">- {formatPKR(b.concessionAmount)}</td>
              </tr>
            )}
            {Number(b.exemptionAmount) > 0 && (
              <tr className="bg-red-50/50 text-red-600 font-medium">
                <td className="px-1.5 py-0.5">Principal Discretionary Exemption</td>
                <td className="px-1.5 py-0.5 text-right">- {formatPKR(b.exemptionAmount)}</td>
              </tr>
            )}
            {/* Additional discount if any */}
            {Number(b.totalDiscount) > Number(b.concessionAmount ?? 0) + Number(b.exemptionAmount ?? 0) && (
              <tr className="bg-red-50/50 text-red-600 font-medium">
                <td className="px-1.5 py-0.5">Fee Discount / Waiver</td>
                <td className="px-1.5 py-0.5 text-right">
                  - {formatPKR(Number(b.totalDiscount) - (Number(b.concessionAmount ?? 0) + Number(b.exemptionAmount ?? 0)))}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* ========================================================= */}
        {/* 5. Dual Payment Highlights Panel */}
        {/* ========================================================= */}
        <div className="grid grid-cols-2 gap-1 mb-1.5">
          {/* Payable by Due Date */}
          <div className="bg-emerald-50 border border-emerald-300 rounded p-1 text-center">
            <span className="block text-[8px] uppercase font-bold text-emerald-800">
              Payable by Due Date
            </span>
            <span className="block text-[12px] font-black text-emerald-700">
              {formatPKR(b.netPayableBeforeDue)}
            </span>
          </div>

          {/* Payable after Due Date */}
          <div className="bg-red-50 border border-red-300 rounded p-1 text-center">
            <span className="block text-[8px] uppercase font-bold text-red-800">
              Payable after Due Date (+Late Fee {formatPKR(lateFeeFine)})
            </span>
            <span className="block text-[12px] font-black text-red-800">
              {formatPKR(b.netPayableAfterDue)}
            </span>
          </div>
        </div>

        {/* Partial Payment / Outstanding Balance Notice */}
        {isPartiallyPaid && (
          <div className="flex items-center justify-between bg-amber-50 border border-amber-300 rounded px-2 py-0.5 mb-1.5 text-[8.5px]">
            <div>
              <span className="text-amber-800 font-medium">Amount Paid:</span>{" "}
              <strong className="text-amber-950 font-bold">{formatPKR(b.amountPaid)}</strong>
            </div>
            <div>
              <span className="text-amber-800 font-medium">Outstanding Balance:</span>{" "}
              <strong className="text-red-700 font-black">{formatPKR(b.outstandingBalance)}</strong>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 6. Bottom Information Block: Bank Details, QR Code, Signatures */}
      {/* ========================================================= */}
      <div className="pt-1 border-t border-slate-300">
        <div className="grid grid-cols-12 gap-2 items-center">
          {/* Left: Bank Details & Instructions (6 cols) */}
          <div className="col-span-6 bg-slate-50 border border-slate-200 rounded p-1 text-[8px] text-slate-700 leading-tight">
            <p className="font-bold text-slate-900 uppercase text-[8.5px] border-b border-slate-200 pb-0.5 mb-0.5">
              School Bank Details:
            </p>
            <div className="grid grid-cols-2 gap-x-1 gap-y-0.5">
              <div>
                <span className="text-slate-500">Bank:</span> <strong>{bank.bankName}</strong>
              </div>
              <div>
                <span className="text-slate-500">Branch:</span> <strong>{bank.branchCode || "0213"}</strong>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500">A/C Title:</span> <strong>{bank.accountTitle}</strong>
              </div>
              <div>
                <span className="text-slate-500">A/C No:</span> <strong className="font-mono">{bank.accountNumber}</strong>
              </div>
              <div>
                <span className="text-slate-500">IBAN:</span>{" "}
                <strong className="font-mono text-[7px]">{bank.iban || "N/A"}</strong>
              </div>
            </div>
            <p className="text-[7px] text-slate-500 italic mt-0.5 pt-0.5 border-t border-slate-200">
              * Deposit at any online branch or accounts counter. Fee is non-refundable. Late fee strictly enforced after due date.
            </p>
          </div>

          {/* Center: Scannable 68x68 QR Code (2.5 cols) */}
          <div className="col-span-2 flex flex-col items-center justify-center">
            <div className="bg-white p-0.5 border border-slate-300 rounded shadow-2xs">
              <QRCodeSVG
                value={qrString}
                size={68}
                level="M"
                includeMargin={true}
                marginSize={2}
              />
            </div>
            <span className="text-[6.5px] text-slate-500 font-mono mt-0.5">
              Scan to Verify
            </span>
          </div>

          {/* Right: Dual Signatures (3.5 cols) */}
          <div className="col-span-4 flex flex-col justify-end space-y-3 text-center text-[7.5px]">
            <div className="border-t border-slate-400 pt-0.5">
              <span className="font-semibold text-slate-700 block">Bank Cashier / Stamp</span>
              <span className="text-[6.5px] text-slate-400 block">Collecting Branch Stamp</span>
            </div>
            <div className="border-t border-slate-400 pt-0.5">
              <span className="font-semibold text-slate-700 block">Authorized Accounts Officer</span>
              <span className="text-[6.5px] text-slate-400 block">MSNS Finance Division</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// Main PrintableVoucher Component
// Two-Part Layout: School Copy (top) and Student Copy (bottom)
// Separated by dashed cutting perforation line with scissors marker (✂)
// ==========================================

export const PrintableVoucher = React.forwardRef<HTMLDivElement, PrintableVoucherProps>(
  (props, ref) => {
    const rawData = props.data ?? props.voucher;
    const voucher = normalizePrintableVoucherData(rawData);

    // Resolve Bank Details with fallback
    let bank: SchoolBankDetails = DEFAULT_BANK_DETAILS;
    if (props.bankDetails) {
      bank = Array.isArray(props.bankDetails)
        ? props.bankDetails[0] ?? DEFAULT_BANK_DETAILS
        : props.bankDetails;
    } else if (voucher.bankDetails && voucher.bankDetails.length > 0) {
      bank = voucher.bankDetails[0] ?? DEFAULT_BANK_DETAILS;
    }

    // Merge School Info with defaults
    const school: SchoolInfo = {
      ...DEFAULT_SCHOOL_INFO,
      ...props.schoolInfo,
    };

    return (
      <div
        ref={ref}
        className={cn(
          "printable-voucher-root bg-white w-full max-w-[210mm] mx-auto text-slate-900 font-sans print:w-full print:max-w-none print:m-0 print:p-0",
          props.className
        )}
      >
        {/* ========================================================= */}
        {/* TOP COPY: School Copy (Accounts Office) */}
        {/* ========================================================= */}
        <div className="voucher-copy-school">
          <VoucherCopy
            voucher={voucher}
            bank={bank}
            school={school}
            copyTitle="SCHOOL COPY"
            copySubtitle="Accounts & Finance Record"
            copyBadgeColor="bg-slate-900"
          />
        </div>

        {/* ========================================================= */}
        {/* PERFORATION DIVIDER: Dashed cutting line with scissors marker (✂) */}
        {/* ========================================================= */}
        <div className="relative my-2.5 flex items-center justify-center print:my-2">
          {/* Dashed Perforation Line */}
          <div className="w-full border-b-2 border-dashed border-slate-400" />

          {/* Centered Scissors Marker & Perforation Text */}
          <div className="absolute bg-white px-2.5 py-0.5 text-slate-500 font-mono text-[8.5px] uppercase tracking-wider flex items-center gap-1.5 border border-dashed border-slate-300 rounded shadow-2xs">
            <Scissors className="w-3 h-3 text-slate-600 rotate-90" />
            <span>✂ TEAR / PERFORATION LINE — SCHOOL COPY (TOP) / STUDENT COPY (BOTTOM) ✂</span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* BOTTOM COPY: Student Copy (Parent Receipt) */}
        {/* ========================================================= */}
        <div className="voucher-copy-student">
          <VoucherCopy
            voucher={voucher}
            bank={bank}
            school={school}
            copyTitle="STUDENT COPY"
            copySubtitle="Student / Parent Receipt"
            copyBadgeColor="bg-emerald-800"
          />
        </div>
      </div>
    );
  }
);

PrintableVoucher.displayName = "PrintableVoucher";

export default PrintableVoucher;
