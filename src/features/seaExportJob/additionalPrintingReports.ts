import { jsPDF } from 'jspdf';
import { agentRepo, partyRepo, spoRepo } from '../../data/masterDataService';
import { SeaExportJob } from '../../domain/seaExportJob';
import { createExcelWorkbook } from '../../utils/excelWorkbook';

const clean = (value: unknown) => String(value ?? '').trim();
const date = (value: string) => value ? new Date(`${value}T00:00:00`).toLocaleDateString('en-GB') : '';
const codeOf = (value: string) => value.split(' - ')[0].trim();
const agentName = (value: string) => {
  const code = codeOf(value);
  return agentRepo.list().find((row) => row.code === code)?.name || value;
};
const partyAddress = (job: SeaExportJob) => partyRepo.list().find((row) => row.code === codeOf(job.partyCode))?.address || job.bl.address;
const spoName = (job: SeaExportJob) => spoRepo.list().find((row) => row.code === codeOf(job.spoCode))?.name || job.spoCode;

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

function newPage(title: string, withHeader: boolean, header?: string) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  if (withHeader && header) doc.addImage(header, 'PNG', 12, 5, 186, 28, undefined, 'FAST');
  const y = withHeader ? 43 : 20;
  doc.setFont('helvetica', 'bold').setFontSize(12).text(title.toUpperCase(), 105, y, { align: 'center' });
  return { doc, y: y + 10 };
}

