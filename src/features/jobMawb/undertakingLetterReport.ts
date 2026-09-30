import { jsPDF } from 'jspdf';
import { Job } from '../../domain/job';

const date = (value: string) => value ? new Date(`${value}T00:00:00`).toLocaleDateString('en-GB') : '';
const headerUrl = `${import.meta.env.BASE_URL}masum-logistics-header.png`;
let headerImage: string | undefined;

async function loadHeaderImage() {
  if (headerImage) return headerImage;
  const response = await fetch(headerUrl);
  if (!response.ok) throw new Error('The undertaking letter header could not be loaded.');
  const blob = await response.blob();
  headerImage = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
  return headerImage;
}

/** Native undertaking letter used by Air Export MAWB printing. */
export async function printUndertakingLetter(job: Job) {
  const header = await loadHeaderImage();
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const firstLine = job.chargeLines[0];
  const mawb = job.mawbNo.replace(/[^A-Za-z0-9-]/g, '');
  const hawb = job.hawbNo || '';
  const printDate = date(job.printing.undertakingPrintDate || job.awbDate || job.jobDate);
  const text = (value: string, x: number, y: number, size = 10, style: 'normal' | 'bold' = 'normal', align: 'left' | 'center' | 'right' = 'left') => doc.setFont('helvetica', style).setFontSize(size).text(value, x, y, { align });
  const wrapped = (value: string, x: number, y: number, width: number, size = 9.5, style: 'normal' | 'bold' = 'normal') => doc.setFont('helvetica', style).setFontSize(size).text(doc.splitTextToSize(value, width), x, y, { lineHeightFactor: 1.08 });

  doc.setLineWidth(.55); doc.line(1, 1, 209, 1);
  // Header artwork is the supplied brand treatment; the rest of the report
  // remains live vector text for sharp printing.
  doc.addImage(header, 'PNG', 2, -17, 205, 68.5, undefined, 'FAST');
  text('Off : 815, 8th Floor Park Avenue Building, P.E.C.H.S Block-6 , Shahrah-e-Faisal', 34, 27, 6.8); text('Karachi, Pakistan  Tel : +92-21-34521335  Email : info@masumlogistics.com.pk', 34, 32, 6.8);
  text('UNDERTAKING', 105, 40, 14, 'bold', 'center'); doc.setLineWidth(.3); doc.line(74, 42, 136, 42); text('To  Whom  It  May  Concern', 105, 51, 12, 'bold', 'center'); doc.line(60, 53, 150, 53);
  text('We hereby undertake that our following shipment of', 21, 62, 8.5);
  const labels: Array<[string, string, number]> = [
    ['Cartons', String(firstLine?.pcs ?? ''), 74],
    ['Destination', job.routing.destination, 81],
    ['MAWB No.', mawb, 88],
    ['HAWB No.', hawb, 95],
  ];
  labels.forEach(([label, value, y]) => { text(label, 35, y, 9.5); text(':', 64, y, 9.5, 'bold'); text(value, 70, y, 9.5); });
  text('Date', 145, 88, 9.5); text(':', 159, 88, 9.5, 'bold'); text(printDate, 169, 88, 9.5); text('Date', 145, 95, 9.5); text(':', 159, 95, 9.5, 'bold');
  wrapped('The above shipment is tendered for carriage by air. The undersigned, on behalf of the (shipper); hereby confirms that:', 25, 110, 160, 8.8);
  const clauses = [
    'The originator of the freight is known to me and I am satisfied that the contents are as stated and safe for carriage.\nOR\nThe originator of the freight is known to me and, to the best of my knowledge.\nThe contents are safe for carriage\nAND',
    'The goods have been protected during storage and transportation used at all stages of transit has been secure.',
    'This confirms that this shipment does not contain unknown / dangerous / hazardous substances unless accompanied by a “Dangerous Goods Certificate / Declaration”.',
    'This is to confirm that this shipment does not contain contraband/explosives / undeclared / falsely declared/prohibited items or articles / incendiary devices / other illegal substances.',
    'Personal effects and household goods are accounted for on an Airway Bill and cargo from unknown customers and/or customers, whose reliability is doubtful, are delivered separately and identified to the carrier for security measures. Our customers have been informed that cargo can be subject to measures ensuring the security of the air traffic.',
  ];
  let y = 123;
  clauses.forEach((clause, index) => { text(`${index + 1}.`, 24, y, 8.8); const split = doc.splitTextToSize(clause, 155); doc.setFont('helvetica', 'normal').setFontSize(8.8).text(split, 31, y, { lineHeightFactor: 1.05 }); y += split.length * 4.2 + 4; });
  const signY = 235;
  text('Signature Name', 90, signY, 9.5, 'bold'); text(':', 136, signY, 9.5, 'bold'); doc.line(141, signY + 1, 190, signY + 1); text('Position in Company', 90, signY + 8, 9.5, 'bold'); text(':', 136, signY + 8, 9.5, 'bold'); text('Dated', 90, signY + 16, 9.5, 'bold'); text(':', 136, signY + 16, 9.5, 'bold');
  window.open(doc.output('bloburl'), '_blank');
}
