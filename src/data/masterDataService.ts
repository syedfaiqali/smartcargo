import { v4 as uuid } from 'uuid';
import {
  AgentCode,
  AirlineCode,
  AirportCode,
  AssociateCode,
  BankCode,
  ChargeableCode,
  CommodityCode,
  ContainerType,
  CountryCode,
  CurrencyCode,
  ForeignAgentCode,
  InvoiceChargeCode,
  JobStatusCode,
  JobType,
  OwnerCode,
  PartyCode,
  PayableTypeCode,
  PAYABLE_TYPE_DEPTS,
  SeaPortCode,
  SectorCode,
  ShippingLineCode,
  SignatoryCode,
  SpoCode,
  SubAgentParty,
  TermsAndConditions,
} from '../domain/masterData';
import { isSeeded, markSeeded } from './localStore';
import { Repository } from './repository';

const nowIso = () => new Date().toISOString();
const withAudit = <T extends object>(item: T) => ({
  ...item,
  id: uuid(),
  createdAt: nowIso(),
  updatedAt: nowIso(),
});

const emptyPayableTypeDeptRows = () => PAYABLE_TYPE_DEPTS.map(({ dept }) => ({
  dept,
  otherExpenseCode: '',
  otherExpenseAmount: 0,
  otherIncomeCode: '',
  otherIncomeAmount: 0,
}));

export const airlineRepo = new Repository<AirlineCode>('airlineCodes');
export const ownerRepo = new Repository<OwnerCode>('ownerCodes');
export const partyRepo = new Repository<PartyCode>('partyCodes');
export const foreignAgentRepo = new Repository<ForeignAgentCode>('foreignAgentCodes');
export const airportRepo = new Repository<AirportCode>('airportCodes');
export const spoRepo = new Repository<SpoCode>('spoCodes');
export const currencyRepo = new Repository<CurrencyCode>('currencyCodes');
export const agentRepo = new Repository<AgentCode>('agentCodes');
export const bankRepo = new Repository<BankCode>('bankCodes');
export const payableTypeRepo = new Repository<PayableTypeCode>('payableTypeCodes');
export const shippingLineRepo = new Repository<ShippingLineCode>('shippingLineCodes');
export const seaPortRepo = new Repository<SeaPortCode>('seaPortCodes');
export const sectorRepo = new Repository<SectorCode>('sectorCodes');
export const countryRepo = new Repository<CountryCode>('countryCodes');
export const commodityRepo = new Repository<CommodityCode>('commodityCodes');
export const containerTypeRepo = new Repository<ContainerType>('containerTypes');
export const subAgentPartyRepo = new Repository<SubAgentParty>('subAgentParties');
export const associateRepo = new Repository<AssociateCode>('associateCodes');
export const chargeableRepo = new Repository<ChargeableCode>('chargeableCodes');
export const invoiceChargeRepo = new Repository<InvoiceChargeCode>('invoiceChargeCodes');
export const signatoryRepo = new Repository<SignatoryCode>('signatoryCodes');
export const jobTypeRepo = new Repository<JobType>('jobTypes');
export const jobStatusRepo = new Repository<JobStatusCode>('jobStatusCodes');
export const termsRepo = new Repository<TermsAndConditions>('termsAndConditions');

