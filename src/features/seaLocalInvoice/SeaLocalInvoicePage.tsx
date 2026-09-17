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
import { SeaLocalInvoice } from '../../domain/seaLocalInvoice';
import { createEmptySeaLocalInvoice } from '../../domain/seaLocalInvoiceFactory';
import { seaLocalInvoiceRepo, nextSeaInvoiceNo, voidSeaInvoice, ensureSeaLocalInvoiceDemo } from '../../data/seaLocalInvoiceService';
import { recomputeInvoiceTotals } from './invoiceCalculations';
import { EntryTab } from './EntryTab';
import { PrintingTab } from './PrintingTab';
import { SeaLocalInvoiceGrid } from './SeaLocalInvoiceGrid';

const TAB_LABELS = ['Entry'] as const;

export function SeaLocalInvoicePage() {
  ensureSeaLocalInvoiceDemo();
  const [tab, setTab] = useState(0);
  const [showList, setShowList] = useState(true);
  const [isPrintingView, setIsPrintingView] = useState(false);
  const [invoice, setInvoice] = useState<SeaLocalInvoice | null>(null);
  const [editable, setEditable] = useState(false);
  const [message, setMessage] = useState<{ severity: 'success' | 'error' | 'warning'; text: string } | null>(null);

  const loadInvoice = (inv: SeaLocalInvoice) => {
    setInvoice(inv);
    setEditable(false);
    setTab(0);
    setShowList(false);
    setIsPrintingView(false);
  };

  const handleAction = (action: ToolbarAction) => {
    switch (action) {
      case 'new': {
        const draft = createEmptySeaLocalInvoice();
        draft.invoiceNo = nextSeaInvoiceNo(draft.branch);
        setInvoice(draft);
        setEditable(true);
        setTab(0);
        setShowList(false);
        setIsPrintingView(false);
        setMessage(null);
        break;
      }
      case 'save':
        handleSave();
        break;
      case 'edit': {
        if (!invoice) {
          setMessage({ severity: 'warning', text: 'Load an invoice first (SEARCH or Detail tab).' });
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
        seaLocalInvoiceRepo.remove(invoice.id);
        setInvoice(null);
        setMessage({ severity: 'success', text: 'Invoice deleted.' });
        break;
      }
      case 'final': {
        if (!invoice) return;
        if (!invoice.partyCode || !invoice.jobNo) {
          setMessage({ severity: 'error', text: 'Job No. and Party Code are required before finalizing.' });
          return;
        }
        const saved = seaLocalInvoiceRepo.save({ ...invoice, status: { ...invoice.status, final: true } });
        setInvoice(saved);
        setEditable(false);
        setMessage({ severity: 'success', text: `Invoice ${saved.invoiceNo} finalized.` });
        break;
      }
      case 'void': {
        if (!invoice) return;
        const updated = voidSeaInvoice(invoice.id);
        if (updated) {
          setInvoice(updated);
          setMessage({ severity: 'success', text: `Invoice ${updated.invoiceNo} voided.` });
        }
        break;
      }
      case 'search':
        setTab(1);
        break;
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
    const saved = seaLocalInvoiceRepo.save(recomputeInvoiceTotals(invoice));
    setInvoice(saved);
    setMessage({ severity: 'success', text: `Invoice ${saved.invoiceNo} saved.` });
  };

  const disabledActions: ToolbarAction[] = [];
  if (!invoice) disabledActions.push('edit', 'delete', 'final', 'void');
  if (invoice?.status.final) disabledActions.push('edit', 'delete', 'final');
  if (invoice?.status.void) disabledActions.push('final', 'edit');
  if (!editable || tab !== 0) disabledActions.push('save');

  return (
    <PageShell breadcrumbs={['Freight', 'Transactions Menu (Sea Export)', 'Local Invoices Entry and Printing (Sea-Export)']} title="Local Invoice (Sea-Export)" actions={!showList ? <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => { setShowList(true); setInvoice(null); setEditable(false); setTab(0); setMessage(null); }}>Back to List</Button> : undefined}>
      {message && (
        <Alert severity={message.severity} onClose={() => setMessage(null)} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      {showList ? <><TransactionToolbar actions={['new']} onAction={handleAction}/><SeaLocalInvoiceGrid invoices={seaLocalInvoiceRepo.list()} onOpen={loadInvoice} onEdit={(i)=>{setInvoice(i);setEditable(true);setShowList(false);setIsPrintingView(false)}} onDelete={(i)=>seaLocalInvoiceRepo.remove(i.id)} onPrint={(i)=>{setInvoice(i);setEditable(false);setTab(0);setShowList(false);setIsPrintingView(true)}}/></> : <>{!isPrintingView && <TransactionToolbar
        actions={['save', 'final', 'void']}
        disabledActions={disabledActions}
        onAction={handleAction}
      />}

      {invoice && (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Chip label={`Invoice No: ${invoice.invoiceNo}`} color="primary" />
          {invoice.status.final && <Chip label="FINAL" color="success" />}
          {invoice.status.void && <Chip label="VOID" color="warning" />}
          {editable && <Chip label="EDITING" color="info" variant="outlined" />}
        </Stack>
      )}
      </>}

      {!showList && <><Tabs value={0} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        {(isPrintingView ? ['Printing'] : TAB_LABELS).map((label) => (
          <Tab key={label} label={label} />
        ))}
      </Tabs>

      {!invoice ? (
        <Alert severity="info">Click NEW to create an invoice.</Alert>
      ) : (
        <>
          {isPrintingView ? <PrintingTab invoice={invoice} /> : <EntryTab invoice={invoice} editable={editable} onChange={setInvoice} />}
        </>
      )}
      </>}
    </PageShell>
  );
}
