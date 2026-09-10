import { Job, JobKind } from '../domain/job';
import { Repository } from './repository';

export const jobRepo = new Repository<Job>('jobs');

let jobSequence = 1000;
let hawbSequence = 5000;

export function nextJobNo(kind: JobKind, branch: string): string {
  const existing = jobRepo.find((j) => j.kind === kind && j.branch === branch);
  const maxSeq = existing.reduce((max, j) => {
    const parts = j.jobNo.split('-');
    const seq = parseInt(parts[parts.length - 1], 10);
    return Number.isFinite(seq) ? Math.max(max, seq) : max;
  }, jobSequence);
  jobSequence = maxSeq + 1;
  const prefix = kind === 'MAWB' ? 'JM' : 'JH';
  return `${branch}-${prefix}-${jobSequence}`;
}

/**
 * HAWB No. is drawn from its own numbering series, separate from the Job No. and from
 * the Airline's AWB Stock (Section 1 stock control is Master-AWB-specific, not per-House)
 * — docs/screens-phase.md Section 3.
 */
export function nextHawbNo(branch: string): string {
  const existing = jobRepo.find((j) => j.kind === 'HAWB' && j.branch === branch && !!j.hawbNo);
  const maxSeq = existing.reduce((max, j) => {
    const seq = parseInt((j.hawbNo ?? '').split('-').pop() ?? '', 10);
    return Number.isFinite(seq) ? Math.max(max, seq) : max;
  }, hawbSequence);
  hawbSequence = maxSeq + 1;
  return `${branch}-HAWB-${hawbSequence}`;
}

export interface JobFilter {
  kind: JobKind;
  branches?: string[];
  partyCode?: string;
  owner?: string;
  spoCode?: string;
  originAirport?: string;
  destination?: string;
  hsCode?: string;
  startJobNo?: string;
  endJobNo?: string;
  checkDate?: boolean;
  startDate?: string;
  endDate?: string;
  dateField?: 'AWB_DATE' | 'JOB_DATE';
  startMawbNo?: string;
  endMawbNo?: string;
  formENo?: string;
  status?: 'FINAL' | 'UN_FINAL' | 'VOID' | 'UN_VOID' | 'ALL';
}

export function searchJobs(filter: JobFilter): Job[] {
  return jobRepo.find((job) => {
    if (job.kind !== filter.kind) return false;
    if (filter.branches?.length && !filter.branches.includes(job.branch)) return false;
    if (filter.partyCode && job.party.partyCode !== filter.partyCode) return false;
    if (filter.owner && job.owner !== filter.owner) return false;
    if (filter.spoCode && job.agents.spoCode !== filter.spoCode) return false;
    if (filter.originAirport && job.routing.airportOfDeparture !== filter.originAirport) return false;
    if (filter.destination && job.routing.destination !== filter.destination) return false;
    if (filter.hsCode && job.routing.hsCode !== filter.hsCode) return false;
    if (filter.startJobNo && job.jobNo < filter.startJobNo) return false;
    if (filter.endJobNo && job.jobNo > filter.endJobNo) return false;
    if (filter.formENo && job.routing.formENo !== filter.formENo) return false;
    if (filter.startMawbNo && job.mawbNo < filter.startMawbNo) return false;
    if (filter.endMawbNo && job.mawbNo > filter.endMawbNo) return false;

    if (filter.checkDate && filter.startDate && filter.endDate) {
      const dateValue = filter.dateField === 'AWB_DATE' ? job.awbDate : job.jobDate;
      if (!dateValue || dateValue < filter.startDate || dateValue > filter.endDate) return false;
    }

    switch (filter.status) {
      case 'FINAL':
        if (!job.status.final) return false;
        break;
      case 'UN_FINAL':
        if (job.status.final) return false;
        break;
      case 'VOID':
        if (!job.status.void) return false;
        break;
      case 'UN_VOID':
        if (job.status.void) return false;
        break;
      default:
        break;
    }
    return true;
  });
}

export function finalizeJob(id: string): Job | undefined {
  const job = jobRepo.get(id);
  if (!job) return undefined;
  return jobRepo.save({ ...job, status: { ...job.status, final: true } });
}

export function finalizeMultiple(ids: string[]): Job[] {
  return ids.map((id) => finalizeJob(id)).filter((j): j is Job => !!j);
}

export function voidJob(id: string): Job | undefined {
  const job = jobRepo.get(id);
  if (!job) return undefined;
  return jobRepo.save({ ...job, status: { ...job.status, void: true } });
}

export function unvoidJob(id: string): Job | undefined {
  const job = jobRepo.get(id);
  if (!job) return undefined;
  return jobRepo.save({ ...job, status: { ...job.status, void: false } });
}

export function getHouseAwbsForMaster(masterJobNo: string): Job[] {
  return jobRepo.find((j) => j.kind === 'HAWB' && j.parentJobNo === masterJobNo);
}

export function findMasterByJobNo(jobNo: string): Job | undefined {
  return jobRepo.find((j) => j.kind === 'MAWB' && j.jobNo === jobNo)[0];
}

/**
 * Rebuilds a Master job's "House Air Waybills" grid (docs Section 2.8) from its current
 * children. Call after saving or deleting a House job so the Master's Entry tab stays live.
 */
export function syncHouseAwbsOnMaster(masterJobNo: string): void {
  const master = findMasterByJobNo(masterJobNo);
  if (!master) return;
  const houses = getHouseAwbsForMaster(masterJobNo);
  const houseAwbs = houses.map((h) => ({
    jobNo: h.jobNo,
    hawbNo: h.hawbNo ?? '',
    runNo: h.agents.runNo,
  }));
  jobRepo.save({ ...master, houseAwbs });
}
