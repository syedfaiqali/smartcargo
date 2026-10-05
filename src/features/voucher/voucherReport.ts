import { jsPDF } from 'jspdf';
import { bankRepo } from '../../data/masterDataService';
import { controlCodeRepo } from '../../data/financeSetupService';
import { Voucher } from '../../domain/voucher';

export type VoucherPrintDocument = 'VOUCHER' | 'DEBIT_NOTE' | 'CREDIT_NOTE' | 'CHEQUE';
export interface ChequePrintOptions {
  payTo: string;
  printPayeeAccountOnly: boolean;
  printStamp: boolean;
  signatoryOne: string;
  signatoryTwo: string;
}

const headerUrl = `${import.meta.env.BASE_URL}masum-logistics-header.png`;
let headerImage: string | undefined;

async function loadHeaderImage(): Promise<string> {
  if (headerImage) return headerImage;
  const response = await fetch(headerUrl);
  if (!response.ok) throw new Error('The debit-note report header could not be loaded.');
  const blob = await response.blob();
  headerImage = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
  return headerImage;
}

type ReportLine = { accountCode: string; description: string; particulars: string; debit: number; credit: number };

const money = (value: number) => (Number(value) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const date = (value?: string) => value ? new Intl.DateTimeFormat('en-GB').format(new Date(`${value}T00:00:00`)) : '—';
const wordsUnderTwenty = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const wordsTens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function underThousand(value: number): string {
  if (value < 20) return wordsUnderTwenty[value];
  if (value < 100) return `${wordsTens[Math.floor(value / 10)]}${value % 10 ? ` ${wordsUnderTwenty[value % 10]}` : ''}`;
  return `${wordsUnderTwenty[Math.floor(value / 100)]} Hundred${value % 100 ? ` ${underThousand(value % 100)}` : ''}`;
}

function amountInWords(value: number, currency: string): string {
  const amount = Math.floor(Math.abs(Number(value) || 0));
  const groups: [number, string][] = [[Math.floor(amount / 10000000), 'Crore'], [Math.floor(amount / 100000) % 100, 'Lakh'], [Math.floor(amount / 1000) % 100, 'Thousand'], [amount % 1000, '']];
  const text = groups.filter(([number]) => number).map(([number, label]) => `${underThousand(number)}${label ? ` ${label}` : ''}`).join(' ') || 'Zero';
  return `${currency} ${value < 0 ? 'Minus ' : ''}${text} Only`;
}

function reportLines(voucher: Voucher): ReportLine[] {
  const codes = controlCodeRepo.list();
  const describe = (code: string) => codes.find((item) => item.code === code)?.name || code || '—';
  if (voucher.accountLines.length) {
    return voucher.accountLines.map((line) => ({
      accountCode: line.accountCode || '—',
      description: describe(line.accountCode),
      particulars: line.particulars || voucher.remarks || '—',
      debit: line.debitCredit === 'D' ? line.amount * (line.exchangeRate || 1) : 0,
      credit: line.debitCredit === 'C' ? line.amount * (line.exchangeRate || 1) : 0,
    }));
  }

  const cleared = voucher.clearingLines.map((line) => ({
    accountCode: voucher.partyCode || '—', description: voucher.partyName || voucher.partyCode || 'Party',
    particulars: `${line.sourceDocNo}${line.jobNo ? ` / Job: ${line.jobNo}` : ''}`,
    debit: voucher.kind === 'PAYMENT' ? line.amountCleared : 0,
    credit: voucher.kind === 'RECEIPT' ? line.amountCleared : 0,
  }));
  const bank = bankRepo.get(voucher.bankCode);
  const bankAmount = voucher.amount * (voucher.exchangeRate || 1);
  return [...cleared, {
    accountCode: voucher.bankCode || voucher.accountCode || 'CASH', description: bank?.name || voucher.bankCode || 'Cash',
    particulars: voucher.remarks || `${voucher.kind === 'PAYMENT' ? 'Payment' : 'Receipt'} against voucher ${voucher.voucherNo}`,
    debit: voucher.kind === 'RECEIPT' ? bankAmount : 0, credit: voucher.kind === 'PAYMENT' ? bankAmount : 0,
  }];
}

/** Creates the selected voucher as a printable A4 PDF. */
export async function printVoucherReport(voucher: Voucher, document: VoucherPrintDocument = 'VOUCHER', printCurrency: 'PKR' | 'FOREIGN' = 'PKR', chequeOptions?: ChequePrintOptions): Promise<void> {
  if (document === 'DEBIT_NOTE' || document === 'CREDIT_NOTE') {
    await printFinanceNoteReport(voucher, document === 'CREDIT_NOTE' ? 'CREDIT' : 'DEBIT', printCurrency);
    return;
  }
  if (document === 'CHEQUE') {
    printChequeReport(voucher, chequeOptions);
    return;
  }
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const lines = reportLines(voucher);
  const left = 8; const right = 202; const width = right - left;
  const debitTotal = lines.reduce((total, line) => total + line.debit, 0);
  const creditTotal = lines.reduce((total, line) => total + line.credit, 0);
  const heading = voucher.kind === 'PAYMENT' ? 'BANK PAYMENT VOUCHER' : voucher.kind === 'RECEIPT' ? 'BANK RECEIPT VOUCHER' : 'JOURNAL VOUCHER';
  const text = (value: string, x: number, y: number, size = 8, bold = false, align: 'left' | 'center' | 'right' = 'left') => doc.setFont('times', bold ? 'bold' : 'normal').setFontSize(size).text(value, x, y, { align });
  const field = (label: string, value: string, x: number, y: number) => { text(label, x, y, 8.5, true); text(':', x + 25, y, 8.5, true); text(value || '—', x + 29, y, 8.5, true); };
  const drawHeader = (page: number) => {
    text('Masum Logistics', 105, 14, 14, true, 'center');
    doc.setLineWidth(0.35).line(left, 19, right, 19);
    text(heading, 105, 25, 11, true, 'center');
    doc.setLineWidth(0.2).line(74, 27, 136, 27);
    text(`Page : ${page} / ${page}`, right, 25, 7.5, true, 'right');
  };

  drawHeader(1);
  field('Branch', voucher.branch, 12, 35); field('Cheque No.', voucher.chequeNo, 130, 35);
  field('Voucher No.', voucher.voucherNo, 12, 41); field('Cheque Date', date(voucher.chequeDate), 130, 41);
  field('Voucher Date', date(voucher.voucherDate), 12, 47); field(voucher.kind === 'RECEIPT' ? 'Received From' : 'Pay To', voucher.receivedFrom || voucher.partyName, 70, 47);

  // These widths add up exactly to the printable table width (194 mm).
  // Keeping that boundary exact prevents the last cells from overflowing.
  const columns = [18, 60, 76, 20, 20];
  const headers = ['Account\nCode', 'Account Description', 'Particulars', 'Debit', 'Credit'];
  let y = 53;
  const tableHeader = () => {
    let x = left;
    headers.forEach((header, index) => {
      // Keep the header unfilled. Some embedded PDF viewers render a jsPDF
      // filled rectangle as black even when a light-gray fill is requested.
      doc.rect(x, y, columns[index], 10, 'S');
      const headerLines = header.split('\n');
      headerLines.forEach((line, lineIndex) => text(line, x + columns[index] / 2, y + 4 + lineIndex * 3.4, 7, true, 'center'));
      x += columns[index];
    });
    y += 10;
  };
  tableHeader();

  lines.forEach((line) => {
    // Permit a clean wrap after separators in GL codes (for example,
    // "DEBTORS-CTRL" becomes two lines inside the Account Code cell).
    const accountCode = doc.splitTextToSize(line.accountCode.replace(/-/g, '- '), columns[0] - 3) as string[];
    const description = doc.splitTextToSize(line.description, columns[1] - 3) as string[];
    const particulars = doc.splitTextToSize(line.particulars, columns[2] - 3) as string[];
    const height = Math.max(8, Math.max(accountCode.length, description.length, particulars.length) * 3.5 + 3);
    if (y + height + 25 > 270) { doc.addPage(); y = 18; drawHeader(doc.getNumberOfPages()); y = 33; tableHeader(); }
    const cells = [accountCode, description, particulars, line.debit ? money(line.debit) : '', line.credit ? money(line.credit) : ''];
    let x = left;
    cells.forEach((cell, index) => {
      doc.rect(x, y, columns[index], height);
      if (Array.isArray(cell)) doc.setFont('times', 'normal').setFontSize(7.5).text(cell, x + 1.5, y + 4.5);
      else text(cell, index >= 3 ? x + columns[index] - 1.5 : x + 1.5, y + 4.5, 7.5, false, index >= 3 ? 'right' : 'left');
      x += columns[index];
    });
    y += height;
  });

  const totalHeight = 7;
  let x = left;
  doc.setFont('times', 'bold').setFontSize(7.5);
  [ { value: amountInWords(Math.max(debitTotal, creditTotal), voucher.currencyCode || 'PKR'), span: 3 }, { value: money(debitTotal), span: 1 }, { value: money(creditTotal), span: 1 } ].forEach(({ value, span }) => {
    const cellWidth = columns.slice(x === left ? 0 : x === left + columns[0] + columns[1] + columns[2] ? 3 : 4, (x === left ? 0 : x === left + columns[0] + columns[1] + columns[2] ? 3 : 4) + span).reduce((sum, item) => sum + item, 0);
    doc.rect(x, y, cellWidth, totalHeight);
    text(value, x + (span === 1 ? cellWidth - 1.5 : 1.5), y + 4.5, 7.5, true, span === 1 ? 'right' : 'left'); x += cellWidth;
  });

  const signatureY = Math.max(y + 30, 102);
  [['Supervisor', 'Prepared By'], ['Checked By', 'Checked By'], ['Approved By', 'Approved By'], ['Received By', 'Received By']].forEach(([top, bottom], index) => {
    const center = 27 + index * 51;
    doc.setLineWidth(0.35).line(center - 18, signatureY, center + 18, signatureY);
    text(top, center, signatureY - 2, 7, false, 'center');
    text(bottom, center, signatureY + 7, 7.5, true, 'center');
  });
  doc.setProperties({ title: `${heading} ${voucher.voucherNo}` });
  window.open(doc.output('bloburl'), '_blank');
}

/** Debit- and credit-note layout used from the voucher Printing tab. */
async function printFinanceNoteReport(voucher: Voucher, noteType: 'DEBIT' | 'CREDIT', printCurrency: 'PKR' | 'FOREIGN'): Promise<void> {
  const header = await loadHeaderImage();
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const left = 6; const right = 204; const width = right - left;
  const currency = printCurrency === 'FOREIGN' ? (voucher.currencyCode || 'PKR') : 'PKR';
  const amount = printCurrency === 'FOREIGN' ? voucher.amount : voucher.amount * (voucher.exchangeRate || 1);
  const payTo = voucher.receivedFrom || voucher.partyName || voucher.partyCode || '';
  const particulars = voucher.remarks || voucher.accountLines.find((line) => line.particulars)?.particulars || '';
  const t = (value: string | number, x: number, y: number, size = 8, bold = false, align: 'left' | 'center' | 'right' = 'left') =>
    doc.setFont('helvetica', bold ? 'bold' : 'normal').setFontSize(size).text(String(value || ''), x, y, { align });
  const box = (x: number, y: number, w: number, h: number) => doc.setDrawColor(0).setLineWidth(0.3).rect(x, y, w, h);
  const cell = (x: number, y: number, w: number, h: number, value: string | number, bold = false, align: 'left' | 'center' | 'right' = 'left') => {
    box(x, y, w, h);
    t(value, align === 'left' ? x + 1 : align === 'right' ? x + w - 1 : x + w / 2, y + 4, 7.5, bold, align);
  };

  const noteTitle = `${noteType} NOTE`;
  doc.setProperties({ title: `${noteTitle} ${voucher.voucherNo}`, subject: noteTitle });
  doc.addImage(header, 'PNG', 4, 4, 202, 34, undefined, 'FAST');
  box(left, 42, width, 202);
  cell(left, 42, width, 8, `${noteTitle} - ${voucher.branch || 'KHI'}`, true, 'center');

  // Customer and document information block.
  box(left, 50, 134, 32);
  t(payTo, left + 1, 55, 8, true);
  const address = voucher.partyCode && voucher.partyCode !== payTo ? voucher.partyCode : '';
  if (address) t(address, left + 1, 61, 8);
  const infoX = left + 134;
  const infoW = 64;
  [[`${noteType === 'CREDIT' ? 'Credit' : 'Debit'} Note No.`, voucher.voucherNo], ['Date', date(voucher.voucherDate)], ['Branch', voucher.branch]].forEach(([label, value], index) => {
    const y = 50 + index * (32 / 3);
    cell(infoX, y, 30, 32 / 3, label, true);
    cell(infoX + 30, y, infoW - 30, 32 / 3, value, true);
  });

  const tableY = 82;
  cell(left, tableY, 164, 12, 'Particulars', true, 'center');
  cell(left + 164, tableY, 34, 12, `Amount\n${currency}`, true, 'center');
  const detailY = tableY + 12;
  box(left, detailY, 164, 86);
  box(left + 164, detailY, 34, 86);
  t('Remarks', left + 1, detailY + 5, 7.5, true);
  t(particulars, left + 43, detailY + 5, 7.5);
  t(money(amount), right - 1, detailY + 5, 7.5, false, 'right');
  if (payTo) { t('Pay To', left + 1, detailY + 13, 7.5, true); t(payTo, left + 43, detailY + 13, 7.5); }
  if (voucher.chequeNo) { t('Cheque No.', left + 1, detailY + 21, 7.5, true); t(voucher.chequeNo, left + 43, detailY + 21, 7.5); }
  if (voucher.chequeDate) { t('Cheque Date', left + 1, detailY + 29, 7.5, true); t(date(voucher.chequeDate), left + 43, detailY + 29, 7.5); }

  const totalY = detailY + 86;
  cell(left, totalY, 164, 7, amountInWords(amount, currency), true);
  cell(left + 164, totalY, 34, 7, money(amount), true, 'right');
  const signatureY = totalY + 27;
  [['Supervisor', 'Prepared By'], ['Checked By', 'Checked By'], ['Manager Finance', 'Manager Finance']].forEach(([top, bottom], index) => {
    const center = index === 0 ? 31 : index === 1 ? 102 : 173;
    doc.setLineWidth(0.25).line(center - 28, signatureY, center + 28, signatureY);
    t(top, center, signatureY - 4, 7, false, 'center');
    t(bottom, center, signatureY + 4, 7, true, 'center');
  });
  window.open(doc.output('bloburl'), '_blank');
}

/** Minimal cheque overlay for pre-printed cheque stationery. */
function printChequeReport(voucher: Voucher, options?: ChequePrintOptions): void {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const amount = voucher.amount * (voucher.exchangeRate || 1);
  const payee = options?.payTo || voucher.receivedFrom || voucher.partyName || voucher.partyCode || '';
  const t = (value: string | number, x: number, y: number, size = 8, bold = false, align: 'left' | 'center' | 'right' = 'left') =>
    doc.setFont('times', bold ? 'bolditalic' : 'italic').setFontSize(size).text(String(value || ''), x, y, { align });
  const digits = (voucher.chequeNo || '').replace(/\s/g, '').split('').join('   ');

  doc.setProperties({ title: `Cheque ${voucher.chequeNo || voucher.voucherNo}`, subject: 'Cheque print' });
  // These coordinates deliberately leave the cheque itself blank; the PDF is
  // an overlay intended for the supplied/pre-printed bank cheque stationery.
  if (options?.printPayeeAccountOnly !== false) {
    doc.setLineWidth(0.25).rect(182, 81, 40, 7);
    t("Payee's Account Only", 202, 85.5, 7.5, true, 'center');
  }
  t(digits, 283, 81.5, 8, true, 'right');
  t(payee, 137, 99, 9, true);
  t(amountInWords(amount, voucher.currencyCode || 'PKR').replace(/^PKR\s+/, '').replace(/\s+Only$/, ' Only'), 142, 107, 8.5, true);
  t(`=${money(amount)}=`, 283, 103, 8.5, true, 'right');
  window.open(doc.output('bloburl'), '_blank');
}
