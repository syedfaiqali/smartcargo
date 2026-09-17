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
import { AirImportForeignAgentInvoice, AirImportForeignAgentInvoiceVariant } from '../../domain/airImportForeignAgentInvoice';
import { createEmptyAirImportForeignAgentInvoice } from '../../domain/airImportForeignAgentInvoiceFactory';
import { airImportAgentInvoiceRepo, nextAirImportAgentDocumentNo, voidAirImportAgentInvoice, ensureAirImportAgentInvoiceDemo } from '../../data/airImportForeignAgentInvoiceService';
import { recomputeAgentInvoiceTotals } from './agentInvoiceCalculations';
import { AIR_IMPORT_VARIANT_CONFIG } from './variantConfig';
import { MainScreenTab } from './MainScreenTab';
import { PrintingTab } from './PrintingTab';
import { AirImportAgentInvoiceGrid } from './AirImportAgentInvoiceGrid';

interface AirImportForeignAgentInvoicePageProps {
  variant: AirImportForeignAgentInvoiceVariant;
  breadcrumbs: string[];
}

export function AirImportForeignAgentInvoicePage({ variant, breadcrumbs }: AirImportForeignAgentInvoicePageProps) {
  ensureAirImportAgentInvoiceDemo(variant);
  const config = AIR_IMPORT_VARIANT_CONFIG[variant];
  const [tab, setTab] = useState(0);
  const [showList, setShowList] = useState(true);
  const [printingOnly, setPrintingOnly] = useState(false);
  const [invoice, setInvoice] = useState<AirImportForeignAgentInvoice | null>(null);
  const [editable, setEditable] = useState(false);
  const [message, setMessage] = useState<{ severity: 'success' | 'error' | 'warning'; text: string } | null>(null);

  const loadInvoice = (inv: AirImportForeignAgentInvoice) => {
    setInvoice(inv);
    setEditable(false);
    setTab(0);
    setPrintingOnly(false);
    setShowList(false);
  };

  const handleAction = (action: ToolbarAction) => {
    switch (action) {
      case 'new': {
        const draft = createEmptyAirImportForeignAgentInvoice(variant);
        draft.documentNo = nextAirImportAgentDocumentNo(variant, draft.branch);
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
        airImportAgentInvoiceRepo.remove(invoice.id);
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
        const saved = airImportAgentInvoiceRepo.save({ ...invoice, status: { ...invoice.status, final: true } });
        setInvoice(saved);
        setEditable(false);
        setMessage({ severity: 'success', text: `${config.entryDocLabel} ${saved.documentNo} finalized.` });
        break;
      }
      case 'void': {
        if (!invoice) return;
        const updated = voidAirImportAgentInvoice(invoice.id);
        if (updated) {
          setInvoice(updated);
          setMessage({ severity: 'success', text: `${config.entryDocLabel} ${updated.documentNo} voided.` });
        }
        break;
      }
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
    const saved = airImportAgentInvoiceRepo.save(recomputeAgentInvoiceTotals(invoice));
    setInvoice(saved);
    setMessage({ severity: 'success', text: `${config.entryDocLabel} ${saved.documentNo} saved.` });
  };

  const disabledActions: ToolbarAction[] = [];
  if (!invoice) disabledActions.push('edit', 'delete', 'final', 'void');
  if (invoice?.status.final) disabledActions.push('edit', 'delete', 'final');
  if (invoice?.status.void) disabledActions.push('final', 'edit');
  if (!editable || tab !== 0 || printingOnly) disabledActions.push('save');

  return (
    <PageShell breadcrumbs={breadcrumbs} title={config.title}>
      {message && (
        <Alert severity={message.severity} onClose={() => setMessage(null)} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      {showList ? <><TransactionToolbar actions={['new']} onAction={handleAction} /><AirImportAgentInvoiceGrid invoices={airImportAgentInvoiceRepo.find((item) => item.variant === variant)} onOpen={loadInvoice} onEdit={(item) => { setInvoice(item); setEditable(true); setTab(0); setPrintingOnly(false); setShowList(false); }} onDelete={(item) => { airImportAgentInvoiceRepo.remove(item.id); setMessage({ severity: 'success', text: 'Record deleted.' }); }} onPrint={(item) => { setInvoice(item); setEditable(false); setTab(0); setPrintingOnly(true); setShowList(false); }} /></> : <>
        <Stack direction="row" justifyContent="flex-end" sx={{ mb: 1 }}><Button startIcon={<ArrowBackIcon />} onClick={() => { setPrintingOnly(false); setShowList(true); }}>Back to List</Button></Stack>
        {!printingOnly && <TransactionToolbar actions={['save', 'final', 'void']} disabledActions={disabledActions} onAction={handleAction} />}

      {invoice && (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Chip label={`${config.entryDocLabel} ${invoice.documentNo}`} color="primary" />
          {invoice.status.final && <Chip label="FINAL" color="success" />}
          {invoice.status.void && <Chip label="VOID" color="warning" />}
          {editable && <Chip label="EDITING" color="info" variant="outlined" />}
        </Stack>
      )}

      <Tabs value={0} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label={printingOnly ? 'Printing' : 'Main Screen'} />
      </Tabs>

      {!invoice ? (
        <Alert severity="info">Click New to create a record.</Alert>
      ) : (
        printingOnly ? <PrintingTab invoice={invoice} config={config} /> : <MainScreenTab invoice={invoice} config={config} editable={editable} onChange={setInvoice} />
      )}</>}
    </PageShell>
  );
}
