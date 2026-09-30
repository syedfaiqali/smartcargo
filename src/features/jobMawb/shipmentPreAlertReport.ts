import { jsPDF } from 'jspdf';
import { Job } from '../../domain/job';

const headerUrl = `${import.meta.env.BASE_URL}masum-logistics-header.png`;
let headerImage: string | undefined;

async function loadHeaderImage() {
  if (headerImage) return headerImage;
  const response = await fetch(headerUrl);
  if (!response.ok) throw new Error('The shipment pre-alert header could not be loaded.');
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
const value = (text: string | number | undefined) => String(text ?? '');

/** Shipment pre-alert summary used by Air Export MAWB printing. */
export async function printShipmentPreAlert(job: Job) {
  const header = await loadHeaderImage();
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const shipment = job.chargeLines[0];
  const houses = job.houseAwbs;
  const savedFlights = job.remarks.flightLegs.filter((flight) => flight.flightNo || flight.flightDate || flight.routing || flight.status);
  const flights = savedFlights.length
    ? savedFlights.map((flight) => ({ flightNo: flight.flightNo, date: flight.flightDate, routing: flight.routing, status: flight.status }))
    : [{ flightNo: job.routing.flightNo1, date: job.routing.flightDate, routing: `${job.routing.airportOfDeparture}-${job.routing.destination}`, status: '' }];
  const text = (content: string, x: number, y: number, size = 7, style: 'normal' | 'bold' = 'normal', align: 'left' | 'center' | 'right' = 'left') =>
    doc.setFont('helvetica', style).setFontSize(size).text(content, x, y, { align });
  const cell = (x: number, y: number, w: number, h: number, content = '', size = 7, align: 'left' | 'center' | 'right' = 'left') => {
    doc.rect(x, y, w, h);
    if (content) text(content, align === 'left' ? x + 1 : x + w / 2, y + h / 2 + 1.5, size, 'bold', align);
  };
  const detail = (label: string, content: string, y: number, labelX = 14, valueX = 60) => {
    text(label, labelX, y, 7.1, 'bold'); text(':', valueX - 5, y, 7.1, 'bold'); text(content || '-', valueX, y, 7.1);
  };

  doc.setProperties({ title: 'Shipment Pre-Alert', subject: `Pre-alert for ${job.mawbNo}` });
  doc.setLineWidth(.55); doc.rect(1, 1, 208, 295);
  doc.addImage(header, 'PNG', 2, -17, 205, 68.5, undefined, 'FAST');
  doc.setLineWidth(.25); doc.line(17, 35, 192, 35);
  text('SHIPMENT PRE-ALERT', 105, 44, 12, 'bold', 'center'); doc.line(69, 46, 141, 46);
  text('Date', 151, 40, 6.5, 'bold'); text(':', 164, 40, 6.5, 'bold'); text(date(job.printing.shipmentPreAlertLetterDate || job.awbDate || job.jobDate), 170, 40, 6.5, 'bold');

  detail('MASTER AWB NO.', job.mawbNo, 53);
  detail('TO', job.agents.deliveryAgent || job.consignee.name, 59);
  detail('PORT OF ORIGIN', job.routing.airportOfDeparture, 65);
  detail('PORT OF DISCHARGE', job.routing.destination, 71);
  detail('WEIGHT', `${value(shipment?.grossWt)} Kg`, 77);
  detail('AIRLINE', job.owner, 83);
  detail('PCS', value(shipment?.pcs), 77, 92, 111);
  detail('Commodity', job.saidToContain || shipment?.comdty || '', 77, 134, 157);

  const x = 13; const widths = [24, 10, 13, 18, 15, 31, 31, 49]; const headers = ['HAWB No.', 'MOP', 'No. of\nPcs.', 'Weight\nKgs', 'Final\nDest', 'Nature of Goods', 'Shipper\nName & Address', 'Consignee\nName & Address'];
  cell(x, 90, 41, 8, 'HOUSE AWB DETAIL', 6.8);
  let left = x;
  widths.forEach((width, index) => { cell(left, 98, width, 12); headers[index].split('\n').forEach((line, row) => text(line, left + width / 2, 103 + row * 3.3, 6.1, 'bold', 'center')); left += width; });
  let rowY = 110;
  houses.slice(0, 6).forEach((house) => {
    const entries = [house.hawbNo, house.runNo, '', '', job.routing.destination, job.saidToContain || shipment?.comdty || '', job.party.name, job.consignee.name];
    left = x; widths.forEach((width, index) => { cell(left, rowY, width, 8, entries[index], 5.8, index === 5 || index > 5 ? 'left' : 'center'); left += width; }); rowY += 8;
  });
  if (!houses.length) { left = x; widths.forEach((width) => { cell(left, rowY, width, 8); left += width; }); rowY += 8; }
  const totalsY = rowY + 5;
  detail('TOTAL CARTONS', value(shipment?.pcs || 0), totalsY, 14, 62); detail('TOTAL GROSS WEIGHT', `${value(shipment?.grossWt || 0)} Kg`, totalsY, 108, 165);
  detail('TOTAL NO. OF HAWB', value(houses.length), totalsY + 9, 14, 62); detail('TOTAL CHARGE WEIGHT', `${value(shipment?.chargeWt || 0)} Kg`, totalsY + 9, 108, 165);

  const flightY = totalsY + 15; const flightWidths = [30, 36, 86, 37]; const flightHeads = ['FLIGHT', 'DATE', 'ROUTING', 'STATUS']; left = x;
  flightWidths.forEach((width, index) => { cell(left, flightY, width, 7, flightHeads[index], 7.2, 'center'); left += width; });
  let flightRowY = flightY + 7;
  flights.slice(0, 5).forEach((flight) => { const entries = [flight.flightNo, date(flight.date), flight.routing, flight.status]; left = x; flightWidths.forEach((width, index) => { cell(left, flightRowY, width, 9, entries[index], 6.5, 'center'); left += width; }); flightRowY += 9; });
  if (!flights.length) { left = x; flightWidths.forEach((width) => { cell(left, flightRowY, width, 9); left += width; }); }
  text('For : Masum Logistics', 15, flightRowY + 20, 7, 'bold');
  window.open(doc.output('bloburl'), '_blank');
}
