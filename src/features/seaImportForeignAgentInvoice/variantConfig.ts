import { SeaImportForeignAgentInvoiceVariant } from '../../domain/seaImportForeignAgentInvoice';

export interface SeaImportVariantConfig {
  title: string;
  breadcrumbLabel: string;
  entryDocLabel: string;
  printingDocLabel: string;
  searchGridGroupLabel: string;
  numberingPrefix: string;
  bulkFinalizeLabel: string;
}

export const SEA_IMPORT_VARIANT_CONFIG: Record<SeaImportForeignAgentInvoiceVariant, SeaImportVariantConfig> = {
  INVOICE_TO: {
    title: 'Invoice To Foreign Agent (Sea-Import)',
    breadcrumbLabel: 'Invoices To Foreign Agents (Sea-Import)',
    entryDocLabel: 'Document No.',
    printingDocLabel: 'Document No.',
    searchGridGroupLabel: 'DOCUMENT',
    numberingPrefix: 'SII',
    bulkFinalizeLabel: 'Final Multiple Invoices',
  },
  CREDIT_NOTE_TO: {
    title: 'Credit Notes To Foreign Agent (Sea-Import)',
    breadcrumbLabel: 'Credit Notes To Foreign Agents (Sea-Import)',
    entryDocLabel: 'Credit Note No.',
    printingDocLabel: 'Document No.',
    searchGridGroupLabel: 'DOCUMENT',
    numberingPrefix: 'SICN',
    bulkFinalizeLabel: 'Final Multiple Invoices',
  },
  INVOICE_RECEIVED: {
    title: 'Inv./DN Rcvd From F/Agent (Sea-Import)',
    breadcrumbLabel: 'Invoices/Dr. Notes Received From Foreign Agents (Sea-Import)',
    entryDocLabel: 'Document No.',
    printingDocLabel: 'Document No.',
    searchGridGroupLabel: 'DOCUMENT',
    numberingPrefix: 'SIR',
    bulkFinalizeLabel: 'Final Multiple Invoices',
  },
  CREDIT_NOTE_RECEIVED: {
    title: 'CN Received From F/Agent (Sea-Import)',
    breadcrumbLabel: 'Credit Notes Received From Foreign Agents (Sea-Import)',
    entryDocLabel: 'Credit Note No.',
    printingDocLabel: 'Document No.',
    searchGridGroupLabel: 'DOCUMENT',
    numberingPrefix: 'SICR',
    bulkFinalizeLabel: 'Final Multiple Invoices',
  },
};
