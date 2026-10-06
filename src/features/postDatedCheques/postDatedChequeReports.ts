import { jsPDF } from "jspdf";
import { createExcelWorkbook, WorkbookCell } from "../../utils/excelWorkbook";
import {
  chequeStatuses,
  chequeTypes,
  PostDatedCheque,
} from "../../domain/postDatedCheque";
import { invoiceTotal } from "../../data/postDatedChequeService";

const date = (value: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? value.split("-").reverse().join("/")
    : value;
export function chequeReportRows(cheque: PostDatedCheque): WorkbookCell[][] {
  return [
    ["POST DATED CHEQUE RECEIVED"],
    ["Receipt No.", cheque.receiptNo],
    ["Branch", cheque.branch],
    ["Receipt Date", date(cheque.receiptDate)],
    ["Cheque No.", cheque.chequeNo],
    ["Cheque Date", date(cheque.chequeDate)],
    ["Cheque Amount", cheque.amount],
    ["Currency", cheque.currencyCode],
    ["Exchange Rate", cheque.exchangeRate],
    ["Party / Account", `${cheque.partyCode} — ${cheque.partyName}`],
    ["Bank Code", cheque.bankCode],
    ["Deposited Date", date(cheque.depositedDate)],
    ["Slip No.", cheque.slipNo],
    ["Cheque Type", chequeTypes[cheque.chequeType]],
    ["Cheque Status", chequeStatuses[cheque.chequeStatus]],
    ["Cleared Date", date(cheque.clearedDate)],
    ["Bank Receipt No.", cheque.bankReceiptNo],
    ["BRV Year", cheque.bankReceiptYear],
    ["Remarks", cheque.remarks],
    [],
    ["Invoice No.", "Job No.", "Applying Amount"],
    ...cheque.invoices.map((line) => [
      line.sourceDocNo,
      line.jobNo,
      line.amountCleared,
    ]),
    [],
    ["Transaction Total", cheque.amount],
    ["Detail Total", invoiceTotal(cheque)],
    ["Difference Total", cheque.amount - invoiceTotal(cheque)],
    [
      "Exchange Difference (PKR)",
      (cheque.amount - invoiceTotal(cheque)) * cheque.exchangeRate,
    ],
  ];
}
export function createPostDatedChequeExcel(cheque: PostDatedCheque) {
  return createExcelWorkbook([
    {
      name: "Cheque Receipt",
      rows: chequeReportRows(cheque),
      headerRows: [0, 20],
    },
  ]);
}
export function createPostDatedChequePdf(cheque: PostDatedCheque) {
  const pdf = new jsPDF();
  pdf.setProperties({ title: `Post Dated Cheque ${cheque.receiptNo}` });
  let y = 18;
  chequeReportRows(cheque).forEach((row, index) => {
    const text = row
      .map((value) =>
        typeof value === "number"
          ? value.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 4,
            })
          : String(value),
      )
      .join("    |    ");
    const lines: string[] = pdf.splitTextToSize(text, 182);
    const height = Math.max(1, lines.length) * 5 + 2;
    if (y + height > 278) {
      pdf.addPage();
      y = 18;
    }
    pdf.setFont("helvetica", index === 0 || index === 20 ? "bold" : "normal");
    pdf.setFontSize(index === 0 ? 14 : 10);
    pdf.text(lines, 14, y);
    y += height;
  });
  return pdf;
}
