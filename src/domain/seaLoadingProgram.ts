import { AuditFields, IsoDate } from './common';

/** Container grid line — Container No./Size/CY-CFS/Seal No./Vehicle No. */
export interface LoadingProgramContainerLine {
  id: string;
  containerNo: string;
  size: string;
  cyCfs: 'CY' | 'CFS';
  sealNo: string;
  vehicleNo: string;
}

/** Loading Program Entry and Printing (Sea-Export) */
export interface SeaLoadingProgram extends AuditFields {
  branch: string;
  loadProgramNo: string;
  date: IsoDate;

  partyCode: string;
  partyName: string;
  agentParty: string;
  shippingLine: string;
  clearAgent: string;
  commodity: string;
  wharf: string;
  port: string;
  destination: string;
  tShipPoint1: string;
  tShipPoint2: string;
  coLoader: string;

  vessel: string;
  voyage: string;
  terminal: string;
  cfsYard: string;
  weboc: string;

  eta: IsoDate | '';
  etd: IsoDate | '';
  egmVir: string;
  dateRequired: IsoDate | '';
  cutOffDate: IsoDate | '';
  noOfPkgs: number;
  units: string;
  lclFcl: 'LCL' | 'FCL';
  remarks: string;
  routing: string;

  containers: LoadingProgramContainerLine[];
  vehicleDate: IsoDate | '';

  status: {
    final: boolean;
  };
}
