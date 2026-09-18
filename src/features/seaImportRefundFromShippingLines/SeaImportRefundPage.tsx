import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { PageShell } from '../../layout/PageShell';
import { TransactionToolbar, ToolbarAction } from '../../components/TransactionToolbar';
import { SeaImportRefundFromShippingLines } from '../../domain/seaImportRefundFromShippingLines';
import { createEmptySeaImportRefund } from '../../domain/seaImportRefundFromShippingLinesFactory';
import { seaImportRefundRepo, nextSeaImportRefundDocNo } from '../../data/seaImportRefundFromShippingLinesService';
import { recomputeRefundTotals } from './refundCalculations';
import { SeaImportRefundEntryForm } from './SeaImportRefundEntryForm';
import { SeaImportRefundGrid } from './SeaImportRefundGrid';
import { SeaImportRefundPrintingTab } from './SeaImportRefundPrintingTab';

export function SeaImportRefundPage() {
  const [refund, setRefund] = useState<SeaImportRefundFromShippingLines | null>(null);
  const [editable, setEditable] = useState(false);
  const [showList, setShowList] = useState(true);
  const [isPrintingView, setIsPrintingView] = useState(false);
  const [message, setMessage] = useState<{ severity: 'success' | 'error' | 'warning'; text: string } | null>(null);

  const loadRefund = (r: SeaImportRefundFromShippingLines) => {
    setRefund(r);
    setEditable(false);
    setShowList(false);
    setIsPrintingView(false);
  };

  const editRefundFromList = (r: SeaImportRefundFromShippingLines) => {
    if (r.status.final) {
      setMessage({ severity: 'warning', text: 'This refund is FINAL and cannot be edited.' });
      return;
    }
    setRefund(r);
    setEditable(true);
    setShowList(false);
    setIsPrintingView(false);
  };

  const deleteRefundFromList = (r: SeaImportRefundFromShippingLines) => {
    seaImportRefundRepo.remove(r.id);
    setMessage({ severity: 'success', text: `Refund ${r.documentNo} deleted.` });
  };

  const printRefundFromList = (r: SeaImportRefundFromShippingLines) => {
    setRefund(r);
    setEditable(false);
    setShowList(false);
    setIsPrintingView(true);
  };

  const handleAction = (action: ToolbarAction) => {
    switch (action) {
      case 'new': {
        const draft = createEmptySeaImportRefund();
        draft.documentNo = nextSeaImportRefundDocNo(draft.branch);
        setRefund(draft);
        setEditable(true);
        setShowList(false);
        setIsPrintingView(false);
        setMessage(null);
        break;
      }
      case 'save':
        handleSave();
        break;
      case 'edit': {
        if (!refund) {
          setMessage({ severity: 'warning', text: 'Load a refund first (SEARCH).' });
          return;
        }
        if (refund.status.final) {
          setMessage({ severity: 'warning', text: 'This refund is FINAL and cannot be edited.' });
          return;
        }
        setEditable(true);
        break;
      }
      case 'delete': {
        if (!refund) return;
        seaImportRefundRepo.remove(refund.id);
        setRefund(null);
        setMessage({ severity: 'success', text: 'Refund deleted.' });
        break;
      }
      case 'final': {
        if (!refund) return;
        if (!refund.jobNo || refund.chargeLines.every((l) => !l.amount1)) {
          setMessage({ severity: 'error', text: 'Job No. and at least one charge amount are required before finalizing.' });
          return;
        }
        const saved = seaImportRefundRepo.save({ ...refund, status: { final: true } });
        setRefund(saved);
        setEditable(false);
        setMessage({ severity: 'success', text: `Refund ${saved.documentNo} finalized.` });
        break;
      }
      case 'search':
        setShowList(true);
        setRefund(null);
        setEditable(false);
        setIsPrintingView(false);
        break;
      default:
        break;
    }
  };

  const handleSave = () => {
    if (!refund) return;
    if (!refund.jobNo) {
      setMessage({ severity: 'error', text: 'Job No. is required to save.' });
      return;
    }
    const saved = seaImportRefundRepo.save(recomputeRefundTotals(refund));
    setRefund(saved);
    setMessage({ severity: 'success', text: `Refund ${saved.documentNo} saved.` });
  };

  const disabledActions: ToolbarAction[] = [];
  if (!refund) disabledActions.push('edit', 'delete', 'final');
  if (refund?.status.final) disabledActions.push('edit', 'delete', 'final');
  if (!editable) disabledActions.push('save');

  return (
    <PageShell
      breadcrumbs={['Freight', 'Transactions Menu (Sea Import)', 'Refund From Shipping Lines Entry and Printing (Sea-Import)']}
      title="Refund From Shipping Lines (Sea-Import)"
      actions={!showList ? <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => { setShowList(true); setRefund(null); setEditable(false); setIsPrintingView(false); setMessage(null); }}>Back to List</Button> : undefined}
    >
      {message && (
        <Alert severity={message.severity} onClose={() => setMessage(null)} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      {showList ? (
        <>
          <TransactionToolbar actions={['new']} onAction={handleAction} />
          <SeaImportRefundGrid refunds={seaImportRefundRepo.list()} onOpen={loadRefund} onEdit={editRefundFromList} onDelete={deleteRefundFromList} onPrint={printRefundFromList} />
        </>
      ) : (
        <>
          {!isPrintingView && <TransactionToolbar actions={['new', 'edit', 'delete', 'final']} disabledActions={disabledActions} onAction={handleAction} />}

      {refund && (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Chip label={`Document No: ${refund.documentNo}`} color="primary" />
          {refund.status.final && <Chip label="FINAL" color="success" />}
          {editable && <Chip label="EDITING" color="info" variant="outlined" />}
        </Stack>
      )}

      <Tabs value={0} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label={isPrintingView ? 'Printing' : 'Entry'} />
      </Tabs>

      {!refund ? (
        <Alert severity="info">Click New to create a refund.</Alert>
      ) : (
        isPrintingView ? <SeaImportRefundPrintingTab refund={refund} /> : <SeaImportRefundEntryForm refund={refund} editable={editable} onChange={setRefund} />
      )}
        </>
      )}
    </PageShell>
  );
}
