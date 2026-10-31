import assert from "node:assert/strict";
import { test } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createRequire } from "node:module";
import { type VoucherData } from "../src/components/forms/fee/FeeVoucher";

// Load Next components through CJS so Node/tsx matches Next's default-export interop.
const require = createRequire(import.meta.url);
const { PrintableVoucher } =
  require("../src/components/forms/fee/PrintableVoucher") as typeof import("../src/components/forms/fee/PrintableVoucher");
const { FeeVoucher } =
  require("../src/components/forms/fee/FeeVoucher") as typeof import("../src/components/forms/fee/FeeVoucher");
import { VoucherBankDetails } from "../src/components/forms/fee/VoucherBankDetails";
import {
  DEFAULT_BANK_DETAILS,
  UBL_BANK_DETAILS,
  resolveVoucherBanks,
} from "../src/components/forms/fee/voucher-branding";

const data: VoucherData = {
  studentName: "Example Student",
  registrationNumber: "REG-TEST",
  fatherName: "Example Parent",
  className: "Grade 5",
  section: "A",
  sfcId: "example-voucher",
  month: 10,
  year: 2026,
  issueDate: new Date("2026-10-01"),
  tuitionFee: 1000,
  examFund: 0,
  computerLabFund: 0,
  studentIdCardFee: 0,
  infoAndCallsFee: 0,
  admissionFee: 0,
  lateFee: 0,
  discount: 0,
  totalDue: 1000,
  totalPaid: 0,
  isPaid: false,
};

test("defaults retain the existing bank and preserve UBL's leading zero", () => {
  for (const input of [undefined, null, []]) {
    assert.deepEqual(resolveVoucherBanks(input), [
      DEFAULT_BANK_DETAILS,
      UBL_BANK_DETAILS,
    ]);
  }
  assert.equal(UBL_BANK_DETAILS.accountNumber, "0828304014084");
});

test("configured accounts are retained without mutating or duplicating UBL", () => {
  const configured = {
    ...DEFAULT_BANK_DETAILS,
    accountNumber: "example-account",
  };
  const banks = [configured];
  assert.deepEqual(resolveVoucherBanks(banks), [configured, UBL_BANK_DETAILS]);
  assert.equal(banks.length, 1);
  assert.deepEqual(resolveVoucherBanks(configured), [
    configured,
    UBL_BANK_DETAILS,
  ]);
  const ubl = { ...UBL_BANK_DETAILS, accountNumber: "0828 3040-14084" };
  assert.deepEqual(resolveVoucherBanks([configured, ubl]), [configured, ubl]);
});

test("UBL does not inherit Meezan's branch or IBAN", () => {
  const html = renderToStaticMarkup(
    <VoucherBankDetails banks={[UBL_BANK_DETAILS]} />,
  );
  assert.match(html, /United Bank Limited \(UBL\)/);
  assert.match(html, /Farah Naz/);
  assert.match(html, /0828304014084/);
  assert.doesNotMatch(html, /Branch:|IBAN:|0213|PK45MEZN/);
});

test("both school and student copies show UBL and the official logo", () => {
  const html = renderToStaticMarkup(<PrintableVoucher data={data} />);
  assert.equal(html.match(/0828304014084/g)?.length, 2);
  assert.equal(html.match(/Farah Naz/g)?.length, 2);
  assert.equal(html.match(/Meezan Bank Limited/g)?.length, 2);
  assert.equal(
    html.match(/alt="M\. S\. Naz High School official logo"/g)?.length,
    2,
  );
  assert.match(html, /Official_LOGO_grn_ic9ldd\.png/);
  assert.doesNotMatch(html, /logo\.svg|<svg[^>]*viewBox="0 0 512 512"/);
});

test("legacy bulk-print voucher shows UBL and the official logo", () => {
  const html = renderToStaticMarkup(<FeeVoucher data={data} />);
  assert.match(html, /0828304014084/);
  assert.match(html, /Farah Naz/);
  assert.match(html, /Official_LOGO_grn_ic9ldd\.png/);
  assert.doesNotMatch(html, /logo\.svg/);
});

test("printable vouchers retain every supplied account and do not repeat UBL", () => {
  const configured = {
    ...DEFAULT_BANK_DETAILS,
    bankName: "Configured School Bank",
  };
  const html = renderToStaticMarkup(
    <PrintableVoucher
      data={data}
      bankDetails={[configured, UBL_BANK_DETAILS]}
    />,
  );
  assert.equal(html.match(/Configured School Bank/g)?.length, 2);
  assert.equal(html.match(/0828304014084/g)?.length, 2);
});

test("bank details from fetched voucher data also include the UBL option", () => {
  const html = renderToStaticMarkup(
    <PrintableVoucher
      data={{
        ...data,
        bankDetails: [
          { ...DEFAULT_BANK_DETAILS, bankName: "Fetched School Bank" },
        ],
      }}
    />,
  );
  assert.equal(html.match(/Fetched School Bank/g)?.length, 2);
  assert.equal(html.match(/0828304014084/g)?.length, 2);
});
