import { jsPDF } from 'jspdf';
import { SeaExportJob } from '../../domain/seaExportJob';
import { createExcelWorkbook } from '../../utils/excelWorkbook';

const date = (value: string) => value ? new Date(`${value}T00:00:00`).toLocaleDateString('en-GB') : '';
const clean = (value: unknown) => String(value ?? '').trim();

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

function reportRows(job: SeaExportJob) {
  const bl = job.bl;
  const ins = job.instructionLetter;
  const route = (place: string, fallback: string) => clean(place) || clean(fallback);
  const containers = job.containers.map((row) => row.containerNo).filter(Boolean).join(', ');
  const transshipment = job.transshipmentPoints
    .filter((point) => point.destinationCode || point.eta || point.etd || point.vessel)
    .map((point) => `${point.destinationCode}${point.eta ? ` (ETA ${date(point.eta)})` : ''}${point.etd ? ` (ETD ${date(point.etd)})` : ''}${point.vessel ? ` / ${point.vessel} ${point.voyage}` : ''}`)
    .join('; ');
  const lclFcl = ({ LL: 'LCL / LCL', LF: 'LCL / FCL', FL: 'FCL / LCL', FF: 'FCL / FCL', PF: 'Part Load / FCL' } as Record<string, string>)[job.lclFcl] || job.lclFcl;
  return [
    ['Shipper / Exporter', `${clean(job.partyName)}${job.bl.address ? `, ${clean(job.bl.address)}` : ''}`],
    ['Consignee', clean(bl.consignee) || clean(ins.consignee)],
    ['Notify Party', clean(bl.notify) || clean(ins.notify)],
    ['Clearing Agent', clean(job.clearingAgent)],
    ['Vessel / Voyage', [clean(bl.vessel) || clean(job.vessel), clean(bl.voyage) || clean(job.voyage)].filter(Boolean).join(' / ')],
    ['Port of Loading', route(bl.placeOfLoading, job.portOfLoad)],
    ['Port of Discharge', route(bl.placeOfDischarge, job.destination)],
    ['Place of Delivery', route(bl.placeOfDelivery, job.destination)],
    ['LCL / FCL', lclFcl],
    ['Commodity', clean(job.commodity) || clean(bl.descriptionOfGoods)],
    ['Booking No.', clean(bl.bookingNo) || clean(job.bookingNo)],
    ['MBL No.', clean(bl.mblNo) || clean(job.mblNo)],
    ['HBL No.', clean(bl.hblNo) || clean(job.hblNo)],
    ['Container No(s).', containers],
    ['Seal No(s).', job.containers.map((row) => row.sealNo).filter(Boolean).join(', ')],
    ['No. of Packages', [job.noOfPackages, job.unit].filter((part) => part !== '' && part !== 0).join(' ')],
    ['Gross Weight', job.grossWeight ? `${job.grossWeight} kg` : ''],
    ['Net Weight', job.netWeight ? `${job.netWeight} kg` : ''],
    ['CBM', job.cbm ? String(job.cbm) : ''],
    ['ETD', date(job.polEtd || job.sailingDate)],
    ['ETA at Destination', date(job.etaAtDest)],
    ['Transshipment', transshipment],
  ];
}

export async function createShipmentStatusPdf(job: SeaExportJob) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  if (job.printing.printOn === 'PLAIN_PAPER') {
    const header = await loadHeader();
    doc.addImage(header, 'PNG', 10, 6, 190, 25, undefined, 'FAST');
  }
  let y = job.printing.printOn === 'PLAIN_PAPER' ? 38 : 20;
  const text = (value: string, x: number, yy: number, size = 8, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal').setFontSize(size).text(value, x, yy);
  };
  text(`Date: ${date(job.printing.todaysDate)}`, 145, y, 8, true);
  text(`Job No.: ${job.jobNo}`, 145, y + 5, 8, true);
  y += 13;
  text('SHIPMENT STATUS', 105, y, 12, true);
  doc.line(76, y + 1.5, 134, y + 1.5);
  y += 11;
  if (job.printing.attention) { text(`Attention: ${job.printing.attention}`, 14, y, 8, true); y += 7; }
  text('Dear Sir,', 14, y); y += 5;
  text('Please note the status of your shipment with following particulars:', 14, y); y += 8;
  const rows = reportRows(job);
  const left = rows.slice(0, Math.ceil(rows.length / 2));
  const right = rows.slice(Math.ceil(rows.length / 2));
  const drawColumn = (items: string[][], x: number) => {
    let yy = y;
    items.forEach(([label, value]) => {
      text(label, x, yy, 7.1, true);
      text(':', x + 42, yy, 7.1, true);
      const lines = doc.splitTextToSize(value || '-', 48) as string[];
      doc.setFont('helvetica', 'normal').setFontSize(7.1).text(lines, x + 45, yy);
      const height = Math.max(5.3, lines.length * 3.2);
      doc.line(x + 45, yy + 1, x + 96, yy + 1);
      yy += height;
    });
    return yy;
  };
  const bottom = Math.max(drawColumn(left, 14), drawColumn(right, 108));
  y = bottom + 5;
  if (job.printing.note) {
    text('Note:', 14, y, 7.5, true); y += 4;
    const noteLines = doc.splitTextToSize(job.printing.note, 180) as string[];
    doc.setFont('helvetica', 'normal').setFontSize(7.5).text(noteLines, 14, y);
    y += noteLines.length * 4 + 5;
  }
  text('Please feel free to contact us in this regard.', 14, y); y += 5;
  text('With Best Regards,', 14, y); y += 8;
  text('For : Masum Logistics', 14, y, 8, true);
  doc.setProperties({ title: `Shipment Status - ${job.jobNo}`, subject: `Shipment status report for job ${job.jobNo}` });
  return doc;
}

export function createShipmentStatusExcel(job: SeaExportJob) {
  const rows = [
    ['SHIPMENT STATUS REPORT', ''],
    ['Branch', job.branch],
    ['Job No.', job.jobNo],
    ['Date', date(job.printing.todaysDate)],
    ['Attention', job.printing.attention],
    ...reportRows(job),
    ['Note', job.printing.note],
  ];
  return createExcelWorkbook([{ name: 'Shipment Status', rows, headerRows: [0] }]);
}
