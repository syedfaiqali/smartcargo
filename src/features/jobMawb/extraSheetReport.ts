import { jsPDF } from 'jspdf';
import { Job } from '../../domain/job';

const headerUrl = `${import.meta.env.BASE_URL}masum-logistics-header.png`;
let headerImage: string | undefined;

async function loadHeaderImage() {
  if (headerImage) return headerImage;
  const response = await fetch(headerUrl);
  if (!response.ok) throw new Error('The extra sheet header could not be loaded.');
  const blob = await response.blob();
  headerImage = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
  return headerImage;
}

const formatDate = (value: string) => value
  ? new Date(`${value}T00:00:00`).toLocaleDateString('en-GB')
  : '';

/** Branded continuation page for information attached to an air waybill. */
export async function printExtraSheet(job: Job) {
  const header = await loadHeaderImage();
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const awbDate = formatDate(job.awbDate || job.jobDate);

  doc.setProperties({ title: 'Extra Sheet', subject: `Extra sheet for ${job.mawbNo}` });
  doc.setLineWidth(.55);
  doc.rect(1, 1, 208, 295);
  // Shared company artwork includes the Masum Logistics, WCA, IATA, and ACN logos.
  doc.addImage(header, 'PNG', 2, -17, 205, 68.5, undefined, 'FAST');

  const text = (value: string, x: number, y: number, size = 8, align: 'left' | 'center' | 'right' = 'left') =>
    doc.setFont('helvetica', 'bold').setFontSize(size).text(value, x, y, { align });

  text(`AWB No.  ${job.mawbNo || '-'}`, 28, 43, 8);
  text(`AWB Date:  ${awbDate || '-'}`, 76, 43, 8);
  text('AS PER ATTACHED SHEET', 105, 67, 12, 'center');
  doc.setLineWidth(.3);
  doc.line(75, 69, 135, 69);

  window.open(doc.output('bloburl'), '_blank');
}
