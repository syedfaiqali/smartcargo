import { AirImportManifest, ManifestHawbLine } from '../domain/airImportManifest';
import { AirImportJob } from '../domain/airImportJob';
import { Job } from '../domain/job';
import { Repository } from './repository';
import { createEmptyAirImportManifest } from '../domain/airImportManifestFactory';
import { airImportJobRepo } from './airImportJobService';
import { jobRepo } from './jobService';

export const airImportManifestRepo = new Repository<AirImportManifest>('airImportManifest');

/** Finds a previously saved manifest by MAWB, accepting numbers entered with or without separators. */
export function findAirImportManifestByMawbNo(mawbNo: string): AirImportManifest | undefined {
  const wanted = normalize(mawbNo);
  return wanted ? airImportManifestRepo.find((manifest) => normalize(manifest.mawbNo) === wanted)[0] : undefined;
}

const normalize = (value: string) => value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

/** Returns the Air-Import job records belonging to a master AWB. */
export function findAirImportJobsByMawbNo(mawbNo: string): AirImportJob[] {
  const wanted = normalize(mawbNo);
  return wanted ? airImportJobRepo.find((job) => normalize(job.mawbNo) === wanted) : [];
}

/** Populates a new manifest from the Air-Import jobs attached to the entered MAWB. */
export function populateManifestFromAirImportJobs(draft: AirImportManifest, jobs: AirImportJob[]): AirImportManifest {
  const master = jobs[0];
  if (!master) return draft;

  const hawbLines: ManifestHawbLine[] = jobs.flatMap((job) => {
    const houses = job.houseAirwayBills.length
      ? job.houseAirwayBills.map((house) => ({
          id: `${job.id}-${house.id}`,
          jobNo: house.jobNo || job.jobNo,
          hawbNo: house.hawbNo,
          pcs: house.pcs,
          grossWeight: house.weight,
          chargeWeight: house.weight,
        }))
      : [{
          id: job.id,
          jobNo: job.jobNo,
          hawbNo: job.hawbNo,
          pcs: job.hawbPcs,
          grossWeight: job.hawbGrossWeight,
          chargeWeight: job.hawbChargeWeight,
        }];

    return houses.filter((house) => house.hawbNo || house.jobNo).map((house) => ({
      ...house,
      partyCode: job.partyCode,
      partyName: job.partyName,
      ppCc: job.hawbPpCc,
      uom: job.hawbUom,
      cbm: job.hawbCbm,
      indexNo: job.indexNo,
      subIndexNo: job.subIndexNo,
    }));
  });

  return {
    ...draft,
    branch: master.branch,
    // A manifest is a new transaction; retain its default (today's) job date.
    jobDate: draft.jobDate,
    jobType: master.jobType,
    nomination: master.nomination,
    mawbNo: master.mawbNo,
    mawbDate: master.mawbDate,
    ppCc: master.mawbPpCc,
    pcs: master.mawbPcs,
    uom: master.mawbUom,
    cbm: master.mawbCbm,
    grossWeight: master.mawbGrossWeight,
    chargeWeight: master.mawbChargeWeight,
    foreignAgent: master.foreignAgent,
    commodity: master.commodity,
    origin: master.origin,
    destination: master.destination,
    airlineDoNo: master.airlineDoNo,
    airlineDoDate: master.airlineDoDate,
    etd: master.etd,
    eta: master.eta,
    originDoNo: master.originDoNo,
    currency: master.currency,
    flightNo: master.flightNo,
    flightDate: master.flightDate,
    hawbLines,
  };
}

/** Finds a master job created in the main Job (MAWB) screen. */
export function findMasterJobByMawbNo(mawbNo: string): Job | undefined {
  const wanted = normalize(mawbNo);
  return wanted ? jobRepo.find((job) => job.kind === 'MAWB' && normalize(job.mawbNo) === wanted)[0] : undefined;
}

