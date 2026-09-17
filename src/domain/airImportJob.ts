import { AuditFields, IsoDate, RecordStatus, YesNo } from './common';

/** House Airway Bill grid line — Job No./HAWB No./Pcs/Weight, attached under this MAWB. */
export interface AirImportHawbLine {
  id: string;
  jobNo: string;
  hawbNo: string;
  pcs: number;
  weight: number;
}

/** Inbond Shipments Entry and Documents Printing (Air-Import) */
export interface AirImportJob extends AuditFields {
  branch: string;
  jobNo: string;
  jobDate: IsoDate;
  finalDate: IsoDate | '';
  jobType: string;
  nomination: YesNo;
  commodity: string;

  quotRefNo: string;
  doIssueDate: IsoDate | '';

  mawbNo: string;
  mawbDate: IsoDate | '';
  mawbPpCc: 'PP' | 'CC';
  mawbPcs: number;
  mawbUom: string;
  mawbCbm: number;
  mawbGrossWeight: number;
  mawbChargeWeight: number;

  hawbNo: string;
  hawbDate: IsoDate | '';
  hawbPpCc: 'PP' | 'CC';
  hawbPcs: number;
  hawbUom: string;
  hawbCbm: number;
  hawbGrossWeight: number;
  hawbChargeWeight: number;

  creditLimit: number;
  partyCode: string;
  partyName: string;
  subAgentParty: string;
  foreignAgent: string;
  spoCode: string;
  origin: string;
  destination: string;
  flightNo: string;
  flightDate: IsoDate | '';
  custRefNo: string;
  clearingAgent: string;
  operationOfficer: string;

  airlineDoNo: string;
  airlineDoDate: IsoDate | '';
  beNo: string;
  beDate: IsoDate | '';
  igmNo: string;
  igmDate: IsoDate | '';
  indexNo: string;
  subIndexNo: string;
  etd: IsoDate | '';
  eta: IsoDate | '';
  lcNo: string;
  passportNo: string;
  docRcvDate: IsoDate | '';
  originDoNo: string;
  currency: string;
  vehicleNo: string;
  transporter: string;
  driver: string;
  driverCell: string;
  hsCode: string;
  roNo: string;

  houseAirwayBills: AirImportHawbLine[];

  foreignAgentShipperNameAddress: string;
  notifyNameAddress: string;
  remarks: string;

  consigneeNameAddress: string;
  jobStatus: string;
  jobStatusDate: IsoDate | '';
  jobStatusRemarks: string;
  shippingTerm: 'FOB' | 'CIF';

  intlInvoice: YesNo;
  localInvoice: YesNo;

  status: RecordStatus & { closed: boolean };
}
