import { useState } from 'react';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import { PageShell } from '../../layout/PageShell';
import { TransactionToolbar, ToolbarAction } from '../../components/TransactionToolbar';
import { OtherChargesPayable } from '../../domain/otherChargesPayable';
import { createEmptyOtherChargesPayable } from '../../domain/otherChargesPayableFactory';
import { payableRepo, nextCreditNoteNo } from '../../data/otherChargesPayableService';
import { recomputePayableTotals } from './payableCalculations';
import { PayableEntryForm } from './PayableEntryForm';
import { PayableSearchPanel } from './PayableSearchPanel';

export function OtherChargesPayablePage() {
  const [payable, setPayable] = useState<OtherChargesPayable | null>(null);
  const [editable, setEditable] = useState(false);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState<{ severity: 'success' | 'error' | 'warning'; text: string } | null>(null);

  const loadPayable = (p: OtherChargesPayable) => {
    setPayable(p);
    setEditable(false);
    setSearching(false);
  };

  const handleAction = (action: ToolbarAction) => {
    switch (action) {
      case 'new': {
        const draft = createEmptyOtherChargesPayable();
        draft.creditNoteNo = nextCreditNoteNo(draft.branch);
        setPayable(draft);
        setEditable(true);
        setSearching(false);
        setMessage(null);
        break;
      }
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
        payableRepo.remove(payable.id);
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
        const saved = payableRepo.save({ ...payable, status: { final: true } });
        setPayable(saved);
        setEditable(false);
        setMessage({ severity: 'success', text: `Payable ${saved.creditNoteNo} finalized.` });
        break;
      }
      case 'search':
        setSearching(true);
        break;
      default:
        break;
    }
  };

  const handleSave = () => {
    if (!payable) return;
    if (!payable.partyCode) {
      setMessage({ severity: 'error', text: 'Party (Vendor) is required to save.' });
      return;
    }
    const saved = payableRepo.save(recomputePayableTotals(payable));
    setPayable(saved);
    setMessage({ severity: 'success', text: `Payable ${saved.creditNoteNo} saved.` });
  };

  const disabledActions: ToolbarAction[] = [];
  if (!payable) disabledActions.push('edit', 'delete', 'final');
  if (payable?.status.final) disabledActions.push('edit', 'delete', 'final');

  return (
    <PageShell breadcrumbs={['Freight', 'Transactions Menu (Air Export)', 'Other Charges Payable']} title="Other Charges Payable (Air-Export)">
      {message && (
        <Alert severity={message.severity} onClose={() => setMessage(null)} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      <TransactionToolbar actions={['search', 'new', 'edit', 'delete', 'final']} disabledActions={disabledActions} onAction={handleAction} />

      {payable && !searching && (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Chip label={`Credit Note No: ${payable.creditNoteNo}`} color="primary" />
          {payable.status.final && <Chip label="FINAL" color="success" />}
          {editable && <Chip label="EDITING" color="info" variant="outlined" />}
        </Stack>
      )}

      {searching ? (
        <PayableSearchPanel onOpenPayable={loadPayable} />
      ) : !payable ? (
        <Alert severity="info">Click NEW to create a payable, or SEARCH to find an existing one.</Alert>
      ) : (
        <>
          <PayableEntryForm payable={payable} editable={editable} onChange={setPayable} />
          {editable && (
            <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
              <Chip label="SAVE" color="primary" onClick={handleSave} sx={{ cursor: 'pointer', px: 2, py: 2.5, fontWeight: 700 }} />
            </Box>
          )}
        </>
      )}
    </PageShell>
  );
}
