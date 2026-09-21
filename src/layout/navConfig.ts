export interface NavLeaf {
  label: string;
  path: string;
}

export interface NavGroup {
  label: string;
  items: NavLeaf[];
}

export const airExportMenu: NavGroup = {
  label: 'Transactions Menu (Air Export)',
  items: [
    { label: 'Air Waybill Stock (Received From Airline)', path: '/freight/air-export/awb-stock' },
    { label: 'Job (MAWB) Entry and Printing', path: '/freight/air-export/job-mawb' },
    { label: 'Job (HAWB) Entry and Printing', path: '/freight/air-export/job-hawb' },
    { label: 'Local Invoices Entry and Printing', path: '/freight/air-export/local-invoices' },
    { label: 'Other Charges Payable', path: '/freight/air-export/other-charges-payable' },
    { label: 'Invoices To Foreign Agents', path: '/freight/air-export/invoices-to-foreign-agents' },
    { label: 'Credit Notes To Foreign Agents', path: '/freight/air-export/credit-notes-to-foreign-agents' },
    {
      label: 'Invoices/Dr. Notes Received From Foreign Agents',
      path: '/freight/air-export/invoices-received-from-foreign-agents',
    },
    {
      label: 'Credit Notes Received From Foreign Agents',
      path: '/freight/air-export/credit-notes-received-from-foreign-agents',
    },
    { label: 'Letter for Sales Report/Covering Letter', path: '/freight/air-export/covering-letter' },
    { label: 'Letter of Issuance of Stock', path: '/freight/air-export/letter-of-issuance' },
  ],
};

export const seaExportMenu: NavGroup = {
  label: 'Transactions Menu (Sea Export)',
  items: [
    { label: 'Jobs Entry and Documents Printing (Sea-Export)', path: '/freight/sea-export/jobs' },
    { label: 'Other Charges Payables (Sea-Export)', path: '/freight/sea-export/other-charges-payable' },
    {
      label: 'Refund from Shipping Lines Entry and Printing (Sea-Export)',
      path: '/freight/sea-export/refund-from-shipping-lines',
    },
    { label: 'Local Invoices Entry and Printing (Sea-Export)', path: '/freight/sea-export/local-invoices' },
    { label: 'Loading Program Entry and Printing', path: '/freight/sea-export/loading-program' },
    { label: 'Invoices To Foreign Agents (Sea-Export)', path: '/freight/sea-export/invoices-to-foreign-agents' },
    {
      label: 'Credit Notes To Foreign Agents (Sea-Export)',
      path: '/freight/sea-export/credit-notes-to-foreign-agents',
    },
    {
      label: 'Invoices/Dr. Notes Received From Foreign Agents (Sea-Export)',
      path: '/freight/sea-export/invoices-received-from-foreign-agents',
    },
    {
      label: 'Credit Notes Received From Foreign Agents (Sea-Export)',
      path: '/freight/sea-export/credit-notes-received-from-foreign-agents',
    },
  ],
};

export const airImportMenu: NavGroup = {
  label: 'Transactions Menu (Air Import)',
  items: [
    { label: 'Manifest Inbond Shipments (Air-Import)', path: '/freight/air-import/manifest-inbond-shipments' },
    {
      label: 'Inbond Shipments Entry and Documents Printing (Air-Import)',
      path: '/freight/air-import/inbond-shipments',
    },
    { label: 'Local Invoices Entry and Printing (Air-Import)', path: '/freight/air-import/local-invoices' },
    { label: 'Other Charges Payable (Air-Import)', path: '/freight/air-import/other-charges-payable' },
    { label: 'Invoices To Foreign Agents (Air-Import)', path: '/freight/air-import/invoices-to-foreign-agents' },
    {
      label: 'Credit Notes To Foreign Agents (Air-Import)',
      path: '/freight/air-import/credit-notes-to-foreign-agents',
    },
    {
      label: 'Invoices/Dr. Notes Received From Foreign Agents (Air-Import)',
      path: '/freight/air-import/invoices-received-from-foreign-agents',
    },
    {
      label: 'Credit Notes Received From Foreign Agents (Air-Import)',
      path: '/freight/air-import/credit-notes-received-from-foreign-agents',
    },
  ],
};

export const seaImportMenu: NavGroup = {
  label: 'Transactions Menu (Sea Import)',
  items: [
    { label: 'Manifest Inbond Shipments (Sea-Import)', path: '/freight/sea-import/manifest-inbond-shipments' },
    {
      label: 'Inbond Shipment Entry and Documents Printing (Sea-Import)',
      path: '/freight/sea-import/inbond-shipments',
    },
    { label: 'Other Charges Payables (Sea-Import)', path: '/freight/sea-import/other-charges-payable' },
    {
      label: 'Refund From Shipping Lines Entry and Printing (Sea-Import)',
      path: '/freight/sea-import/refund-from-shipping-lines',
    },
    { label: 'Local Invoices Entry and Printing (Sea-Import)', path: '/freight/sea-import/local-invoices' },
    { label: 'Invoices To Foreign Agents (Sea-Import)', path: '/freight/sea-import/invoices-to-foreign-agents' },
    {
      label: 'Credit Notes To Foreign Agents (Sea-Import)',
      path: '/freight/sea-import/credit-notes-to-foreign-agents',
    },
    {
      label: 'Invoices/Dr. Notes Received From Foreign Agents (Sea-Import)',
      path: '/freight/sea-import/invoices-received-from-foreign-agents',
    },
    {
      label: 'Credit Notes Received From Foreign Agents (Sea-Import)',
      path: '/freight/sea-import/credit-notes-received-from-foreign-agents',
    },
  ],
};

