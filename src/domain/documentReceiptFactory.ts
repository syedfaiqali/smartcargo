import { v4 as uuid } from 'uuid';
import { DocumentReceipt, DocumentReceiptLine } from './documentReceipt';

const nowIso = () => new Date().toISOString();

export function createEmptyDocumentReceiptLine(label = ''): DocumentReceiptLine {
  return {
    id: uuid(),
    label,
    documentNo: '',
    date: '',
    original: false,
    duplicate: false,
    triplicate: false,
    quadruplicate: false,
    customAttested: false,
    exportersCopy: false,
    other: false,
  };
}

const defaultLineLabels = [
  'MBL/MAWB No.',
  'HBL/HAWB No.',
  'Shipper Invoice No.',
  'Packing List',
  'Form "E" No.',
  'Shipping Bill No.',
  'Our Invoice No.',
];

export function createEmptyDocumentReceipt(branch = 'KHI'): DocumentReceipt {
  return {
    id: uuid(),
    createdAt: nowIso(),
    updatedAt: nowIso(),
    branch,
    recordNo: '',
    date: new Date().toISOString().slice(0, 10),
    type: 'Air M/JOB',
    jobNo: '',
    jobNoSuffix: '',
    partyCode: '',
    partyName: '',
    subAgentCode: '',
    subAgentName: '',
    noOfPkgs: 0,
    origin: '',
    destination: '',
    lines: [
      ...defaultLineLabels.map((label) => createEmptyDocumentReceiptLine(label)),
      ...Array.from({ length: 4 }, () => createEmptyDocumentReceiptLine('')),
    ],
    status: { final: false },
  };
}
