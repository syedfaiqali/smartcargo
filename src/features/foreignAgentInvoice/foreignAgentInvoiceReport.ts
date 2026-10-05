import { jsPDF } from 'jspdf';
import { ForeignAgentInvoice } from '../../domain/foreignAgentInvoice';
import { airportRepo, bankRepo, foreignAgentRepo } from '../../data/masterDataService';
import { recomputeAgentInvoiceTotals } from './agentInvoiceCalculations';
import { VariantConfig } from './variantConfig';

const headerUrl = `${import.meta.env.BASE_URL}masum-logistics-header.png`;
let headerImage: string | undefined;

async function loadHeaderImage(): Promise<string> {
  if (headerImage) return headerImage;
  const response = await fetch(headerUrl);
  if (!response.ok) throw new Error('The invoice report header could not be loaded.');
  const blob = await response.blob();
  headerImage = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
  return headerImage;
}

const money = (value: number) => (Number(value) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const date = (value: string) => value ? new Intl.DateTimeFormat('en-GB').format(new Date(`${value}T00:00:00`)) : '';
const safe = (value: string | number | undefined) => String(value ?? '');
const underTwenty = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
function underThousand(value: number): string { if (value < 20) return underTwenty[value]; if (value < 100) return `${tens[Math.floor(value / 10)]}${value % 10 ? ` ${underTwenty[value % 10]}` : ''}`; return `${underTwenty[Math.floor(value / 100)]} Hundred${value % 100 ? ` ${underThousand(value % 100)}` : ''}`; }
function inWords(value: number, unit: string): string { const number = Math.floor(Math.abs(value)); const pieces: [number, string][] = [[Math.floor(number / 10000000), 'Crore'], [Math.floor(number / 100000) % 100, 'Lakh'], [Math.floor(number / 1000) % 100, 'Thousand'], [number % 1000, '']]; return `${value < 0 ? 'Minus ' : ''}${unit} ${pieces.filter(([n]) => n).map(([n, suffix]) => `${underThousand(n)}${suffix ? ` ${suffix}` : ''}`).join(' ') || 'Zero'} Only`; }

/** Opens the selected foreign-agent invoice as a PDF report, matching Job Entry & Printing. */
export async function printForeignAgentInvoice(record: ForeignAgentInvoice, config: VariantConfig): Promise<void> {
  const invoice = recomputeAgentInvoiceTotals(record);
  const header = await loadHeaderImage();
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const agent = foreignAgentRepo.get(invoice.fAgentCode);
  const currency = invoice.currencyCode || 'US$';
  const heading = invoice.printing.printHeadingAs === 'DEBIT_NOTE' ? 'DEBIT NOTE' : 'INVOICE';
  const copyType = invoice.printing.printCopyType === 'ORIGINAL' ? '' : ` (${invoice.printing.printCopyType.replace('_', ' ')})`;
  const sellingLines = invoice.chargeLines.filter((line) => line.side === 'SELLING' && (line.description || line.code || line.charges));
  const bankDetail = invoice.bankDetailText || bankRepo.get(invoice.bankCode)?.accountDetail || '';
  const left = 10;
  const right = 200;
  const text = (content: string | number, x: number, y: number, size = 8, style: 'normal' | 'bold' = 'normal', align: 'left' | 'center' | 'right' = 'left') => doc.setFont('helvetica', style).setFontSize(size).text(safe(content) || '-', x, y, { align, maxWidth: 80 });
  const line = (x1: number, y1: number, x2: number, y2: number) => doc.setDrawColor(40, 60, 85).setLineWidth(0.2).line(x1, y1, x2, y2);
  const cell = (x: number, y: number, width: number, height: number, value: string | number, align: 'left' | 'center' | 'right' = 'left', bold = false) => { doc.rect(x, y, width, height); text(value, align === 'left' ? x + 2 : align === 'right' ? x + width - 2 : x + width / 2, y + 5, 7.5, bold ? 'bold' : 'normal', align); };

  doc.setProperties({ title: `${heading} ${invoice.documentNo}`, subject: `Foreign agent invoice ${invoice.documentNo}` });
  doc.addImage(header, 'PNG', 2, -17, 205, 68.5, undefined, 'FAST');
  doc.setLineWidth(0.55).rect(1, 1, 208, 295);
  text(heading + copyType, 105, 43, 15, 'bold', 'center');
  line(left, 47, right, 47);
  text('BILL TO', left, 54, 8, 'bold');
  text(agent?.name || invoice.fAgentName || invoice.fAgentCode, left, 60, 9, 'bold');
  const address = doc.splitTextToSize(agent?.address || '', 88) as string[];
  doc.setFont('helvetica', 'normal').setFontSize(7.5).text(address.length ? address : ['-'], left, 65);
  const details: [string, string][] = [[config.printingDocLabel, invoice.documentNo], ['Date', date(invoice.documentDate)], ['MAWB No.', invoice.mawbNo], ['MAWB Date', date(invoice.mawbDate)], ['M. Job No.', `${invoice.mawbJobNo}/${invoice.mawbJobYear || ''}`], ['F/Agent Doc #', invoice.fAgentDocNo], ['Currency', currency], ['P.P./C.C.', invoice.ppCc]];
  details.forEach(([label, value], index) => { const y = 53 + index * 5; text(label, 116, y, 7.2, 'bold'); text(':', 145, y, 7.2, 'bold'); text(value, 149, y, 7.2); });
  const shipmentY = 96;
  const shipmentColumns = [44, 44, 25, 34, 43];
  const shipmentLabels = ['FROM', 'TO', 'PCS', 'GRS. WEIGHT', 'CH. WEIGHT'];
  const airport = airportRepo.get(invoice.origin)?.name ? `(${invoice.origin}) ${airportRepo.get(invoice.origin)?.name}` : invoice.origin;
  const shipmentValues = [airport, invoice.destination, invoice.pieces, invoice.grossWeight, invoice.chargeWeight];
  let x = left;
  shipmentColumns.forEach((width, index) => { cell(x, shipmentY, width, 7, shipmentLabels[index], 'center', true); cell(x, shipmentY + 7, width, 7, shipmentValues[index], 'center'); x += width; });
  let y = 121;
  text('PARTICULARS', left, y - 3, 8, 'bold');
  const chargeWidths = [120, 32, 38];
  x = left;
  ['PARTICULAR', `RATE/KG (${currency})`, `AMOUNT (${currency})`].forEach((label, index) => { cell(x, y, chargeWidths[index], 7, label, index ? 'right' : 'left', true); x += chargeWidths[index]; });
  const rows = sellingLines.length ? sellingLines : [{ description: 'No billable charges', code: '', charges: 0, rate: 0 }];
  rows.forEach((charge) => { y += 7; x = left; const rate = invoice.chargeWeight ? charge.charges / invoice.chargeWeight : charge.rate; [charge.description || charge.code, money(rate), money(charge.charges)].forEach((value, index) => { cell(x, y, chargeWidths[index], 7, value, index ? 'right' : 'left'); x += chargeWidths[index]; }); });
  y += 12;
  doc.setFillColor(235, 241, 248).rect(108, y - 6, 92, 12, 'F'); doc.rect(108, y - 6, 92, 12);
  text('TOTAL', 113, y + 1, 9, 'bold'); text(`${money(invoice.totalInvoiceAmount)} ${currency}`, 196, y + 1, 10, 'bold', 'right');
  y += 16;
  text('AMOUNT IN WORDS:', left, y, 7.5, 'bold'); doc.setFont('helvetica', 'normal').setFontSize(7.5).text(doc.splitTextToSize(inWords(invoice.totalInvoiceAmount, currency), 140), left, y + 5);
  y += 19;
  text('BANK DETAILS:', left, y, 7.5, 'bold'); doc.setFont('helvetica', 'normal').setFontSize(7.5).text(doc.splitTextToSize(bankDetail || '-', 180), left, y + 5);
  if (invoice.printing.printSignatorys === 'Y') { text('Authorised Signatory', right, 268, 8, 'bold', 'right'); line(150, 270, right, 270); }
  text('This is a system-generated document and does not require a signature.', 105, 287, 7, 'normal', 'center');
  window.open(doc.output('bloburl'), '_blank');
}