const legacyAirlineCodes = [
  ['EK', 'Emirates'], ['999', 'AIR CHINA'], ['997', 'BIMAN BANGLADESH - BG'], ['996', 'Air Europan'],
  ['960', 'SALAM AIR'], ['932', 'VIRGIN ATLANTIC CARGO'], ['910', 'OMAN AIR'], ['860', 'YG CARRIER ( CHINA )'],
  ['784', 'CHINA SOUTHERN AIRLINES'], ['761', 'DAS AIR'], ['745', 'AIRBERLIN'], ['729', 'AVIANCA AIR'],
  ['724', 'SWISS WORLD CARGO'], ['706', 'KENYAN AIR - KQ'], ['703', 'FLYNAS AIR'], ['635', 'YEMEN AIRWAYS - YE'],
  ['624', 'PEGASUS AIR (LEISURE CARGO PVT LTD)'], ['618', 'SINGAPORE AIRLINES'], ['612', 'SWE FLY'], ['607', 'EITHAD AIRWAYS'],
  ['603', 'AIR LANKA - UL'], ['555', 'AERO FLOT'], ['537', 'Mahan AIR'], ['514', 'AIR ARABIA'],
  ['512', 'ROYAL JORDANIAN - RJ'], ['501', 'SILKWAY WEST AIRLINE 501'], ['319', 'FITS AIR'], ['250', 'UZBEKISTAN AIRWAYS'],
  ['235', 'TURKISH AIRLINES - TK'], ['232', 'MALAYSIAN AIRLINE - MH'], ['229', 'KUWAIT AIRWAYS - KU'], ['217', 'THAI AIRLINES - TG'],
  ['214', "PAKISTAN INT'L AIRLINES CORP"], ['200', 'SUDAN AIR'], ['180', 'KOREAN AIR - KE'], ['176', 'EMIRATES - EK'],
  ['172', 'CARGOLUX'], ['168', 'AIR ZIMBABWE CORPORATION'], ['160', 'CATHAY PACIFIC AIRWAYS LIMITED'], ['157', 'QATAR AIRWAYS'],
  ['155', 'DHL AIR'], ['141', 'FLY DUBAI'], ['131', 'JORDAN AIRLINES - JL'], ['129', 'MARTIN AIR'],
  ['125', 'BRITISH AIRWAYS-BA'], ['121', 'Saudi Airline'], ['115', 'JUGOSLOVENSKI AEROTRANSPORT-JU'], ['111', 'Saudi Airline'],
  ['108', 'Iceland Airline'], ['096', 'IRAN AIR - IR'], ['092', 'SERENE AIRLINE 092'], ['085', 'SWISS AIR - SR'],
  ['084', 'AIR BLUE'], ['079', 'PHILIPPINE AIRLINE - PR'], ['077', 'EGYPT AIR - MS'], ['076', 'MIDDLE EAST AIRLINE'],
  ['074', 'KLM ROYAL DUTCH AIRLINES - KL'], ['072', 'GULF AIR'], ['071', 'ETHOPIAN AIRLINES'], ['070', 'SYRIAN ARAB AIRLINES - RB'],
  ['065', 'SAUDI ARABIAN AIRLINE'], ['064', 'CZECH AIRLINES'], ['057', 'AIR FRANCE - AF'], ['055', 'ALITALIA AIR'],
  ['049', 'AIR ARABIA ABU DHABI AIRLINE 049'], ['020', 'LUFTHANSA CARGO'], ['016', 'UNITED AIRWAYS'], ['014', 'AIR CANADA CARGO'],
  ['006', 'DELTA CARGO'], ['005', 'CONTINENTAL AIRLINES'], ['001', 'AMERICAN AIRLINE'],
] as const;

const legacyCassAirlineCodes = new Set(['EK', '910', '603', '235', '214', '176', '157']);
const toLegacyAirline = ([code, name]: readonly [string, string]) => withAudit({
  code,
  name,
  flightName: code === '996' ? 'UX' : '',
  standardAwb: 'Y' as const,
  airlineCass: legacyCassAirlineCodes.has(code) ? 'Y' as const : 'N' as const,
});

const jobTypes = [
  { code: 'FREIGHT', description: 'Freight', incomeCode: '', incomeDescription: '' },
  { code: 'CLEARANCE', description: 'Clearance', incomeCode: '', incomeDescription: '' },
  { code: 'FREIGHT-CLEARANCE', description: 'Freight+Clearance', incomeCode: '', incomeDescription: '' },
  { code: 'ROAD-TRANSPORT', description: 'Road Transport', incomeCode: '', incomeDescription: '' },
  { code: 'VALUE-SERVICES', description: 'Value Services', incomeCode: '', incomeDescription: '' },
  { code: 'CUSTOM-CLEARANCE', description: 'Custom Clearance', incomeCode: '', incomeDescription: '' },
  { code: 'NOMINATION', description: 'Nomination', incomeCode: '', incomeDescription: '' },
  { code: 'EX-WORKS', description: 'EX-WORKS', incomeCode: '', incomeDescription: '' },
];

