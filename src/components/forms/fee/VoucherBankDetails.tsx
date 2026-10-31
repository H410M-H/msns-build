import React from "react";
import { type SchoolBankDetails } from "./voucher-branding";

export function VoucherBankDetails({ banks }: { banks: SchoolBankDetails[] }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {banks.map((bank) => (
        <div
          key={`${bank.bankName}-${bank.accountNumber}`}
          className="grid content-start gap-0.5"
        >
          <div>
            <span className="text-slate-500">Bank:</span>{" "}
            <strong>{bank.bankName}</strong>
          </div>
          {[bank.branchCode, bank.branchName].some(Boolean) && (
            <div>
              <span className="text-slate-500">Branch:</span>{" "}
              <strong>
                {[bank.branchCode, bank.branchName].filter(Boolean).join(" — ")}
              </strong>
            </div>
          )}
          <div>
            <span className="text-slate-500">A/C Title:</span>{" "}
            <strong>{bank.accountTitle}</strong>
          </div>
          <div>
            <span className="text-slate-500">A/C No:</span>{" "}
            <strong className="font-mono">{bank.accountNumber}</strong>
          </div>
          {bank.iban && (
            <div>
              <span className="text-slate-500">IBAN:</span>{" "}
              <strong className="break-all font-mono">{bank.iban}</strong>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
