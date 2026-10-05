import { ReceiptEntryLine, Voucher } from "./voucher";

export function receiptLineComplete(line: ReceiptEntryLine): boolean {
  return (
    !!line.accountCode.trim() &&
    !!line.amount.trim() &&
    Number.isFinite(Number(line.amount)) &&
    Number(line.amount) > 0 &&
    !!line.currencyCode &&
    !!line.exchangeRate.trim() &&
    Number.isFinite(Number(line.exchangeRate)) &&
    Number(line.exchangeRate) > 0
  );
}

export function getReceiptEntryLines(voucher: Voucher): ReceiptEntryLine[] {
  if (voucher.receiptEntryLines) return voucher.receiptEntryLines;
  return voucher.journalLines.map((line) => ({
    id: line.id,
    dc: line.debit > 0 ? "DEBIT" : "CREDIT",
    accountCode:
      line.accountHead === "Bank"
        ? voucher.bankCode
        : line.accountHead === "Receivables"
          ? voucher.partyCode
          : line.accountHead,
    accountDescription: "",
    particulars: line.description,
    analysisCode: voucher.analysisCode ?? "",
    billNo: "",
    billDate: "",
    currencyCode: voucher.currencyCode,
    exchangeRate: String(voucher.exchangeRate),
    amount: String((line.debit || line.credit) / (voucher.exchangeRate || 1)),
  }));
}

export function withReceiptEntryLines(
  voucher: Voucher,
  lines: ReceiptEntryLine[],
): Voucher {
  const debit = lines.find((line) => line.dc === "DEBIT");
  const numeric = (value: string) =>
    Number.isFinite(Number(value)) ? Number(value) : 0;
  const exchangeRate = debit
    ? numeric(debit.exchangeRate)
    : voucher.exchangeRate;
  const debitPkr = lines
    .filter((line) => line.dc === "DEBIT")
    .reduce(
      (sum, line) => sum + numeric(line.amount) * numeric(line.exchangeRate),
      0,
    );
  return {
    ...voucher,
    receiptEntryLines: lines,
    amount: exchangeRate > 0 ? debitPkr / exchangeRate : 0,
    currencyCode: debit?.currencyCode ?? voucher.currencyCode,
    exchangeRate,
    accountCode: debit?.accountCode ?? "",
    analysisCode: debit?.analysisCode ?? "",
    journalLines: lines.map((line) => {
      const amount = numeric(line.amount) * numeric(line.exchangeRate);
      return {
        id: line.id,
        accountHead: line.accountCode,
        description: line.particulars,
        debit: line.dc === "DEBIT" ? amount : 0,
        credit: line.dc === "CREDIT" ? amount : 0,
      };
    }),
  };
}