const seaExportChargeableCodes = [
  { code: 'FC', description: 'AIR FREIGHT TO COLLECT' },
  { code: 'CC', description: 'CHARGES COLLECT' },
  { code: 'DDP', description: 'DELIVERED DUTY UNPAID' },
  { code: 'DDU', description: 'DELIVERED DUTY UNPAID' },
  { code: 'C&I', description: 'FREIGHT COLLECT' },
  { code: 'FOB', description: 'FREIGHT COLLECT' },
  { code: 'FCP', description: 'FREIGHT COLLECT D/C PREPAID' },
  { code: 'FPD', description: 'FREIGHT PAYABLE AT DESTINATION' },
  { code: 'CIF', description: 'FREIGHT PREPAID' },
  { code: 'PP', description: 'FREIGHT PREPAID' },
  { code: 'C&F', description: 'INVOICED' },
  { code: 'CFR', description: 'INVOICED' },
  { code: 'CIP', description: 'INVOICED' },
  { code: 'CPT', description: 'INVOICED' },
  { code: 'FP', description: 'INVOICED' },
  { code: 'HGG', description: 'MASTER FILE' },
];

const seaExportCurrencies = [
  { code: 'AUD', name: 'Australian Dollar', defaultExchangeRate: 0 },
  { code: 'RMB', name: 'China Yuan RMB', defaultExchangeRate: 0 },
  { code: 'AED', name: 'DHARAM', defaultExchangeRate: 0 },
  { code: 'EUR', name: 'EURO DOLLARS', defaultExchangeRate: 0 },
  { code: 'HKD', name: 'HONG KONG DOLLAR', defaultExchangeRate: 0 },
  { code: 'NZD', name: 'NEWZEALAND DOLLAR', defaultExchangeRate: 0 },
  { code: 'PKR', name: 'PAK CURRENCY', defaultExchangeRate: 1 },
  { code: 'SGD', name: 'Singapore Dollar', defaultExchangeRate: 0 },
  { code: 'SEK', name: 'SWEDISH KRONA', defaultExchangeRate: 0 },
  { code: 'CHF', name: 'SWISS FRANCE', defaultExchangeRate: 0 },
  { code: 'GBP', name: 'UK POUND', defaultExchangeRate: 0 },
  { code: 'US$', name: 'US DOLLARS DAILY', defaultExchangeRate: 0 },
  { code: 'USD', name: 'US Dollar', defaultExchangeRate: 278.5 },
];

const sectorCodes = [
  { code: '1', name: 'USA / CANADA' },
  { code: '2', name: 'EUROPE' },
  { code: '3', name: 'FAR EAST' },
  { code: '4', name: 'AFRICA' },
  { code: '5', name: 'ASIA' },
  { code: '6', name: 'MIDDLE EAST' },
];

// ISO 3166-1 alpha-2 country codes. DisplayNames keeps names current in the browser.
const countryNames = new Intl.DisplayNames(['en'], { type: 'region' });
const countryCodes = 'AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW'
  .split(' ')
  .map((code) => ({ code, name: countryNames.of(code) ?? code, sectorCode: '' }));

