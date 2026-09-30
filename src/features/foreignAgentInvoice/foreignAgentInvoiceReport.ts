import { jsPDF } from 'jspdf';
import { ForeignAgentInvoice } from '../../domain/foreignAgentInvoice';
import { foreignAgentRepo } from '../../data/masterDataService';

const headerUrl = `${import.meta.env.BASE_URL}masum-logistics-header.png`;
let headerImage: string | undefined;

async function loadHeaderImage() {
  if (headerImage) return headerImage;
  const response = await fetch(headerUrl);
  if (!response.ok) throw new Error('The invoice header could not be loaded.');
  const blob = await response.blob();
  headerImage = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
  return headerImage;
}

const date = (value: string) => value ? new Date(`${value}T00:00:00`).toLocaleDateString('en-GB') : '';
const money = (value: number) => Number(value || 0).toFixed(2);

/** Printable credit/debit note for Air Export foreign-agent invoices. */
export async function printForeignAgentInvoice(invoice: ForeignAgentInvoice) {
  const header = await loadHeaderImage();
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const agent = foreignAgentRepo.find((item) => item.code === invoice.fAgentCode)[0];
  const heading = invoice.printing.printHeadingAs === 'DEBIT_NOTE' ? 'DEBIT NOTE' : invoice.variant.includes('CREDIT_NOTE') ? 'CREDIT NOTE' : 'INVOICE';
  const copyLabel: Record<ForeignAgentInvoice['printing']['printCopyType'], string> = { ORIGINAL: '', REVISED: '(Revised)', DUPLICATE: '(Duplicate)', OFFICE_COPY: '(Office Copy)' };
  const text = (content: string, x: number, y: number, size = 7, style: 'normal' | 'bold' = 'normal', align: 'left' | 'center' | 'right' = 'left') => doc.setFont('helvetica', style).setFontSize(size).text(content, x, y, { align });
  const cell = (x: number, y: number, width: number, height: number, content = '', size = 7, align: 'left' | 'center' | 'right' = 'left') => { doc.rect(x, y, width, height); if (content) text(content, align === 'left' ? x + 1 : x + width / 2, y + height / 2 + 1.5, size, 'bold', align); };
  const wrapped = (content: string, x: number, y: number, width: number, size = 6.8) => doc.setFont('helvetica', 'normal').setFontSize(size).text(doc.splitTextToSize(content, width), x, y, { lineHeightFactor: 1.05 });

  doc.setProperties({ title: heading, subject: invoice.documentNo });
  doc.setLineWidth(.55); doc.rect(1, 1, 208, 295);
  doc.addImage(header, 'PNG', 2, -22, 205, 68.5, undefined, 'FAST');
  const x = 5; const leftW = 98; const rightX = 103; const rightW = 100;
  cell(x, 32, leftW, 8, 'CUSTOMER', 7.5); cell(rightX, 32, rightW, 16);
  text(heading, rightX + 50, 42, 15, 'bold', 'center');
  if (copyLabel[invoice.printing.printCopyType]) text(copyLabel[invoice.printing.printCopyType], rightX + rightW - 4, 42, 6.5, 'bold', 'right');
  wrapped(`${agent?.name || invoice.fAgentName}\n${agent?.address || invoice.consignee || ''}`, x + 1, 43, leftW - 2, 6.8);
  cell(x, 62, 23, 8, heading === 'CREDIT NOTE' ? 'Credit Note No.' : 'Invoice No.', 6.5); cell(x + 23, 62, 30, 8, invoice.documentNo, 6.5); cell(x + 53, 62, 17, 8, 'Date', 6.5); cell(x + 70, 62, 28, 8, date(invoice.documentDate), 6.5);
  cell(x, 70, 23, 8, 'MAWB No.', 6.5); cell(x + 23, 70, 30, 8, invoice.mawbNo, 6.5); cell(x + 53, 70, 17, 8, 'Date', 6.5); cell(x + 70, 70, 28, 8, date(invoice.mawbDate), 6.5);
  cell(x, 78, 23, 8, 'M.Job No.', 6.5); cell(x + 23, 78, 30, 8, invoice.mawbJobNo, 6.5); cell(x + 53, 78, 17, 8, 'Year', 6.5); cell(x + 70, 78, 28, 8, String(invoice.mawbJobYear || ''), 6.5);
  cell(x, 86, 23, 8, 'F/Agent Doc #', 6.5); cell(x + 23, 86, 75, 8, invoice.fAgentDocNo, 6.5);
  cell(rightX, 48, rightW, 8, 'DEPARTMENT :   Air - Export', 7.5); cell(rightX, 56, rightW, 8, 'REFERENCE / CONSIGNEE', 7.5); cell(rightX, 64, rightW, 30);
  wrapped(invoice.reference || invoice.consignee || `${invoice.fAgentName || agent?.name || ''}\n${agent?.address || ''}`, rightX + 1, 71, rightW - 2, 6.8);
  cell(rightX, 94, 21, 8, 'Currency', 6.5); cell(rightX + 21, 94, 21, 8, invoice.printing.printIn === 'PKR' ? 'PKR' : invoice.currencyCode, 7, 'center');

  const cols = [45, 45, 43, 15, 26, 26]; const heads = ['FROM', 'TO', 'COMMODITY', 'PCS', 'GRS.WEIGHT', 'CH.WEIGHT']; let left = x;
  cols.forEach((width, index) => { cell(left, 104, width, 8, heads[index], 7.2, 'center'); cell(left, 112, width, 10, index === 0 ? invoice.origin : index === 1 ? invoice.destination : index === 2 ? invoice.remarks : index === 3 ? String(invoice.pieces) : index === 4 ? money(invoice.grossWeight) : money(invoice.chargeWeight), 6.5, 'center'); left += width; });
  const alloc = invoice.allocationLines[0]; const allocCols = [16, 16, 43, 20, 33, 33, 41]; const allocHeads = ['JOB\nNo.', 'Year', 'HAWB NO.', 'PCS', 'GROSS WEIGHT', 'CH.WEIGHT', 'Party Name']; left = x;
  allocCols.forEach((width, index) => { cell(left, 122, width, 10, allocHeads[index], 6.8, 'center'); cell(left, 132, width, 10, index === 0 ? (alloc?.jobNo || invoice.mawbJobNo) : index === 1 ? String(invoice.mawbJobYear || '') : index === 2 ? (alloc?.hawbNo || '') : index === 3 ? String(alloc?.pcs ?? invoice.pieces) : index === 4 ? money(alloc?.grWeight ?? invoice.grossWeight) : index === 5 ? money(alloc?.chWeight ?? invoice.chargeWeight) : (alloc?.partyName || invoice.fAgentName), 6.3, 'center'); left += width; });
  cell(x, 142, 140, 8, 'PARTICULAR', 7.5, 'center'); cell(x + 140, 142, 25, 8, 'Rate/Kg (PKR)', 6.5, 'center'); cell(x + 165, 142, 38, 8, 'AMOUNT (PKR)', 7, 'center');
  const charges = [...invoice.chargeLines, ...invoice.handlingLines].filter((line) => line.description || line.charges);
  for (let index = 0; index < 10; index += 1) {
    const line = charges[index]; const y = 150 + index * 6;
    cell(x, y, 140, 6, line?.description || '', 6.5); cell(x + 140, y, 25, 6, line ? money(line.rate) : '', 6.5, 'right'); cell(x + 165, y, 38, 6, line ? money(line.charges) : '', 6.5, 'right');
  }
  cell(x, 210, 140, 8, `${invoice.currencyCode || 'PKR'} ${invoice.totalInvoiceAmount ? '' : 'zero'}`, 7.2); cell(x + 140, 210, 25, 8, 'TOTAL', 7.5, 'center'); cell(x + 165, 210, 38, 8, money(invoice.totalInvoiceAmount), 7.5, 'right');
  text('**This is system generated Document, does not require any signature.**', 105, 228, 6.5, 'bold', 'center');
  window.open(doc.output('bloburl'), '_blank');
}
