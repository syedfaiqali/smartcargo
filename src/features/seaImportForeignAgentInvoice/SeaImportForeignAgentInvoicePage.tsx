import { useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import { PageShell } from '../../layout/PageShell';
import { TransactionToolbar, ToolbarAction } from '../../components/TransactionToolbar';
import { SeaImportForeignAgentInvoice, SeaImportForeignAgentInvoiceVariant } from '../../domain/seaImportForeignAgentInvoice';
import { createEmptySeaImportForeignAgentInvoice } from '../../domain/seaImportForeignAgentInvoiceFactory';
import { seaImportAgentInvoiceRepo, nextSeaImportAgentDocumentNo, voidSeaImportAgentInvoice } from '../../data/seaImportForeignAgentInvoiceService';
import { recomputeAgentInvoiceTotals } from './agentInvoiceCalculations';
import { SEA_IMPORT_VARIANT_CONFIG } from './variantConfig';
import { MainScreenTab } from './MainScreenTab';
import { DetailSearchTab } from './DetailSearchTab';
import { PrintingTab } from './PrintingTab';

interface SeaImportForeignAgentInvoicePageProps {
  variant: SeaImportForeignAgentInvoiceVariant;
  breadcrumbs: string[];
}

export function SeaImportForeignAgentInvoicePage({ variant, breadcrumbs }: SeaImportForeignAgentInvoicePageProps) {
  const config = SEA_IMPORT_VARIANT_CONFIG[variant];
  const [tab, setTab] = useState(0);
  const [invoice, setInvoice] = useState<SeaImportForeignAgentInvoice | null>(null);
  const [editable, setEditable] = useState(false);
  const [message, setMessage] = useState<{ severity: 'success' | 'error' | 'warning'; text: string } | null>(null);

  const loadInvoice = (inv: SeaImportForeignAgentInvoice) => {
    setInvoice(inv);
    setEditable(false);
    setTab(0);
  };

  const handleAction = (action: ToolbarAction) => {
    switch (action) {
      case 'new': {
        const draft = createEmptySeaImportForeignAgentInvoice(variant);
        draft.documentNo = nextSeaImportAgentDocumentNo(variant, draft.branch);
        setInvoice(draft);
        setEditable(true);
        setTab(0);
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
        seaImportAgentInvoiceRepo.remove(invoice.id);
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
        const saved = seaImportAgentInvoiceRepo.save({ ...invoice, status: { ...invoice.status, final: true } });
        setInvoice(saved);
        setEditable(false);
        setMessage({ severity: 'success', text: `${config.entryDocLabel} ${saved.documentNo} finalized.` });
        break;
      }
      case 'void': {
        if (!invoice) return;
        const updated = voidSeaImportAgentInvoice(invoice.id);
        if (updated) {
          setInvoice(updated);
          setMessage({ severity: 'success', text: `${config.entryDocLabel} ${updated.documentNo} voided.` });
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
    if (!invoice.fAgentCode) {
      setMessage({ severity: 'error', text: 'F/Agent Code is required to save.' });
      return;
    }
    const saved = seaImportAgentInvoiceRepo.save(recomputeAgentInvoiceTotals(invoice));
    setInvoice(saved);
    setMessage({ severity: 'success', text: `${config.entryDocLabel} ${saved.documentNo} saved.` });
  };

  const disabledActions: ToolbarAction[] = [];
  if (!invoice) disabledActions.push('edit', 'delete', 'final', 'void');
  if (invoice?.status.final) disabledActions.push('edit', 'delete', 'final');
  if (invoice?.status.void) disabledActions.push('final', 'edit');
  if (!editable || tab !== 0) disabledActions.push('save');

  return (
    <PageShell breadcrumbs={breadcrumbs} title={config.title}>
      {message && (
        <Alert severity={message.severity} onClose={() => setMessage(null)} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      <TransactionToolbar
        actions={['search', 'top', 'bottom', 'prev', 'next', 'new', 'edit', 'delete', 'final', 'void']}
        disabledActions={disabledActions}
        onAction={handleAction}
      />

      {invoice && (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Chip label={`${config.entryDocLabel} ${invoice.documentNo}`} color="primary" />
          {invoice.status.final && <Chip label="FINAL" color="success" />}
          {invoice.status.void && <Chip label="VOID" color="warning" />}
          {editable && <Chip label="EDITING" color="info" variant="outlined" />}
        </Stack>
      )}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="Main Screen" />
        <Tab label="Detail/Search" />
        <Tab label="Printing" />
      </Tabs>

      {tab === 1 ? (
        <DetailSearchTab variant={variant} config={config} onOpenInvoice={loadInvoice} />
      ) : !invoice ? (
        <Alert severity="info">Click New to create a record, or use the Detail/Search tab to find an existing one.</Alert>
      ) : (
        <>
          {tab === 0 && <MainScreenTab invoice={invoice} config={config} editable={editable} onChange={setInvoice} />}
          {tab === 2 && <PrintingTab invoice={invoice} config={config} />}
        </>
      )}
    </PageShell>
  );
}