function seedIfEmpty() {
  if (isSeeded('masterData')) {
    if (currencyRepo.list().length < seaExportCurrencies.length) {
      currencyRepo.replaceAll(seaExportCurrencies.map(withAudit));
    }
    if (chargeableRepo.list().length < seaExportChargeableCodes.length) {
      chargeableRepo.replaceAll(seaExportChargeableCodes.map(withAudit));
    }
    return;
  }

  airlineRepo.replaceAll(
    legacyAirlineCodes.map(toLegacyAirline)
  );

  ownerRepo.replaceAll(
    [
      { code: 'KHI-OWN', name: 'Karachi Branch Owner', station: '', phoneFaxNo: '', email: '', website: '', iataCode: '', accountNo: '', commissionPercent: 0, whtPercent: 0, logoName: '' },
      { code: 'LHE-OWN', name: 'Lahore Branch Owner', station: '', phoneFaxNo: '', email: '', website: '', iataCode: '', accountNo: '', commissionPercent: 0, whtPercent: 0, logoName: '' },
    ].map(withAudit)
  );

  partyRepo.replaceAll(
    [
      { code: 'GEN-01', name: 'General Format', address: 'Site Area, Karachi', creditLimit: 500000 },
      { code: 'MSL-01', name: 'Masum Logistics', address: 'SITE-II, Karachi', creditLimit: 250000 },
    ].map(withAudit)
  );

  foreignAgentRepo.replaceAll(
    [
      { code: 'FA-201', name: 'Gulf Cargo Partners LLC', address: 'Dubai, UAE' },
      { code: 'FA-202', name: 'Far East Freight Co.', address: 'Hong Kong' },
    ].map(withAudit)
  );

  airportRepo.replaceAll(
    [
      { code: 'KHI', name: 'Jinnah International Airport', countryCode: 'PK', sectorCode: '' },
      { code: 'DXB', name: 'Dubai International Airport', countryCode: 'AE', sectorCode: '' },
      { code: 'DOH', name: 'Hamad International Airport', countryCode: 'QA', sectorCode: '' },
      { code: 'IST', name: 'Istanbul Airport', countryCode: 'TR', sectorCode: '' },
      { code: 'HKG', name: 'Hong Kong International Airport', countryCode: 'HK', sectorCode: '' },
    ].map(withAudit)
  );

  spoRepo.replaceAll(
    [
      { code: 'SPO-01', description: 'Sales Person A', sharePercent: 1, splitedSharePercent: 0, financeCode: '', designation: '', mobileNo: '', email: '', active: 'Y' as const },
      { code: 'SPO-02', description: 'Sales Person B', sharePercent: 1, splitedSharePercent: 0, financeCode: '', designation: '', mobileNo: '', email: '', active: 'Y' as const },
    ].map(withAudit)
  );

  currencyRepo.replaceAll(
    seaExportCurrencies.map(withAudit)
  );

  agentRepo.replaceAll(
    [
      { code: 'CA-01', name: 'Speedway Clearing Agency', kind: 'CLEARING' as const, address: '', countryCode: '', phoneNo: '', faxNo: '', contactPerson: '', email: '', website: '' },
      { code: 'DA-01', name: 'CityLink Delivery Services', kind: 'DELIVERY' as const, address: '', countryCode: '', phoneNo: '', faxNo: '', contactPerson: '', email: '', website: '' },
    ].map(withAudit)
  );

  bankRepo.replaceAll(
    [
      { code: 'BNK-01', name: 'Habib Bank Limited', accountDetail: 'A/C 001-234567-01, Main Branch, Karachi' },
      { code: 'BNK-02', name: 'MCB Bank Limited', accountDetail: 'A/C 009-876543-02, I.I. Chundrigar Road, Karachi' },
    ].map(withAudit)
  );

  payableTypeRepo.replaceAll(
    [
      { code: 'TRUCKING', description: 'Trucking / Local Transport', vendorCode: '', deptRows: emptyPayableTypeDeptRows() },
      { code: 'TERMINAL', description: 'Terminal Handling', vendorCode: '', deptRows: emptyPayableTypeDeptRows() },
      { code: 'CUSTOMS', description: 'Customs Agent Fees', vendorCode: '', deptRows: emptyPayableTypeDeptRows() },
      { code: 'MISC', description: 'Miscellaneous Vendor Charges', vendorCode: '', deptRows: emptyPayableTypeDeptRows() },
    ].map(withAudit)
  );

  shippingLineRepo.replaceAll(
    [
      { code: 'MSC', name: 'Mediterranean Shipping Company', address: '', email: '', website: '', phoneNo: '', faxNo: '', contactPerson: '', ntnNo: '' },
      { code: 'MAERSK', name: 'Maersk Line', address: '', email: '', website: '', phoneNo: '', faxNo: '', contactPerson: '', ntnNo: '' },
      { code: 'CMA', name: 'CMA CGM', address: '', email: '', website: '', phoneNo: '', faxNo: '', contactPerson: '', ntnNo: '' },
      { code: 'OOCL', name: 'Orient Overseas Container Line', address: '', email: '', website: '', phoneNo: '', faxNo: '', contactPerson: '', ntnNo: '' },
    ].map(withAudit)
  );

  seaPortRepo.replaceAll(
    [
      { code: 'PKKHI', name: 'Port of Karachi', country: 'Pakistan' },
      { code: 'PKQCT', name: 'Qasim International Container Terminal', country: 'Pakistan' },
      { code: 'AEJEA', name: 'Jebel Ali', country: 'UAE' },
      { code: 'CNSHA', name: 'Shanghai', country: 'China' },
      { code: 'SGSIN', name: 'Singapore', country: 'Singapore' },
    ].map(withAudit)
  );

  sectorRepo.replaceAll(
    sectorCodes.map(withAudit)
  );

  countryRepo.replaceAll(
    countryCodes.map(withAudit)
  );

  commodityRepo.replaceAll(
    [
      { code: 'TEXT', description: 'Textiles / Garments', commodityType: 'Dry Cargo' as const, hsCode: '' },
      { code: 'RICE', description: 'Rice', commodityType: 'Dry Cargo' as const, hsCode: '' },
      { code: 'LEATH', description: 'Leather Goods', commodityType: 'Dry Cargo' as const, hsCode: '' },
      { code: 'GEN', description: 'General Cargo', commodityType: 'Dry Cargo' as const, hsCode: '' },
    ].map(withAudit)
  );

  containerTypeRepo.replaceAll(
    [
      { code: '20GP', size: '20', containerType: 'General Purpose', teus: 1 },
      { code: '40GP', size: '40', containerType: 'General Purpose', teus: 2 },
      { code: '40HC', size: '40', containerType: 'High Cube', teus: 2 },
      { code: 'LCL', size: '', containerType: 'Less than Container Load', teus: 0 },
    ].map(withAudit)
  );

  subAgentPartyRepo.replaceAll(
    [
      { code: 'SUB-01', name: 'Al Madina Cargo Services', address: 'Lahore', phoneNo: '', faxNo: '', contactPerson: '', exportRegNo: '', saleTaxNo: '', ntnNo: '', zipCode: '', cityCode: '', countryCode: '', email: '', website: '' },
      { code: 'SUB-02', name: 'Ocean Link Agencies', address: 'Karachi', phoneNo: '', faxNo: '', contactPerson: '', exportRegNo: '', saleTaxNo: '', ntnNo: '', zipCode: '', cityCode: '', countryCode: '', email: '', website: '' },
    ].map(withAudit)
  );

  associateRepo.replaceAll(
    [
      { code: 'ASC-01', name: 'Continental Freight Associates', address: '', countryCode: '', phoneNo: '', faxNo: '', contactPerson: '', email: '', website: '' },
      { code: 'ASC-02', name: 'Silk Route Logistics', address: '', countryCode: '', phoneNo: '', faxNo: '', contactPerson: '', email: '', website: '' },
    ].map(withAudit)
  );

  chargeableRepo.replaceAll(
    seaExportChargeableCodes.map(withAudit)
  );

  invoiceChargeRepo.replaceAll(
    [
      { code: 'FRT', description: 'Freight Charges', awbAbbreviation: 'FRT', financeCode: '' },
      { code: 'THC', description: 'Terminal Handling Charges', awbAbbreviation: 'THC', financeCode: '' },
      { code: 'DOC', description: 'Documentation Fee', awbAbbreviation: 'DOC', financeCode: '' },
      { code: 'CUS', description: 'Customs Clearance', awbAbbreviation: 'CUS', financeCode: '' },
    ].map(withAudit)
  );

  signatoryRepo.replaceAll(
    [
      { code: 'SIG-01', name: 'Ahmed Raza', designation: 'Branch Manager', fatherName: '', cnicNo: '', email: '', signatureImageName: '' },
      { code: 'SIG-02', name: 'Bilal Khan', designation: 'Operations Head', fatherName: '', cnicNo: '', email: '', signatureImageName: '' },
    ].map(withAudit)
  );

  jobTypeRepo.replaceAll(
    jobTypes.map(withAudit)
  );

  jobStatusRepo.replaceAll(
    [
      { code: 'OPEN', description: 'Open' },
      { code: 'IN_TRANSIT', description: 'In Transit' },
      { code: 'CLOSED', description: 'Closed' },
    ].map(withAudit)
  );

  termsRepo.replaceAll(
    [
      { code: 'STD', description: 'Standard freight forwarding terms and conditions apply.' },
      { code: 'COD', description: 'Cash on delivery — payment due before release of cargo.' },
    ].map(withAudit)
  );

  markSeeded('masterData');
}

