import { v4 as uuid } from 'uuid';
import { emptyStatus } from './common';
import { SeaImportForeignAgentInvoice, SeaImportForeignAgentInvoiceVariant } from './seaImportForeignAgentInvoice';

const nowIso = () => new Date().toISOString();

export function createEmptySeaImportForeignAgentInvoice(variant: SeaImportForeignAgentInvoiceVariant, branch = 'KHI'): SeaImportForeignAgentInvoice {
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
    blNo: '',
    fAgentCode: '',
    fAgentName: '',
    commodity: '',
    origin: '',
    destination: '',
    currencyCode: '',
    exchangeRate: 0,
    autoCalculateCost: 'Y',
    costLines: [],
    chargeLines: [
      { id: uuid(), description: 'Sea Freight', amount1: 0, amount2: 0, editableDescription: false },
    ],
    totalAmount: 0,
    bankCode: '',
    bankDetailText: '',
    receipts: [],
    remarks: '',
    status: emptyStatus(),
  };
}
