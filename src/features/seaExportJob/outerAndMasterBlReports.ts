import { jsPDF } from 'jspdf';
import { agentRepo, foreignAgentRepo, partyRepo, seaPortRepo, shippingLineRepo, spoRepo } from '../../data/masterDataService';
import { SeaExportJob } from '../../domain/seaExportJob';
import { createExcelWorkbook } from '../../utils/excelWorkbook';

const clean = (value: unknown) => String(value ?? '').trim();
const date = (value: string) => value && !value.startsWith('0001') ? new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString('en-GB') : '';
const codeOf = (value: string) => value.split(' - ')[0].trim();
function resolve(value: string, rows: { code: string; name: string }[]) {
  const code = codeOf(value);
  return rows.find((row) => row.code === code)?.name || value;
}
function agent(value: string) { return resolve(value, agentRepo.list()); }
function port(value: string) { return resolve(value, seaPortRepo.list()); }
function foreignAgent(value: string) { return resolve(value, foreignAgentRepo.list()); }
function partyDetails(job: SeaExportJob) {
  const code = codeOf(job.bl.partyCode || job.partyCode);
  return partyRepo.list().find((row) => row.code === code) || partyRepo.list().find((row) => row.code === codeOf(job.partyCode));
}
function agentAddress(value: string) {
  const match = agentRepo.list().find((row) => row.code === codeOf(value));
  return match ? [match.name, match.address].filter(Boolean).join('\n') : value;
}

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

function addHeader(doc: jsPDF, paper: 'LETTER_PAD' | 'PLAIN_PAPER', image: string | undefined) {
  if (paper === 'PLAIN_PAPER' && image) doc.addImage(image, 'PNG', 12, 4, 186, 28, undefined, 'FAST');
}

