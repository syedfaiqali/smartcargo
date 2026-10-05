import { Voucher } from "../../domain/voucher";
import { getReceiptEntryLines } from "../../domain/receiptEntry";
import {
  createExcelWorkbook,
  WorkbookCell,
  WorkbookSheet,
} from "../../utils/excelWorkbook";

export type VoucherPrintType =
  "Voucher" | "Debit Note" | "Credit Note" | "Cheque";
export interface VoucherPrintSettings {
  type: VoucherPrintType;
  currency: "PKR" | "FOREIGN";
  payTo: string;
  payeeAccountOnly: boolean;
  stamp: boolean;
  signatory1: string;
  signatory2: string;
}
export interface PrintTable {
  title: string;
  headers: string[];
  rows: WorkbookCell[][];
}
export interface VoucherPrintReport {
  title: string;
  reference: string;
  metadata: WorkbookCell[][];
  tables: PrintTable[];
  layout: {
    type: VoucherPrintType;
    branch: string;
    voucherDate: string;
    chequeNo: string;
    chequeDate: string;
    payTo: string;
    partyAddress: string;
    bankDetail: string;
    remarks: string;
    lines: ReturnType<typeof getReceiptEntryLines>;
  };
  cheque?: {
    amount: number;
    words: string;
    payTo: string;
    accountOnly: boolean;
    stamp: boolean;
    signatory1: string;
    signatory2: string;
  };
}
const date = (value: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? value.split("-").reverse().join("/")
    : value;

export function amountInWords(value: number): string {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  const words = (n: number): string =>
    n < 20
      ? ones[n]
      : n < 100
        ? `${tens[Math.floor(n / 10)]} ${ones[n % 10]}`.trim()
        : n < 1000
          ? `${ones[Math.floor(n / 100)]} Hundred ${words(n % 100)}`.trim()
          : n < 1000000
            ? `${words(Math.floor(n / 1000))} Thousand ${words(n % 1000)}`.trim()
            : n < 1000000000
              ? `${words(Math.floor(n / 1000000))} Million ${words(n % 1000000)}`.trim()
              : `${words(Math.floor(n / 1000000000))} Billion ${words(n % 1000000000)}`.trim();
  const paisa = Math.round(value * 100);
  const rupees = Math.floor(paisa / 100);
  return `${words(rupees) || "Zero"} Rupees${paisa % 100 ? ` and ${words(paisa % 100)} Paisa` : ""} Only`;
}

export function buildVoucherPrintReport(
  voucher: Voucher,
  settings: VoucherPrintSettings,
  context: { partyAddress?: string; bankDetail?: string } = {},
): VoucherPrintReport {
  const lines = getReceiptEntryLines(voucher);
  if (
    !lines.length ||
    lines.some(
      (line) =>
        !line.accountCode ||
        !Number.isFinite(Number(line.amount)) ||
        Number(line.amount) <= 0 ||
        !Number.isFinite(Number(line.exchangeRate)) ||
        Number(line.exchangeRate) <= 0,
    )
  )
    throw new Error(
      "Complete the account entries and valid amounts before printing.",
    );
  const debit = lines
    .filter((line) => line.dc === "DEBIT")
    .reduce(
      (sum, line) => sum + Number(line.amount) * Number(line.exchangeRate),
      0,
    );
  const credit = lines
    .filter((line) => line.dc === "CREDIT")
    .reduce(
      (sum, line) => sum + Number(line.amount) * Number(line.exchangeRate),
      0,
    );
  const report: VoucherPrintReport = {
    title: settings.type === "Voucher" ? "BANK PAYMENT VOUCHER" : settings.type === "Cheque" ? "Payee's Account Only" : `${settings.type.toUpperCase()} - ${voucher.branch}`,
    reference: voucher.voucherNo,
    metadata: [
      ["Voucher No.", voucher.voucherNo],
      ["Branch", voucher.branch],
      ["Voucher Date", date(voucher.voucherDate)],
      ["Status", voucher.void ? "VOID" : voucher.final ? "FINAL" : "DRAFT"],
      ["Received From", voucher.receivedFrom || voucher.partyName],
      ["Cheque No.", voucher.chequeNo ?? ""],
      ["Cheque Date", date(voucher.chequeDate ?? "")],
    ],
    tables: [],
    layout: {
      type: settings.type,
      branch: ({ KHI: "Karachi", LHE: "Lahore", ISB: "Islamabad" } as Record<string, string>)[voucher.branch] || voucher.branch,
      voucherDate: date(voucher.voucherDate),
      chequeNo: voucher.chequeNo || "",
      chequeDate: date(voucher.chequeDate || ""),
      payTo: settings.payTo || voucher.partyName || voucher.receivedFrom || "",
      partyAddress: context.partyAddress || "",
      bankDetail: context.bankDetail || "",
      remarks: voucher.remarks,
      lines,
    },
  };
  if (settings.type === "Cheque") {
    if (!settings.payTo.trim())
      throw new Error("Enter Pay To before printing a cheque.");
    if (
      !voucher.chequeNo ||
      !voucher.chequeDate ||
      !Number.isFinite(debit) ||
      debit <= 0 ||
      debit > 999999999999.99
    )
      throw new Error(
        "Enter a cheque number, cheque date and valid debit amount before printing a cheque.",
      );
    report.cheque = {
      amount: debit,
      words: amountInWords(debit),
      payTo: settings.payTo.trim(),
      accountOnly: settings.payeeAccountOnly,
      stamp: settings.stamp,
      signatory1: settings.signatory1,
      signatory2: settings.signatory2,
    };
    report.metadata.push(
      ["Pay To", settings.payTo],
      ["Currency", "PKR"],
      ["Amount", debit],
      ["Amount in Words", report.cheque.words],
      ["Payees A/C Only", settings.payeeAccountOnly ? "Yes" : "No"],
      ["Print Stamp", settings.stamp ? "Yes" : "No"],
      ["Signatory (1) Designation", settings.signatory1],
      ["Signatory (2) Designation", settings.signatory2],
    );
    return report;
  }
  if (settings.type === "Voucher") {
    report.tables.push({
      title: "Account Entries",
      headers: [
        "D/C",
        "Account",
        "Particulars",
        "Analysis",
        "Bill / Date",
        "Currency",
        "FC Amount",
        "Ex. Rate",
        "PKR Amount",
      ],
      rows: lines.map((line) => [
        line.dc === "DEBIT" ? "Debit" : "Credit",
        `${line.accountCode} ${line.accountDescription}`,
        line.particulars,
        line.analysisCode,
        [line.billNo, date(line.billDate)].filter(Boolean).join(" / "),
        line.currencyCode,
        Number(line.amount),
        line.exchangeRate,
        Number(line.amount) * Number(line.exchangeRate),
      ]),
    });
    report.tables.push({
      title: "Voucher Totals (PKR)",
      headers: ["Debit", "Credit", "Difference"],
      rows: [[debit, credit, debit - credit]],
    });
    if (voucher.clearingLines.length)
      report.tables.push({
        title: `Cleared Invoices (${voucher.currencyCode})`,
        headers: ["Invoice No.", "Job No.", "Amount"],
        rows: voucher.clearingLines.map((line) => [
          line.sourceDocNo,
          line.jobNo,
          line.amountCleared,
        ]),
      });
    if (voucher.costLines?.length)
      report.tables.push({
        title: "Cost Sheet (PKR)",
        headers: ["Account", "Description", "Job", "Invoice", "Expense Amount"],
        rows: voucher.costLines.map((line) => [
          line.accountCode,
          line.description,
          [line.masterJobPrefix, line.masterJobNo].filter(Boolean).join("-"),
          line.invoiceNo,
          line.amount,
        ]),
      });
  } else {
    const chosen = lines.filter(
      (line) =>
        line.dc === (settings.type === "Debit Note" ? "DEBIT" : "CREDIT"),
    );
    if (!chosen.length)
      throw new Error(
        `No ${settings.type === "Debit Note" ? "debit" : "credit"} entries are available for this note.`,
      );
    const totals = new Map<string, number>();
    const rows = chosen.map((line) => {
      const currency = settings.currency === "PKR" ? "PKR" : line.currencyCode;
      const amount =
        Number(line.amount) *
        (settings.currency === "PKR" ? Number(line.exchangeRate) : 1);
      totals.set(currency, (totals.get(currency) ?? 0) + amount);
      return [
        line.accountCode,
        line.accountDescription,
        line.particulars,
        line.billNo,
        date(line.billDate),
        currency,
        amount,
      ];
    });
    report.metadata.push([
      "Print Currency",
      settings.currency === "PKR" ? "PKR" : "Foreign Currency",
    ]);
    report.tables.push({
      title: settings.type,
      headers: [
        "Account Code",
        "Description",
        "Particulars",
        "Bill No.",
        "Bill Date",
        "Currency",
        "Amount",
      ],
      rows,
    });
    report.tables.push({
      title: "Totals",
      headers: ["Currency", "Amount"],
      rows: [...totals.entries()],
    });
  }
  if (voucher.remarks) report.metadata.push(["Remarks", voucher.remarks]);
  return report;
}

export function voucherReportSheets(
  report: VoucherPrintReport,
): WorkbookSheet[] {
  const layout = report.layout;
  if (layout.type === "Voucher") {
    const entries: WorkbookCell[][] = layout.lines.map(line => [
      line.accountCode, line.accountDescription, line.particulars,
      line.dc === "DEBIT" ? Number(line.amount) * Number(line.exchangeRate) : "",
      line.dc === "CREDIT" ? Number(line.amount) * Number(line.exchangeRate) : "",
    ]);
    const totals = report.tables[1].rows[0];
    return [{
      name: "Bank Payment Voucher",
      rows: [["Masum Logistics"], [report.title], ["Branch", layout.branch, "Cheque No.", layout.chequeNo],
        ["Voucher No.", report.reference, "Cheque Date", layout.chequeDate], ["Voucher Date", layout.voucherDate, "Pay To", layout.payTo], [],
        ["Account Code", "Account Description", "Particulars", "Debit", "Credit"], ...entries,
        ["PKR : " + amountInWords(Number(totals[0])).replace(" Rupees", ""), "", "", totals[0], totals[1]], [],
        ["Prepared By", "Checked By", "Approved By", "Received By"]],
      headerRows: [0, 1, 6, 7 + entries.length],
    }];
  }
  if (layout.type.includes("Note")) {
    const groups = new Map<string, WorkbookCell[][]>();
    report.tables[0].rows.forEach(row => {
      const key = `${row[0]}|${row[5]}`;
      groups.set(key, [...(groups.get(key) || []), row]);
    });
    return [...groups.values()].map((group, i) => {
      const currency = String(group[0][5]);
      const total = group.reduce((sum, row) => sum + Number(row[6]), 0);
      return { name: `${layout.type} ${i + 1}`, rows: [
        ["Masum Logistics"], [report.title], [String(group[0][1]), "", `${layout.type} No.`, report.reference],
        [layout.type === "Debit Note" ? layout.partyAddress : layout.bankDetail, "", "Date", layout.voucherDate],
        ["", "", "Branch", layout.branch], [], ["Particulars", `Amount ${currency}`],
        ...group.map(row => [String(row[2] || layout.remarks), Number(row[6])]),
        ["Pay To", layout.payTo], ["Cheque No.", layout.chequeNo], ["Cheque Date", layout.chequeDate],
        [currency + " : " + amountInWords(total).replace(" Rupees", ""), total], [],
        ["Prepared By", "Checked By", "Manager Finance"],
      ], headerRows: [0, 1, 6] };
    });
  }
  return [
    {
      name: report.title,
      rows: [[report.title], ...report.metadata],
      headerRows: [0],
    },
    ...report.tables.map((table) => ({
      name: table.title,
      rows: [table.headers, ...table.rows],
      headerRows: [0],
    })),
  ];
}
export function createVoucherExcel(report: VoucherPrintReport): Uint8Array {
  return createExcelWorkbook(voucherReportSheets(report));
}

// Native report layouts follow the existing MAWB and invoice report approach.
export { createVoucherPdf } from "./voucherReportPdf";
