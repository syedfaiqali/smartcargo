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

function seedIfEmpty() {
  if (isSeeded('masterData')) return;

  airlineRepo.replaceAll(
    [
      { code: 'PK', name: 'Pakistan International Airlines' },
      { code: 'EK', name: 'Emirates' },
      { code: 'QR', name: 'Qatar Airways' },
      { code: 'TK', name: 'Turkish Airlines' },
      { code: 'CX', name: 'Cathay Pacific' },
    ].map(withAudit)
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
    [
      { code: 'ME', name: 'Middle East' },
      { code: 'FE', name: 'Far East' },
      { code: 'EU', name: 'Europe' },
      { code: 'NA', name: 'North America' },
    ].map(withAudit)
  );

  countryRepo.replaceAll(
    [
      { code: 'PK', name: 'Pakistan' },
      { code: 'AE', name: 'United Arab Emirates' },
      { code: 'QA', name: 'Qatar' },
      { code: 'TR', name: 'Turkey' },
      { code: 'HK', name: 'Hong Kong' },
      { code: 'CN', name: 'China' },
      { code: 'SG', name: 'Singapore' },
    ].map(withAudit)
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
    [
      { code: 'DIRECT', description: 'Direct Shipment' },
      { code: 'CONSOL', description: 'Consolidated Shipment' },
      { code: 'TRANSSHIP', description: 'Transshipment' },
    ].map(withAudit)
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
