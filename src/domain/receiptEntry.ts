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
  if (voucher.accountLines.length) {
    return voucher.accountLines.map((line) => ({
      id: line.id,
      counterpartId: line.counterpartId,
      dc: line.debitCredit === "D" ? "DEBIT" : "CREDIT",
      accountCode: line.accountCode,
      accountDescription: "",
      particulars: line.particulars,
      analysisCode: line.analysis,
      billNo: line.billNo,
      billDate: line.billDate,
      currencyCode: line.currencyCode,
      exchangeRate: String(line.exchangeRate),
      amount: String(line.amount),
    }));
  }
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

export function addOppositeReceiptLine(
  voucher: Voucher,
  sourceId: string,
  newId: string,
): Voucher {
  const lines = getReceiptEntryLines(voucher);
  const sourceIndex = lines.findIndex((line) => line.id === sourceId);
  const source = lines[sourceIndex];
  if (
    !source ||
    !source.amount.trim() ||
    !Number.isFinite(Number(source.amount)) ||
    Number(source.amount) <= 0 ||
    !source.exchangeRate.trim() ||
    !Number.isFinite(Number(source.exchangeRate)) ||
    Number(source.exchangeRate) <= 0 ||
    !source.currencyCode
  )
    return voucher;
  if (
    source.counterpartId &&
    lines.some((line) => line.id === source.counterpartId)
  )
    return voucher;
  const opposite = source.dc === "DEBIT" ? "CREDIT" : "DEBIT";
  const existing = lines.find(
    (line) =>
      line.id !== sourceId &&
      line.dc === opposite &&
      !line.counterpartId &&
      line.currencyCode === source.currencyCode &&
      Number(line.exchangeRate) === Number(source.exchangeRate) &&
      Number(line.amount) === Number(source.amount),
  );
  if (existing)
    return withReceiptEntryLines(
      voucher,
      lines.map((line) =>
        line.id === sourceId
          ? { ...line, counterpartId: existing.id }
          : line.id === existing.id
            ? { ...line, counterpartId: sourceId }
            : line,
      ),
    );
  const counterpart: ReceiptEntryLine = {
    ...source,
    id: newId,
    counterpartId: sourceId,
    dc: opposite,
    accountCode:
      voucher.kind === "PAYMENT" ? voucher.bankCode : voucher.partyCode,
    accountDescription: "",
  };
  const next = [...lines];
  next[sourceIndex] = { ...source, counterpartId: newId };
  next.splice(sourceIndex + 1, 0, counterpart);
  return withReceiptEntryLines(voucher, next);
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
