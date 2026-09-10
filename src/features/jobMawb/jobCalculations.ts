import { ChargeLine, ChargesTab, Job, JobTotals } from '../../domain/job';

/** Recomputes Entry-tab Totals (2.6) from the Charges grid (2.5) and Charges-tab Due Carrier/Agent totals (2.9). */
export function recomputeJobTotals(job: Job): JobTotals {
  const freight = sum(job.chargeLines, (l) => l.total);
  const freightPkr = sum(job.chargeLines, (l) => l.totalPkr);
  const dueCarrier = job.charges.totalDueCarrier;
  const dueCarrierPkr = job.charges.totalDueCarrierPkr;
  const dueAgent = job.charges.totalDueAgent;
  const dueAgentPkr = job.charges.totalDueAgentPkr;
  const totalAwbAmount = freight + dueCarrier + dueAgent;
  const totalAwbAmountPkr = freightPkr + dueCarrierPkr + dueAgentPkr;
  const totalKbAmount = job.totals.totalKbAmount;
  const commission = job.totals.commission;
  const whtAmount = job.totals.whtAmount;
  const payableToAirline = totalAwbAmount - commission - whtAmount - totalKbAmount;
  const payableToAirlinePkr = totalAwbAmountPkr - commission - whtAmount - totalKbAmount;

  return {
    freight,
    freightPkr,
    dueCarrier,
    dueCarrierPkr,
    dueAgent,
    dueAgentPkr,
    totalAwbAmount,
    totalAwbAmountPkr,
    totalKbAmount,
    commission,
    whtAmount,
    payableToAirline,
    payableToAirlinePkr,
  };
}

export function recomputeChargesTotals(charges: ChargesTab): ChargesTab {
  const totalDueCarrier = sum(charges.dueCarrierLines, (l) => l.charges);
  const totalDueCarrierPkr = sum(charges.dueCarrierLines, (l) => l.chargesPkr);
  const totalDueAgent = sum(charges.dueAgentLines, (l) => l.chargesForeign);
  const totalDueAgentPkr = sum(charges.dueAgentLines, (l) => l.chargesPkr);
  return { ...charges, totalDueCarrier, totalDueCarrierPkr, totalDueAgent, totalDueAgentPkr };
}

export function recomputeChargeLineTotal(line: ChargeLine, exRate: number): ChargeLine {
  const total = line.rate * (line.chargeWt || 0);
  const totalPkr = total * (exRate || 0);
  return { ...line, total, totalPkr };
}

function sum<T>(items: T[], selector: (item: T) => number): number {
  return items.reduce((acc, item) => acc + (selector(item) || 0), 0);
}
