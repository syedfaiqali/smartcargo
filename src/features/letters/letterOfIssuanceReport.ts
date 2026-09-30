import { jsPDF } from 'jspdf';

const headerUrl = `${import.meta.env.BASE_URL}masum-logistics-header.png`;
let headerImage: string | undefined;

async function loadHeaderImage() {
  if (headerImage) return headerImage;
  const response = await fetch(headerUrl);
  if (!response.ok) throw new Error('The letter header could not be loaded.');
  const blob = await response.blob();
  headerImage = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(reader.error); reader.readAsDataURL(blob); });
  return headerImage;
}

export interface LetterOfIssuanceData { airlineName: string; letterDate: string; noOfAwbs: number; bearerOfLetter: string; cnic: string; signatoryName: string; }
const date = (value: string) => value ? new Date(`${value}T00:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '';

export async function printLetterOfIssuance(data: LetterOfIssuanceData) {
  const header = await loadHeaderImage();
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const text = (content: string, x: number, y: number, size = 9, style: 'normal' | 'bold' = 'normal', align: 'left' | 'center' | 'right' = 'left') => doc.setFont('times', style).setFontSize(size).text(content, x, y, { align });
  const wrapped = (content: string, x: number, y: number, width: number) => doc.setFont('times', 'normal').setFontSize(9.5).text(doc.splitTextToSize(content, width), x, y, { lineHeightFactor: 1.08 });
  doc.setProperties({ title: 'Letter of Issuance of Stock' }); doc.setLineWidth(.55); doc.rect(1, 1, 208, 295);
  doc.addImage(header, 'PNG', 2, -17, 205, 68.5, undefined, 'FAST');
  text('THE CARGO MANAGER', 23, 58, 9, 'bold'); text(date(data.letterDate), 177, 58, 9, 'bold', 'right');
  text('SUBJECT: ISSUANCE OF AIR WAYBILLS STOCK', 105, 92, 10, 'bold', 'center'); doc.setLineWidth(.25); doc.line(62, 94, 148, 94);
  text('Dear Sir,', 23, 104, 9.5);
  wrapped(`We would be grateful if you kindly issue (${data.noOfAwbs || 0}) Air Waybills of your esteemed Airline${data.airlineName ? `, ${data.airlineName}` : ''}.`, 23, 119, 165);
  wrapped(`The bearer of this letter is authorised to collect the said Air Waybills stock on behalf of ${data.bearerOfLetter || '__________'}.${data.cnic ? ` CNIC: ${data.cnic}.` : ''} His specimen signature is appended below:`, 23, 134, 165);
  text('Thanking you for your co-operation and support, we remain.', 23, 151, 9.5); text('Thanking You.', 23, 166, 9.5); text('SPECIMEN SIGNATURE OF', 124, 182, 9, 'normal');
  if (data.signatoryName) text(data.signatoryName, 124, 189, 9, 'bold');
  window.open(doc.output('bloburl'), '_blank');
}
