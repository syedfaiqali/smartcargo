import { AuditFields, IsoDate, RecordStatus, YesNo } from './common';

/** House B/L grid line — No./Job No./Containers, attached under this MBL. */
export interface SeaImportHblLine {
  id: string;
  no: string;
  jobNo: string;
  containers: string;
}

/** Container grid line — Container No./Size/Seal No./ISO Code/Pkgs/Weight/Net Wt./CRO Date/Detention. */
export interface SeaImportContainerLine {
  id: string;
  containerNo: string;
  size: string;
  sealNo: string;
  isoCode: string;
  pkgs: number;
  weight: number;
  netWeight: number;
  croFreeDate: IsoDate | '';
  detentionDays: number;
  detentionAmount: number;
  emptyLocation: string;
}

/** Container Security grid line — Instrument/No./Date/Amount. */
export interface SeaImportSecurityLine {
  id: string;
  instrument: string;
  no: string;
  date: IsoDate | '';
  amount: number;
}

/** Console Job Containers grid line — Br./Job No./Containers. */
export interface SeaImportConsoleContainerLine {
  id: string;
  branch: string;
  jobNo: string;
  containers: string;
}

/** Inbond Shipment Entry and Documents Printing (Sea-Import) */
export interface SeaImportJob extends AuditFields {
  branch: string;
  jobNo: string;
  jobDate: IsoDate;
  finalDate: IsoDate | '';
  jobType: string;
  nomination: YesNo;
  commodity: string;
  consoleJob: string;

  quotRefNo: string;
  doIssueDate: IsoDate | '';

  mblNo: string;
  mblDate: IsoDate | '';
  mblPpCc: 'PP' | 'CC';
  mblPcs: number;
  mblUom: string;
  mblCbm: number;
  mblGrossWeight: number;
  mblNetWeight: number;

  hblNo: string;
  hblDate: IsoDate | '';
  hblPpCc: 'PP' | 'CC';
  hblPcs: number;
  hblUom: string;
  hblCbm: number;
  hblGrossWeight: number;
  hblNetWeight: number;

  creditLimit: number;
  partyCode: string;
  partyName: string;
  subAgentParty: string;
  foreignAgent: string;
  shippingLine: string;
  sLineAgent: string;
  spoCode: string;
  origin: string;
  destination: string;
  portOfLoading: string;
  portOfDischarge: string;
  portOfShipment: string;
  viaPort: string;
  shed: string;
  terminal: string;
  clearingAgent: string;
  operationOfficer: string;
  stevedoring: string;
  marksAndNos: string;

  vessel: string;
  voyage: string;
  rotationNo: string;
  stackCode: string;
  eta: IsoDate | '';
  etd: IsoDate | '';
  beNo: string;
  beDate: IsoDate | '';
  indexNo: string;
  subIndexNo: string;
  igmNo: string;
  igmDate: IsoDate | '';
  lclFcl: 'LCL' | 'FCL';
  arrivedDate: IsoDate | '';
  docRcvDate: IsoDate | '';
  nocValidDate: IsoDate | '';
  transporter: string;
  guarantee: string;
  vehicleNo: string;
  driver: string;
  driverCell: string;
  cyCfs: 'CY/CY' | 'CY/CFS' | 'CFS/CY' | 'CFS/CFS';
  virNumber: string;
  custRefNo: string;
  hsCode: string;
  berthNo: string;
  freeDays: number;
  totalDetentionDays: number;
  currency: string;
  exRate: number;
  detentionRatePerDay: number;
  totalDetentionAmount: number;
  roNo: string;

  hblLines: SeaImportHblLine[];
  documentsList: string[];

  foreignAgentShipperNameAddress: string;
  consigneeNameAddress: string;
  ntnNo: string;
  passportNo: string;
  cnicNo: string;
  notifyNameAddress: string;

  totalSecurityReceivable: number;
  containerSecurityLines: SeaImportSecurityLine[];
  balanceSecurityReceivable: number;

  containers: SeaImportContainerLine[];
  consoleJobContainers: SeaImportConsoleContainerLine[];

  jobStatus: string;
  jobStatusDate: IsoDate | '';
  jobStatusRemarks: string;
  shippingTerm: 'FOB' | 'CIF';

  intlInvoice: YesNo;
  localInvoice: YesNo;

  status: RecordStatus & { closed: boolean };
}
