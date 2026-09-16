import { SeaForeignAgentInvoiceVariant } from '../../domain/seaForeignAgentInvoice';

export interface SeaVariantConfig {
  title: string;
  breadcrumbLabel: string;
  entryDocLabel: string;
  printingDocLabel: string;
  searchGridGroupLabel: string;
  numberingPrefix: string;
  bulkFinalizeLabel: string;
}

export const SEA_VARIANT_CONFIG: Record<SeaForeignAgentInvoiceVariant, SeaVariantConfig> = {
  INVOICE_TO: {
    title: 'Invoice To Foreign Agent (Sea-Export)',
    breadcrumbLabel: 'Invoices To Foreign Agents (Sea-Export)',
    entryDocLabel: 'Invoice No.',
    printingDocLabel: 'Invoice No.',
    searchGridGroupLabel: 'INVOICE',
    numberingPrefix: 'SFI',
    bulkFinalizeLabel: 'Final Multiple Invoices',
  },
  CREDIT_NOTE_TO: {
    title: 'Credit Notes To Foreign Agent (Sea-Export)',
    breadcrumbLabel: 'Credit Notes To Foreign Agents (Sea-Export)',
    entryDocLabel: 'Credit Note No.',
    printingDocLabel: 'Invoice No.',
    searchGridGroupLabel: 'INVOICE',
    numberingPrefix: 'SCN',
    bulkFinalizeLabel: 'Final Multiple Invoices',
  },
  INVOICE_RECEIVED: {
    title: 'Invoice/DN Received From F/Agent (Sea-Export)',
    breadcrumbLabel: 'Invoices/Dr. Notes Received From Foreign Agents (Sea-Export)',
    entryDocLabel: 'Invoice No.',
    printingDocLabel: 'Invoice No.',
    searchGridGroupLabel: 'INVOICE',
    numberingPrefix: 'SFR',
    bulkFinalizeLabel: 'Final Multiple Invoices',
  },
  CREDIT_NOTE_RECEIVED: {
    title: 'Credit Notes Received From F/Agent (Sea-Export)',
    breadcrumbLabel: 'Credit Notes Received From Foreign Agents (Sea-Export)',
    entryDocLabel: 'Credit Note No.',
    printingDocLabel: 'Invoice No.',
    searchGridGroupLabel: 'INVOICE',
    numberingPrefix: 'SCR',
    bulkFinalizeLabel: 'Final Multiple Invoices',
  },
};
