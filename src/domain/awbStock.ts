import { AuditFields, IsoDate, YesNo } from './common';

/** Air Waybill Stock (Received From Airline) — docs/screens-phase.md Section 1 */
export interface AwbStock extends AuditFields {
  awbNo: string;
  airlineCode: string;
  receiptDate: IsoDate;
  ownerCode: string;
  awbUsed: YesNo;
  awbDate: IsoDate | '';
  /** Job No. that consumed this AWB, once used. */
  usedByJobNo?: string;
}

export interface AwbStockSummary {
  total: number;
  used: number;
  unused: number;
}

export interface AwbRangeCheckResult {
  given: number;
  duplicate: number;
  toBeWritten: number;
  duplicateAwbNos: string[];
  newAwbNos: string[];
}
