import { SeaImportRefundFromShippingLines } from '../domain/seaImportRefundFromShippingLines';
import { createEmptySeaImportRefund } from '../domain/seaImportRefundFromShippingLinesFactory';
import { Repository } from './repository';
import { seaImportJobRepo } from './seaImportJobService';

export const seaImportRefundRepo = new Repository<SeaImportRefundFromShippingLines>('seaImportRefundFromShippingLines');

/** Adds a couple of sample rows only while the Sea-Import refund list is empty. */
export function ensureSeaImportRefundDemo(): void {
  if (seaImportRefundRepo.list().length) return;

  const demo1 = createEmptySeaImportRefund('KHI');
  demo1.documentNo = 'KHI-SIREF-101';
  demo1.date = '2026-09-15';
  demo1.jobNo = 'KHI-SI-101';
  demo1.jobYear = 2026;
  demo1.mblNo = 'MBL-8890021';
  demo1.hblNo = 'HBL-456789';
  demo1.sLineAgent = 'Gulf Shipping Agency';
  demo1.currency = 'USD';
  demo1.exRate = 278.5;
  demo1.billNo = 'BL-2001';
  demo1.billDate = '2026-09-16';
  demo1.cbm = 28.5;
  demo1.chargeLines = [{ id: 'demo-charge-1', description: 'Ocean Freight', ratePerCbm: 45, amount1: 1282.5, amount2: 0 }];
  demo1.totalAmount = 1282.5;
  demo1.status = { final: true };
  seaImportRefundRepo.save(demo1);

  const demo2 = createEmptySeaImportRefund('KHI');
  demo2.documentNo = 'KHI-SIREF-102';
  demo2.date = '2026-09-17';
  demo2.jobNo = 'KHI-SI-102';
  demo2.jobYear = 2026;
  demo2.mblNo = 'MBL-8890045';
  demo2.hblNo = 'HBL-456912';
  demo2.sLineAgent = 'Continental Marine Agents';
  demo2.currency = 'USD';
  demo2.exRate = 278.5;
  demo2.billNo = 'BL-2015';
  demo2.billDate = '2026-09-17';
  demo2.cbm = 14.2;
  demo2.chargeLines = [{ id: 'demo-charge-2', description: 'Ocean Freight', ratePerCbm: 40, amount1: 568, amount2: 0 }];
  demo2.totalAmount = 568;
  demo2.status = { final: false };
  seaImportRefundRepo.save(demo2);
}

let refundSequence = 100;

export function nextSeaImportRefundDocNo(branch: string): string {
  const existing = seaImportRefundRepo.find((r) => r.branch === branch);
  const maxSeq = existing.reduce((max, r) => {
    const seq = parseInt(r.documentNo.split('-').pop() ?? '', 10);
    return Number.isFinite(seq) ? Math.max(max, seq) : max;
  }, refundSequence);
  refundSequence = maxSeq + 1;
  return `${branch}-SIREF-${refundSequence}`;
}

/** Pulls MBL/HBL/Vessel/Party/Route/CBM from a selected Sea-Import Job No. */
export function lookupSeaImportJobForRefund(jobNo: string) {
  const job = seaImportJobRepo.find((j) => j.jobNo === jobNo)[0];
  if (!job) return null;
  return {
    jobYear: new Date(job.jobDate).getFullYear(),
    lclFcl: job.lclFcl,
    mblNo: job.mblNo,
    hblNo: job.hblNo,
    vessel: job.vessel,
    origin: job.origin,
    destination: job.destination,
    cbm: job.mblCbm,
    partyCode: job.partyCode,
    partyName: job.partyName,
    sLineAgent: job.sLineAgent,
    job,
  };
}

export interface SeaImportRefundFilter {
  branches?: string[];
  jobNo?: string;
  status?: 'FINAL' | 'UN_FINAL' | 'ALL';
}

export function searchSeaImportRefunds(filter: SeaImportRefundFilter): SeaImportRefundFromShippingLines[] {
  return seaImportRefundRepo.find((r) => {
    if (filter.branches?.length && !filter.branches.includes(r.branch)) return false;
    if (filter.jobNo && r.jobNo !== filter.jobNo) return false;

    switch (filter.status) {
      case 'FINAL':
        if (!r.status.final) return false;
        break;
      case 'UN_FINAL':
        if (r.status.final) return false;
        break;
      default:
        break;
    }
    return true;
  });
}
