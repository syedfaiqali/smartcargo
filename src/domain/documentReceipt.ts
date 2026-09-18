import { AuditFields, IsoDate } from './common';

export type DocumentReceiptType = 'Air M/JOB' | 'Sea M/JOB' | 'Air H/JOB' | 'Sea H/JOB';

export interface DocumentReceiptLine {
  id: string;
  label: string;
  documentNo: string;
  date: IsoDate | '';
  original: boolean;
  duplicate: boolean;
  triplicate: boolean;
  quadruplicate: boolean;
  customAttested: boolean;
  exportersCopy: boolean;
  other: boolean;
}

/** Document Receipt (Freight) */
export interface DocumentReceipt extends AuditFields {
  branch: string;
  recordNo: string;
  date: IsoDate;
  type: DocumentReceiptType;
  jobNo: string;
  jobNoSuffix: string;
  partyCode: string;
  partyName: string;
  subAgentCode: string;
  subAgentName: string;
  noOfPkgs: number;
  origin: string;
  destination: string;

  lines: DocumentReceiptLine[];

  status: {
    final: boolean;
  };
}
