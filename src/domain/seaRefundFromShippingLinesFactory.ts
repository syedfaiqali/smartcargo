import { v4 as uuid } from 'uuid';
import { SeaRefundFromShippingLines } from './seaRefundFromShippingLines';

const nowIso = () => new Date().toISOString();

export function createEmptySeaRefund(branch = 'KHI'): SeaRefundFromShippingLines {
  return {
    id: uuid(),
    createdAt: nowIso(),
    updatedAt: nowIso(),
    branch,
    documentNo: '',
    year: new Date().getFullYear(),
    date: new Date().toISOString().slice(0, 10),
    consolNo: '',
    jobYear: new Date().getFullYear(),
    jobNo: '',
    sLineAgent: '',
    postInLocalCurrency: 'N',
    currency: 'USD',
    exRate: 0,
    billNo: '',
    billDate: '',
    cbm: 0,
    remarks: '',
    allocationLines: [],
    chargeLines: [
      {
        id: uuid(),
        code: 'OCEAN_FREIGHT',
        description: 'Ocean Freight',
        ratePerCbm: 0,
        curr: 'USD',
        fAmount: 0,
        pkrAmount: 0,
      },
    ],
    totalAmount: 0,
    jobHistory: [],
    status: { final: false },
  };
}
