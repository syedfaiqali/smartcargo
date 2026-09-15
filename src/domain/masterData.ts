import { AuditFields } from './common';

export interface AirlineCode extends AuditFields {
  code: string;
  name: string;
}

export interface OwnerCode extends AuditFields {
  code: string;
  name: string;
}

export interface PartyCode extends AuditFields {
  code: string;
  name: string;
  address: string;
  creditLimit: number;
}

export interface ForeignAgentCode extends AuditFields {
  code: string;
  name: string;
  address: string;
}

export interface AirportCode extends AuditFields {
  code: string;
  name: string;
  country: string;
}

export interface SpoCode extends AuditFields {
  code: string;
  description: string;
}

export interface CurrencyCode extends AuditFields {
  code: string;
  name: string;
  defaultExchangeRate: number;
}

export interface AgentCode extends AuditFields {
  code: string;
  name: string;
  kind: 'CLEARING' | 'DELIVERY';
}

export interface BankCode extends AuditFields {
  code: string;
  name: string;
  accountDetail: string;
}

export interface PayableTypeCode extends AuditFields {
  code: string;
  description: string;
}

export interface ShippingLineCode extends AuditFields {
  code: string;
  name: string;
}

export interface SeaPortCode extends AuditFields {
  code: string;
  name: string;
  country: string;
}

export interface SectorCode extends AuditFields {
  code: string;
  name: string;
}

export interface CountryCode extends AuditFields {
  code: string;
  name: string;
}

export interface CommodityCode extends AuditFields {
  code: string;
  description: string;
}

export interface ContainerType extends AuditFields {
  code: string;
  description: string;
}

export interface SubAgentParty extends AuditFields {
  code: string;
  name: string;
  address: string;
}

export interface AssociateCode extends AuditFields {
  code: string;
  name: string;
}

export interface ChargeableCode extends AuditFields {
  code: string;
  description: string;
}

export interface InvoiceChargeCode extends AuditFields {
  code: string;
  description: string;
}

export interface SignatoryCode extends AuditFields {
  code: string;
  name: string;
  designation: string;
}

export interface JobType extends AuditFields {
  code: string;
  description: string;
}

export interface JobStatusCode extends AuditFields {
  code: string;
  description: string;
}

export interface TermsAndConditions extends AuditFields {
  code: string;
  description: string;
}
