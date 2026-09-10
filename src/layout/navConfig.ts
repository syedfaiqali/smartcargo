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
  ],
};

export const initialSetupMenu: NavGroup = {
  label: 'Initial Setup',
  items: [
    { label: 'Airline Codes', path: '/freight/initial-setup/airline-codes' },
    { label: 'Owner Codes', path: '/freight/initial-setup/owner-codes' },
    { label: 'Party Codes', path: '/freight/initial-setup/party-codes' },
    { label: 'Foreign Agent Codes', path: '/freight/initial-setup/foreign-agent-codes' },
    { label: 'Airport / Destination Codes', path: '/freight/initial-setup/airport-codes' },
    { label: 'SPO Codes', path: '/freight/initial-setup/spo-codes' },
    { label: 'Currency Codes', path: '/freight/initial-setup/currency-codes' },
    { label: 'Clearing / Delivery Agent Codes', path: '/freight/initial-setup/agent-codes' },
    { label: 'Bank Codes', path: '/freight/initial-setup/bank-codes' },
    { label: 'Payable Type Codes', path: '/freight/initial-setup/payable-type-codes' },
    { label: 'Shipping Line Codes', path: '/freight/initial-setup/shipping-line-codes' },
    { label: 'Sea Port Codes', path: '/freight/initial-setup/sea-port-codes' },
  ],
};

export const freightMenu: NavGroup[] = [initialSetupMenu, airExportMenu, seaExportMenu];

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

export const financeMenu: NavGroup[] = [financeInitialSetupMenu, vouchersMenu, financeReportsMenu];

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
    submenu: [initialSetupMenu, airExportMenu, seaExportMenu],
  },
  { key: 'courier', label: 'Courier', icon: 'courier', disabled: true },
  { key: 'sales', label: 'Sales', icon: 'sales', disabled: true },
  { key: 'inventory', label: 'Inventory', icon: 'inventory', disabled: true },
  { key: 'logs', label: 'Logs', icon: 'logs', disabled: true },
];
