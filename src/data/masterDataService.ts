import { v4 as uuid } from 'uuid';
import {
  AgentCode,
  AirlineCode,
  AirportCode,
  BankCode,
  CurrencyCode,
  ForeignAgentCode,
  OwnerCode,
  PartyCode,
  PayableTypeCode,
  SeaPortCode,
  ShippingLineCode,
  SpoCode,
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

  markSeeded('masterData');
}

seedIfEmpty();
