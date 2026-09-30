import { jsPDF } from 'jspdf';
import { Job } from '../../domain/job';

const headerUrl = `${import.meta.env.BASE_URL}masum-logistics-header.png`;
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
  wrapped(job.printing.mawbAcceptanceSpecialNote, 14, 70, 180, 8.1);
  text('Declaration For US-Bound Shipments', 105, 95, 10.5, 'bold', 'center'); doc.line(70, 97, 140, 97);
  wrapped(job.printing.mawbAcceptanceReviewNote, 14, 106, 180, 8.1);
  detail('Date', date(job.awbDate || job.jobDate), 125);
  detail('AWB or MAWB Number', job.mawbNo, 132);
  detail('HAWB Number', job.hawbNo || '-', 139);
  detail('Company Name', 'Masum Logistics', 146);
  detail('Name And Title of Signatory', '', 153);
  doc.setLineWidth(.3); doc.line(14, 178, 62, 178); text('Signature & Stamp', 21, 184, 8, 'bold');
  window.open(doc.output('bloburl'), '_blank');
}
