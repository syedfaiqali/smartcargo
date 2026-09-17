import { useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { PageShell } from '../../layout/PageShell';
import { TransactionToolbar, ToolbarAction } from '../../components/TransactionToolbar';
import { AirImportLocalInvoice } from '../../domain/airImportLocalInvoice';
import { createEmptyAirImportLocalInvoice } from '../../domain/airImportLocalInvoiceFactory';
import { airImportInvoiceRepo, nextAirImportInvoiceNo, voidAirImportInvoice, ensureAirImportInvoiceDemo } from '../../data/airImportLocalInvoiceService';
import { recomputeInvoiceTotals } from './invoiceCalculations';
import { EntryTab } from './EntryTab';
import { PrintingTab } from './PrintingTab';
import { AirImportLocalInvoiceGrid } from './AirImportLocalInvoiceGrid';

export function AirImportLocalInvoicePage() {
  ensureAirImportInvoiceDemo();
  const [tab, setTab] = useState(0);
  const [showList, setShowList] = useState(true);
  const [printingOnly, setPrintingOnly] = useState(false);
  const [invoice, setInvoice] = useState<AirImportLocalInvoice | null>(null);
  const [editable, setEditable] = useState(false);
  const [message, setMessage] = useState<{ severity: 'success' | 'error' | 'warning'; text: string } | null>(null);

  const loadInvoice = (inv: AirImportLocalInvoice) => {
    setInvoice(inv);
    setEditable(false);
    setTab(0);
    setPrintingOnly(false);
    setShowList(false);
  };

  const handleAction = (action: ToolbarAction) => {
    switch (action) {
      case 'new': {
        const draft = createEmptyAirImportLocalInvoice();
        draft.invoiceNo = nextAirImportInvoiceNo(draft.branch);
        setInvoice(draft);
        setEditable(true);
        setTab(0);
        setPrintingOnly(false);
        setShowList(false);
        setMessage(null);
        break;
      }
      case 'save':
        handleSave();
        break;
      case 'edit': {
        if (!invoice) {
          setMessage({ severity: 'warning', text: 'Load an invoice first (SEARCH or Detail/Search tab).' });
          return;
        }
        if (invoice.status.final) {
          setMessage({ severity: 'warning', text: 'This invoice is FINAL and cannot be edited.' });
          return;
        }
        setEditable(true);
        break;
      }
      case 'delete': {
        if (!invoice) return;
        airImportInvoiceRepo.remove(invoice.id);
        setInvoice(null);
        setMessage({ severity: 'success', text: 'Invoice deleted.' });
        break;
      }
      case 'final': {
        if (!invoice) return;
        if (!invoice.partyCode) {
          setMessage({ severity: 'error', text: 'Party Code is required before finalizing.' });
          return;
        }
        const saved = airImportInvoiceRepo.save({ ...invoice, status: { ...invoice.status, final: true } });
        setInvoice(saved);
        setEditable(false);
        setMessage({ severity: 'success', text: `Invoice ${saved.invoiceNo} finalized.` });
        break;
      }
      case 'void': {
        if (!invoice) return;
        const updated = voidAirImportInvoice(invoice.id);
        if (updated) {
          setInvoice(updated);
          setMessage({ severity: 'success', text: `Invoice ${updated.invoiceNo} voided.` });
        }
        break;
      }
      default:
        break;
    }
  };

  const handleSave = () => {
    if (!invoice) return;
    if (!invoice.partyCode) {
      setMessage({ severity: 'error', text: 'Party Code is required to save.' });
      return;
    }
    const saved = airImportInvoiceRepo.save(recomputeInvoiceTotals(invoice));
    setInvoice(saved);
    setMessage({ severity: 'success', text: `Invoice ${saved.invoiceNo} saved.` });
  };

  const disabledActions: ToolbarAction[] = [];
  if (!invoice) disabledActions.push('edit', 'delete', 'final', 'void');
  if (invoice?.status.final) disabledActions.push('edit', 'delete', 'final');
  if (invoice?.status.void) disabledActions.push('final', 'edit');
  if (!editable || tab !== 0 || printingOnly) disabledActions.push('save');

  return (
    <PageShell breadcrumbs={['Freight', 'Transactions Menu (Air Import)', 'Local Invoices Entry and Printing (Air-Import)']} title="Local Invoice Entry (Air-Import)">
      {message && (
        <Alert severity={message.severity} onClose={() => setMessage(null)} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      {showList ? <><TransactionToolbar actions={['new']} onAction={handleAction} /><AirImportLocalInvoiceGrid invoices={airImportInvoiceRepo.list()} onOpen={loadInvoice} onEdit={(item) => { setInvoice(item); setEditable(true); setTab(0); setPrintingOnly(false); setShowList(false); }} onDelete={(item) => { airImportInvoiceRepo.remove(item.id); setMessage({ severity: 'success', text: 'Invoice deleted.' }); }} onPrint={(item) => { setInvoice(item); setEditable(false); setTab(0); setPrintingOnly(true); setShowList(false); }} /></> : <>
        <Stack direction="row" justifyContent="flex-end" sx={{ mb: 1 }}><Button startIcon={<ArrowBackIcon />} onClick={() => { setPrintingOnly(false); setShowList(true); }}>Back to List</Button></Stack>
        {!printingOnly && <TransactionToolbar actions={['save', 'final', 'void']} disabledActions={disabledActions} onAction={handleAction} />}

      {invoice && (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Chip label={`Invoice No: ${invoice.invoiceNo}`} color="primary" />
          {invoice.status.final && <Chip label="FINAL" color="success" />}
          {invoice.status.void && <Chip label="VOID" color="warning" />}
          {editable && <Chip label="EDITING" color="info" variant="outlined" />}
        </Stack>
      )}

      <Tabs value={0} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label={printingOnly ? 'Printing' : 'Entry'} />
      </Tabs>

      {!invoice ? (
        <Alert severity="info">Click New to create an invoice.</Alert>
      ) : (
        printingOnly ? <PrintingTab invoice={invoice} /> : <EntryTab invoice={invoice} editable={editable} onChange={setInvoice} />
      )}</>}
    </PageShell>
  );
}