/** Maps a main Job (MAWB) entry and its linked HAWB jobs into the Import-Air manifest. */
export function populateManifestFromMasterJob(draft: AirImportManifest, master: Job): AirImportManifest {
  const shipment = master.chargeLines.reduce(
    (total, line) => ({ pcs: total.pcs + line.pcs, grossWeight: total.grossWeight + line.grossWt, chargeWeight: total.chargeWeight + line.chargeWt }),
    { pcs: 0, grossWeight: 0, chargeWeight: 0 },
  );
  const children = jobRepo.find((job) => job.kind === 'HAWB' && job.parentJobNo === master.jobNo);
  const hawbLines: ManifestHawbLine[] = children.map((job) => {
    const totals = job.chargeLines.reduce(
      (total, line) => ({ pcs: total.pcs + line.pcs, grossWeight: total.grossWeight + line.grossWt, chargeWeight: total.chargeWeight + line.chargeWt }),
      { pcs: 0, grossWeight: 0, chargeWeight: 0 },
    );
    return {
      id: job.id,
      jobNo: job.jobNo,
      partyCode: job.party.partyCode,
      partyName: job.party.name,
      hawbNo: job.hawbNo ?? '',
      ppCc: job.printing.printChargeType === 'PP' ? 'PP' : 'CC',
      pcs: totals.pcs,
      uom: '',
      cbm: 0,
      grossWeight: totals.grossWeight,
      chargeWeight: totals.chargeWeight,
      indexNo: '',
      subIndexNo: '',
    };
  });

  return {
    ...draft,
    branch: master.branch,
    // A manifest is a new transaction; retain its default (today's) job date.
    jobDate: draft.jobDate,
    jobType: master.jobType,
    nomination: master.nomination,
    mawbNo: master.mawbNo,
    mawbDate: master.awbDate,
    ppCc: master.printing.printChargeType === 'PP' ? 'PP' : 'CC',
    pcs: shipment.pcs,
    uom: '',
    cbm: 0,
    grossWeight: shipment.grossWeight,
    chargeWeight: shipment.chargeWeight,
    foreignAgent: master.agents.deliveryAgent,
    commodity: master.saidToContain || master.chargeLines.map((line) => line.comdty).filter(Boolean).join(', '),
    origin: master.routing.airportOfDeparture,
    destination: master.routing.destination,
    currency: master.currency,
    flightNo: master.routing.flightNo1,
    flightDate: master.routing.flightDate,
    hawbLines,
  };
}

/** Adds one visible sample only until a real Import-Air manifest is saved. */
export function ensureAirImportManifestDemo(): void {
  if (airImportManifestRepo.list().length) return;
  const demo = createEmptyAirImportManifest('KHI');
  demo.jobDate = '2026-09-17';
  demo.mawbNo = '176-98765432';
  demo.pcs = 42;
  demo.cbm = 3.25;
  demo.grossWeight = 480;
  demo.chargeWeight = 525;
  demo.origin = 'DXB';
  demo.destination = 'KHI';
  demo.hawbLines = [{ id: 'demo-hawb-1', jobNo: 'KHI-AIM-101', partyCode: 'P-1003', partyName: 'Gulf Cargo Partners', hawbNo: 'HAWB-456789', ppCc: 'PP', pcs: 42, uom: 'PCS', cbm: 3.25, grossWeight: 480, chargeWeight: 525, indexNo: '1', subIndexNo: '1' }];
  airImportManifestRepo.save(demo);
}

export interface AirImportManifestFilter {
  branches?: string[];
  foreignAgent?: string;
  origin?: string;
  destination?: string;
  mawbNo?: string;
  checkDate?: boolean;
  startDate?: string;
  endDate?: string;
  status?: 'FINAL' | 'UN_FINAL' | 'ALL';
}

export function searchAirImportManifests(filter: AirImportManifestFilter): AirImportManifest[] {
  return airImportManifestRepo.find((m) => {
    if (filter.branches?.length && !filter.branches.includes(m.branch)) return false;
    if (filter.foreignAgent && m.foreignAgent !== filter.foreignAgent) return false;
    if (filter.origin && m.origin !== filter.origin) return false;
    if (filter.destination && m.destination !== filter.destination) return false;
    if (filter.mawbNo && !m.mawbNo.toLowerCase().includes(filter.mawbNo.toLowerCase())) return false;

    if (filter.checkDate && filter.startDate && filter.endDate) {
      if (m.jobDate < filter.startDate || m.jobDate > filter.endDate) return false;
    }

    switch (filter.status) {
      case 'FINAL':
        if (!m.status.final) return false;
        break;
      case 'UN_FINAL':
        if (m.status.final) return false;
        break;
      default:
        break;
    }
    return true;
  });
}
