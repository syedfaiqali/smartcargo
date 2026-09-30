import { AuditFields, IsoDate, RecordStatus, YesNo } from "./common";

/** 12.1 Container summary row shown on the Entry tab (detail maintained on Container tab). */
export interface SeaContainerRef {
  id: string;
  containerNo: string;
  sizeType: string;
  sealNo: string;
  isoCode: string;
  vehicleNo: string;
  vehicleDate: IsoDate | "";
  vehicleEta: IsoDate | "";
  vehicleAta: IsoDate | "";
  // 12.3 Container tab detail fields not shown in the Entry-tab summary grid
  serialNo: number;
  containerTypes: string;
  vehicleType: string;
  polEta: IsoDate | "";
  polAta: IsoDate | "";
  pcd: IsoDate | "";
  transporterName: string;
  driverName: string;
  mobileNo: string;
  charges: number;
  fromPol: string;
  toPod: string;
  noOfPkgs: number;
  unit: string;
  cbm: number;
  grossWeight: number;
  netWeight: number;
}

export interface SeaConsolRef {
  jobNo: string;
  containerNo: string;
  size: string;
  vessel: string;
  voyage: string;
}

export interface SeaJobHistoryRef {
  no: string;
  date: IsoDate;
  year: number;
  type: string;
  name: string;
  curr: string;
  fAmount: number;
  pkrAmount: number;
  final: boolean;
}

export interface TransshipmentPoint {
  id: string;
  destinationCode: string;
  eta: IsoDate | "";
  etaTime: string;
  etaChecked: boolean;
  etd: IsoDate | "";
  etdTime: string;
  etdChecked: boolean;
  vessel: string;
  voyage: string;
}

export interface SeaCreditNoteRef {
  cnNo: string;
  manualCn: boolean;
}

/** 12.4 Job Charges — Other Charges grid line. */
export interface SeaChargeLine {
  id: string;
  code: string;
  description: string;
  curr: string;
  sellFAmount: number;
  buyFAmount: number;
}

/** 12.3 top-of-tab entry form fields, mirrored into each container record on Add. */
export interface SeaAddress {
  name: string;
  address: string;
}

export type SeaJobStatus =
  "FINAL" | "UN_FINAL" | "VOID" | "UN_VOID" | "CLOSED" | "UN_CLOSED";

/**
 * Jobs Entry and Documents Printing (Sea-Export) — docs/screens-phase.md Part 2 / Section 12.
 * One record backs all 8 tabs (Entry, B/L Screen, Container, Job Charges, Detail/Search,
 * Printing, Consol, Instruction Letter); Job No. is the anchor.
 */
export interface SeaExportJob extends AuditFields {
  // --- 12.1 Entry Tab ---
  branch: string;
  jobNo: string;
  jobNo2: string;
  date: IsoDate;
  jobType: string;
  loadProgramNo: string;
  consolNo: string;
  consolYN: YesNo;
  nomination: YesNo;
  creditLimit: number;
  attachmentName: string;
  partyCode: string;
  partyName: string;
  subAgentParty: string;
  commodity: string;
  foreignAgent: string;
  shippingLine: string;
  sLineAgent: string;
  deliveryAgent: string;
  spoCode: string;
  portOfLoad: string;
  destination: string;
  wharf: string;
  terminal: string;
  clearingAgent: string;
  jobStatus: string;
  jobStatusDate: IsoDate | "";
  bookingNo: string;
  quotRefNo: string;
  consolTotal: {
    cbm: number;
    grossWeight: number;
    netWeight: number;
    noOfPackages: number;
    uom: string;
    noOfShipments: number;
  };
  lastConsolNo: string;

  lclFcl: "LL" | "LF" | "FL" | "FF" | "PF";
  mPpCc: string;
  cyCfs: "CY" | "CFS";
  hPpCc: string;
  cyCfsCutOff: IsoDate | "";
  roNo: string;
  gdDate: IsoDate | "";
  shipmentdate: IsoDate | "";
  noOfPackages: number;
  unit: string;
  noOfPcsQty: number;
  unitQty: string;
  gdNo: string;
  currencyCode: string;
  exchangeRate: number;

  grossWeight: number;
  netWeight: number;
  volWeight: number;
  cbm: number;
  cbmRate: number;

  incoTerm: string;
  hsCode: string;
  stackCode: string;
  runNo: string;
  vehicleNo: string;
  vehicleType: string;

  shipperInvoice: {
    invNo: string;
    date: IsoDate | "";
    currencyCode: string;
    amount: number;
    poNo: string;
  };

  ccDate: IsoDate | "";
  ccPlace: string;
  ccDateTime: string;
  selectFromE: string;
  formEDate: IsoDate | "";
  formEInsNo2: string;
  formEInsNo2Date: IsoDate | "";
  formEInsNo3: string;
  formEInsNo3Date: IsoDate | "";
  shipReceivedDate: IsoDate | "";

