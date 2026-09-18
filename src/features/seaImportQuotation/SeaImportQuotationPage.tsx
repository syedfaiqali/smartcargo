import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { PageShell } from '../../layout/PageShell';
import { TransactionToolbar, ToolbarAction } from '../../components/TransactionToolbar';
import { SeaImportQuotation } from '../../domain/seaImportQuotation';
import { createEmptySeaImportQuotation } from '../../domain/seaImportQuotationFactory';
import { seaImportQuotationRepo, nextSeaImportQuotationNo, ensureSeaImportQuotationDemo } from '../../data/seaImportQuotationService';
import { recomputeQuotationTotals } from './quotationCalculations';
import { SeaImportQuotationEntryForm } from './SeaImportQuotationEntryForm';
import { SeaImportQuotationGrid } from './SeaImportQuotationGrid';
import { SeaImportQuotationPrintingTab } from './SeaImportQuotationPrintingTab';

export function SeaImportQuotationPage() {
  ensureSeaImportQuotationDemo();
  const [quotation, setQuotation] = useState<SeaImportQuotation | null>(null);
  const [editable, setEditable] = useState(false);
  const [showList, setShowList] = useState(true);
  const [isPrintingView, setIsPrintingView] = useState(false);
  const [message, setMessage] = useState<{ severity: 'success' | 'error' | 'warning'; text: string } | null>(null);

  const loadQuotation = (q: SeaImportQuotation) => {
    setQuotation(q);
    setEditable(false);
    setShowList(false);
    setIsPrintingView(false);
  };

  const editQuotationFromList = (q: SeaImportQuotation) => {
    if (q.status.final) {
      setMessage({ severity: 'warning', text: 'This quotation is FINAL and cannot be edited.' });
      return;
    }
    setQuotation(q);
    setEditable(true);
    setShowList(false);
    setIsPrintingView(false);
  };

  const deleteQuotationFromList = (q: SeaImportQuotation) => {
    seaImportQuotationRepo.remove(q.id);
    setMessage({ severity: 'success', text: `Quotation ${q.quotationNo} deleted.` });
  };

  const printQuotationFromList = (q: SeaImportQuotation) => {
    setQuotation(q);
    setEditable(false);
    setShowList(false);
    setIsPrintingView(true);
  };

  const backToList = () => {
    setShowList(true);
    setQuotation(null);
    setEditable(false);
    setIsPrintingView(false);
    setMessage(null);
  };

  const handleAction = (action: ToolbarAction) => {
    switch (action) {
      case 'new': {
        const draft = createEmptySeaImportQuotation();
        draft.quotationNo = nextSeaImportQuotationNo(draft.branch);
        setQuotation(draft);
        setEditable(true);
        setShowList(false);
        setIsPrintingView(false);
        setMessage(null);
        break;
      }
      case 'save':
        handleSave();
        break;
      case 'delete': {
        if (!quotation) return;
        seaImportQuotationRepo.remove(quotation.id);
        setQuotation(null);
        setMessage({ severity: 'success', text: 'Quotation deleted.' });
        break;
      }
      case 'final': {
        if (!quotation) return;
        if (!quotation.partyCode) {
          setMessage({ severity: 'error', text: 'Party Code is required before finalizing.' });
          return;
        }
        const saved = seaImportQuotationRepo.save({ ...quotation, status: { final: true } });
        setQuotation(saved);
        setEditable(false);
        setMessage({ severity: 'success', text: `Quotation ${saved.quotationNo} finalized.` });
        break;
      }
      default:
        break;
    }
  };

  const handleSave = () => {
    if (!quotation) return;
    if (!quotation.partyCode) {
      setMessage({ severity: 'error', text: 'Party Code is required to save.' });
      return;
    }
    const saved = seaImportQuotationRepo.save(recomputeQuotationTotals(quotation));
    setQuotation(saved);
    setMessage({ severity: 'success', text: `Quotation ${saved.quotationNo} saved.` });
  };

  const disabledActions: ToolbarAction[] = [];
  if (!quotation) disabledActions.push('delete', 'final');
  if (quotation?.status.final) disabledActions.push('final');
  if (!editable) disabledActions.push('save');

  return (
    <PageShell
      breadcrumbs={['Freight', 'Quotations']}
      title="Quotations"
      actions={!showList ? <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={backToList}>Back to List</Button> : undefined}
    >
      {message && (
        <Alert severity={message.severity} onClose={() => setMessage(null)} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      {showList ? (
        <>
          <TransactionToolbar actions={['new']} onAction={handleAction} />
          <SeaImportQuotationGrid
            quotations={seaImportQuotationRepo.list()}
            onOpen={loadQuotation}
            onEdit={editQuotationFromList}
            onDelete={deleteQuotationFromList}
            onPrint={printQuotationFromList}
          />
        </>
      ) : (
        <>
          {!isPrintingView && (
            <TransactionToolbar actions={editable ? ['delete', 'final', 'save'] : ['delete', 'final']} disabledActions={disabledActions} onAction={handleAction} />
          )}

          {quotation && (
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <Chip label={`Quotation No: ${quotation.quotationNo}`} color="primary" />
              {quotation.status.final && <Chip label="FINAL" color="success" />}
              {editable && <Chip label="EDITING" color="info" variant="outlined" />}
            </Stack>
          )}

          {quotation && (
            isPrintingView ? (
              <SeaImportQuotationPrintingTab quotation={quotation} />
            ) : (
              <SeaImportQuotationEntryForm quotation={quotation} editable={editable} onChange={setQuotation} />
            )
          )}
        </>
      )}
    </PageShell>
  );
}
