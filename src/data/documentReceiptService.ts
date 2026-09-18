import { DocumentReceipt } from '../domain/documentReceipt';
import { createEmptyDocumentReceipt, createEmptyDocumentReceiptLine } from '../domain/documentReceiptFactory';
import { Repository } from './repository';

export const documentReceiptRepo = new Repository<DocumentReceipt>('documentReceipts');

let recordSequence = 100;

export function nextDocumentReceiptNo(branch: string): string {
  const existing = documentReceiptRepo.find((r) => r.branch === branch);
  const maxSeq = existing.reduce((max, r) => {
    const seq = parseInt(r.recordNo, 10);
    return Number.isFinite(seq) ? Math.max(max, seq) : max;
  }, recordSequence);
  recordSequence = maxSeq + 1;
  return String(recordSequence);
}

/** Adds a couple of sample rows only while the Document Receipt list is empty. */
export function ensureDocumentReceiptDemo(): void {
  if (documentReceiptRepo.list().length) return;

  const demo1 = createEmptyDocumentReceipt('KHI');
  demo1.recordNo = '101';
  demo1.date = '2026-09-14';
  demo1.type = 'Air M/JOB';
  demo1.jobNo = 'KHI-AI-101';
  demo1.jobNoSuffix = '26';
  demo1.partyCode = 'P-1003';
  demo1.partyName = 'Sindh Rice Exporters';
  demo1.subAgentCode = 'SA-201';
  demo1.subAgentName = 'Gulf Freight Agents LLC';
  demo1.noOfPkgs = 12;
  demo1.origin = 'AEJEA';
  demo1.destination = 'PKKHI';
  demo1.lines = [
    { ...createEmptyDocumentReceiptLine('MBL/MAWB No.'), documentNo: '098-1234 5670', date: '2026-09-13', original: true, exportersCopy: true },
    { ...createEmptyDocumentReceiptLine('HBL/HAWB No.'), documentNo: 'HAWB-88213', date: '2026-09-13', duplicate: true },
    { ...createEmptyDocumentReceiptLine('Shipper Invoice No.'), documentNo: 'INV-5521', date: '2026-09-12', original: true },
    { ...createEmptyDocumentReceiptLine('Packing List'), documentNo: 'PL-5521', date: '2026-09-12', original: true },
    createEmptyDocumentReceiptLine('Form "E" No.'),
    createEmptyDocumentReceiptLine('Shipping Bill No.'),
    { ...createEmptyDocumentReceiptLine('Our Invoice No.'), documentNo: 'OI-9001', date: '2026-09-14', customAttested: true },
    ...Array.from({ length: 4 }, () => createEmptyDocumentReceiptLine('')),
  ];
  demo1.status = { final: true };
  documentReceiptRepo.save(demo1);

  const demo2 = createEmptyDocumentReceipt('KHI');
  demo2.recordNo = '102';
  demo2.date = '2026-09-16';
  demo2.type = 'Sea H/JOB';
  demo2.jobNo = 'KHI-SI-102';
  demo2.jobNoSuffix = '26';
  demo2.partyCode = 'P-1001';
  demo2.partyName = 'Al Baraka Textiles Ltd';
  demo2.subAgentCode = '';
  demo2.subAgentName = '';
  demo2.noOfPkgs = 60;
  demo2.origin = 'CNSHA';
  demo2.destination = 'PKKHI';
  demo2.lines = [
    { ...createEmptyDocumentReceiptLine('MBL/MAWB No.'), documentNo: 'MBL-77120', date: '2026-09-15', original: true },
    { ...createEmptyDocumentReceiptLine('HBL/HAWB No.'), documentNo: 'HBL-33410', date: '2026-09-15', original: true },
    createEmptyDocumentReceiptLine('Shipper Invoice No.'),
    createEmptyDocumentReceiptLine('Packing List'),
    createEmptyDocumentReceiptLine('Form "E" No.'),
    createEmptyDocumentReceiptLine('Shipping Bill No.'),
    createEmptyDocumentReceiptLine('Our Invoice No.'),
    ...Array.from({ length: 4 }, () => createEmptyDocumentReceiptLine('')),
  ];
  demo2.status = { final: false };
  documentReceiptRepo.save(demo2);
}
