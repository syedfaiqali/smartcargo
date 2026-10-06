import { AuditFields, IsoDate, YesNo } from './common';

/** A HAWB shipment attached to this manifest's Master AWB, via "Add Jobs". */
export interface ManifestHawbLine {
  id: string;
  jobNo: string;
  partyCode: string;
  partyName: string;
  hawbNo: string;
  ppCc: 'PP' | 'CC';
  pcs: number;
  uom: string;
  cbm: number;
  grossWeight: number;
  chargeWeight: number;
  indexNo: string;
  subIndexNo: string;
}

/** Manifest Inbond Shipments (Air-Import) */
export interface AirImportManifest extends AuditFields {
  branch: string;
  jobDate: IsoDate;
  jobType: string;
  nomination: YesNo;

  mawbNo: string;
  mawbDate: IsoDate | '';
  ppCc: 'PP' | 'CC';
  pcs: number;
  uom: string;
  cbm: number;
  grossWeight: number;
  chargeWeight: number;

  foreignAgent: string;
  commodity: string;
  origin: string;
  destination: string;

  airlineDoNo: string;
  airlineDoDate: IsoDate | '';
  etd: IsoDate | '';
  eta: IsoDate | '';
  originDoNo: string;
  currency: string;
  flightNo: string;
  flightDate: IsoDate | '';

  hawbLines: ManifestHawbLine[];

  status: {
    final: boolean;
  };
}