export const seaImportOtherMenu: NavGroup = {
  label: 'Sea Import',
  items: [
    { label: 'Quotations', path: '/freight/sea-import/quotations' },
    { label: 'Document Receipt', path: '/freight/sea-import/document-receipt' },
  ],
};

export const initialSetupMenu: NavGroup = {
  label: 'Initial Setup',
  items: [
    { label: 'SPO Codes', path: '/freight/initial-setup/spo-codes' },
    { label: 'Airline Codes', path: '/freight/initial-setup/airline-codes' },
    { label: 'Sector Codes', path: '/freight/initial-setup/sector-codes' },
    { label: 'Country Codes', path: '/freight/initial-setup/country-codes' },
    { label: 'Airport / Destination Codes', path: '/freight/initial-setup/airport-codes' },
    { label: 'Currency Codes', path: '/freight/initial-setup/currency-codes' },
    { label: 'Commodity Codes', path: '/freight/initial-setup/commodity-codes' },
    { label: 'Container Types', path: '/freight/initial-setup/container-types' },
    { label: 'Shipping Line Codes', path: '/freight/initial-setup/shipping-line-codes' },
    { label: 'Sub-Agent Parties', path: '/freight/initial-setup/sub-agent-parties' },
    { label: 'Owner Codes', path: '/freight/initial-setup/owner-codes' },
    { label: 'Associate Codes', path: '/freight/initial-setup/associate-codes' },
    { label: 'Chargeable Codes (MOP)', path: '/freight/initial-setup/chargeable-codes' },
    { label: 'Invoice Charges Codes', path: '/freight/initial-setup/invoice-charge-codes' },
    { label: 'Signatory Codes', path: '/freight/initial-setup/signatory-codes' },
    { label: 'Clearing / Delivery Agent Codes', path: '/freight/initial-setup/agent-codes' },
    { label: 'Payable Type Codes', path: '/freight/initial-setup/payable-type-codes' },
    { label: 'Job Types', path: '/freight/initial-setup/job-types' },
    { label: 'Job Status', path: '/freight/initial-setup/job-status' },
    { label: 'Terms and Conditions', path: '/freight/initial-setup/terms-and-conditions' },
    { label: 'Party Codes', path: '/freight/initial-setup/party-codes' },
    { label: 'Foreign Agent Codes', path: '/freight/initial-setup/foreign-agent-codes' },
    { label: 'Bank Codes', path: '/freight/initial-setup/bank-codes' },
    { label: 'Sea Port Codes', path: '/freight/initial-setup/sea-port-codes' },
  ],
};

export const freightMenu: NavGroup[] = [
  airExportMenu,
  seaExportMenu,
  airImportMenu,
  seaImportMenu,
  seaImportOtherMenu,
  initialSetupMenu,
];

export const financeInitialSetupMenu: NavGroup = {
  label: 'Initial Setup',
  items: [
    { label: 'Group Codes', path: '/finance/initial-setup/group-codes' },
    { label: 'Control Codes', path: '/finance/initial-setup/control-codes' },
  ],
};

export const vouchersMenu: NavGroup = {
  label: 'Vouchers',
  items: [
    { label: 'Receipt Voucher', path: '/finance/receipt-voucher' },
    { label: 'Payment Voucher', path: '/finance/payment-voucher' },
    { label: 'Journal Voucher', path: '/finance/journal-voucher' },
  ],
};

export const financeReportsMenu: NavGroup = {
  label: 'Reports (Finance)',
  items: [
    { label: 'AR Aging', path: '/finance/reports/ar-aging' },
    { label: 'AP Aging', path: '/finance/reports/ap-aging' },
    { label: 'Bank/Cash Ledger', path: '/finance/reports/bank-cash-ledger' },
    { label: 'Job Profitability', path: '/finance/reports/job-profitability' },
  ],
};

export const financeMenu: NavGroup[] = [vouchersMenu, financeReportsMenu, financeInitialSetupMenu];

export const topNavItems = [
  'Freight',
  'Finance',
  'Reports',
  'Reports (MIS)',
  'Reports (Finance)',
  'Management',
  'Dashboard',
  'My Portal',
] as const;

export interface SidebarModule {
  key: string;
  label: string;
  icon: 'home' | 'hr' | 'finance' | 'freight' | 'courier' | 'sales' | 'inventory' | 'logs';
  path?: string;
  submenu?: NavGroup[];
  /** Modules present in the reference UI but out of scope for docs/screens-phase.md — shown, not clickable. */
  disabled?: boolean;
}

export const sidebarModules: SidebarModule[] = [
  { key: 'hr', label: 'HR Management', icon: 'hr', disabled: true },
  { key: 'finance', label: 'Finance', icon: 'finance', submenu: financeMenu },
  {
    key: 'freight',
    label: 'Freight Forwarding',
    icon: 'freight',
    submenu: freightMenu,
  },
  { key: 'courier', label: 'Courier', icon: 'courier', disabled: true },
  { key: 'sales', label: 'Sales', icon: 'sales', disabled: true },
  { key: 'inventory', label: 'Inventory', icon: 'inventory', disabled: true },
  { key: 'logs', label: 'Logs', icon: 'logs', disabled: true },
];
