import { v4 as uuid } from 'uuid';
import { AirImportOtherChargesPayable } from './airImportOtherChargesPayable';

const nowIso = () => new Date().toISOString();

export function createEmptyAirImportOtherChargesPayable(branch = 'KHI'): AirImportOtherChargesPayable {
  return {
    id: uuid(),
    createdAt: nowIso(),
    updatedAt: nowIso(),
    branch,
    creditNoteNo: '',
    year: new Date().getFullYear(),
    date: new Date().toISOString().slice(0, 10),
    payableType: '',
    dueDate: '',
    partyCode: '',
    partyName: '',
    partyAddress: '',
    mJobNo: '',
    jobYear: new Date().getFullYear(),
    mawbNo: '',
    grossWeight: 0,
    chargeWeight: 0,
    postInLocalCurrency: 'Y',
    currency1: 'USD',
    exRate1: 0,
    currency2: '',
    exRate2: 0,
    currency3: '',
    exRate3: 0,
    billNo: '',
    billDate: '',
    remarks: '',
    distributeCostEquallyOnAllJobs: 'Y',
    allocationLines: [],
    chargeLines: [
      {
        id: uuid(),
        code: 'FREIGHT',
        description: 'Freight',
        wtPcBasis: 'WT',
        curr: 'USD',
        qty: 0,
        rate: 0,
        fAmount: 0,
        pkrAmount: 0,
      },
    ],
    grandTotal: 0,
    totalCharges: 0,
    jobHistory: [],
    usedClearedVouchers: [],
    attachmentNote: '',
    status: { final: false },
  };
}
