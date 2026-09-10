import { ForeignAgentInvoiceVariant } from '../../domain/foreignAgentInvoice';

export interface VariantConfig {
  title: string;
  breadcrumbLabel: string;
  /** Entry-tab document-number field label — differs per docs 7.1/9.1. */
  entryDocLabel: string;
  /**
   * Printing-tab document-number field label. Docs 7.1/9.1 note the reference system keeps
   * "Invoice No." here even on Credit Note variants — an observed quirk, faithfully replicated
   * rather than "fixed", since the docs explicitly flag it as worth confirming before build.
   */
  printingDocLabel: string;
  /** Detail/Search result-grid first column-group header — same reused-label quirk as above. */
  searchGridGroupLabel: string;
  numberingPrefix: string;
  bulkFinalizeLabel: string;
}

export const VARIANT_CONFIG: Record<ForeignAgentInvoiceVariant, VariantConfig> = {
  INVOICE_TO: {
    title: 'Invoices To Foreign Agents (Air-Export)',
    breadcrumbLabel: 'Invoices To Foreign Agents',
    entryDocLabel: 'Invoice No.',
    printingDocLabel: 'Invoice No.',
    searchGridGroupLabel: 'INVOICE',
    numberingPrefix: 'FAI',
    bulkFinalizeLabel: 'Final Multiple Invoices',
  },
  CREDIT_NOTE_TO: {
    title: 'Credit Notes To Foreign Agents (Air-Export)',
    breadcrumbLabel: 'Credit Notes To Foreign Agents',
    entryDocLabel: 'Credit Note No.',
    printingDocLabel: 'Invoice No.',
    searchGridGroupLabel: 'INVOICE',
    numberingPrefix: 'FCN',
    bulkFinalizeLabel: 'Final Multiple Invoices',
  },
  INVOICE_RECEIVED: {
    title: 'Invoice/DN Received From F/Agent (Air-Export)',
    breadcrumbLabel: 'Invoices/Dr. Notes Received From Foreign Agents',
    entryDocLabel: 'Invoice No.',
    printingDocLabel: 'Invoice No.',
    searchGridGroupLabel: 'INVOICE',
    numberingPrefix: 'FAR',
    bulkFinalizeLabel: 'Final Multiple Invoices',
  },
  CREDIT_NOTE_RECEIVED: {
    title: 'Credit Notes Received From F/Agent (Air-Export)',
    breadcrumbLabel: 'Credit Notes Received From Foreign Agents',
    entryDocLabel: 'Credit Note No.',
    printingDocLabel: 'Invoice No.',
    searchGridGroupLabel: 'INVOICE',
    numberingPrefix: 'FCR',
    bulkFinalizeLabel: 'Final Multiple Invoices',
  },
};