export async function createOuterPdf(job: SeaExportJob) {
  const image = job.printing.outer?.paper === 'PLAIN_PAPER' ? await loadHeader() : undefined;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  addHeader(doc, job.printing.outer?.paper || 'PLAIN_PAPER', image);
  const x = 10, width = 190;
  let y = job.printing.outer?.paper === 'PLAIN_PAPER' ? 39 : 16;
  const text = (content: string, xx: number, yy: number, size = 7, bold = false, align: 'left' | 'center' | 'right' = 'left') => {
    if (content) doc.setFont('helvetica', bold ? 'bold' : 'normal').setFontSize(size).text(content, xx, yy, { align, maxWidth: 190 });
  };
  const cell = (xx: number, yy: number, w: number, h: number, content: string, size = 6.2, bold = false) => {
    doc.rect(xx, yy, w, h);
    if (content) {
      const lines = doc.splitTextToSize(content, w - 2) as string[];
      doc.setFont('helvetica', bold ? 'bold' : 'normal').setFontSize(size).text(lines.slice(0, Math.max(1, Math.floor((h - 1) / 3))), xx + 1, yy + 3.4);
    }
  };
  doc.setLineWidth(.4).rect(x, y, width, 10);
  text('OUTER (SEA EXPORT)', 105, y + 6.6, 10, true, 'center');
  text(`JOB No. : ${job.jobNo}`, x + 2, y + 6.4, 7.5, true);
  text(`Date : ${date(job.printing.todaysDate || job.date)}`, x + width - 2, y + 6.4, 7.5, true, 'right');
  y += 14;

  const columnWidths = [42, 15, 38, 15, 13, 16, 26, 25];
  const headers = ['B/L No.', 'MBL Date', 'HBL No.', 'HBL Date', 'PCS', 'CBM', 'Gs. Weight', 'Ch. Weight'];
  let cx = x;
  headers.forEach((header, index) => { cell(cx, y, columnWidths[index], 9, header, 6, true); cx += columnWidths[index]; });
  y += 9;
  const summary = [job.bl.mblNo || job.mblNo, date(job.mblDate), job.bl.hblNo || job.hblNo, date(job.bl.hblDate || job.hblDate), String(job.noOfPcsQty || job.noOfPackages), job.cbm.toFixed(4), job.grossWeight.toFixed(3), job.volWeight.toFixed(3)];
  cx = x; summary.forEach((value, index) => { cell(cx, y, columnWidths[index], 9, clean(value), 6.3); cx += columnWidths[index]; });
  y += 13;

  const party = partyDetails(job);
  const details: [string, string, string, string][] = [
    ['Party', `${codeOf(job.partyCode)}  ${job.partyName}`, 'Freight Term', job.bl.mop],
    ['Sub Agent', job.subAgentParty, 'LCL / FCL', job.lclFcl],
    ['Foreign Agent', foreignAgent(job.foreignAgent), 'CY / CFS', job.cyCfs],
    ['Shipping Line', resolve(job.shippingLine, shippingLineRepo.list()), 'EGM No.', job.egm],
    ['Clearing Agent', agent(job.clearingAgent), 'SB/GD No.', job.sbNo],
    ['S/Line Agent', agent(job.sLineAgent), 'SB/GD Date', date(job.sbDate)],
    ['Delivery Agent', agent(job.deliveryAgent), 'E.T.D', date(job.polEtd || job.sailingDate)],
    ['Port of Loading', port(job.bl.placeOfLoading || job.portOfLoad), 'E.T.A', date(job.etaAtDest)],
    ['Destination', port(job.bl.placeOfDischarge || job.destination), 'Ship Inv. No.', job.shipperInvoice.invNo],
    ['Vessel / Voyage', `${job.bl.vessel || job.vessel} / ${job.bl.voyage || job.voyage}`, 'Ship Inv Date', date(job.shipperInvoice.date)],
    ['Goods Desc.', job.bl.descriptionOfGoods || job.commodity, 'Currency', job.currencyCode],
    ['SPO Name', spoRepo.list().find((item) => item.code === codeOf(job.spoCode))?.name || job.spoCode, 'Remarks', job.bl.reference],
  ];
  details.forEach(([l1, v1, l2, v2]) => {
    const rowH = l1 === 'Goods Desc.' ? 12 : 9;
    cell(x, y, 28, rowH, l1, 6.1, true); cell(x + 28, y, 72, rowH, clean(v1), 6.1);
    cell(x + 100, y, 28, rowH, l2, 6.1, true); cell(x + 128, y, 62, rowH, clean(v2), 6.1);
    y += rowH;
  });
  y += 4;
  const containerHeadings = ['Container No.', 'Size No.', 'Seal No.', 'Vehicle No.', 'Vehicle Date'];
  const widths = [60, 32, 42, 30, 26];
  cx = x; containerHeadings.forEach((header, index) => { cell(cx, y, widths[index], 8, header, 6, true); cx += widths[index]; }); y += 8;
  const rows = job.containers.length ? job.containers : [undefined];
  rows.forEach((container) => {
    const values = [container?.containerNo || '', container?.sizeType || '', container?.sealNo || '', container?.vehicleNo || '', date(container?.vehicleDate || '')];
    cx = x; values.forEach((value, index) => { cell(cx, y, widths[index], 8, value, 6); cx += widths[index]; }); y += 8;
    if (y > 270) { doc.addPage(); y = 20; }
  });
  doc.setProperties({ title: `Outer (Sea Export) - ${job.jobNo}` });
  return doc;
}

