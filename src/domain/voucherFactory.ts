import { v4 as uuid } from 'uuid';
import { Voucher, VoucherKind } from './voucher';

const nowIso = () => new Date().toISOString();

export function createEmptyVoucher(kind: VoucherKind, branch = 'KHI'): Voucher {
  return {
    id: uuid(),
    createdAt: nowIso(),
    updatedAt: nowIso(),
    kind,
    branch,
    voucherNo: '',
    voucherDate: new Date().toISOString().slice(0, 10),
    partyCode: '',
    partyName: '',
    bankCode: '',
    amount: 0,
    currencyCode: 'PKR',
    exchangeRate: 1,
    clearingLines: [],
    accountLines: [],
    entryDate: new Date().toISOString().slice(0, 10),
    chequeNo: '',
    chequeDate: '',
    chequeStatus: 'UNCLEARED',
    clearingDate: '',
    chequeType: 'OPEN',
    accountCode: '',
    journalLines: [],
    remarks: '',
    final: false,
  };
}
