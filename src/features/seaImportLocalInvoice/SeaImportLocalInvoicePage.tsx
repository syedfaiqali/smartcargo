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
import { SeaImportLocalInvoice } from '../../domain/seaImportLocalInvoice';
import { createEmptySeaImportLocalInvoice } from '../../domain/seaImportLocalInvoiceFactory';
import { seaImportInvoiceRepo, nextSeaImportInvoiceNo, voidSeaImportInvoice, ensureSeaImportInvoiceDemo } from '../../data/seaImportLocalInvoiceService';
import { recomputeInvoiceTotals } from './invoiceCalculations';
import { EntryTab } from './EntryTab';
import { PrintingTab } from './PrintingTab';
import { SeaImportLocalInvoiceGrid } from './SeaImportLocalInvoiceGrid';

export function SeaImportLocalInvoicePage() {
  ensureSeaImportInvoiceDemo();
  const [tab, setTab] = useState(0);
  const [showList, setShowList] = useState(true);
  const [printingOnly, setPrintingOnly] = useState(false);
  const [invoice, setInvoice] = useState<SeaImportLocalInvoice | null>(null);
  const [editable, setEditable] = useState(false);
  const [message, setMessage] = useState<{ severity: 'success' | 'error' | 'warning'; text: string } | null>(null);

  const loadInvoice = (inv: SeaImportLocalInvoice) => {
    setInvoice(inv);
    setEditable(false);
    setTab(0);
    setPrintingOnly(false);
    setShowList(false);
  };

  const handleAction = (action: ToolbarAction) => {
    switch (action) {
      case 'new': {
        const draft = createEmptySeaImportLocalInvoice();
        draft.invoiceNo = nextSeaImportInvoiceNo(draft.branch);
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
        seaImportInvoiceRepo.remove(invoice.id);
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
        const saved = seaImportInvoiceRepo.save({ ...invoice, status: { ...invoice.status, final: true } });
        setInvoice(saved);
        setEditable(false);
        setMessage({ severity: 'success', text: `Invoice ${saved.invoiceNo} finalized.` });
        break;
      }
      case 'void': {
        if (!invoice) return;
        const updated = voidSeaImportInvoice(invoice.id);
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
    const saved = seaImportInvoiceRepo.save(recomputeInvoiceTotals(invoice));
    setInvoice(saved);
    setMessage({ severity: 'success', text: `Invoice ${saved.invoiceNo} saved.` });
  };

  const disabledActions: ToolbarAction[] = [];
  if (!invoice) disabledActions.push('edit', 'delete', 'final', 'void');
  if (invoice?.status.final) disabledActions.push('edit', 'delete', 'final');
  if (invoice?.status.void) disabledActions.push('final', 'edit');
  if (!editable || tab !== 0 || printingOnly) disabledActions.push('save');

  return (
    <PageShell breadcrumbs={['Freight', 'Transactions Menu (Sea Import)', 'Local Invoices Entry and Printing (Sea-Import)']} title="Local Invoice Entry (Sea-Import)">
      {message && (
        <Alert severity={message.severity} onClose={() => setMessage(null)} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      {showList ? <><TransactionToolbar actions={['new']} onAction={handleAction}/><SeaImportLocalInvoiceGrid invoices={seaImportInvoiceRepo.list()} onOpen={loadInvoice} onEdit={(i)=>{setInvoice(i);setEditable(true);setTab(0);setPrintingOnly(false);setShowList(false)}} onDelete={(i)=>{seaImportInvoiceRepo.remove(i.id);setMessage({severity:'success',text:'Invoice deleted.'})}} onPrint={(i)=>{setInvoice(i);setEditable(false);setTab(0);setPrintingOnly(true);setShowList(false)}}/></> : <><Stack direction="row" justifyContent="flex-end" sx={{mb:1}}><Button startIcon={<ArrowBackIcon/>} onClick={()=>{setPrintingOnly(false);setShowList(true)}}>Back to List</Button></Stack>{!printingOnly && <TransactionToolbar actions={['save','final','void']} disabledActions={disabledActions} onAction={handleAction}/>} 

      {invoice && (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Chip label={`Invoice No: ${invoice.invoiceNo}`} color="primary" />
          {invoice.status.final && <Chip label="FINAL" color="success" />}
          {invoice.status.void && <Chip label="VOID" color="warning" />}
          {editable && <Chip label="EDITING" color="info" variant="outlined" />}
        </Stack>
      )}</>}

      {!showList && <><Tabs value={0} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
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