export async function createMasterBlSpecimenPdf(job: SeaExportJob) {
  const cfg = job.printing.masterBlSpecimen;
  const image = cfg?.paper === 'PLAIN_PAPER' ? await loadHeader() : undefined;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  addHeader(doc, cfg?.paper || 'PLAIN_PAPER', image);
  const x = 7.3, width = 196.5, leftWidth = 100, gap = 3, rightX = x + leftWidth + gap, rightWidth = width - leftWidth - gap;
  const line = (y: number) => { doc.setLineWidth(.25).line(x, y, x + width, y); };
  const box = (xx: number, yy: number, w: number, h: number, label: string, value: string, labelSize = 7.2, shaded = false) => {
    doc.setDrawColor(80).setLineWidth(.2);
    if (shaded) doc.setFillColor(211).rect(xx, yy, w, h, 'FD');
    else doc.rect(xx, yy, w, h);
    doc.setFont('helvetica', 'bold').setFontSize(labelSize).text(label, xx + 2, yy + 4);
    const content = clean(value);
    if (content) {
      const lines = doc.splitTextToSize(content, w - 4) as string[];
      doc.setFont('helvetica', 'normal').setFontSize(7.2).text(lines.slice(0, Math.max(1, Math.floor((h - 7) / 3.4))), xx + 2, yy + 8);
    }
  };
  const party = partyDetails(job);
  const shipperName = cfg?.shipperAs === 'SHIPPER_NAME' ? (party?.name || job.partyName) : 'Masum Logistics';
  const shipperAddress = cfg?.shipperAs === 'SHIPPER_NAME' ? (party?.address || job.bl.address) : 'Karachi';
  const delivery = agentAddress(job.bl.deliveryAgent || job.deliveryAgent);
  const consignee = cfg?.consigneeAs === 'DELIVERY_AGENT' ? delivery : job.bl.consignee;
  const notify = cfg?.notifyAs === 'DELIVERY_AGENT' ? delivery : [job.bl.notify, job.bl.alsoNotify].filter(Boolean).join('\n');
  const vessel = [job.bl.vessel || job.vessel, job.bl.voyage || job.voyage].filter(Boolean).join(' / ');
  const reference = job.bl.docRefNo || job.bl.reference || job.jobNo2 || job.jobNo;

  // Keep the source sheet's letterhead and split left/right information blocks.
  line(31.5);
  box(x, 34, leftWidth, 28, 'SHIPPER NAME & ADDRESS', `${shipperName}\n${shipperAddress}`);
  doc.setFont('helvetica', 'bold').setFontSize(14).text('MASTER B/L SPECIMEN', rightX + rightWidth / 2, 39, { align: 'center' });
  doc.setFontSize(8).text('OUR REFERENCE NUMBER :', rightX + 2, 47);
  doc.setFont('helvetica', 'bold').setFontSize(9).text(reference, rightX + 49, 47);
  doc.setDrawColor(80).setLineWidth(.25).rect(rightX, 50, rightWidth, 18);
  doc.setFont('helvetica', 'normal').setFontSize(8).text('TO:', rightX + 2, 56);
  doc.text(resolve(job.shippingLine, shippingLineRepo.list()), rightX + 14, 56, { maxWidth: rightWidth - 16 });
  doc.text('ATTN:', rightX + 2, 62);
  doc.text(agentAddress(job.sLineAgent), rightX + 14, 62, { maxWidth: rightWidth - 16 });

  box(x, 65, leftWidth, 24, 'CONSIGNEE NAME & ADDRESS', consignee);
  const route: [string, string][] = [
    ['NUMBER OF ORIGINAL B/Ls', String(job.bl.noOfOrigBLs || '')],
    ['VESSEL / VOYAGE', vessel],
    ['PORT OF LOADING/EXPORT', port(job.bl.placeOfLoading || job.portOfLoad)],
    ['PORT OF DISCHARGE', port(job.bl.placeOfDischarge || job.destination)],
    ['PLACE OF DELIVERY', port(job.bl.placeOfDelivery || job.destination)],
  ];
  route.forEach(([label, value], index) => {
    const yy = 67 + index * 10.5;
    doc.setFont('helvetica', 'bold').setFontSize(7.2).text(label, rightX, yy);
    doc.setDrawColor(120).setLineWidth(.2).line(rightX, yy + 2, rightX + rightWidth, yy + 2);
    doc.setFont('helvetica', 'normal').setFontSize(7.5).text(clean(value), rightX, yy + 6, { maxWidth: rightWidth });
  });
  box(x, 92, leftWidth, 23, 'NOTIFY PARTY/INTERMEDIATE CONSIGNEE', notify, 7);

  const containers = job.containers;
  const cargoWidths = [34, 107, 28, 27.5];
  const cargoHeaders = ['MARKS & NUMBERS', 'DESCRIPTION', 'GROSS WT.', 'MEASUREMENT'];
  const cargoValues = [job.bl.marksAndNos, job.bl.descriptionOfGoods || job.commodity, `${job.grossWeight.toFixed(3)} KGS`, `${job.cbm.toFixed(4)} M3`];
  let cargoX = x;
  cargoHeaders.forEach((label, index) => { box(cargoX, 118, cargoWidths[index], 9, label, '', 6.7, true); cargoX += cargoWidths[index]; });
  cargoX = x;
  cargoValues.forEach((value, index) => { box(cargoX, 127, cargoWidths[index], 18, '', value, 7); cargoX += cargoWidths[index]; });

  const colWidths = [width * .52, width * .20, width * .14, width * .14];
  const containerHeaders = ['CONTAINER NO.', 'SEAL NO.', 'PKGS', 'MEASUREMENT'];
  let cx = x;
  containerHeaders.forEach((label, index) => { box(cx, 146, colWidths[index], 9, label, '', 7, true); cx += colWidths[index]; });
  const visibleRows = Math.max(1, containers.length);
  const rowHeight = Math.min(6, 22 / visibleRows);
  for (let row = 0; row < visibleRows; row += 1) {
    const item = containers[row];
    const values = [item?.containerNo || '', item?.sealNo || '', item ? `${item.noOfPkgs || 0} ${item.unit || job.unit}`.trim() : String(job.noOfPackages || ''), item ? `${(item.cbm || job.cbm).toFixed(4)} M3` : `${job.cbm.toFixed(4)} M3`];
    cx = x;
    values.forEach((value, index) => { box(cx, 155 + row * rowHeight, colWidths[index], rowHeight, '', value, 7); cx += colWidths[index]; });
  }
  const summaryY = Math.max(178, 155 + visibleRows * rowHeight + 2);
  doc.setFont('helvetica', 'bold').setFontSize(7.2).text('LCL/FCL', x + 2, summaryY);
  doc.setFont('helvetica', 'normal').text(job.lclFcl, x + 25, summaryY);
  doc.setFont('helvetica', 'bold').text('GROSS WEIGHT', rightX, summaryY);
  doc.setFont('helvetica', 'normal').text(`${job.grossWeight.toFixed(3)} KGS`, rightX + 27, summaryY);
  doc.setFont('helvetica', 'bold').text('NET WEIGHT', rightX + 68, summaryY);
  doc.setFont('helvetica', 'normal').text(`${job.netWeight.toFixed(3)} KGS`, rightX + 90, summaryY);
  doc.setFont('helvetica', 'bold').setFontSize(7.2).text('ON BEHALF OF EXPORTER', x + 2, 215);
  doc.setFont('helvetica', 'normal').setFontSize(7.2).text(`${delivery}\n${job.partyName}`, x + 2, 221, { maxWidth: 95 });
  doc.setFont('helvetica', 'bold').text('Masum Logistics', x + width - 38, 221);
  doc.setFont('helvetica', 'normal').text(`Date: ${date(job.printing.todaysDate || job.date)}`, x + width - 38, 228);
  doc.setProperties({ title: `Master B/L Specimen - ${job.jobNo}` });
  return doc;
}
export function createOuterExcel(job: SeaExportJob) {
  const party = partyDetails(job);
  return createExcelWorkbook([{ name: 'Outer (Sea Export)', rows: [
    ['OUTER (SEA EXPORT)', ''], ['Job No.', job.jobNo], ['Date', date(job.printing.todaysDate || job.date)],
    ['B/L No.', job.bl.mblNo || job.mblNo], ['MBL Date', date(job.mblDate)], ['HBL No.', job.bl.hblNo || job.hblNo], ['HBL Date', date(job.bl.hblDate || job.hblDate)],
    ['PCS', job.noOfPcsQty || job.noOfPackages], ['CBM', job.cbm], ['Gross Weight', job.grossWeight], ['Charge Weight', job.volWeight],
    ['Party', `${job.partyCode} ${party?.name || job.partyName}`], ['Freight Term', job.bl.mop], ['Sub Agent', job.subAgentParty], ['LCL / FCL', job.lclFcl],
    ['Foreign Agent', foreignAgent(job.foreignAgent)], ['CY / CFS', job.cyCfs], ['Shipping Line', resolve(job.shippingLine, shippingLineRepo.list())],
    ['EGM No.', job.egm], ['Clearing Agent', agent(job.clearingAgent)], ['SB/GD No.', job.sbNo], ['S/Line Agent', agent(job.sLineAgent)],
    ['SB/GD Date', date(job.sbDate)], ['Delivery Agent', agent(job.deliveryAgent)], ['ETD', date(job.polEtd || job.sailingDate)], ['ETA', date(job.etaAtDest)],
    ['Port of Loading', port(job.bl.placeOfLoading || job.portOfLoad)], ['Destination', port(job.bl.placeOfDischarge || job.destination)],
    ['Ship Inv. No.', job.shipperInvoice.invNo], ['Ship Inv Date', date(job.shipperInvoice.date)], ['Vessel / Voyage', `${job.bl.vessel || job.vessel} / ${job.bl.voyage || job.voyage}`],
    ['Goods Description', job.bl.descriptionOfGoods || job.commodity], ['Currency', job.currencyCode], ['SPO Name', spoRepo.list().find((item) => item.code === codeOf(job.spoCode))?.name || job.spoCode],
    ['Remarks', job.bl.reference], [], ['Container No.', 'Size No.', 'Seal No.', 'Vehicle No.', 'Vehicle Date'],
    ...job.containers.map((container) => [container.containerNo, container.sizeType, container.sealNo, container.vehicleNo, date(container.vehicleDate)]),
  ], headerRows: [0, 35] }]);
}

