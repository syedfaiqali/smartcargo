import { v4 as uuid } from 'uuid';
import { SeaImportOtherChargesPayable } from './seaImportOtherChargesPayable';

const nowIso = () => new Date().toISOString();

export function createEmptySeaImportOtherChargesPayable(branch = 'KHI'): SeaImportOtherChargesPayable {
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
    takeEffectInGp: 'Y',
    consoleJobNo: '',
    jobYear: new Date().getFullYear(),
    cbm: 0,
    cbmRate: 0,
    billNo: '',
    billDate: '',
    currencies: [
      { currencyCode: '', exRate: 0 },
      { currencyCode: '', exRate: 0 },
      { currencyCode: '', exRate: 0 },
    ],
    containers: [],
    remarks: '',
    costLines: [],
    chargeLines: [
      { id: uuid(), code: 'FREIGHT', description: 'Freight', curr: '', fAmount: 0, pkrAmount: 0 },
    ],
    grandTotal: 0,
    totalCharges: 0,
    jobHistory: [],
    usedClearedVouchers: [],
    attachmentNote: '',
    status: { final: false },
  };
}
