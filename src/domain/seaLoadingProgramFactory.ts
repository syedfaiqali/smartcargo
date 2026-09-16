import { v4 as uuid } from 'uuid';
import { SeaLoadingProgram } from './seaLoadingProgram';

const nowIso = () => new Date().toISOString();

export function createEmptySeaLoadingProgram(branch = 'KHI'): SeaLoadingProgram {
  return {
    id: uuid(),
    createdAt: nowIso(),
    updatedAt: nowIso(),
    branch,
    loadProgramNo: '',
    date: new Date().toISOString().slice(0, 10),
    partyCode: '',
    partyName: '',
    agentParty: '',
    shippingLine: '',
    clearAgent: '',
    commodity: '',
    wharf: '',
    port: '',
    destination: '',
    tShipPoint1: '',
    tShipPoint2: '',
    coLoader: '',
    vessel: '',
    voyage: '',
    terminal: '',
    cfsYard: '',
    weboc: '',
    eta: '',
    etd: '',
    egmVir: '',
    dateRequired: '',
    cutOffDate: '',
    noOfPkgs: 0,
    units: '',
    lclFcl: 'LCL',
    remarks: '',
    routing: '',
    containers: [],
    vehicleDate: '',
    status: { final: false },
  };
}
