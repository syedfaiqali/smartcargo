import { jsPDF } from 'jspdf';
import { Job } from '../../domain/job';

const headerUrl = `${import.meta.env.BASE_URL}masum-logistics-header.png`;
let headerImage: string | undefined;

async function loadHeaderImage() {
  if (headerImage) return headerImage;
  const response = await fetch(headerUrl);
  if (!response.ok) throw new Error('The security certificate header could not be loaded.');
  const blob = await response.blob();
  headerImage = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
  return headerImage;
}

/** Compact shipment security certificate for Air Export printing. */
export async function printSecurityCertificate(job: Job) {
  const header = await loadHeaderImage();
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const shipment = job.chargeLines[0];
  const text = (content: string, x: number, y: number, size = 8, style: 'normal' | 'bold' = 'normal', align: 'left' | 'center' | 'right' = 'left') =>
    doc.setFont('helvetica', style).setFontSize(size).text(content, x, y, { align });
  const wrapped = (content: string, x: number, y: number, width: number, size = 8) =>
    doc.setFont('helvetica', 'normal').setFontSize(size).text(doc.splitTextToSize(content, width), x, y, { lineHeightFactor: 1.08 });
  const cell = (x: number, y: number, width: number, height: number, content = '', size = 7, align: 'left' | 'center' | 'right' = 'left') => {
    doc.rect(x, y, width, height);
    if (content) text(content, align === 'left' ? x + 1 : x + width / 2, y + height / 2 + 1.5, size, 'bold', align);
  };

  doc.setProperties({ title: 'Security Certificate', subject: `Security certificate for ${job.mawbNo}` });
  doc.setLineWidth(.55); doc.rect(1, 1, 208, 295);
  doc.addImage(header, 'PNG', 2, -17, 205, 68.5, undefined, 'FAST');
  doc.setLineWidth(.25); doc.line(17, 35, 192, 35);
  text('Security Certificate', 105, 44, 11, 'bold', 'center'); doc.line(78, 46, 132, 46);
  text('TO WHOM IT MAY CONCERN', 105, 52, 9, 'normal', 'center');
  text('Dear Sir,', 13, 61, 8);
  text('We are handing over following shipment to', 13, 68, 8); text(job.owner || 'the carrier', 84, 68, 8, 'bold');

  const x = 12; const widths = [35, 17, 24, 72, 44]; const headers = ['AWB No.', 'Pieces', 'Weight', 'Destination', 'Commodity']; const values = [job.mawbNo, String(shipment?.pcs ?? ''), String(shipment?.grossWt ?? ''), job.routing.destination, job.saidToContain || shipment?.comdty || ''];
  let left = x;
  widths.forEach((width, index) => { cell(left, 76, width, 8, headers[index], 7.1, 'center'); cell(left, 84, width, 8, values[index], 7.1, 'center'); left += width; });

  wrapped('We hereby certify that the above shipment does not contain any explosive, restricted articles, hazardous material or any contraband goods.', 13, 102, 178, 8);
  wrapped('It is confirmed that the above shipment is not harmful for the safety security of the aircraft, its passengers & crew.', 13, 113, 178, 8);
  text('Pieces, Weight, Commodity & Destination declared on AWB are correct.', 13, 124, 8);

  doc.setLineWidth(.3); doc.line(13, 145, 96, 145); text('Signature', 13, 151, 8, 'bold');
  doc.line(13, 168, 96, 168); text('Name & Seal of Shipper / Authorised Agent', 13, 174, 8, 'bold');
  window.open(doc.output('bloburl'), '_blank');
}
