import { ChargeLine, ChargesTab, Job, JobTotals } from '../../domain/job';

/** Recomputes Entry-tab Totals (2.6) from the Charges grid (2.5) and Charges-tab Due Carrier/Agent totals (2.9). */
export function recomputeJobTotals(job: Job): JobTotals {
  // Legacy 2.5 rows marked D/C or INT are carrier charges, while the
  // remaining charge-grid rows contribute to Freight.
  const dueCarrierRcpCodes = new Set(['D/C', 'INT']);
  const freightLines = job.chargeLines.filter((line) => !dueCarrierRcpCodes.has(line.rcp));
  const dueCarrierGridLines = job.chargeLines.filter((line) => dueCarrierRcpCodes.has(line.rcp));
  const freight = sum(freightLines, (l) => l.total);
  const freightPkr = sum(freightLines, (l) => l.totalPkr);
  const dueCarrier = job.charges.totalDueCarrier + sum(dueCarrierGridLines, (l) => l.total);
  const dueCarrierPkr = job.charges.totalDueCarrierPkr + sum(dueCarrierGridLines, (l) => l.totalPkr);
  const dueAgent = job.charges.totalDueAgent;
  const dueAgentPkr = job.charges.totalDueAgentPkr;
  const totalAwbAmount = freight + dueCarrier + dueAgent;
  const totalAwbAmountPkr = freightPkr + dueCarrierPkr + dueAgentPkr;
  const totalKbAmount = job.totals.totalKbAmount;
  const commission = job.totals.commission;
  const whtAmount = job.totals.whtAmount;
  // The legacy Entry screen does not derive "Payable To Airline" from the
  // freight totals. It remains at its saved value until the payable workflow
  // supplies it (a new job therefore displays zero here).
  const payableToAirline = job.totals.payableToAirline;
  const payableToAirlinePkr = job.totals.payableToAirlinePkr;

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

export function recomputeChargeLineTotal(line: ChargeLine, exRate: number, useDimensionWeight = false): ChargeLine {
  // The Dimension Calculator temporarily uses its rounded result. Regular
  // Entry-grid recalculation (including field blur) returns to Charge Wt.,
  // which matches the legacy screen's two-stage behavior.
  const chargeWt = useDimensionWeight && line.dimensionWt > 0 ? Math.round(line.dimensionWt) : (line.chargeWt || 0);
  const ratePkr = line.rate * (exRate || 0);
  const total = line.rate * chargeWt;
  const totalPkr = ratePkr * chargeWt;
  return { ...line, ratePkr, total, totalPkr };
}

function sum<T>(items: T[], selector: (item: T) => number): number {
  return items.reduce((acc, item) => acc + (selector(item) || 0), 0);
}
