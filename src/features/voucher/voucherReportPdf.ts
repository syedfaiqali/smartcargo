import { jsPDF } from 'jspdf';
import { amountInWords, VoucherPrintReport } from './voucherPrinting';

const money = (value: number) => value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const words = (value: number) => amountInWords(value).replace(' Rupees', '');
let headerImage: Promise<string> | undefined;

/** Reuses the artwork already supplied for the project's native reports. */
export function loadVoucherReportHeader(): Promise<string> {
  if (!headerImage) headerImage = fetch('/masum-logistics-header.png').then(response => {
    if (!response.ok) throw new Error('The report letterhead could not be loaded.');
    return response.blob();
  }).then(blob => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('The report letterhead could not be read.'));
    reader.readAsDataURL(blob);
  })).catch(error => { headerImage = undefined; throw error; });
  return headerImage;
}

/** Screenshot layouts: landscape voucher/cheque and portrait Karachi notes. */
export function createVoucherPdf(report: VoucherPrintReport, header?: string): jsPDF {
  const layout = report.layout;
  const note = layout.type === 'Debit Note' || layout.type === 'Credit Note';
  const doc = new jsPDF({ orientation: note ? 'portrait' : 'landscape', unit: 'mm', format: 'a4' });
  doc.setProperties({ title: `${report.title} ${report.reference}`, author: 'Masum Logistics' });
  doc.setTextColor(0); doc.setDrawColor(0); doc.setLineWidth(.35);
  const text = (value: string, x: number, y: number, size = 10, font = 'helvetica', style = 'normal', align: 'left' | 'right' | 'center' = 'left') => {
    doc.setFont(font, style).setFontSize(size).text(value, x, y, { align });
  };
  const wrap = (value: string, width: number, size = 10, font = 'times', style = 'normal'): string[] => {
    doc.setFont(font, style).setFontSize(size);
    return doc.splitTextToSize(value, width);
  };
  const signatures = (y: number, four: boolean) => {
    const xs = four ? [7, 82, 154, 216] : [13, 66, 133];
    const widths = four ? [51, 51, 51, 51] : [28, 41, 58];
    const labels = four ? ['Prepared By', 'Checked By', 'Approved By', 'Received By'] : ['Prepared By', 'Checked By', 'Manager Finance'];
    xs.forEach((x, index) => {
      doc.line(x, y, x + widths[index], y);
      if (index === 0) text('Supervisor', x + widths[index] / 2, y - 2.5, four ? 10 : 8, 'helvetica', 'normal', 'center');
      text(labels[index], x + widths[index] / 2, y + 6, four ? 10 : 8, 'helvetica', 'bold', 'center');
    });
  };

  if (report.cheque) {
    const cheque = report.cheque;
    // The large blank area and coordinates are intentional: this is an overlay for cheque stationery.
    if (cheque.accountOnly) {
      doc.rect(182, 101.5, 40.5, 8);
      text("Payee's Account Only", 183.5, 107, 10.5, 'helvetica', 'bolditalic');
    }
    const digits = layout.chequeDate.replace(/\D/g, '');
    digits.split('').forEach((digit, index) => text(digit, 246 + index * 5.6, 102, 12, 'times', 'bolditalic'));
    text(cheque.payTo, 137, 124, 12, 'times', 'bolditalic');
    const amountWords = wrap(words(cheque.amount), 94, 12, 'times', 'bolditalic');
    doc.text(amountWords, 142, 133, { lineHeightFactor: 1.1 });
    text(`=${money(cheque.amount).replace(/\.00$/, '')}/=`, 283, 130, 12, 'times', 'bolditalic', 'right');
    text('Masum Logistics', 239, 141, 12, 'helvetica', 'bold');
    if (cheque.signatory1) text(cheque.signatory1, 237, 154, 9);
    if (cheque.signatory2) text(cheque.signatory2, 274, 154, 9, 'helvetica', 'normal', 'right');
    if (cheque.stamp) { doc.rect(239, 159, 43, 14); text('Company Stamp', 260.5, 167, 8, 'helvetica', 'normal', 'center'); }
    return doc;
  }

  if (!note) {
    const table = report.tables[0];
    const columns = [6, 28, 119, 217, 249, 281];
    let y = 58;
    const heading = () => {
      text('Masum Logistics', 140, 14, 19, 'helvetica', 'bold', 'center');
      doc.line(6, 20, 273, 20);
      text(report.title, 140, 28, 16, 'times', 'bold', 'center');
      doc.line(98, 28.8, 180, 28.8);
      text('Branch          :   ' + layout.branch, 12, 38, 12, 'helvetica', 'bold');
      text('Voucher No.   :   ' + report.reference, 12, 45, 12, 'helvetica', 'bold');
      text('Voucher Date :   ' + layout.voucherDate, 12, 52, 12, 'helvetica', 'bold');
      text('Pay To : ' + layout.payTo, 94, 52, 12, 'helvetica', 'bold');
      text('Cheque No.    :   ' + layout.chequeNo, 176, 38, 12, 'helvetica', 'bold');
      text('Cheque Date  :   ' + layout.chequeDate, 176, 45, 12, 'helvetica', 'bold');
      y = 58;
      doc.setFillColor(211, 211, 211); doc.rect(6, y, 275, 11, 'FD');
      ['Account\nCode', 'Account Description', 'Particulars', 'Debit', 'Credit'].forEach((value, index) => {
        text(value, (columns[index] + columns[index + 1]) / 2, y + 4.5, 11, 'times', 'bold', 'center');
        if (index) doc.line(columns[index], y, columns[index], y + 11);
      });
      y += 11;
    };
    heading();
    // Account rows use the same live values as the workbook; no sample amounts are baked in.
    for (const row of table.rows) {
      const source = layout.lines.find(line => `${line.accountCode} ${line.accountDescription}` === row[1]);
      const code = source?.accountCode || String(row[1]).split(' ')[0];
      const desc = source?.accountDescription || String(row[1]).slice(code.length).trim();
      const cells = [wrap(code, 20), wrap(desc, 89), wrap(String(row[2]), 96)];
      const count = Math.max(...cells.map(cell => cell.length));
      let offset = 0;
      while (offset < count) {
        if (y + 10 > 172) { doc.addPage(); heading(); }
        const take = Math.min(count - offset, Math.max(1, Math.floor((172 - y - 3) / 4.2)));
        const h = Math.max(10, take * 4.2 + 2);
        doc.rect(6, y, 275, h);
        columns.slice(1, -1).forEach(x => doc.line(x, y, x, y + h));
        cells.forEach((cell, i) => { const chunk = cell.slice(offset, offset + take); if (chunk.length) text(chunk.join('\n'), columns[i] + 1, y + 4.5, 10, 'times'); });
        if (!offset) text(money(Number(row[8])), row[0] === 'Debit' ? 248 : 280, y + 4.5, 10, 'times', 'normal', 'right');
        y += h; offset += take;
      }
    }
    const totals = table.rows.reduce<number[]>((sum, row) => {
      sum[row[0] === 'Debit' ? 0 : 1] += Number(row[8]); return sum;
    }, [0, 0]);
    const totalWords = wrap('PKR : ' + words(Number(totals[0])), 208, 10, 'helvetica', 'bold');
    const h = Math.max(8, totalWords.length * 4 + 3);
    if (y + h > 179) { doc.addPage(); heading(); }
    doc.rect(6, y, 275, h); doc.line(217, y, 217, y + h); doc.line(249, y, 249, y + h);
    text(totalWords.join('\n'), 7, y + 4, 10, 'helvetica', 'bold');
    text(money(Number(totals[0])), 248, y + 5, 11, 'times', 'bold', 'right');
    text(money(Number(totals[1])), 280, y + 5, 11, 'times', 'bold', 'right');
    signatures(Math.min(196, y + h + 30), true);
    const pages = doc.getNumberOfPages();
    for (let p = 1; p <= pages; p++) { doc.setPage(p); text(`Page : ${p} / ${pages}`, 272, 28, 10, 'helvetica', 'bold', 'right'); }
    return doc;
  }

  // Each account and currency gets its own note, so independent recipients and
  // foreign currencies cannot be combined into a misleading total.
  const rows = report.tables[0].rows;
  const groups = new Map<string, typeof rows>();
  rows.forEach(row => { const key = `${row[0]}|${row[5]}`; groups.set(key, [...(groups.get(key) || []), row]); });
  let first = true;
  for (const group of groups.values()) {
    const currency = String(group[0][5]);
    const particulars = group.flatMap(row => wrap(String(row[2] || layout.remarks), 119, 9));
    // Keep the fixed stationery frame while allowing long remarks to continue.
    const chunks = Math.max(1, Math.ceil(particulars.length / 8));
    for (let page = 0; page < chunks; page++) {
      if (!first) doc.addPage(); first = false;
      if (header) doc.addImage(header, 'PNG', 2, -17, 205, 68.5, undefined, 'FAST');
      else text('MASUM LOGISTICS', 105, 14, 23, 'times', 'bold', 'center');
      text('Off : 815, 8th Floor Park Avenue Building, P.E.C.H.S Block-6 , Shahrah-e-Faisal', 34, 27, 6.8);
      text('Karachi, Pakistan  Tel : +92-21-34521335  Email : info@masumlogistics.com.pk', 34, 32, 6.8);
      doc.rect(6, 43, 198, 160);
      doc.line(6, 49, 204, 49); text(report.title, 105, 47.5, 11, 'helvetica', 'bold', 'center');
      text(wrap(String(group[0][1]), 128, 9, 'helvetica').join('\n'), 7, 53, 9);
      text(wrap(layout.type === 'Debit Note' ? layout.partyAddress : layout.bankDetail, 128, 9, 'helvetica').join('\n'), 7, 60, 9);
      const label = layout.type === 'Debit Note' ? 'Debit Note No.' : 'Credit Note No.';
      [[label, report.reference], ['Date', layout.voucherDate], ['Branch', layout.branch]].forEach(([name, value], i) => {
        const y = 49 + i * 6.3;
        doc.rect(140.5, y, 63.5, 6.3); doc.line(171, y, 171, y + 6.3);
        text(name, 141, y + 4, 9, 'helvetica', 'bold'); text(value, 172, y + 4, 9, 'times', 'bold');
      });
      doc.setFillColor(211, 211, 211); doc.rect(6, 81, 198, 12.5, 'FD'); doc.line(170.5, 81, 170.5, 163);
      text('Particulars', 88, 89, 10, 'helvetica', 'bold', 'center'); text('Amount\n' + currency, 187, 86, 10, 'helvetica', 'bold', 'center');
      text('Remarks', 7, 97, 9, 'helvetica', 'bold');
      const chunk = particulars.slice(page * 8, (page + 1) * 8);
      if (chunk.length) text(chunk.join('\n'), 50, 97, 9, 'times');
      let y = 97 + Math.max(1, chunk.length) * 3.5 + 3;
      [['Pay To', layout.payTo], ['Cheque No.', layout.chequeNo], ['Cheque Date', layout.chequeDate]].forEach(([name, value]) => {
        text(name, 7, y, 9, 'helvetica', 'bold'); text(value, 50, y, 9, 'times'); y += 6.5;
      });
      const total = group.reduce((sum, row) => sum + Number(row[6]), 0);
      text(money(total), 203, 97, 9, 'times', 'normal', 'right');
      doc.rect(6, 157, 198, 6); doc.line(170.5, 157, 170.5, 163);
      text(wrap(currency + ' : ' + words(total), 163, 9, 'helvetica', 'bold').join('\n'), 7, 161, 9, 'helvetica', 'bold');
      text(money(total), 203, 161, 9, 'times', 'bold', 'right');
      signatures(189.5, false);
    }
  }
  return doc;
}