seedIfEmpty();

// Replace the earlier placeholder airline list once for existing browser data.
if (!isSeeded('legacyAirlineCodesV1')) {
  airlineRepo.replaceAll(legacyAirlineCodes.map(toLegacyAirline));
  markSeeded('legacyAirlineCodesV1');
}

// Adds the legacy grid fields to browser data created before those columns existed.
if (!isSeeded('legacyAirlineCodesV2')) {
  airlineRepo.replaceAll(legacyAirlineCodes.map(toLegacyAirline));
  markSeeded('legacyAirlineCodesV2');
}

// Update the original placeholder job types without overwriting user-maintained lists.
if (!isSeeded('jobTypesV2')) {
  const currentJobTypes = jobTypeRepo.list();
  const placeholderCodes = ['DIRECT', 'CONSOL', 'TRANSSHIP'];
  const isOriginalPlaceholderList = currentJobTypes.length === placeholderCodes.length
    && currentJobTypes.every((jobType) => placeholderCodes.includes(jobType.code));

  if (isOriginalPlaceholderList) jobTypeRepo.replaceAll(jobTypes.map(withAudit));
  markSeeded('jobTypesV2');
}

// Add the Income fields to saved Job Types while retaining all existing entries.
if (!isSeeded('jobTypesV3')) {
  jobTypeRepo.replaceAll(jobTypeRepo.list().map((jobType) => ({
    ...jobType,
    incomeCode: jobType.incomeCode ?? '',
    incomeDescription: jobType.incomeDescription ?? '',
  })));
  markSeeded('jobTypesV3');
}

