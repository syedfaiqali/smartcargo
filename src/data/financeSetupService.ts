import { v4 as uuid } from 'uuid';
import { AnalysisCode, ControlCode, GroupCode } from '../domain/finance';
import { isSeeded, markSeeded } from './localStore';
import { Repository } from './repository';

const nowIso = () => new Date().toISOString();
const withAudit = <T extends object>(item: T) => ({
  ...item,
  id: uuid(),
  createdAt: nowIso(),
  updatedAt: nowIso(),
});

export const groupCodeRepo = new Repository<GroupCode>('groupCodes');
export const controlCodeRepo = new Repository<ControlCode>('controlCodes');
export const analysisCodeRepo = new Repository<AnalysisCode>('analysisCodes');

function seedIfEmpty() {
  if (isSeeded('financeSetup')) return;

  groupCodeRepo.replaceAll(
    [
      { code: 'ASSET', name: 'Assets', type: 'ASSET' as const },
      { code: 'LIAB', name: 'Liabilities', type: 'LIABILITY' as const },
      { code: 'INCOME', name: 'Income', type: 'INCOME' as const },
      { code: 'EXP', name: 'Expenses', type: 'EXPENSE' as const },
      { code: 'EQUITY', name: 'Equity', type: 'EQUITY' as const },
    ].map(withAudit)
  );

  controlCodeRepo.replaceAll(
    [
      { code: 'DEBTORS-CTRL', name: 'Trade Debtors Control', groupCode: 'ASSET' },
      { code: 'BANK-CTRL', name: 'Bank Control', groupCode: 'ASSET' },
      { code: 'CASH-CTRL', name: 'Cash Control', groupCode: 'ASSET' },
      { code: 'CREDITORS-CTRL', name: 'Trade Creditors Control', groupCode: 'LIAB' },
      { code: 'WHT-CTRL', name: 'Withholding Tax Payable Control', groupCode: 'LIAB' },
      { code: 'FREIGHT-INC', name: 'Freight Income Control', groupCode: 'INCOME' },
      { code: 'COMM-INC', name: 'Commission Income Control', groupCode: 'INCOME' },
      { code: 'OPEX-CTRL', name: 'Operating Expenses Control', groupCode: 'EXP' },
    ].map(withAudit)
  );

  markSeeded('financeSetup');
}

seedIfEmpty();