  cuttOffDate: IsoDate | "";
  siFileCuttOff: IsoDate | "";
  handOverToSl: IsoDate | "";
  handOverToSlTime: string;
  docReceived: IsoDate | "";
  siFiled: IsoDate | "";
  docDespatchDate: IsoDate | "";

  sbNo: string;
  sbPlace: string;
  sbDate: IsoDate | "";
  mrNo: string;
  mrDate: IsoDate | "";
  egm: string;

  mblNo: string;
  mblDate: IsoDate | "";
  mblReceived: YesNo;
  hblType: string;
  hblNo: string;
  hblDate: IsoDate | "";
  sailingDate: IsoDate | "";
  pickupStuffing: IsoDate | "";

  containers: SeaContainerRef[];

  invoiceRequired: YesNo;
  localInvoice: YesNo;
  intlInvoice: YesNo;
  payableToSl: YesNo;
  refundFromSl: YesNo;
  ddShip: YesNo;

  shipmentDelivered: YesNo;
  deliveredDate: IsoDate | "";
  releaseMessageDate: IsoDate | "";
  preAlertDate: IsoDate | "";
  shipmentContainerized: YesNo;

  nonPrintableRemarks: string;

  consolGrid: SeaConsolRef[];
  jobHistory: SeaJobHistoryRef[];

  polEta: IsoDate | "";
  polEtaTime: string;
  polEtaChecked: boolean;
  polEtd: IsoDate | "";
  polEtdTime: string;
  etaAtDest: IsoDate | "";
  etaAtDestTime: string;
  etaAtDestChecked: boolean;
  vessel: string;
  voyage: string;
  rotationNo: string;
  transshipmentPoints: TransshipmentPoint[];

  creditNoteDetails: SeaCreditNoteRef[];

  // --- 12.2 B/L Screen Tab ---
  bl: {
    hblType: string;
    mblNo: string;
    hblNo: string;
    docRefNo: string;
    partyCode: string;
    agentParty: string;
    address: string;
    consignee: string;
    notify: string;
    alsoNotify: string;
    deliveryAgent: string;
    formENo: string;
    formEDate: IsoDate | "";
    vessel: string;
    voyage: string;
    placeOfReceipt: string;
    placeOfLoading: string;
    placeOfDischarge: string;
    placeOfDelivery: string;
    freightPayableAt: string;
    noOfOrigBLs: number;
    countryOfOrigin: string;
    placeOfIssue: string;
    hblDate: IsoDate | "";
    fobCif: "FOB" | "CIF";
    cbm: number;
    grossWeight: number;
    volWeight: number;
    netWeight: number;
    bookingNo: string;
    loadingPier: string;
    reference: string;
    blReleasedAt: string;
    mop: string;
    freightChargesText: string;
    rate: number;
    prepaid: number;
    collect: number;
    marksAndNos: string;
    descriptionOfGoods: string;
    sheet: string;
  };

  // --- 12.4 Job Charges Tab ---
  jobCharges: {
    currencies: { curr: string; exRate: number }[];
    lines: SeaChargeLine[];
    totalSellCharges: number;
    totalBuyCharges: number;
    totalGpAmount: number;
    totalGpLessKb: number;
  };

  // --- 12.7 Consol Tab (fields specific to this job's own consol record) ---
  consol: {
    consolNo: string;
    lclFcl: "LCL" | "FCL";
    foreignAgent: string;
    shippingLine: string;
    sLineAgent: string;
    portOfLoad: string;
    portOfDischarge: string;
    wharf: string;
    terminal: string;
    mblNo: string;
    mblDate: IsoDate | "";
    vessel: string;
    voyage: string;
    rotationNo: string;
    containerNo: string;
    size: string;
    containerTypes: string;
    sealNo: string;
    pickupStuffing: IsoDate | "";
    cutOffDate: IsoDate | "";
    sailingDate: IsoDate | "";
    polEta: IsoDate | "";
    polEtd: IsoDate | "";
    etaAtDest: IsoDate | "";
  };

  // --- 12.8 Instruction Letter Tab ---
  instructionLetter: {
    mblNo: string;
    hblNo: string;
    docRefNo: string;
    partyCode: string;
    agentParty: string;
    address: string;
    consignee: string;
    notify: string;
    alsoNotify: string;
    deliveryAgent: string;
    formENo: string;
    formEDate: IsoDate | "";
    vessel: string;
    voyage: string;
    placeOfReceipt: string;
    placeOfLoading: string;
    placeOfDischarge: string;
    placeOfDelivery: string;
    freightPayableAt: string;
    noOfOrigBLs: number;
    cbm: number;
    grossWeight: number;
    volWeight: number;
    netWeight: number;
    bookingNo: string;
    reference: string;
    mop: string;
    marksAndNos: string;
    descriptionOfGoods: string;
    sheet: string;
  };

  // --- 12.6 Printing Tab ---
  printing: {
    documentType: string;
    printOn: "LETTER_PAD" | "PLAIN_PAPER";
    todaysDate: IsoDate;
    attention: string;
    note: string;
  };

  status: RecordStatus & { closed: boolean };
}
