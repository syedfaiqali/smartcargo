import { v4 as uuid } from 'uuid';
import { emptyStatus } from './common';
import { AirImportForeignAgentInvoice, AirImportForeignAgentInvoiceVariant } from './airImportForeignAgentInvoice';

const nowIso = () => new Date().toISOString();

export function createEmptyAirImportForeignAgentInvoice(variant: AirImportForeignAgentInvoiceVariant, branch = 'KHI'): AirImportForeignAgentInvoice {
  return {
    id: uuid(),
    createdAt: nowIso(),
    updatedAt: nowIso(),
    variant,
    branch,
    documentNo: '',
    documentDate: new Date().toISOString().slice(0, 10),
    fAgentDocNo: '',
    fAgentDocDate: '',
    jobNo: '',
    jobYear: new Date().getFullYear(),
    recordNo: '',
    mawbNo: '',
    mawbDate: '',
    fAgentCode: '',
    fAgentName: '',
    commodity: '',
    origin: '',
    destination: '',
    postInPkr: 'N',
    currencyCode: '',
    exchangeRate: 0,
    pieces: 0,
    unit: '',
    grossWeight: 0,
    chargeableWeight: 0,
    autoCalculateCost: 'Y',
    costLines: [],
    chargeLines: [
      { id: uuid(), description: 'Air Freight', rate: 0, amount: 0, editableDescription: false },
    ],
    totalAmount: 0,
    bankCode: '',
    bankDetailText: '',
    receipts: [],
    remarks: '',
    status: emptyStatus(),
  };
}
