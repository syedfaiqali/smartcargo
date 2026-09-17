import { AuditFields, IsoDate, YesNo } from './common';

/** An HBL shipment attached to this manifest's Master B/L, via "Add Jobs". */
export interface SeaManifestHblLine {
  id: string;
  jobNo: string;
  partyCode: string;
  partyName: string;
  hblNo: string;
  containerNos: string;
  ppCc: 'PP' | 'CC';
  pcs: number;
  uom: string;
  cbm: number;
  grossWeight: number;
  netWeight: number;
  indexNo: string;
  subIndexNo: string;
}

/** Manifest Inbond Shipments (Sea-Import) */
export interface SeaImportManifest extends AuditFields {
  branch: string;
  consoleJobNo: string;
  jobDate: IsoDate;
  finalDate: IsoDate | '';
  jobType: string;
  nomination: YesNo;

  mblNo: string;
  mblDate: IsoDate | '';
  ppCc: 'PP' | 'CC';
  pcs: number;
  uom: string;
  cbm: number;
  grossWeight: number;
  netWeight: number;

  foreignAgent: string;
  shippingLine: string;
  sLineAgent: string;
  destination: string;
  portOfLoading: string;
  portOfDischarge: string;
  portOfShipment: string;
  viaPort: string;
  shed: string;

  vessel: string;
  voyage: string;
  rotationNo: string;
  eta: IsoDate | '';
  etd: IsoDate | '';
  beNo: string;
  beDate: IsoDate | '';
  igmNo: string;
  igmDate: IsoDate | '';
  lclFcl: 'LCL' | 'FCL';
  arrivedDate: IsoDate | '';
  cyCfs: 'CY' | 'CFS' | 'CY/CFS' | 'CFS/CFS' | 'CY/CY' | 'CFS/CY';
  virNumber: string;
  berthNo: string;
  stevedoring: string;

  hblLines: SeaManifestHblLine[];

  status: {
    final: boolean;
  };
}