// Replace only the original placeholder sectors; user-maintained lists are retained.
if (!isSeeded('sectorCodesV2')) {
  const currentSectors = sectorRepo.list();
  const placeholderCodes = ['ME', 'FE', 'EU', 'NA'];
  const isOriginalPlaceholderList = currentSectors.length === placeholderCodes.length
    && currentSectors.every((sector) => placeholderCodes.includes(sector.code));

  if (isOriginalPlaceholderList) sectorRepo.replaceAll(sectorCodes.map(withAudit));
  markSeeded('sectorCodesV2');
}

// Upgrade the initial seven-record Country Code sample to the complete ISO list.
if (!isSeeded('countryCodesV2')) {
  const currentCountries = countryRepo.list();
  const sampleCodes = ['PK', 'AE', 'QA', 'TR', 'HK', 'CN', 'SG'];
  const isOriginalSample = currentCountries.length === sampleCodes.length
    && currentCountries.every((country) => sampleCodes.includes(country.code));

  if (isOriginalSample) countryRepo.replaceAll(countryCodes.map(withAudit));
  markSeeded('countryCodesV2');
}

// Add the Commodity Type / H.S Code fields to saved Commodity Codes while retaining all existing entries.
if (!isSeeded('commodityCodesV2')) {
  commodityRepo.replaceAll(commodityRepo.list().map((commodity) => ({
    ...commodity,
    commodityType: commodity.commodityType ?? '',
    hsCode: commodity.hsCode ?? '',
  })));
  markSeeded('commodityCodesV2');
}

