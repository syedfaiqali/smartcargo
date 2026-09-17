import { v4 as uuid } from 'uuid';
import { SeaImportRefundFromShippingLines } from './seaImportRefundFromShippingLines';

const nowIso = () => new Date().toISOString();

export function createEmptySeaImportRefund(branch = 'KHI'): SeaImportRefundFromShippingLines {
  return {
    id: uuid(),
    createdAt: nowIso(),
    updatedAt: nowIso(),
    branch,
    documentNo: '',
    date: new Date().toISOString().slice(0, 10),
    jobNo: '',
    jobYear: new Date().getFullYear(),
    lclFcl: 'LCL',
    sLineAgent: '',
    postInPkrCurrency: 'Y',
    currency: '',
    exRate: 0,
    billNo: '',
    billDate: '',
    cbm: 0,
    partyCode: '',
    partyName: '',
    agentParty: '',
    mblNo: '',
    hblNo: '',
    vessel: '',
    origin: '',
    destination: '',
    remarks: '',
    docNo: '',
    chargeLines: [
      { id: uuid(), description: 'Ocean Freight', ratePerCbm: 0, amount1: 0, amount2: 0 },
    ],
    totalAmount: 0,
    status: { final: false },
  };
}
