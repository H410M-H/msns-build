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

export const DEFAULT_BANK_DETAILS: SchoolBankDetails = {
  bankName: "Meezan Bank Limited",
  accountTitle: "M. S. Naz High School",
  accountNumber: "02130104859682",
  iban: "PK45MEZN0002130104859682",
  branchCode: "0213",
  branchName: "Ghakhar Mandi Branch",
  isDefault: true,
};

export const UBL_BANK_DETAILS: SchoolBankDetails = {
  bankName: "United Bank Limited (UBL)",
  accountTitle: "Farah Naz",
  accountNumber: "0828304014084",
};

/** Keep configured accounts and add the UBL payment option without duplicating it. */
export function resolveVoucherBanks(
  details?: SchoolBankDetails | SchoolBankDetails[] | null,
): SchoolBankDetails[] {
  const banks = details ? (Array.isArray(details) ? details : [details]) : [];
  const effectiveBanks = banks.length > 0 ? banks : [DEFAULT_BANK_DETAILS];
  if (
    effectiveBanks.some(
      (bank) =>
        bank.accountNumber.replace(/\s|-/g, "") ===
        UBL_BANK_DETAILS.accountNumber,
    )
  ) {
    return effectiveBanks;
  }
  return [...effectiveBanks, UBL_BANK_DETAILS];
}
