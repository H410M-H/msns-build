import assert from "node:assert/strict";
import { test } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createRequire } from "node:module";
import type * as PrintableVoucherModule from "../src/components/forms/fee/PrintableVoucher";
import type * as FeeVoucherModule from "../src/components/forms/fee/FeeVoucher";
import { type VoucherData } from "../src/components/forms/fee/FeeVoucher";

// Load Next components through CJS so Node/tsx matches Next's default-export interop.
const require = createRequire(import.meta.url);
const { PrintableVoucher } =
  require("../src/components/forms/fee/PrintableVoucher") as typeof PrintableVoucherModule;
const { FeeVoucher } =
  require("../src/components/forms/fee/FeeVoucher") as typeof FeeVoucherModule;
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

const oldBank = {
  bankName: "Meezan Bank Limited",
  accountTitle: "Old School Account",
  accountNumber: "old-account-number",
  iban: "old-iban",
  branchCode: "old-branch",
};

void test("defaults use only UBL and preserve the leading zero", () => {
  for (const input of [undefined, null, []]) {
    assert.deepEqual(resolveVoucherBanks(input), [UBL_BANK_DETAILS]);
  }
  assert.equal(DEFAULT_BANK_DETAILS, UBL_BANK_DETAILS);
  assert.equal(UBL_BANK_DETAILS.accountNumber, "0828304014084");
});

void test("legacy configured bank accounts cannot replace or accompany UBL", () => {
  for (const input of [oldBank, [oldBank], [oldBank, UBL_BANK_DETAILS]]) {
    assert.deepEqual(resolveVoucherBanks(input), [UBL_BANK_DETAILS]);
  }
});

void test("UBL does not inherit Meezan's branch or IBAN", () => {
  const html = renderToStaticMarkup(
    <VoucherBankDetails banks={[UBL_BANK_DETAILS]} />,
  );
  assert.match(html, /United Bank Limited \(UBL\)/);
  assert.match(html, /Farah Naz/);
  assert.match(html, /0828304014084/);
  assert.doesNotMatch(html, /Branch:|IBAN:|0213|PK45MEZN/);
});

void test("both school and student copies show UBL and the official logo", () => {
  const html = renderToStaticMarkup(<PrintableVoucher data={data} />);
  assert.equal(html.match(/0828304014084/g)?.length, 2);
  assert.equal(html.match(/Farah Naz/g)?.length, 2);
  assert.doesNotMatch(html, /Meezan|old-account-number|old-iban|old-branch/);
  assert.equal(
    html.match(/alt="M\. S\. Naz High School official logo"/g)?.length,
    2,
  );
  assert.match(html, /Official_LOGO_grn_ic9ldd\.png/);
  assert.doesNotMatch(html, /logo\.svg|<svg[^>]*viewBox="0 0 512 512"/);
});

void test("legacy bulk-print voucher shows UBL and the official logo", () => {
  const html = renderToStaticMarkup(<FeeVoucher data={data} />);
  assert.match(html, /0828304014084/);
  assert.match(html, /Farah Naz/);
  assert.match(html, /Official_LOGO_grn_ic9ldd\.png/);
  assert.doesNotMatch(html, /logo\.svg|Meezan|old-account-number/);
});

void test("printable vouchers ignore other supplied accounts and do not repeat UBL", () => {
  const html = renderToStaticMarkup(
    <PrintableVoucher data={data} bankDetails={[oldBank, UBL_BANK_DETAILS]} />,
  );
  assert.doesNotMatch(html, /Meezan|old-account-number|old-iban|old-branch/);
  assert.equal(html.match(/0828304014084/g)?.length, 2);
});

void test("legacy bank details fetched with voucher data are excluded", () => {
  const html = renderToStaticMarkup(
    <PrintableVoucher data={{ ...data, bankDetails: [oldBank] }} />,
  );
  assert.doesNotMatch(html, /Meezan|old-account-number|old-iban|old-branch/);
  assert.equal(html.match(/0828304014084/g)?.length, 2);
});
