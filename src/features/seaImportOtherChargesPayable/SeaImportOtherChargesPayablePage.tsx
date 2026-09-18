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
import { SeaImportOtherChargesPayable } from '../../domain/seaImportOtherChargesPayable';
import { createEmptySeaImportOtherChargesPayable } from '../../domain/seaImportOtherChargesPayableFactory';
import { seaImportPayableRepo, nextSeaImportCreditNoteNo } from '../../data/seaImportOtherChargesPayableService';
import { recomputePayableTotals } from './payableCalculations';
import { SeaImportPayableEntryForm } from './SeaImportPayableEntryForm';
import { SeaImportPayableGrid } from './SeaImportPayableGrid';
import { SeaImportPayablePrintingTab } from './SeaImportPayablePrintingTab';

export function SeaImportOtherChargesPayablePage() {
  const [payable, setPayable] = useState<SeaImportOtherChargesPayable | null>(null);
  const [editable, setEditable] = useState(false);
  const [showList, setShowList] = useState(true);
  const [isPrintingView, setIsPrintingView] = useState(false);
  const [message, setMessage] = useState<{ severity: 'success' | 'error' | 'warning'; text: string } | null>(null);

  const loadPayable = (p: SeaImportOtherChargesPayable) => {
    setPayable(p);
    setEditable(false);
    setShowList(false);
    setIsPrintingView(false);
  };

  const editPayableFromList = (p: SeaImportOtherChargesPayable) => {
    if (p.status.final) {
      setMessage({ severity: 'warning', text: 'This payable is FINAL and cannot be edited.' });
      return;
    }
    setPayable(p);
    setEditable(true);
    setShowList(false);
    setIsPrintingView(false);
  };

  const deletePayableFromList = (p: SeaImportOtherChargesPayable) => {
    seaImportPayableRepo.remove(p.id);
    setMessage({ severity: 'success', text: `Payable ${p.creditNoteNo} deleted.` });
  };

  const printPayableFromList = (p: SeaImportOtherChargesPayable) => {
    setPayable(p);
    setEditable(false);
    setShowList(false);
    setIsPrintingView(true);
  };

  const handleAction = (action: ToolbarAction) => {
    switch (action) {
      case 'new': {
        const draft = createEmptySeaImportOtherChargesPayable();
        draft.creditNoteNo = nextSeaImportCreditNoteNo(draft.branch);
        setPayable(draft);
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
        if (!payable) {
          setMessage({ severity: 'warning', text: 'Load a payable first (SEARCH).' });
          return;
        }
        if (payable.status.final) {
          setMessage({ severity: 'warning', text: 'This payable is FINAL and cannot be edited.' });
          return;
        }
        setEditable(true);
        break;
      }
      case 'delete': {
        if (!payable) return;
        seaImportPayableRepo.remove(payable.id);
        setPayable(null);
        setMessage({ severity: 'success', text: 'Payable deleted.' });
        break;
      }
      case 'final': {
        if (!payable) return;
        if (!payable.partyCode || payable.chargeLines.every((l) => !l.fAmount)) {
          setMessage({ severity: 'error', text: 'Party and at least one charge amount are required before finalizing.' });
          return;
        }
        const saved = seaImportPayableRepo.save({ ...payable, status: { final: true } });
        setPayable(saved);
        setEditable(false);
        setMessage({ severity: 'success', text: `Payable ${saved.creditNoteNo} finalized.` });
        break;
      }
      case 'search':
        setShowList(true);
        setPayable(null);
        setEditable(false);
        setIsPrintingView(false);
        break;
      default:
        break;
    }
  };

  const handleSave = () => {
    if (!payable) return;
    if (!payable.partyCode) {
      setMessage({ severity: 'error', text: 'Party is required to save.' });
      return;
    }
    const saved = seaImportPayableRepo.save(recomputePayableTotals(payable));
    setPayable(saved);
    setMessage({ severity: 'success', text: `Payable ${saved.creditNoteNo} saved.` });
  };

  const disabledActions: ToolbarAction[] = [];
  if (!payable) disabledActions.push('edit', 'delete', 'final');
  if (payable?.status.final) disabledActions.push('edit', 'delete', 'final');
  if (!editable) disabledActions.push('save');

  return (
    <PageShell
      breadcrumbs={['Freight', 'Transactions Menu (Sea Import)', 'Other Charges Payables (Sea-Import)']}
      title="Other Charges Payable (Sea-Import)"
      actions={!showList ? <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => { setShowList(true); setPayable(null); setEditable(false); setIsPrintingView(false); setMessage(null); }}>Back to List</Button> : undefined}
    >
      {message && (
        <Alert severity={message.severity} onClose={() => setMessage(null)} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      {showList ? (
        <>
          <TransactionToolbar actions={['new']} onAction={handleAction} />
          <SeaImportPayableGrid payables={seaImportPayableRepo.list()} onOpen={loadPayable} onEdit={editPayableFromList} onDelete={deletePayableFromList} onPrint={printPayableFromList} />
        </>
      ) : (
        <>
          {!isPrintingView && <TransactionToolbar actions={['new', 'edit', 'delete', 'final']} disabledActions={disabledActions} onAction={handleAction} />}

      {payable && (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Chip label={`Credit Note No: ${payable.creditNoteNo}`} color="primary" />
          {payable.status.final && <Chip label="FINAL" color="success" />}
          {editable && <Chip label="EDITING" color="info" variant="outlined" />}
        </Stack>
      )}

      <Tabs value={0} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label={isPrintingView ? 'Printing' : 'Entry'} />
      </Tabs>

      {!payable ? (
        <Alert severity="info">Click New to create a payable.</Alert>
      ) : (
        isPrintingView ? <SeaImportPayablePrintingTab payable={payable} /> : <SeaImportPayableEntryForm payable={payable} editable={editable} onChange={setPayable} />
      )}
        </>
      )}
    </PageShell>
  );
}