// Merge missing ISO country records into every existing browser list without removing custom records.
if (!isSeeded('countryCodesV3')) {
  const currentCountries = countryRepo.list();
  const existingCodes = new Set(currentCountries.map((country) => country.code));
  const missingCountries = countryCodes.filter((country) => !existingCodes.has(country.code));

  if (missingCountries.length) countryRepo.replaceAll([...currentCountries, ...missingCountries.map(withAudit)]);
  markSeeded('countryCodesV3');
}

// Add the Sector Code field to browser data saved before Country Codes supported sectors.
if (!isSeeded('countryCodesV4')) {
  countryRepo.replaceAll(countryRepo.list().map((country) => ({ ...country, sectorCode: country.sectorCode ?? '' })));
  markSeeded('countryCodesV4');
}

// Split the old single "description" field on Container Types into Size / Container Type / No. of TEUs.
if (!isSeeded('containerTypesV2')) {
  containerTypeRepo.replaceAll(containerTypeRepo.list().map((container) => {
    const legacy = container as unknown as { description?: string };
    return {
      ...container,
      size: container.size ?? '',
      containerType: container.containerType ?? legacy.description ?? '',
      teus: container.teus ?? 0,
    };
  }));
  markSeeded('containerTypesV2');
}

// Add the contact/address fields to saved Shipping Line Codes while retaining all existing entries.
if (!isSeeded('shippingLineCodesV2')) {
  shippingLineRepo.replaceAll(shippingLineRepo.list().map((line) => ({
    ...line,
    address: line.address ?? '',
    email: line.email ?? '',
    website: line.website ?? '',
    phoneNo: line.phoneNo ?? '',
    faxNo: line.faxNo ?? '',
    contactPerson: line.contactPerson ?? '',
    ntnNo: line.ntnNo ?? '',
  })));
  markSeeded('shippingLineCodesV2');
}

// Add the contact/registration/location fields to saved Sub-Agent Parties while retaining all existing entries.
if (!isSeeded('subAgentPartiesV2')) {
  subAgentPartyRepo.replaceAll(subAgentPartyRepo.list().map((party) => ({
    ...party,
    phoneNo: party.phoneNo ?? '',
    faxNo: party.faxNo ?? '',
    contactPerson: party.contactPerson ?? '',
    exportRegNo: party.exportRegNo ?? '',
    saleTaxNo: party.saleTaxNo ?? '',
    ntnNo: party.ntnNo ?? '',
    zipCode: party.zipCode ?? '',
    cityCode: party.cityCode ?? '',
    countryCode: party.countryCode ?? '',
    email: party.email ?? '',
    website: party.website ?? '',
  })));
  markSeeded('subAgentPartiesV2');
}

// Add the station/contact/commission/logo fields to saved Owner Codes while retaining all existing entries.
if (!isSeeded('ownerCodesV2')) {
  ownerRepo.replaceAll(ownerRepo.list().map((owner) => ({
    ...owner,
    station: owner.station ?? '',
    phoneFaxNo: owner.phoneFaxNo ?? '',
    email: owner.email ?? '',
    website: owner.website ?? '',
    iataCode: owner.iataCode ?? '',
    accountNo: owner.accountNo ?? '',
    commissionPercent: owner.commissionPercent ?? 0,
    whtPercent: owner.whtPercent ?? 0,
    logoName: owner.logoName ?? '',
  })));
  markSeeded('ownerCodesV2');
}

