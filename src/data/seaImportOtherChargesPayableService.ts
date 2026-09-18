import { SeaImportOtherChargesPayable } from '../domain/seaImportOtherChargesPayable';
import { createEmptySeaImportOtherChargesPayable } from '../domain/seaImportOtherChargesPayableFactory';
import { Repository } from './repository';
import { seaImportJobRepo } from './seaImportJobService';

export const seaImportPayableRepo = new Repository<SeaImportOtherChargesPayable>('seaImportOtherChargesPayable');

/** Adds a couple of sample rows only while the Sea-Import payable list is empty. */
export function ensureSeaImportPayableDemo(): void {
  if (seaImportPayableRepo.list().length) return;

  const demo1 = createEmptySeaImportOtherChargesPayable('KHI');
  demo1.creditNoteNo = 'KHI-SICP-101';
  demo1.date = '2026-09-15';
  demo1.payableType = 'TERMINAL';
  demo1.partyCode = 'P-1003';
  demo1.partyName = 'Sindh Rice Exporters';
  demo1.consoleJobNo = 'KHI-SIM-101';
  demo1.jobYear = 2026;
  demo1.billNo = 'BL-3001';
  demo1.billDate = '2026-09-16';
  demo1.currencies = [{ currencyCode: 'USD', exRate: 278.5 }, { currencyCode: '', exRate: 0 }, { currencyCode: '', exRate: 0 }];
  demo1.costLines = [{ id: 'demo-cost-1', jobNo: 'KHI-SI-101', hblNo: 'HBL-456789', pcs: 120, grossWeight: 18000, cbm: 28.5, cost: 1100, partyName: demo1.partyName }];
  demo1.chargeLines = [{ id: 'demo-charge-1', code: 'FREIGHT', description: 'Freight', curr: 'USD', fAmount: 1100, pkrAmount: 306350 }];
  demo1.totalCharges = 306350;
  demo1.grandTotal = 306350;
  demo1.status = { final: true };
  seaImportPayableRepo.save(demo1);

  const demo2 = createEmptySeaImportOtherChargesPayable('KHI');
  demo2.creditNoteNo = 'KHI-SICP-102';
  demo2.date = '2026-09-17';
  demo2.payableType = 'CUSTOMS';
  demo2.partyCode = 'P-1001';
  demo2.partyName = 'Al Baraka Textiles Ltd';
  demo2.consoleJobNo = 'KHI-SIM-102';
  demo2.jobYear = 2026;
  demo2.billNo = 'BL-3018';
  demo2.billDate = '2026-09-17';
  demo2.currencies = [{ currencyCode: 'USD', exRate: 278.5 }, { currencyCode: '', exRate: 0 }, { currencyCode: '', exRate: 0 }];
  demo2.costLines = [{ id: 'demo-cost-2', jobNo: 'KHI-SI-102', hblNo: 'HBL-456912', pcs: 60, grossWeight: 9200, cbm: 14.2, cost: 480, partyName: demo2.partyName }];
  demo2.chargeLines = [{ id: 'demo-charge-2', code: 'FREIGHT', description: 'Freight', curr: 'USD', fAmount: 480, pkrAmount: 133680 }];
  demo2.totalCharges = 133680;
  demo2.grandTotal = 133680;
  demo2.status = { final: false };
  seaImportPayableRepo.save(demo2);
}

let payableSequence = 100;

export function nextSeaImportCreditNoteNo(branch: string): string {
  const existing = seaImportPayableRepo.find((p) => p.branch === branch);
  const maxSeq = existing.reduce((max, p) => {
    const seq = parseInt(p.creditNoteNo.split('-').pop() ?? '', 10);
    return Number.isFinite(seq) ? Math.max(max, seq) : max;
  }, payableSequence);
  payableSequence = maxSeq + 1;
  return `${branch}-SICP-${payableSequence}`;
}

/** Pulls CBM/Job Year from a selected Console Job No. */
export function lookupSeaImportConsoleJob(consoleJobNo: string) {
  const job = seaImportJobRepo.find((j) => j.consoleJob === consoleJobNo)[0];
  if (!job) return null;
  return {
    jobYear: new Date(job.jobDate).getFullYear(),
    cbm: job.mblCbm,
    grossWeight: job.mblGrossWeight,
    job,
  };
}

/** Jobs attached to a Console Job No., for the allocation grid's Job No. picker. */
export function getJobsForSeaImportConsole(consoleJobNo: string) {
  return seaImportJobRepo.find((j) => j.consoleJob === consoleJobNo);
}

export interface SeaImportPayableFilter {
  branches?: string[];
  partyCode?: string;
  payableType?: string;
  consoleJobNo?: string;
  status?: 'FINAL' | 'UN_FINAL' | 'ALL';
}

export function searchSeaImportPayables(filter: SeaImportPayableFilter): SeaImportOtherChargesPayable[] {
  return seaImportPayableRepo.find((p) => {
    if (filter.branches?.length && !filter.branches.includes(p.branch)) return false;
    if (filter.partyCode && p.partyCode !== filter.partyCode) return false;
    if (filter.payableType && p.payableType !== filter.payableType) return false;
    if (filter.consoleJobNo && p.consoleJobNo !== filter.consoleJobNo) return false;

    switch (filter.status) {
      case 'FINAL':
        if (!p.status.final) return false;
        break;
      case 'UN_FINAL':
        if (p.status.final) return false;
        break;
      default:
        break;
    }
    return true;
  });
}
