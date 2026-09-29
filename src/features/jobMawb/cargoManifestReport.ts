import { jsPDF } from 'jspdf';
import { Job } from '../../domain/job';

const headerUrl = `${process.env.PUBLIC_URL}/masum-logistics-header.png`;
let headerImage: string | undefined;
const date = (value: string) => value ? new Date(`${value}T00:00:00`).toLocaleDateString('en-GB') : '';

async function loadHeader() {
  if (headerImage) return headerImage;
  const response = await fetch(headerUrl);
  if (!response.ok) throw new Error('The cargo manifest header could not be loaded.');
  const blob = await response.blob();
  headerImage = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(reader.error); reader.readAsDataURL(blob); });
  return headerImage;
}

export async function printCargoManifest(job: Job) {
  const header = await loadHeader();
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const line = job.chargeLines[0];
  const houseRows = job.houseAwbs.length ? job.houseAwbs : [{ jobNo: '', hawbNo: '', runNo: '' }];
  const text = (value: string, x: number, y: number, size = 7, style: 'normal' | 'bold' = 'normal', align: 'left' | 'center' | 'right' = 'left') => doc.setFont('helvetica', style).setFontSize(size).text(value, x, y, { align });
  const cell = (x: number, y: number, w: number, h: number, value = '', size = 7, align: 'left' | 'center' | 'right' = 'left') => { doc.rect(x, y, w, h); if (value) text(value, align === 'left' ? x + 1 : x + w / 2, y + h / 2 + 1.5, size, 'bold', align); };
  const detail = (label: string, value: string, x: number, y: number) => { text(label, x, y, 6.3, 'bold'); text(':', x + 17, y, 6.3); text(value, x + 21, y, 6.3); };

  doc.setLineWidth(.55); doc.line(1, 1, 209, 1); doc.addImage(header, 'PNG', 2, -17, 205, 68.5, undefined, 'FAST');
  text('CONSOLIDATED CARGO MANIFEST / PRE-ALERT', 105, 40, 11.5, 'bold', 'center'); doc.setLineWidth(.3); doc.line(34, 42, 176, 42);
  cell(12, 45, 47, 8, 'MASTER AWB DETAIL', 6.8); cell(12, 53, 88, 30); cell(100, 53, 88, 30);
  text('Shipper Name & Address :', 13, 58, 6.8, 'bold'); text('Consignee Name & Address :', 101, 58, 6.8, 'bold'); text(job.party.name, 13, 65, 7, 'bold'); text(job.party.address, 13, 70, 6); text(job.consignee.name, 101, 65, 7, 'bold'); text(job.consignee.address, 101, 70, 6);
  detail('MAWB No.', job.mawbNo, 13, 88); detail('Total Pcs', String(line?.pcs ?? 0), 60, 88); detail('Airport of Dep.', job.routing.airportOfDeparture, 115, 88);
  detail('Date', date(job.awbDate || job.jobDate), 13, 94); detail('Total Gross Wt', `${line?.grossWt ?? 0} Kg`, 60, 94); detail('Airport of Dest.', job.routing.destination, 115, 94);
  detail('Flight No.', job.routing.flightNo1, 13, 100); detail('Flight No.', job.routing.flightNo2 || job.routing.flightNo1, 60, 100); detail('Routing 1', job.routing.legs[0]?.to || '', 115, 100);
  detail('Date', date(job.routing.flightDate), 13, 106); detail('Date', date(job.routing.flightDate2), 60, 106); detail('Routing 2', job.routing.legs[1]?.to || '', 115, 106);
  cell(12, 112, 47, 8, 'HOUSE AWB DETAIL', 6.8);
  const widths = [24, 10, 12, 17, 16, 46, 30, 30]; const headings = ['HAWB No.', 'MOP', 'No. of\nPcs.', 'Weight\nKGs', 'Final\nDest', 'Nature of Goods', 'Shipper\nName & Address', 'Consignee\nName & Address']; let left = 12;
  widths.forEach((width, index) => { cell(left, 120, width, 12); const pieces = headings[index].split('\n'); pieces.forEach((piece, row) => text(piece, left + width / 2, 125 + row * 3.4, 6.1, 'bold', 'center')); left += width; });
  let rowY = 132;
  houseRows.forEach((house) => { left = 12; const values = [house.hawbNo, house.runNo, '', '', job.routing.destination, '', '', '']; widths.forEach((width, index) => { cell(left, rowY, width, 8, values[index], 6); left += width; }); rowY += 8; });
  cell(12, rowY, 34, 8, 'TOTAL', 7.2); left = 46; widths.slice(1).forEach((width) => { cell(left, rowY, width, 8); left += width; });
  const totalY = rowY + 15; text('TOTAL NO. OF PACKAGES', 13, totalY, 7, 'bold'); text(':', 78, totalY, 7); text(String(line?.pcs ?? 0), 82, totalY, 7, 'bold'); text('TOTAL GROSS WEIGHT', 13, totalY + 7, 7, 'bold'); text(':', 78, totalY + 7, 7); text(`${line?.grossWt ?? 0} Kgs`, 82, totalY + 7, 7, 'bold'); text('TOTAL CHARGEABLE WEIGHT', 13, totalY + 14, 7, 'bold'); text(':', 78, totalY + 14, 7); text(String(line?.chargeWt ?? 0), 82, totalY + 14, 7, 'bold'); text('TOTAL NO. OF HAWBS', 13, totalY + 21, 7, 'bold'); text(':', 78, totalY + 21, 7); text(String(job.houseAwbs.length), 82, totalY + 21, 7, 'bold');
  text('For : Masum Logistics', 15, totalY + 42, 7, 'bold');
  window.open(doc.output('bloburl'), '_blank');
}