export function createMasterBlSpecimenExcel(job: SeaExportJob) {
  const cfg = job.printing.masterBlSpecimen;
  const party = partyDetails(job);
  const shipper = cfg?.shipperAs === 'SHIPPER_NAME' ? party?.name || job.partyName : 'Masum Logistics';
  const consignee = cfg?.consigneeAs === 'DELIVERY_AGENT' ? agentAddress(job.deliveryAgent) : job.bl.consignee;
  const notify = cfg?.notifyAs === 'DELIVERY_AGENT' ? agentAddress(job.deliveryAgent) : [job.bl.notify, job.bl.alsoNotify].filter(Boolean).join('\n');
  return createExcelWorkbook([{ name: 'Master BL Specimen', rows: [
    ['MASTER B/L SPECIMEN', ''], ['Our Reference Number', job.bl.docRefNo || job.bl.reference || job.jobNo2 || job.jobNo], ['To', resolve(job.shippingLine, shippingLineRepo.list())],
    ['Shipper Name & Address', `${shipper}\n${cfg?.shipperAs === 'SHIPPER_NAME' ? party?.address || job.bl.address : 'Karachi'}`],
    ['Consignee Name & Address', consignee], ['Notify Party / Intermediate Consignee', notify],
    ['Marks & Numbers', job.bl.marksAndNos], ['Description', job.bl.descriptionOfGoods || job.commodity], ['Vessel / Voyage', `${job.bl.vessel || job.vessel} / ${job.bl.voyage || job.voyage}`],
    ['Port of Loading / Export', port(job.bl.placeOfLoading || job.portOfLoad)], ['Port of Discharge', port(job.bl.placeOfDischarge || job.destination)],
    ['Place of Delivery', port(job.bl.placeOfDelivery || job.destination)], ['Number of Original B/Ls', job.bl.noOfOrigBLs], ['LCL / FCL', job.lclFcl],
    ['Container No.', 'Seal No.', 'Packages', 'Gross Weight', 'Measurement'],
    ...job.containers.map((container) => [container.containerNo, container.sealNo, container.noOfPkgs, container.grossWeight, container.cbm]),
  ], headerRows: [0, 14] }]);
}
