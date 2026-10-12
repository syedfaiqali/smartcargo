import { jsPDF } from 'jspdf';
import { signatoryRepo } from '../../data/masterDataService';
import { SeaExportJob } from '../../domain/seaExportJob';
import { createExcelWorkbook } from '../../utils/excelWorkbook';

type HblOptions = SeaExportJob['printing']['hbl'];
const date = (value: string) => value ? new Date(`${value}T00:00:00`).toLocaleDateString('en-GB') : '';
const value = (text: unknown) => String(text ?? '').trim();

async function loadHeader() {
  const response = await fetch(`${import.meta.env.BASE_URL}masum-logistics-header.png`);
  if (!response.ok) throw new Error('Could not load the company letterhead.');
  const blob = await response.blob();
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

const watermarkLabels: Record<HblOptions['watermark'], string> = {
  DRAFT_COPY: 'DRAFT COPY', CERTIFIED_TRUE_COPY: 'CERTIFIED TRUE COPY', NON_NEGOTIABLE_COPY: 'NON NEGOTIABLE COPY',
  ORIGINAL: 'ORIGINAL', BL_SURRENDER: 'B/L SURRENDER', EXPRESS_RELEASED: 'EXPRESS RELEASED',
  TELEX_RELEASED: 'TELEX RELEASED', RECEIVED_FOR_SHIPMENT: 'RECEIVED FOR SHIPMENT', NONE: '',
};
const stampLabels: Record<HblOptions['stamp'], string> = {
  ON_BOARD: 'ON BOARD', SHIPPED_ON_BOARD: 'SHIPPED ON BOARD', CLEAN_ON_BOARD: 'CLEAN ON BOARD', DO_NOT_PRINT: '',
};

function reportData(job: SeaExportJob) {
  const bl = job.bl;
  const containers = job.containers.filter((row) => row.containerNo || row.sealNo).map((row) => [row.containerNo, row.sealNo, row.sizeType, row.noOfPkgs, row.unit, row.grossWeight, row.netWeight]);
  return {
    shipper: `${value(job.partyName)}${bl.address ? `\n${value(bl.address)}` : ''}`,
    consignee: value(bl.consignee), notify: [value(bl.notify), value(bl.alsoNotify)].filter(Boolean).join('\n'),
    billNo: value(bl.hblNo || job.hblNo), masterNo: value(bl.mblNo || job.mblNo),
    vessel: value(bl.vessel || job.vessel), voyage: value(bl.voyage || job.voyage),
    receipt: value(bl.placeOfReceipt), loading: value(bl.placeOfLoading || job.portOfLoad),
    discharge: value(bl.placeOfDischarge || job.destination), delivery: value(bl.placeOfDelivery || job.destination),
    freightPayable: value(bl.freightPayableAt), booking: value(bl.bookingNo || job.bookingNo),
    reference: value(bl.reference), origin: value(bl.countryOfOrigin), issue: value(bl.placeOfIssue),
    blDate: date(bl.hblDate || job.hblDate), sailingDate: date(job.sailingDate),
    originals: value(bl.noOfOrigBLs), mop: value(bl.mop), fobCif: value(bl.fobCif),
    packages: [job.noOfPackages, job.unit].filter((part) => part !== '' && part !== 0).join(' '),
    marks: value(bl.marksAndNos), goods: value(bl.descriptionOfGoods || job.commodity),
    gross: job.grossWeight ? `${job.grossWeight} KGS` : '', net: job.netWeight ? `${job.netWeight} KGS` : '',
    volume: job.cbm ? `${job.cbm} CBM` : '', containers,
    freightText: value(bl.freightChargesText), rate: bl.rate, prepaid: bl.prepaid, collect: bl.collect,
  };
}

export async function createHblPrintingPdf(job: SeaExportJob) {
  const opts = job.printing.hbl;
  const data = reportData(job);
  const selectedCopies = [
    ...(opts.copies.original ? ['ORIGINAL'] : []), ...(opts.copies.firstOriginal ? ['FIRST ORIGINAL'] : []),
    ...(opts.copies.secondOriginal ? ['SECOND ORIGINAL'] : []), ...(opts.copies.thirdOriginal ? ['THIRD ORIGINAL'] : []),
    ...(opts.copies.nonNegotiable ? ['NON-NEGOTIABLE'] : []),
  ];
  const copies = [...selectedCopies, ...Array.from({ length: Math.max(0, Math.min(20, opts.copies.extra || 0)) }, () => 'NON-NEGOTIABLE')];
  const outputCopies = copies.length ? copies : ['NON-NEGOTIABLE'];
  const header = opts.paper === 'PLAIN_PAPER' ? await loadHeader() : undefined;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const signatory = signatoryRepo.find((row) => row.code === opts.signatoryCode)[0];

  outputCopies.forEach((copy, index) => {
    if (index) doc.addPage();
    const x = 12; const width = 186; let y = 12;
    const text = (content: string, xx: number, yy: number, size = 7, bold = false, align: 'left' | 'center' | 'right' = 'left') => {
      if (!content) return;
      doc.setFont('helvetica', bold ? 'bold' : 'normal').setFontSize(size).text(content, xx, yy, { align, maxWidth: 180 });
    };
    const cell = (xx: number, yy: number, ww: number, hh: number, content: string, size = 7, bold = false) => {
      doc.rect(xx, yy, ww, hh);
      const lines = content ? doc.splitTextToSize(content, ww - 3) as string[] : [];
      if (lines.length) {
        doc.setFont('helvetica', bold ? 'bold' : 'normal').setFontSize(size);
        doc.text(lines.slice(0, Math.max(1, Math.floor((hh - 2) / 3))), xx + 1.5, yy + 4);
      }
    };
    if (header) { doc.addImage(header, 'PNG', 12, 5, width, 25, undefined, 'FAST'); y = 32; }
    doc.setLineWidth(0.35).rect(x, y, width, 263 - (y - 12));
    y += 4;
    text('BILL OF LADING', 105, y + 2, 13, true, 'center');
    text(`B/L No.: ${data.billNo}`, 194, y + 2, 8, true, 'right');
    y += 6;
    doc.setFontSize(6.5).setFont('helvetica', 'normal').text('Received in apparent good order and condition, except as otherwise noted, the total number of containers or packages stated below.', 16, y, { maxWidth: 178 });
    y += 5;
    const half = width / 2;
    const left = (label: string, content: string, h: number) => { cell(x, y, half, h, '', 7); text(label, x + 2, y + 4, 6, true); const lines = content ? doc.splitTextToSize(content, half - 4) as string[] : []; if (lines.length) { doc.setFont('helvetica', 'normal').setFontSize(7).text(lines, x + 2, y + 8); } };
    const right = (label: string, content: string, h: number) => { cell(x + half, y, half, h, '', 7); text(label, x + half + 2, y + 4, 6, true); const lines = content ? doc.splitTextToSize(content, half - 4) as string[] : []; if (lines.length) { doc.setFont('helvetica', 'normal').setFontSize(7).text(lines, x + half + 2, y + 8); } };
    left('SHIPPER / EXPORTER', data.shipper, 27); right('B/L NO. / BOOKING NO.', `${data.billNo}${data.booking ? `\nBooking: ${data.booking}` : ''}`, 27); y += 27;
    left('CONSIGNEE', data.consignee, 27); right('NOTIFY PARTY', data.notify, 27); y += 27;
    left('VESSEL / VOYAGE', `${data.vessel}${data.voyage ? ` / ${data.voyage}` : ''}`, 12); right('PLACE OF RECEIPT', data.receipt, 12); y += 12;
    left('PORT OF LOADING', data.loading, 12); right('PORT OF DISCHARGE', data.discharge, 12); y += 12;
    left('PLACE OF DELIVERY', data.delivery, 12); right('FREIGHT PAYABLE AT', data.freightPayable, 12); y += 12;
    cell(x, y, width, 7, `No. of Original B/Ls: ${data.originals}     Issue place: ${data.issue}     Date: ${data.blDate}`, 6.5); y += 7;
    const marksW = 45, goodsW = 83, pkgsW = 24, weightW = 34;
    cell(x, y, marksW, 8, 'MARKS & NUMBERS', 6, true); cell(x + marksW, y, goodsW, 8, 'DESCRIPTION OF PACKAGES AND GOODS', 6, true);
    cell(x + marksW + goodsW, y, pkgsW, 8, 'PACKAGES', 6, true); cell(x + marksW + goodsW + pkgsW, y, weightW, 8, 'WEIGHT / MEASURE', 6, true); y += 8;
    const goodsHeight = 58;
    cell(x, y, marksW, goodsHeight, data.marks, 6.5);
    cell(x + marksW, y, goodsW, goodsHeight, `${data.goods}${data.origin ? `\nCountry of origin: ${data.origin}` : ''}`, 6.5);
    cell(x + marksW + goodsW, y, pkgsW, goodsHeight, data.packages, 6.5);
    cell(x + marksW + goodsW + pkgsW, y, weightW, goodsHeight, [data.gross, data.net, data.volume].filter(Boolean).join('\n'), 6.5); y += goodsHeight;
    cell(x, y, width, 7, `FREIGHT: ${data.freightText}     ${data.fobCif}${data.mop ? `     ${data.mop}` : ''}`, 6.5, true); y += 7;
    const tableHeaders = ['CONTAINER NO.', 'SEAL NO.', ...(opts.printContainerSize ? ['SIZE / TYPE'] : []), 'PACKAGES', 'GROSS WT.'];
    const containerWidths = opts.printContainerSize ? [51, 42, 32, 30, 31] : [55, 48, 40, 43];
    let cx = x;
    tableHeaders.forEach((heading, i) => { cell(cx, y, containerWidths[i], 7, heading, 5.7, true); cx += containerWidths[i]; }); y += 7;
    const rows = data.containers.slice(0, 5);
    rows.forEach((row) => {
      const contents = opts.printContainerSize ? [row[0], row[1], row[2], `${row[3] || ''} ${row[4] || ''}`.trim(), row[5] ? `${row[5]} kg` : ''] : [row[0], row[1], `${row[3] || ''} ${row[4] || ''}`.trim(), row[5] ? `${row[5]} kg` : ''];
      cx = x; contents.forEach((content, i) => { cell(cx, y, containerWidths[i], 7, value(content), 5.8); cx += containerWidths[i]; }); y += 7;
    });
    if (!rows.length) { cx = x; containerWidths.forEach((w) => { cell(cx, y, w, 7, ''); cx += w; }); y += 7; }
    y += 3;
    text(`PREPAID: ${data.prepaid || 0}`, x + 2, y, 7, true); text(`COLLECT: ${data.collect || 0}`, x + 75, y, 7, true);
    text(`ETD: ${data.sailingDate}`, x + 132, y, 7, true); y += 7;
    if (opts.printBelowStamp) opts.stampText.filter(Boolean).forEach((line) => { text(line, x + 2, y, 6.4); y += 4; });
    if (opts.additionalPrintText) { text(opts.additionalPrintText, x + 2, y, 6.4); y += 5; }
    if (opts.stamp !== 'DO_NOT_PRINT') text(`${stampLabels[opts.stamp]}${opts.stampDate ? `  ${date(opts.stampDate)}` : ''}`, 105, Math.min(y + 2, 275), 10, true, 'center');
    if (watermarkLabels[opts.watermark]) {
      doc.setTextColor(190, 190, 190).setFont('helvetica', 'bold').setFontSize(27).text(watermarkLabels[opts.watermark], 105, 152, { align: 'center', angle: 35 });
      if (opts.watermark === 'NON_NEGOTIABLE_COPY' && opts.nonNegotiableText) text(opts.nonNegotiableText, 105, 159, 8, true, 'center');
      doc.setTextColor(0, 0, 0);
    }
    text(`COPY: ${copy}`, 105, 282, 7, true, 'center');
    if (opts.printCarrierName) text(job.shippingLine, x + 2, 282, 7, true);
    text(`For ${job.shippingLine || 'Carrier'}`, 164, 264, 7, true, 'center');
    if (signatory) { text(signatory.name, 164, 272, 7, true, 'center'); text(signatory.designation, 164, 276, 6.5, false, 'center'); }
    if (opts.printExtraSheet) {
      doc.addPage();
      let extraY = 18;
      text('HBL CONTAINER DETAILS', 105, extraY, 12, true, 'center'); extraY += 10;
      text(`HBL No.: ${data.billNo}    Job No.: ${job.jobNo}`, x + 2, extraY, 8, true); extraY += 8;
      const headers = ['CONTAINER NO.', 'SEAL NO.', 'SIZE / TYPE', 'PACKAGES', 'UNIT', 'GROSS WT.', 'NET WT.'];
      const widths = [38, 30, 30, 23, 20, 23, 22];
      let xx = x;
      headers.forEach((heading, col) => { cell(xx, extraY, widths[col], 8, heading, 5.7, true); xx += widths[col]; }); extraY += 8;
      if (opts.printContainersOnExtraSheet) data.containers.forEach((row) => {
        const contents = [row[0], row[1], row[2], row[3], row[4], row[5], row[6]];
        xx = x; contents.forEach((entry, col) => { cell(xx, extraY, widths[col], 8, value(entry), 5.8); xx += widths[col]; }); extraY += 8;
      });
    }
  });
  doc.setProperties({ title: `HBL Printing - ${data.billNo || job.jobNo}`, subject: `House bill of lading for job ${job.jobNo}` });
  return doc;
}

export function createHblPrintingExcel(job: SeaExportJob) {
  const d = reportData(job);
  return createExcelWorkbook([{ name: 'HBL', rows: [
    ['HOUSE BILL OF LADING', ''], ['Branch', job.branch], ['Job No.', job.jobNo], ['HBL No.', d.billNo], ['MBL No.', d.masterNo],
    ['Shipper / Exporter', d.shipper], ['Consignee', d.consignee], ['Notify Party', d.notify], ['Vessel', d.vessel], ['Voyage', d.voyage],
    ['Place of Receipt', d.receipt], ['Port of Loading', d.loading], ['Port of Discharge', d.discharge], ['Place of Delivery', d.delivery],
    ['Freight Payable At', d.freightPayable], ['Booking No.', d.booking], ['B/L Date', d.blDate], ['No. of Originals', d.originals],
    ['Marks & Numbers', d.marks], ['Description of Goods', d.goods], ['Packages', d.packages], ['Gross Weight', d.gross], ['Net Weight', d.net], ['CBM', d.volume],
    ['Freight Charges', d.freightText], ['Prepaid', d.prepaid], ['Collect', d.collect],
    ['Container No.', 'Seal No.', 'Size / Type', 'Packages', 'Unit', 'Gross Weight', 'Net Weight'], ...d.containers,
  ], headerRows: [0, 27] }]);
}
