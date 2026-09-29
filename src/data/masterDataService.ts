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
  if (isSeeded('masterData')) return;

  airlineRepo.replaceAll(
    legacyAirlineCodes.map(toLegacyAirline)
  );

  ownerRepo.replaceAll(
    [
      { code: 'KHI-OWN', name: 'Karachi Branch Owner' },
      { code: 'LHE-OWN', name: 'Lahore Branch Owner' },
    ].map(withAudit)
  );

  partyRepo.replaceAll(
    [
      { code: 'P-1001', name: 'Al Baraka Textiles Ltd', address: 'Site Area, Karachi', creditLimit: 500000 },
      { code: 'P-1002', name: 'Indus Garments (Pvt) Ltd', address: 'SITE-II, Karachi', creditLimit: 250000 },
      { code: 'P-1003', name: 'Sindh Rice Exporters', address: 'Korangi, Karachi', creditLimit: 750000 },
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
      { code: 'KHI', name: 'Jinnah International Airport', country: 'Pakistan' },
      { code: 'DXB', name: 'Dubai International Airport', country: 'UAE' },
      { code: 'DOH', name: 'Hamad International Airport', country: 'Qatar' },
      { code: 'IST', name: 'Istanbul Airport', country: 'Turkey' },
      { code: 'HKG', name: 'Hong Kong International Airport', country: 'Hong Kong' },
    ].map(withAudit)
  );

  spoRepo.replaceAll(
    [
      { code: 'SPO-01', description: 'Sales Person A' },
      { code: 'SPO-02', description: 'Sales Person B' },
    ].map(withAudit)
  );

  currencyRepo.replaceAll(
    [
      { code: 'USD', name: 'US Dollar', defaultExchangeRate: 278.5 },
      { code: 'PKR', name: 'Pakistani Rupee', defaultExchangeRate: 1 },
      { code: 'EUR', name: 'Euro', defaultExchangeRate: 302.1 },
      { code: 'AED', name: 'UAE Dirham', defaultExchangeRate: 75.8 },
    ].map(withAudit)
  );

  agentRepo.replaceAll(
    [
      { code: 'CA-01', name: 'Speedway Clearing Agency', kind: 'CLEARING' as const },
      { code: 'DA-01', name: 'CityLink Delivery Services', kind: 'DELIVERY' as const },
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
      { code: 'TRUCKING', description: 'Trucking / Local Transport' },
      { code: 'TERMINAL', description: 'Terminal Handling' },
      { code: 'CUSTOMS', description: 'Customs Agent Fees' },
      { code: 'MISC', description: 'Miscellaneous Vendor Charges' },
    ].map(withAudit)
  );

  shippingLineRepo.replaceAll(
    [
      { code: 'MSC', name: 'Mediterranean Shipping Company' },
      { code: 'MAERSK', name: 'Maersk Line' },
      { code: 'CMA', name: 'CMA CGM' },
      { code: 'OOCL', name: 'Orient Overseas Container Line' },
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
      { code: 'TEXT', description: 'Textiles / Garments' },
      { code: 'RICE', description: 'Rice' },
      { code: 'LEATH', description: 'Leather Goods' },
      { code: 'GEN', description: 'General Cargo' },
    ].map(withAudit)
  );

  containerTypeRepo.replaceAll(
    [
      { code: '20GP', description: "20' General Purpose" },
      { code: '40GP', description: "40' General Purpose" },
      { code: '40HC', description: "40' High Cube" },
      { code: 'LCL', description: 'Less than Container Load' },
    ].map(withAudit)
  );

  subAgentPartyRepo.replaceAll(
    [
      { code: 'SUB-01', name: 'Al Madina Cargo Services', address: 'Lahore' },
      { code: 'SUB-02', name: 'Ocean Link Agencies', address: 'Karachi' },
    ].map(withAudit)
  );

  associateRepo.replaceAll(
    [
      { code: 'ASC-01', name: 'Continental Freight Associates' },
      { code: 'ASC-02', name: 'Silk Route Logistics' },
    ].map(withAudit)
  );

  chargeableRepo.replaceAll(
    [
      { code: 'PP', description: 'Prepaid' },
      { code: 'CC', description: 'Collect' },
    ].map(withAudit)
  );

  invoiceChargeRepo.replaceAll(
    [
      { code: 'FRT', description: 'Freight Charges' },
      { code: 'THC', description: 'Terminal Handling Charges' },
      { code: 'DOC', description: 'Documentation Fee' },
      { code: 'CUS', description: 'Customs Clearance' },
    ].map(withAudit)
  );

  signatoryRepo.replaceAll(
    [
      { code: 'SIG-01', name: 'Ahmed Raza', designation: 'Branch Manager' },
      { code: 'SIG-02', name: 'Bilal Khan', designation: 'Operations Head' },
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
