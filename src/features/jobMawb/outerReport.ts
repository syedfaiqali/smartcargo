import { jsPDF } from 'jspdf';
import { Job } from '../../domain/job';

const headerUrl = `${process.env.PUBLIC_URL}/masum-logistics-header.png`;
let headerImage: string | undefined;

async function loadHeaderImage() {
  if (headerImage) return headerImage;
  const response = await fetch(headerUrl);
  if (!response.ok) throw new Error('The outer report header could not be loaded.');
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

/** Compact outer cover sheet for an Air Export job. */
export async function printOuterReport(job: Job) {
  const header = await loadHeaderImage();
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const shipment = job.chargeLines[0];
  const text = (content: string, x: number, y: number, size = 7, style: 'normal' | 'bold' = 'normal', align: 'left' | 'center' | 'right' = 'left') =>
    doc.setFont('helvetica', style).setFontSize(size).text(content || '-', x, y, { align });
  const cell = (x: number, y: number, width: number, height: number, content = '', size = 7, align: 'left' | 'center' | 'right' = 'left') => {
    doc.rect(x, y, width, height);
    if (content) text(content, align === 'left' ? x + 1 : x + width / 2, y + height / 2 + 1.5, size, 'bold', align);
  };
  const detail = (label: string, content: string, x: number, y: number) => { text(label, x, y, 7.2, 'bold'); text(':', x + 32, y, 7.2, 'bold'); text(content, x + 36, y, 7.2); };

  doc.setProperties({ title: 'Outer Air Export', subject: `Outer sheet for ${job.mawbNo}` });
  doc.setLineWidth(.55); doc.rect(1, 1, 208, 295);
  doc.addImage(header, 'PNG', 2, -17, 205, 68.5, undefined, 'FAST');
  doc.setLineWidth(.25); doc.line(17, 35, 192, 35);
  text('OUTER (AIR EXPORT)', 105, 44, 11, 'bold', 'center');

  const top = 48;
  cell(7, top, 64, 10); cell(71, top, 79, 10); cell(150, top, 51, 10);
  detail('M/JOB No.', job.jobNo, 8, top + 6); detail('H/Job No.', job.hawbNo || '', 77, top + 6);
  text('Date', 154, top + 6, 7.2, 'bold'); text(':', 166, top + 6, 7.2, 'bold'); text(date(job.awbDate || job.jobDate), 170, top + 6, 7.2, 'bold');
  const cols = [51, 44, 21, 16, 18, 26, 25]; const heads = ['MAWB No.', 'HAWB No.', 'Date', 'PP/CC', 'PCS', 'Gs. Weight', 'Ch. Weight']; const values = [job.mawbNo, job.hawbNo || '', date(job.awbDate || job.jobDate), job.printing.printChargeType, String(shipment?.pcs ?? ''), `${shipment?.grossWt ?? ''}`, `${shipment?.chargeWt ?? ''}`];
  let left = 7;
  cols.forEach((width, index) => { cell(left, 60, width, 8, heads[index], 7.2, 'center'); cell(left, 68, width, 8, values[index], 7.2, 'center'); left += width; });

  doc.rect(3, 80, 202, 86);
  detail('Party', `${job.party.partyCode}    ${job.party.name}`, 7, 89);
  detail('Sub Agent', job.party.agentParty || job.agents.clearingAgent, 7, 96);
  detail('Foreign Agent', job.agents.deliveryAgent, 7, 103);
  detail('Origin', job.routing.airportOfDeparture, 7, 110);
  detail('Destination', job.routing.destination, 7, 117);
  detail('Goods Description', job.saidToContain || shipment?.comdty || '', 7, 124);
  detail('Shipment Status', job.shipmentStatus, 7, 131);
  detail('Consignee', job.consignee.name, 7, 138);
  detail('SPO Name', job.agents.spoCode, 7, 153);
  detail('Remarks', job.remarks.printableRemarks || job.otherInformation, 7, 160);
  detail('Flight No.', job.routing.flightNo1, 135, 89);
  detail('Flight Date', date(job.routing.flightDate), 135, 96);
  detail('Form E No.', job.routing.formENo, 135, 103);
  detail('Form E Date', date(job.routing.formEDate), 135, 110);
  detail('Ship. Inv. No.', job.routing.shipperInvoiceNo, 135, 117);

  window.open(doc.output('bloburl'), '_blank');
}
