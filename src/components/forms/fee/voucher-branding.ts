export const SCHOOL_LOGO_URL = "/api/images/logos/Official_LOGO_grn_ic9ldd.png";

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

export const UBL_BANK_DETAILS: SchoolBankDetails = {
  bankName: "United Bank Limited (UBL)",
  accountTitle: "Farah Naz",
  accountNumber: "0828304014084",
};

export const DEFAULT_BANK_DETAILS = UBL_BANK_DETAILS;

/** Vouchers must use only the approved UBL account, including for older records. */
export function resolveVoucherBanks(
  _details?: SchoolBankDetails | SchoolBankDetails[] | null,
): SchoolBankDetails[] {
  return [UBL_BANK_DETAILS];
}
