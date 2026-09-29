import { jsPDF } from 'jspdf';
import { Job } from '../../domain/job';
import { airlineRepo } from '../../data/masterDataService';

const cleanAwb = (value: string) => value.replace(/[^A-Za-z0-9]/g, '');
const shownAwb = (value: string) => cleanAwb(value).replace(/^(.{3})(.{7})$/, '$1-$2') || value;
const logoUrl = `${process.env.PUBLIC_URL}/masum-logo.png`;
let masumLogo: string | undefined;

async function loadLogo() {
  if (masumLogo) return masumLogo;
  const response = await fetch(logoUrl);
  if (!response.ok) throw new Error('The label logo could not be loaded.');
  const blob = await response.blob();
  masumLogo = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(reader.error); reader.readAsDataURL(blob); });
  return masumLogo;
}

export async function printLabelSheet(job: Job) {
  const logo = await loadLogo();
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const firstLine = job.chargeLines[0];
  const airline = airlineRepo.list().find((item) => item.code === job.mawbNo.split('-')[0])?.name || job.owner || '';
  const awb = shownAwb(job.mawbNo);
  const raw = cleanAwb(job.mawbNo);
  const text = (value: string, x: number, y: number, size = 7, style: 'normal' | 'bold' = 'normal', align: 'left' | 'center' | 'right' = 'left') => doc.setFont('helvetica', style).setFontSize(size).text(value, x, y, { align });
  const barcode = (x: number, y: number, width: number, height: number) => {
    // Code 39: scanner-readable start/stop markers and the actual AWB value.
    const patterns: Record<string, string> = {
      '0': 'nnnwwnwnn', '1': 'wnnwnnnnw', '2': 'nnwwnnnnw', '3': 'wnwwnnnnn', '4': 'nnnwwnnnw',
      '5': 'wnnwwnnnn', '6': 'nnwwwnnnn', '7': 'nnnwnnwnw', '8': 'wnnwnnwnn', '9': 'nnwwnnwnn',
      '-': 'nnnnwnnww', '*': 'nwnnwnwnn',
    };
    const encoded = `*${awb.toUpperCase()}*`.replace(/[^0-9*-]/g, '');
    const units = encoded.split('').reduce((total, char) => total + [...(patterns[char] || '')].reduce((sum, item) => sum + (item === 'w' ? 3 : 1), 0) + 1, 0);
    const unit = width / units; let cursor = x;
    encoded.split('').forEach((char) => {
      [...(patterns[char] || '')].forEach((item, index) => { const bar = item === 'w' ? unit * 3 : unit; if (index % 2 === 0) doc.rect(cursor, y, bar, height, 'F'); cursor += bar; });
      cursor += unit;
    });
  };
  const label = (x: number) => {
    const y = 20; const w = 84; const h = 122;
    doc.setDrawColor(0); doc.setLineWidth(.7); doc.rect(x, y, w, h); doc.setLineWidth(.22);
    doc.addImage(logo, 'PNG', x + w / 2 - 6, y + 2, 12, 14, undefined, 'FAST'); text('MASUM LOGISTICS', x + w / 2, y + 18, 4.2, 'bold', 'center'); doc.setDrawColor(0);
    doc.line(x, y + 23, x + w, y + 23); barcode(x + 7, y + 27, w - 14, 18); text(awb, x + w / 2, y + 49, 8.3, 'bold', 'center');
    doc.line(x, y + 54, x + w, y + 54); doc.line(x, y + 62, x + w, y + 62); doc.line(x + 20, y + 54, x + 20, y + 80); text('Airline', x + 1, y + 59, 6.2, 'bold'); text(airline.toUpperCase(), x + 27, y + 59, 6, 'bold'); text('MAWB No.', x + 1, y + 68, 6.2, 'bold'); text(awb, x + 27, y + 68, 7.2, 'bold');
    doc.line(x, y + 80, x + w, y + 80); doc.line(x + w / 2, y + 80, x + w / 2, y + 101); text('Origin', x + 1, y + 86, 6.8, 'bold'); text('Destination', x + w / 2 + 1, y + 86, 6.8, 'bold'); text(job.routing.airportOfDeparture || '', x + w / 4, y + 96, 8.2, 'bold', 'center'); text(job.routing.destination || '', x + w * .75, y + 96, 8.2, 'bold', 'center');
    doc.line(x, y + 101, x + w, y + 101); doc.line(x + w / 2, y + 101, x + w / 2, y + h); text('Weight', x + 1, y + 107, 6.8, 'bold'); text('No of Pieces', x + w / 2 + 1, y + 107, 6.8, 'bold'); text(`${Number(firstLine?.grossWt || 0).toFixed(2)} K`, x + w / 4, y + 116, 7.8, 'bold', 'center'); text(String(firstLine?.pcs ?? 0), x + w * .75, y + 116, 7.8, 'bold', 'center');
  };
  label(11); label(116);
  window.open(doc.output('bloburl'), '_blank');
}
