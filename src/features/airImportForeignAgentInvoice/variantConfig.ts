import { AirImportForeignAgentInvoiceVariant } from '../../domain/airImportForeignAgentInvoice';

export interface AirImportVariantConfig {
  title: string;
  breadcrumbLabel: string;
  entryDocLabel: string;
  printingDocLabel: string;
  searchGridGroupLabel: string;
  numberingPrefix: string;
  bulkFinalizeLabel: string;
}

export const AIR_IMPORT_VARIANT_CONFIG: Record<AirImportForeignAgentInvoiceVariant, AirImportVariantConfig> = {
  INVOICE_TO: {
    title: 'Invoice To Foreign Agent (Air-Import)',
    breadcrumbLabel: 'Invoices To Foreign Agents (Air-Import)',
    entryDocLabel: 'Document No.',
    printingDocLabel: 'Document No.',
    searchGridGroupLabel: 'DOCUMENT',
    numberingPrefix: 'AII',
    bulkFinalizeLabel: 'Final Multiple Invoices',
  },
  CREDIT_NOTE_TO: {
    title: 'Credit Notes To Foreign Agent (Air-Import)',
    breadcrumbLabel: 'Credit Notes To Foreign Agents (Air-Import)',
    entryDocLabel: 'Credit Note No.',
    printingDocLabel: 'Document No.',
    searchGridGroupLabel: 'DOCUMENT',
    numberingPrefix: 'AICN',
    bulkFinalizeLabel: 'Final Multiple Invoices',
  },
  INVOICE_RECEIVED: {
    title: 'Inv./DN Rcvd From F/Agent (Air-Import)',
    breadcrumbLabel: 'Invoices/Dr. Notes Received From Foreign Agents (Air-Import)',
    entryDocLabel: 'Document No.',
    printingDocLabel: 'Document No.',
    searchGridGroupLabel: 'DOCUMENT',
    numberingPrefix: 'AIR',
    bulkFinalizeLabel: 'Final Multiple Invoices',
  },
  CREDIT_NOTE_RECEIVED: {
    title: 'CN Received From F/Agent (Air-Import)',
    breadcrumbLabel: 'Credit Notes Received From Foreign Agents (Air-Import)',
    entryDocLabel: 'Credit Note No.',
    printingDocLabel: 'Document No.',
    searchGridGroupLabel: 'DOCUMENT',
    numberingPrefix: 'AICR',
    bulkFinalizeLabel: 'Final Multiple Invoices',
  },
};
