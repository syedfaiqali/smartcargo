import { jsPDF } from 'jspdf';
import { Job } from '../../domain/job';

const headerUrl = `${process.env.PUBLIC_URL}/masum-logistics-header.png`;
let headerImage: string | undefined;

async function loadHeaderImage() {
  if (headerImage) return headerImage;
  const response = await fetch(headerUrl);
  if (!response.ok) throw new Error('The acceptance statement header could not be loaded.');
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

/** Acceptance declaration required for US-bound master air waybill shipments. */
export async function printMawbAcceptanceStatement(job: Job) {
  const header = await loadHeaderImage();
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const text = (content: string, x: number, y: number, size = 8, style: 'normal' | 'bold' = 'normal', align: 'left' | 'center' | 'right' = 'left') =>
    doc.setFont('helvetica', style).setFontSize(size).text(content, x, y, { align });
  const wrapped = (content: string, x: number, y: number, width: number, size = 8.5) =>
    doc.setFont('helvetica', 'normal').setFontSize(size).text(doc.splitTextToSize(content, width), x, y, { lineHeightFactor: 1.08 });
  const detail = (label: string, content: string, y: number) => { text(label, 14, y, 8, 'bold'); text('-', 88, y, 8, 'bold'); text(content || '-', 98, y, 8, 'bold'); };

  doc.setProperties({ title: 'Master Air Waybill Acceptance Statement (US-Bound)', subject: `Acceptance statement for ${job.mawbNo}` });
  doc.setLineWidth(.55); doc.rect(1, 1, 208, 295);
  doc.addImage(header, 'PNG', 2, -17, 205, 68.5, undefined, 'FAST');
  doc.setLineWidth(.25); doc.line(17, 35, 192, 35);
  text('Master Air Waybill Acceptance Statement', 105, 44, 11, 'bold', 'center'); doc.line(58, 46, 152, 46);
  text(`Master Airway Bill (MAWB) ${job.mawbNo}`, 14, 59, 8.5, 'bold');
  wrapped('All shipment tendered in this Master Air Waybill were received directly from a shipper, or other person with an established relationship with Masum Logistics Lahore for at least 180 calendar days, which has an established shipping address, and a payment, credit, or invoice history of at least 180 calendar days; or person originating or tendering a shipment where Masum Logistics Lahore has an established business relationship or payment, credit or invoice history with the consignee or bill-to party of at least 180 calendar days.', 14, 70, 180, 8.1);
  text('Declaration For US-Bound Shipments', 105, 95, 10.5, 'bold', 'center'); doc.line(70, 97, 140, 97);
  wrapped('(Masum Logistics Lahore) has reviewed all available documentation and has determined that none of the cargo being offered in this consignment or consolidation has originated in, transferred from, or transited through any point in Somalia, Syria, Yemen, Egypt.', 14, 106, 180, 8.1);
  detail('Date', date(job.awbDate || job.jobDate), 125);
  detail('AWB or MAWB Number', job.mawbNo, 132);
  detail('HAWB Number', job.hawbNo || '-', 139);
  detail('Company Name', 'Masum Logistics', 146);
  detail('Name And Title of Signatory', '', 153);
  doc.setLineWidth(.3); doc.line(14, 178, 62, 178); text('Signature & Stamp', 21, 184, 8, 'bold');
  window.open(doc.output('bloburl'), '_blank');
}
