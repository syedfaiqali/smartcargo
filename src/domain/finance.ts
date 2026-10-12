import { AuditFields } from './common';

export type AccountGroupType = 'ASSET' | 'LIABILITY' | 'INCOME' | 'EXPENSE' | 'EQUITY';

export interface GroupCode extends AuditFields {
  code: string;
  name: string;
  type: AccountGroupType;
}

export interface ControlCode extends AuditFields {
  code: string;
  name: string;
  groupCode: string;
}

/** Ledger account maintained beneath a control account in the chart. */
export interface ChartAccount extends AuditFields {
  code: string;
  name: string;
  controlCode: string;
}

export interface AnalysisCode extends AuditFields {
  code: string;
  name: string;
}
