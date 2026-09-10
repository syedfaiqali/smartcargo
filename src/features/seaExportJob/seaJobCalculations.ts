import { SeaChargeLine, SeaExportJob } from '../../domain/seaExportJob';

function sum<T>(items: T[], selector: (item: T) => number): number {
  return items.reduce((acc, item) => acc + (selector(item) || 0), 0);
}

/**
 * Recomputes 12.4 Job Charges totals. "K.B." here mirrors the Air Export K.B. concept
 * (docs 12.10 flags this as needing confirmation) — treated as a flat adjustment amount
 * subtracted from gross profit until the real calculation rule is confirmed.
 */
export function recomputeJobChargesTotals(job: SeaExportJob, kbAdjustment = 0): SeaExportJob {
  const totalSellCharges = sum(job.jobCharges.lines, (l) => l.sellFAmount);
  const totalBuyCharges = sum(job.jobCharges.lines, (l) => l.buyFAmount);
  const totalGpAmount = totalSellCharges - totalBuyCharges;
  const totalGpLessKb = totalGpAmount - kbAdjustment;

  return {
    ...job,
    jobCharges: { ...job.jobCharges, totalSellCharges, totalBuyCharges, totalGpAmount, totalGpLessKb },
  };
}

export function emptyChargeLine(id: string, curr: string): SeaChargeLine {
  return { id, code: '', description: '', curr, sellFAmount: 0, buyFAmount: 0 };
}