function writeWrapped(doc: jsPDF, value: string, x: number, y: number, width: number, size = 9, lineHeight = 4.5) {
  if (!value) return y;
  const lines = doc.setFont('helvetica', 'normal').setFontSize(size).splitTextToSize(value, width) as string[];
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

function detail(doc: jsPDF, label: string, value: string, x: number, y: number, valueX = 56) {
  doc.setFont('helvetica', 'bold').setFontSize(8.5).text(label, x, y);
  doc.setFont('helvetica', 'normal').setFontSize(8.5).text(':', x + valueX - 3, y);
  const lines = doc.splitTextToSize(value || '-', 210 - x - valueX - 15) as string[];
  doc.text(lines, x + valueX, y);
  return y + Math.max(6, lines.length * 4);
}

export async function createExtraSheetPdf(job: SeaExportJob) {
  const header = await loadHeader();
  const { doc, y: titleY } = newPage('Attached Sheet', true, header);
  const bl = job.bl;
  let y = titleY + 8;
  doc.setFont('helvetica', 'bold').setFontSize(8).text(`HBL No.: ${clean(bl.hblNo || job.hblNo)}`, 160, titleY + 1, { align: 'right' });
  y = detail(doc, 'Vessel', clean(bl.vessel || job.vessel), 14, y);
  y = detail(doc, 'Voyage', clean(bl.voyage || job.voyage), 14, y);
  y = detail(doc, 'Place of Receipt', clean(bl.placeOfReceipt), 14, y);
  y = detail(doc, 'Place of Delivery', clean(bl.placeOfDelivery || job.destination), 14, y);
  y += 5;
  doc.setLineWidth(.5).rect(14, y, 182, 145);
  doc.setFont('helvetica', 'bold').setFontSize(9).text('Description', 105, y + 7, { align: 'center' });
  doc.line(14, y + 10, 196, y + 10);
  writeWrapped(doc, clean(bl.descriptionOfGoods || job.commodity), 18, y + 17, 174, 9, 5);
  const footerY = 278;
  doc.setLineWidth(.5).line(14, footerY, 196, footerY);
  doc.setFont('helvetica', 'bold').setFontSize(9).text('************* End Attached Rider *************', 105, footerY - 4, { align: 'center' });
  doc.setProperties({ title: `Extra Sheet - ${job.bl.hblNo || job.hblNo || job.jobNo}` });
  return doc;
}

export async function createReleaseInstructionsPdf(job: SeaExportJob) {
  const header = job.printing.printOn === 'PLAIN_PAPER' ? await loadHeader() : undefined;
  const { doc, y: startY } = newPage('Release Instruction', job.printing.printOn === 'PLAIN_PAPER', header);
  const bl = job.bl;
  const printDate = date(job.printing.todaysDate || job.date);
  doc.setFont('helvetica', 'normal').setFontSize(9).text(`Date :  ${printDate}`, 20, startY);
  if (job.printing.attention) doc.text(`Attention :  ${job.printing.attention}`, 20, startY + 9);
  let y = startY + (job.printing.attention ? 22 : 14);
  doc.setFont('helvetica', 'bold').setFontSize(10).text('OBL SURRENDERING :', 20, y);
  doc.line(20, y + 2, 82, y + 2); y += 14;
  y = detail(doc, 'HB/L No.', clean(bl.hblNo || job.hblNo), 20, y);
  y = detail(doc, 'NO. OF PKGS', [job.noOfPackages, job.unit].filter((value) => value !== '' && value !== 0).join(' '), 20, y);
  y = detail(doc, 'POD', clean(bl.placeOfDischarge || job.destination), 20, y);
  y = detail(doc, 'FREIGHT', clean(bl.mop), 20, y);
  y = detail(doc, 'VESSEL', clean(bl.vessel || job.vessel), 20, y);
  y = detail(doc, 'CONT Nos.', job.containers.map((row) => row.containerNo).filter(Boolean).join(', '), 20, y);
  y = detail(doc, 'SHIPPER', clean(job.partyName), 20, y);
  y += 2;
  y = detail(doc, 'CONSIGNEE', clean(bl.consignee), 20, y);
  y += 7;
  y = writeWrapped(doc, job.printing.note, 20, y, 168, 9, 5) + 7;
  doc.setFont('helvetica', 'normal').setFontSize(10).text('Yours Truly,', 20, y);
  doc.setFont('helvetica', 'bold').text('Masum Logistics', 20, y + 11);
  doc.setProperties({ title: `Release Instructions - ${bl.hblNo || job.hblNo || job.jobNo}` });
  return doc;
}

export async function createStuffingDetailPdf(job: SeaExportJob) {
  const header = job.printing.printOn === 'PLAIN_PAPER' ? await loadHeader() : undefined;
  const { doc, y: startY } = newPage('Stuffing Detail', job.printing.printOn === 'PLAIN_PAPER', header);
  const bl = job.bl;
  let y = startY + 2;
  doc.setFont('helvetica', 'bold').setFontSize(9).text(`DATE :  ${date(job.printing.todaysDate || job.date)}`, 145, y, { align: 'left' });
  y += 14;
  doc.setFont('helvetica', 'bold').setFontSize(10).text(`M/S ${job.partyName}`, 20, y); y += 14;
  doc.setFont('helvetica', 'normal').setFontSize(10).text('Dear Sir,', 20, y); y += 9;
  y = writeWrapped(doc, 'We have pleasure in advising you that undermentioned shipments has been Stuffed into Container and now you are kindly requested to send us the BL formats and all related shipping documents to us ASAP for the above shipment enable us to send the documents to Shipping Line well in time.', 20, y, 170, 9, 5) + 9;
  doc.setFont('helvetica', 'bold').setFontSize(9).text('Stuffing Details As Follows,', 20, y); y += 10;
  const partyOrAgent = agentName(bl.agentParty || job.deliveryAgent || job.foreignAgent);
  const goodsRows: [string, string][] = [
    ['Shipper', partyOrAgent],
    ['Clearing Agent', agentName(job.clearingAgent)],
    ['Vol. Weight (Kgs)', job.volWeight ? String(job.volWeight) : ''],
    ['CBM', job.cbm ? String(job.cbm) : ''],
    ['MBL No.', clean(bl.mblNo || job.mblNo)],
    ['HBL No.', clean(bl.hblNo || job.hblNo)],
    ['Packages', [job.noOfPackages, job.unit].filter((value) => value !== '' && value !== 0).join(' ')],
    ['Destination', clean(bl.placeOfDischarge || job.destination)],
    ['Vessel & Voyage', [clean(bl.vessel || job.vessel), clean(bl.voyage || job.voyage)].filter(Boolean).join(' / ')],
    ['ETD Karachi', date(job.polEtd || job.sailingDate)],
    ['ETA Destination', date(job.etaAtDest)],
    ['Shipping Line', clean(job.shippingLine)],
    ['Container No.', job.containers.map((row) => row.containerNo).filter(Boolean).join(', ')],
    ['Seal No.', job.containers.map((row) => row.sealNo).filter(Boolean).join(', ')],
    ['Job No.', `${job.jobNo}${job.jobNo2 ? ` / ${job.jobNo2}` : ''}`],
    ['Delivery Agent', agentName(job.deliveryAgent)],
  ];
  if (job.printing.stuffingDetail?.printSpoName) goodsRows.splice(15, 0, ['SPO Name', spoName(job)]);
  goodsRows.forEach(([label, content]) => {
    if (y > 250) { doc.addPage(); y = 20; }
    doc.setFont('helvetica', 'bold').setFontSize(9).text(label, 20, y);
    doc.setFont('helvetica', 'bold').setFontSize(9).text(':', 51, y);
    doc.setFont('helvetica', 'normal').setFontSize(9).text(content || '-', 55, y, { maxWidth: 140 });
    y += 6;
  });
  y += 8;
  y = writeWrapped(doc, 'If you want any further Information / Clarification Please do not hesitate to contact our Customer Service Department.', 20, y, 170, 9, 5) + 8;
  doc.setFont('helvetica', 'bold').setFontSize(10).text('With Best Regards.', 20, y);
  doc.text('For Masum Logistics', 20, y + 12);
  doc.setProperties({ title: `Stuffing Detail - ${job.jobNo}` });
  return doc;
}

export function createExtraSheetExcel(job: SeaExportJob) {
  return createExcelWorkbook([{ name: 'Extra Sheet', rows: [
    ['ATTACHED SHEET', ''], ['Job No.', job.jobNo], ['HBL No.', job.bl.hblNo || job.hblNo],
    ['Vessel', job.bl.vessel || job.vessel], ['Voyage', job.bl.voyage || job.voyage],
    ['Place of Receipt', job.bl.placeOfReceipt], ['Place of Delivery', job.bl.placeOfDelivery || job.destination],
    ['Description', job.bl.descriptionOfGoods || job.commodity],
  ], headerRows: [0] }]);
}

export function createReleaseInstructionsExcel(job: SeaExportJob) {
  return createExcelWorkbook([{ name: 'Release Instructions', rows: [
    ['RELEASE INSTRUCTION', ''], ['Date', date(job.printing.todaysDate || job.date)], ['Attention', job.printing.attention],
    ['OBL Surrendering', ''], ['HBL No.', job.bl.hblNo || job.hblNo], ['No. of Packages', job.noOfPackages], ['Unit', job.unit],
    ['POD', job.bl.placeOfDischarge || job.destination], ['Freight', job.bl.mop], ['Vessel', job.bl.vessel || job.vessel],
    ['Container Nos.', job.containers.map((row) => row.containerNo).filter(Boolean).join(', ')], ['Shipper', job.partyName],
    ['Consignee', job.bl.consignee], ['Note', job.printing.note],
  ], headerRows: [0] }]);
}

export function createStuffingDetailExcel(job: SeaExportJob) {
  const rows: (string | number)[][] = [
    ['STUFFING DETAIL', ''], ['Date', date(job.printing.todaysDate || job.date)], ['M/S', job.partyName],
    ['Shipper', agentName(job.bl.agentParty || job.deliveryAgent || job.foreignAgent)], ['Clearing Agent', agentName(job.clearingAgent)],
    ['Vol. Weight (Kgs)', job.volWeight], ['CBM', job.cbm], ['MBL No.', job.bl.mblNo || job.mblNo], ['HBL No.', job.bl.hblNo || job.hblNo],
    ['Packages', job.noOfPackages], ['Unit', job.unit], ['Destination', job.bl.placeOfDischarge || job.destination],
    ['Vessel & Voyage', `${job.bl.vessel || job.vessel} ${job.bl.voyage || job.voyage}`], ['ETD Karachi', date(job.polEtd || job.sailingDate)],
    ['ETA Destination', date(job.etaAtDest)], ['Shipping Line', job.shippingLine], ['Container No.', job.containers.map((row) => row.containerNo).filter(Boolean).join(', ')],
    ['Seal No.', job.containers.map((row) => row.sealNo).filter(Boolean).join(', ')], ['Job No.', job.jobNo], ['Delivery Agent', agentName(job.deliveryAgent)],
  ];
  if (job.printing.stuffingDetail?.printSpoName) rows.splice(19, 0, ['SPO Name', spoName(job)]);
  return createExcelWorkbook([{ name: 'Stuffing Detail', rows, headerRows: [0] }]);
}
