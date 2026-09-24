import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { PageShell } from '../../layout/PageShell';
import { TransactionToolbar, ToolbarAction } from '../../components/TransactionToolbar';
import { ForeignAgentInvoice, ForeignAgentInvoiceVariant } from '../../domain/foreignAgentInvoice';
import { createEmptyForeignAgentInvoice } from '../../domain/foreignAgentInvoiceFactory';
import { foreignAgentInvoiceRepo, nextDocumentNo, syncCreditNoteLinks, syncForeignAgentInvoiceLinks, voidAgentInvoice } from '../../data/foreignAgentInvoiceService';
import { recomputeAgentInvoiceTotals } from './agentInvoiceCalculations';
import { VARIANT_CONFIG } from './variantConfig';
import { EntryTab } from './tabs/EntryTab';
import { PrintingTab } from './tabs/PrintingTab';
import { ForeignAgentInvoiceGrid } from './ForeignAgentInvoiceGrid';

interface ForeignAgentInvoicePageProps {
  variant: ForeignAgentInvoiceVariant;
  breadcrumbs: string[];
}

export function ForeignAgentInvoicePage({ variant, breadcrumbs }: ForeignAgentInvoicePageProps) {
  const config = VARIANT_CONFIG[variant];
  const location = useLocation();
  const [tab, setTab] = useState(0);
  const [showList, setShowList] = useState(true);
  const [isPrintingView, setIsPrintingView] = useState(false);
  const [invoice, setInvoice] = useState<ForeignAgentInvoice | null>(null);
  const [editable, setEditable] = useState(false);
  const [message, setMessage] = useState<{ severity: 'success' | 'error' | 'warning'; text: string } | null>(null);

  useEffect(() => {
    const invoiceId = (location.state as { invoiceId?: string } | null)?.invoiceId;
    if (!invoiceId) return;
    const linkedInvoice = foreignAgentInvoiceRepo.get(invoiceId);
    if (!linkedInvoice || linkedInvoice.variant !== variant) return;
    setInvoice(linkedInvoice);
    setEditable(false);
    setTab(0);
    setShowList(false);
    setIsPrintingView(false);
  }, [location.key, location.state, variant]);

  const loadInvoice = (inv: ForeignAgentInvoice) => {
    setInvoice(inv);
    setEditable(false);
    setTab(0);
    setShowList(false);
    setIsPrintingView(false);
  };

  const editInvoiceFromList = (inv: ForeignAgentInvoice) => { if (inv.status.final) { setMessage({ severity: 'warning', text: 'This record is FINAL and cannot be edited.' }); return; } setInvoice(inv); setEditable(true); setTab(0); setShowList(false); setIsPrintingView(false); };
  const deleteInvoiceFromList = (inv: ForeignAgentInvoice) => { foreignAgentInvoiceRepo.remove(inv.id); syncCreditNoteLinks(inv); syncForeignAgentInvoiceLinks(inv); setMessage({ severity: 'success', text: `${config.entryDocLabel} ${inv.documentNo} deleted.` }); };
  const printInvoiceFromList = (inv: ForeignAgentInvoice) => { setInvoice(inv); setEditable(false); setTab(0); setShowList(false); setIsPrintingView(true); };

  const handleAction = (action: ToolbarAction) => {
    switch (action) {
      case 'new': {
        const draft = createEmptyForeignAgentInvoice(variant);
        draft.documentNo = nextDocumentNo(variant, draft.branch);
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
          setMessage({ severity: 'warning', text: 'Load a record first (SEARCH or Detail/Search tab).' });
          return;
        }
        if (invoice.status.final) {
          setMessage({ severity: 'warning', text: 'This record is FINAL and cannot be edited.' });
          return;
        }
        setEditable(true);
        break;
      }
      case 'delete': {
        if (!invoice) return;
        foreignAgentInvoiceRepo.remove(invoice.id);
        syncCreditNoteLinks(invoice);
        syncForeignAgentInvoiceLinks(invoice);
        setInvoice(null);
        setMessage({ severity: 'success', text: 'Record deleted.' });
        break;
      }
      case 'final': {
        if (!invoice) return;
        if (!invoice.fAgentCode) {
          setMessage({ severity: 'error', text: 'F/Agent Code is required before finalizing.' });
          return;
        }
        const previous = foreignAgentInvoiceRepo.get(invoice.id);
        const saved = foreignAgentInvoiceRepo.save({ ...invoice, status: { ...invoice.status, final: true } });
        syncCreditNoteLinks(saved, previous);
        syncForeignAgentInvoiceLinks(saved, previous);
        setInvoice(saved);
        setEditable(false);
        setMessage({ severity: 'success', text: `${config.entryDocLabel} ${saved.documentNo} finalized.` });
        break;
      }
      case 'void': {
        if (!invoice) return;
        const updated = voidAgentInvoice(invoice.id);
        if (updated) {
          syncCreditNoteLinks(updated, invoice);
          syncForeignAgentInvoiceLinks(updated, invoice);
          setInvoice(updated);
          setMessage({ severity: 'success', text: `${config.entryDocLabel} ${updated.documentNo} voided.` });
        }
        break;
      }
      case 'search':
        setShowList(true);
        setInvoice(null);
        setEditable(false);
        setIsPrintingView(false);
        break;
      default:
        break;
    }
  };

  const handleSave = () => {
    if (!invoice) return;
    if (!invoice.fAgentCode) {
      setMessage({ severity: 'error', text: 'F/Agent Code is required to save.' });
      return;
    }
    const previous = foreignAgentInvoiceRepo.get(invoice.id);
    const saved = foreignAgentInvoiceRepo.save(recomputeAgentInvoiceTotals(invoice));
    syncCreditNoteLinks(saved, previous);
    syncForeignAgentInvoiceLinks(saved, previous);
    setInvoice(saved);
    setMessage({ severity: 'success', text: `${config.entryDocLabel} ${saved.documentNo} saved.` });
  };

  const disabledActions: ToolbarAction[] = [];
  if (!invoice) disabledActions.push('edit', 'delete', 'final', 'void');
  if (invoice?.status.final) disabledActions.push('edit', 'delete', 'final');
  if (invoice?.status.void) disabledActions.push('final', 'edit');
  if (!editable || isPrintingView) disabledActions.push('save');

  return (
    <PageShell breadcrumbs={[...breadcrumbs]} title={config.title} actions={!showList ? <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => { setShowList(true); setInvoice(null); setEditable(false); setIsPrintingView(false); setMessage(null); }}>Back to List</Button> : undefined}>
      {message && (
        <Alert severity={message.severity} onClose={() => setMessage(null)} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      {showList ? <><TransactionToolbar actions={['new']} onAction={handleAction} /><ForeignAgentInvoiceGrid invoices={foreignAgentInvoiceRepo.find((item) => item.variant === variant)} onOpen={loadInvoice} onEdit={editInvoiceFromList} onDelete={deleteInvoiceFromList} onPrint={printInvoiceFromList} /></> : <>
      {!isPrintingView && <TransactionToolbar actions={['save', 'final', 'void']} disabledActions={disabledActions} onAction={handleAction} />}

      {invoice && (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Chip label={`${config.entryDocLabel} ${invoice.documentNo}`} color="primary" />
          {invoice.status.final && <Chip label="FINAL" color="success" />}
          {invoice.status.void && <Chip label="VOID" color="warning" />}
          {editable && <Chip label="EDITING" color="info" variant="outlined" />}
        </Stack>
      )}

      <Tabs value={tab} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label={isPrintingView ? 'Printing' : 'Entry'} />
      </Tabs>

      {!invoice ? (
        <Alert severity="info">Click New to create a record.</Alert>
      ) : (
        <>
          {isPrintingView ? <PrintingTab invoice={invoice} config={config} editable={editable} onChange={setInvoice} /> : <EntryTab invoice={invoice} config={config} editable={editable} onChange={setInvoice} />}
        </>
      )}
      </>}
    </PageShell>
  );
}