// Add the address/country/contact fields to saved Associate Codes while retaining all existing entries.
if (!isSeeded('associateCodesV2')) {
  associateRepo.replaceAll(associateRepo.list().map((associate) => ({
    ...associate,
    address: associate.address ?? '',
    countryCode: associate.countryCode ?? '',
    phoneNo: associate.phoneNo ?? '',
    faxNo: associate.faxNo ?? '',
    contactPerson: associate.contactPerson ?? '',
    email: associate.email ?? '',
    website: associate.website ?? '',
  })));
  markSeeded('associateCodesV2');
}

// Add the Name / PP-CC fields to saved Chargeable Codes while retaining all existing entries.
if (!isSeeded('chargeableCodesV2')) {
  chargeableRepo.replaceAll(chargeableRepo.list().map((chargeable) => ({
    ...chargeable,
    name: chargeable.name ?? chargeable.description ?? '',
    ppCc: chargeable.ppCc ?? (chargeable.code === 'CC' ? 'CC' : 'PP'),
  })));
  markSeeded('chargeableCodesV2');
}

// Add the AWB abbreviation / Finance Code fields to saved Invoice Charge Codes while retaining all existing entries.
if (!isSeeded('invoiceChargeCodesV2')) {
  invoiceChargeRepo.replaceAll(invoiceChargeRepo.list().map((chargeCode) => ({
    ...chargeCode,
    awbAbbreviation: chargeCode.awbAbbreviation ?? '',
    financeCode: chargeCode.financeCode ?? '',
  })));
  markSeeded('invoiceChargeCodesV2');
}

// Add the Father Name / CNIC / Email / signature image fields to saved Signatory Codes while retaining all existing entries.
if (!isSeeded('signatoryCodesV2')) {
  signatoryRepo.replaceAll(signatoryRepo.list().map((signatory) => ({
    ...signatory,
    fatherName: signatory.fatherName ?? '',
    cnicNo: signatory.cnicNo ?? '',
    email: signatory.email ?? '',
    signatureImageName: signatory.signatureImageName ?? '',
  })));
  markSeeded('signatoryCodesV2');
}

// Add the address/country/contact fields to saved Clearing/Delivery Agent Codes while retaining all existing entries.
if (!isSeeded('agentCodesV2')) {
  agentRepo.replaceAll(agentRepo.list().map((agent) => ({
    ...agent,
    address: agent.address ?? '',
    countryCode: agent.countryCode ?? '',
    phoneNo: agent.phoneNo ?? '',
    faxNo: agent.faxNo ?? '',
    contactPerson: agent.contactPerson ?? '',
    email: agent.email ?? '',
    website: agent.website ?? '',
  })));
  markSeeded('agentCodesV2');
}

// Add the Vendor Code / department expense-income matrix fields to saved Payable Type Codes while retaining all existing entries.
if (!isSeeded('payableTypeCodesV2')) {
  payableTypeRepo.replaceAll(payableTypeRepo.list().map((payableType) => ({
    ...payableType,
    vendorCode: payableType.vendorCode ?? '',
    deptRows: payableType.deptRows?.length ? payableType.deptRows : emptyPayableTypeDeptRows(),
  })));
  markSeeded('payableTypeCodesV2');
}

// Replace the old free-text "country" field on Airport/Destination Codes with a linked Country Code, and add Sector Code.
if (!isSeeded('airportCodesV2')) {
  const legacyCountryNameToCode: Record<string, string> = {
    Pakistan: 'PK', UAE: 'AE', Qatar: 'QA', Turkey: 'TR', 'Hong Kong': 'HK',
  };
  airportRepo.replaceAll(airportRepo.list().map((airport) => {
    const legacy = airport as unknown as { country?: string };
    return {
      ...airport,
      countryCode: airport.countryCode ?? (legacy.country ? legacyCountryNameToCode[legacy.country] ?? '' : ''),
      sectorCode: airport.sectorCode ?? '',
    };
  }));
  markSeeded('airportCodesV2');
}
