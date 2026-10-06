import { v4 as uuid } from 'uuid';
import { AirImportManifest } from './airImportManifest';

const nowIso = () => new Date().toISOString();

export function createEmptyAirImportManifest(branch = 'KHI'): AirImportManifest {
  return {
    id: uuid(),
    createdAt: nowIso(),
    updatedAt: nowIso(),
    branch,
    jobDate: new Date().toISOString().slice(0, 10),
    jobType: '',
    nomination: 'N',
    mawbNo: '',
    mawbDate: '',
    ppCc: 'PP',
    pcs: 0,
    uom: '',
    cbm: 0,
    grossWeight: 0,
    chargeWeight: 0,
    foreignAgent: '',
    commodity: '',
    origin: '',
    destination: '',
    airlineDoNo: '',
    airlineDoDate: '',
    etd: '',
    eta: '',
    originDoNo: '',
    currency: '',
    flightNo: '',
    flightDate: '',
    hawbLines: [],
    status: { final: false },
  };
}
