import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme/theme';
import { AppShell } from './layout/AppShell';
import { HomePage } from './features/home/HomePage';
import { AirlineCodesPage } from './features/masterData/AirlineCodesPage';
import { OwnerCodesPage } from './features/masterData/OwnerCodesPage';
import { PartyCodesPage } from './features/masterData/PartyCodesPage';
import { ForeignAgentCodesPage } from './features/masterData/ForeignAgentCodesPage';
import { AirportCodesPage } from './features/masterData/AirportCodesPage';
import { SpoCodesPage } from './features/masterData/SpoCodesPage';
import { CurrencyCodesPage } from './features/masterData/CurrencyCodesPage';
import { AgentCodesPage } from './features/masterData/AgentCodesPage';
import { BankCodesPage } from './features/masterData/BankCodesPage';
import { PayableTypeCodesPage } from './features/masterData/PayableTypeCodesPage';
import { ShippingLineCodesPage } from './features/masterData/ShippingLineCodesPage';
import { SeaPortCodesPage } from './features/masterData/SeaPortCodesPage';
import { SectorCodesPage } from './features/masterData/SectorCodesPage';
import { CountryCodesPage } from './features/masterData/CountryCodesPage';
import { CommodityCodesPage } from './features/masterData/CommodityCodesPage';
import { ContainerTypesPage } from './features/masterData/ContainerTypesPage';
import { SubAgentPartiesPage } from './features/masterData/SubAgentPartiesPage';
import { AssociateCodesPage } from './features/masterData/AssociateCodesPage';
import { ChargeableCodesPage } from './features/masterData/ChargeableCodesPage';
import { InvoiceChargeCodesPage } from './features/masterData/InvoiceChargeCodesPage';
import { SignatoryCodesPage } from './features/masterData/SignatoryCodesPage';
import { JobTypesPage } from './features/masterData/JobTypesPage';
import { JobStatusPage } from './features/masterData/JobStatusPage';
import { TermsAndConditionsPage } from './features/masterData/TermsAndConditionsPage';
import { AwbStockPage } from './features/awbStock/AwbStockPage';
import { JobPage } from './features/jobMawb/JobPage';
import { LocalInvoicePage } from './features/localInvoice/LocalInvoicePage';
import { OtherChargesPayablePage } from './features/otherChargesPayable/OtherChargesPayablePage';
import { ForeignAgentInvoicePage } from './features/foreignAgentInvoice/ForeignAgentInvoicePage';
import { CoveringLetterPage } from './features/letters/CoveringLetterPage';
import { LetterOfIssuancePage } from './features/letters/LetterOfIssuancePage';
import { SeaExportJobPage } from './features/seaExportJob/SeaExportJobPage';
import { ClearingVoucherPage } from './features/voucher/ClearingVoucherPage';
import { BankReceiptPage } from './features/voucher/BankReceiptPage';
import { JournalVoucherPage } from './features/voucher/JournalVoucherPage';
import { AgingReportPage } from './features/financeReports/AgingReportPage';
import { BankCashLedgerPage } from './features/financeReports/BankCashLedgerPage';
import { JobProfitabilityPage } from './features/financeReports/JobProfitabilityPage';
import { GroupCodesPage } from './features/financeSetup/GroupCodesPage';
import { ControlCodesPage } from './features/financeSetup/ControlCodesPage';
import { ComingSoonPage } from './features/common/ComingSoonPage';
import { FinanceUtilityPage } from './features/financeSetup/FinanceUtilityPage';
import { SeaOtherChargesPayablePage } from './features/seaOtherChargesPayable/SeaOtherChargesPayablePage';
import { SeaRefundPage } from './features/seaRefundFromShippingLines/SeaRefundPage';
import { SeaLocalInvoicePage } from './features/seaLocalInvoice/SeaLocalInvoicePage';
import { SeaLoadingProgramPage } from './features/seaLoadingProgram/SeaLoadingProgramPage';
import { SeaForeignAgentInvoicePage } from './features/seaForeignAgentInvoice/SeaForeignAgentInvoicePage';
import { AirImportManifestPage } from './features/airImportManifest/AirImportManifestPage';
import { AirImportJobPage } from './features/airImportJob/AirImportJobPage';
import { AirImportLocalInvoicePage } from './features/airImportLocalInvoice/AirImportLocalInvoicePage';
import { AirImportOtherChargesPayablePage } from './features/airImportOtherChargesPayable/AirImportOtherChargesPayablePage';
import { AirImportForeignAgentInvoicePage } from './features/airImportForeignAgentInvoice/AirImportForeignAgentInvoicePage';
import { SeaImportManifestPage } from './features/seaImportManifest/SeaImportManifestPage';
import { SeaImportJobPage } from './features/seaImportJob/SeaImportJobPage';
import { SeaImportOtherChargesPayablePage } from './features/seaImportOtherChargesPayable/SeaImportOtherChargesPayablePage';
import { SeaImportRefundPage } from './features/seaImportRefundFromShippingLines/SeaImportRefundPage';
import { SeaImportLocalInvoicePage } from './features/seaImportLocalInvoice/SeaImportLocalInvoicePage';
import { SeaImportForeignAgentInvoicePage } from './features/seaImportForeignAgentInvoice/SeaImportForeignAgentInvoicePage';
import { SeaImportQuotationPage } from './features/seaImportQuotation/SeaImportQuotationPage';
import { DocumentReceiptPage } from './features/documentReceipt/DocumentReceiptPage';
import { DeleteConfirmationDialog } from './components/DeleteConfirmationDialog';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <DeleteConfirmationDialog />
        <AppShell>
          <Routes>
            <Route path="/finance" element={<ClearingVoucherPage kind="PAYMENT" mode="BANK" title="BPV - Bank Payment Voucher" />} />
            <Route path="/finance/initial-setup/group-codes" element={<GroupCodesPage />} />
            <Route path="/finance/initial-setup/control-codes" element={<ControlCodesPage />} />
            <Route
              path="/finance/initial-setup/chart-of-accounts"
              element={<ComingSoonPage breadcrumbs={['Finance', 'Initial Setup', 'Chart of Accounts']} title="Chart of Accounts" />}
            />
            <Route path="/finance/bank-payment-voucher" element={<ClearingVoucherPage kind="PAYMENT" mode="BANK" title="BPV - Bank Payment Voucher" />} />
            <Route path="/finance/bank-receipt-voucher" element={<BankReceiptPage />} />
            <Route path="/finance/cash-payment-voucher" element={<ClearingVoucherPage kind="PAYMENT" mode="CASH" title="CPV - Cash Payment Voucher" />} />
            <Route path="/finance/cash-receipt-voucher" element={<ClearingVoucherPage kind="RECEIPT" mode="CASH" title="CRV - Cash Receipt Voucher" />} />
            <Route path="/finance/journal-voucher" element={<JournalVoucherPage />} />
            <Route path="/finance/post-dated-cheques-received" element={<FinanceUtilityPage kind="post-dated-cheques" />} />
            <Route path="/finance/cheque-book" element={<FinanceUtilityPage kind="cheque-book" />} />
            <Route path="/finance/bank-reconciliation" element={<FinanceUtilityPage kind="bank-reconciliation" />} />
            {/* Legacy voucher routes kept for backward compatibility with any saved links. */}
            <Route path="/finance/receipt-voucher" element={<ClearingVoucherPage kind="RECEIPT" mode="BANK" title="BRV - Bank Receipt Voucher" />} />
            <Route path="/finance/payment-voucher" element={<ClearingVoucherPage kind="PAYMENT" mode="BANK" title="BPV - Bank Payment Voucher" />} />
            <Route path="/finance/reports/ar-aging" element={<AgingReportPage kind="AR" />} />
            <Route path="/finance/reports/ap-aging" element={<AgingReportPage kind="AP" />} />
            <Route path="/finance/reports/bank-cash-ledger" element={<BankCashLedgerPage />} />
            <Route path="/finance/reports/job-profitability" element={<JobProfitabilityPage />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/freight/initial-setup/airline-codes" element={<AirlineCodesPage />} />
            <Route path="/freight/initial-setup/owner-codes" element={<OwnerCodesPage />} />
            <Route path="/freight/initial-setup/party-codes" element={<PartyCodesPage />} />
            <Route path="/freight/initial-setup/foreign-agent-codes" element={<ForeignAgentCodesPage />} />
            <Route path="/freight/initial-setup/airport-codes" element={<AirportCodesPage />} />
            <Route path="/freight/initial-setup/spo-codes" element={<SpoCodesPage />} />
            <Route path="/freight/initial-setup/currency-codes" element={<CurrencyCodesPage />} />
            <Route path="/freight/initial-setup/agent-codes" element={<AgentCodesPage />} />
            <Route path="/freight/initial-setup/bank-codes" element={<BankCodesPage />} />
            <Route path="/freight/initial-setup/payable-type-codes" element={<PayableTypeCodesPage />} />
            <Route path="/freight/initial-setup/shipping-line-codes" element={<ShippingLineCodesPage />} />
            <Route path="/freight/initial-setup/sea-port-codes" element={<SeaPortCodesPage />} />
            <Route path="/freight/initial-setup/sector-codes" element={<SectorCodesPage />} />
            <Route path="/freight/initial-setup/country-codes" element={<CountryCodesPage />} />
            <Route path="/freight/initial-setup/commodity-codes" element={<CommodityCodesPage />} />
            <Route path="/freight/initial-setup/container-types" element={<ContainerTypesPage />} />
            <Route path="/freight/initial-setup/sub-agent-parties" element={<SubAgentPartiesPage />} />
            <Route path="/freight/initial-setup/associate-codes" element={<AssociateCodesPage />} />
            <Route path="/freight/initial-setup/chargeable-codes" element={<ChargeableCodesPage />} />
            <Route path="/freight/initial-setup/invoice-charge-codes" element={<InvoiceChargeCodesPage />} />
            <Route path="/freight/initial-setup/signatory-codes" element={<SignatoryCodesPage />} />
            <Route path="/freight/initial-setup/job-types" element={<JobTypesPage />} />
            <Route path="/freight/initial-setup/job-status" element={<JobStatusPage />} />
            <Route path="/freight/initial-setup/terms-and-conditions" element={<TermsAndConditionsPage />} />

            <Route path="/freight/air-export/awb-stock" element={<AwbStockPage />} />
            <Route
              path="/freight/air-export/job-mawb"
              element={
                <JobPage
                  key="mawb-job-page"
                  kind="MAWB"
                  breadcrumbs={['Freight', 'Transactions Menu (Air Export)', 'Job (MAWB) Entry and Printing']}
                  title="Job (MAWB) Entry and Printing"
                />
              }
            />
            <Route
              path="/freight/air-export/job-hawb"
              element={
                <JobPage
                  key="hawb-job-page"
                  kind="HAWB"
                  breadcrumbs={['Freight', 'Transactions Menu (Air Export)', 'Job (HAWB) Entry and Printing']}
                  title="Job (HAWB) Entry and Printing"
                />
              }
            />
            <Route path="/freight/air-export/local-invoices" element={<LocalInvoicePage />} />
            <Route path="/freight/air-export/other-charges-payable" element={<OtherChargesPayablePage />} />
            <Route
              path="/freight/air-export/invoices-to-foreign-agents"
              element={
                <ForeignAgentInvoicePage
                  variant="INVOICE_TO"
                  breadcrumbs={['Freight', 'Transactions Menu (Air Export)', 'Invoices To Foreign Agents']}
                />
              }
            />
            <Route
              path="/freight/air-export/credit-notes-to-foreign-agents"
              element={
                <ForeignAgentInvoicePage
                  variant="CREDIT_NOTE_TO"
                  breadcrumbs={['Freight', 'Transactions Menu (Air Export)', 'Credit Notes To Foreign Agents']}
                />
              }
            />
            <Route
              path="/freight/air-export/invoices-received-from-foreign-agents"
              element={
                <ForeignAgentInvoicePage
                  variant="INVOICE_RECEIVED"
                  breadcrumbs={['Freight', 'Transactions Menu (Air Export)', 'Invoices/Dr. Notes Received From Foreign Agents']}
                />
              }
            />
            <Route
              path="/freight/air-export/credit-notes-received-from-foreign-agents"
              element={
                <ForeignAgentInvoicePage
                  variant="CREDIT_NOTE_RECEIVED"
                  breadcrumbs={['Freight', 'Transactions Menu (Air Export)', 'Credit Notes Received From Foreign Agents']}
                />
              }
            />
            <Route path="/freight/air-export/covering-letter" element={<CoveringLetterPage />} />
            <Route path="/freight/air-export/letter-of-issuance" element={<LetterOfIssuancePage />} />

            <Route path="/freight/sea-export/jobs" element={<SeaExportJobPage />} />
            <Route path="/freight/sea-export/other-charges-payable" element={<SeaOtherChargesPayablePage />} />
            <Route path="/freight/sea-export/refund-from-shipping-lines" element={<SeaRefundPage />} />
            <Route path="/freight/sea-export/local-invoices" element={<SeaLocalInvoicePage />} />
            <Route path="/freight/sea-export/loading-program" element={<SeaLoadingProgramPage />} />
            <Route
              path="/freight/sea-export/invoices-to-foreign-agents"
              element={
                <SeaForeignAgentInvoicePage
                  variant="INVOICE_TO"
                  breadcrumbs={['Freight', 'Transactions Menu (Sea Export)', 'Invoices To Foreign Agents (Sea-Export)']}
                />
              }
            />
            <Route
              path="/freight/sea-export/credit-notes-to-foreign-agents"
              element={
                <SeaForeignAgentInvoicePage
                  variant="CREDIT_NOTE_TO"
                  breadcrumbs={['Freight', 'Transactions Menu (Sea Export)', 'Credit Notes To Foreign Agents (Sea-Export)']}
                />
              }
            />
            <Route
              path="/freight/sea-export/invoices-received-from-foreign-agents"
              element={
                <SeaForeignAgentInvoicePage
                  variant="INVOICE_RECEIVED"
                  breadcrumbs={['Freight', 'Transactions Menu (Sea Export)', 'Invoices/Dr. Notes Received From Foreign Agents (Sea-Export)']}
                />
              }
            />
            <Route
              path="/freight/sea-export/credit-notes-received-from-foreign-agents"
              element={
                <SeaForeignAgentInvoicePage
                  variant="CREDIT_NOTE_RECEIVED"
                  breadcrumbs={['Freight', 'Transactions Menu (Sea Export)', 'Credit Notes Received From Foreign Agents (Sea-Export)']}
                />
              }
            />

            <Route
              path="/freight/air-import/manifest-inbond-shipments"
              element={<AirImportManifestPage />}
            />
            <Route
              path="/freight/air-import/inbond-shipments"
              element={<AirImportJobPage />}
            />
            <Route
              path="/freight/air-import/local-invoices"
              element={<AirImportLocalInvoicePage />}
            />
            <Route
              path="/freight/air-import/other-charges-payable"
              element={<AirImportOtherChargesPayablePage />}
            />
            <Route
              path="/freight/air-import/invoices-to-foreign-agents"
              element={
                <AirImportForeignAgentInvoicePage
                  variant="INVOICE_TO"
                  breadcrumbs={['Freight', 'Transactions Menu (Air Import)', 'Invoices To Foreign Agents (Air-Import)']}
                />
              }
            />
            <Route
              path="/freight/air-import/credit-notes-to-foreign-agents"
              element={
                <AirImportForeignAgentInvoicePage
                  variant="CREDIT_NOTE_TO"
                  breadcrumbs={['Freight', 'Transactions Menu (Air Import)', 'Credit Notes To Foreign Agents (Air-Import)']}
                />
              }
            />
            <Route
              path="/freight/air-import/invoices-received-from-foreign-agents"
              element={
                <AirImportForeignAgentInvoicePage
                  variant="INVOICE_RECEIVED"
                  breadcrumbs={['Freight', 'Transactions Menu (Air Import)', 'Invoices/Dr. Notes Received From Foreign Agents (Air-Import)']}
                />
              }
            />
            <Route
              path="/freight/air-import/credit-notes-received-from-foreign-agents"
              element={
                <AirImportForeignAgentInvoicePage
                  variant="CREDIT_NOTE_RECEIVED"
                  breadcrumbs={['Freight', 'Transactions Menu (Air Import)', 'Credit Notes Received From Foreign Agents (Air-Import)']}
                />
              }
            />

            <Route
              path="/freight/sea-import/manifest-inbond-shipments"
              element={<SeaImportManifestPage />}
            />
            <Route
              path="/freight/sea-import/inbond-shipments"
              element={<SeaImportJobPage />}
            />
            <Route
              path="/freight/sea-import/other-charges-payable"
              element={<SeaImportOtherChargesPayablePage />}
            />
            <Route
              path="/freight/sea-import/refund-from-shipping-lines"
              element={<SeaImportRefundPage />}
            />
            <Route
              path="/freight/sea-import/local-invoices"
              element={<SeaImportLocalInvoicePage />}
            />
            <Route
              path="/freight/sea-import/invoices-to-foreign-agents"
              element={
                <SeaImportForeignAgentInvoicePage
                  variant="INVOICE_TO"
                  breadcrumbs={['Freight', 'Transactions Menu (Sea Import)', 'Invoices To Foreign Agents (Sea-Import)']}
                />
              }
            />
            <Route
              path="/freight/sea-import/credit-notes-to-foreign-agents"
              element={
                <SeaImportForeignAgentInvoicePage
                  variant="CREDIT_NOTE_TO"
                  breadcrumbs={['Freight', 'Transactions Menu (Sea Import)', 'Credit Notes To Foreign Agents (Sea-Import)']}
                />
              }
            />
            <Route
              path="/freight/sea-import/invoices-received-from-foreign-agents"
              element={
                <SeaImportForeignAgentInvoicePage
                  variant="INVOICE_RECEIVED"
                  breadcrumbs={['Freight', 'Transactions Menu (Sea Import)', 'Invoices/Dr. Notes Received From Foreign Agents (Sea-Import)']}
                />
              }
            />
            <Route
              path="/freight/sea-import/credit-notes-received-from-foreign-agents"
              element={
                <SeaImportForeignAgentInvoicePage
                  variant="CREDIT_NOTE_RECEIVED"
                  breadcrumbs={['Freight', 'Transactions Menu (Sea Import)', 'Credit Notes Received From Foreign Agents (Sea-Import)']}
                />
              }
            />
            <Route
              path="/freight/sea-import/quotations"
              element={<SeaImportQuotationPage />}
            />
            <Route
              path="/freight/sea-import/document-receipt"
              element={<DocumentReceiptPage />}
            />
          </Routes>
        </AppShell>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
