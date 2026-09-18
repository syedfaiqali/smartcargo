import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { PageShell } from '../../layout/PageShell';
import { TransactionToolbar, ToolbarAction } from '../../components/TransactionToolbar';
import { DocumentReceipt } from '../../domain/documentReceipt';
import { createEmptyDocumentReceipt } from '../../domain/documentReceiptFactory';
import { documentReceiptRepo, nextDocumentReceiptNo, ensureDocumentReceiptDemo } from '../../data/documentReceiptService';
import { DocumentReceiptEntryForm } from './DocumentReceiptEntryForm';
import { DocumentReceiptGrid } from './DocumentReceiptGrid';
import { DocumentReceiptPrintingTab } from './DocumentReceiptPrintingTab';

export function DocumentReceiptPage() {
  ensureDocumentReceiptDemo();
  const [record, setRecord] = useState<DocumentReceipt | null>(null);
  const [editable, setEditable] = useState(false);
  const [showList, setShowList] = useState(true);
  const [isPrintingView, setIsPrintingView] = useState(false);
  const [message, setMessage] = useState<{ severity: 'success' | 'error' | 'warning'; text: string } | null>(null);

  const loadRecord = (r: DocumentReceipt) => {
    setRecord(r);
    setEditable(false);
    setShowList(false);
    setIsPrintingView(false);
  };

  const editRecordFromList = (r: DocumentReceipt) => {
    if (r.status.final) {
      setMessage({ severity: 'warning', text: 'This record is FINAL and cannot be edited.' });
      return;
    }
    setRecord(r);
    setEditable(true);
    setShowList(false);
    setIsPrintingView(false);
  };

  const deleteRecordFromList = (r: DocumentReceipt) => {
    documentReceiptRepo.remove(r.id);
    setMessage({ severity: 'success', text: `Document Receipt ${r.recordNo} deleted.` });
  };

  const printRecordFromList = (r: DocumentReceipt) => {
    setRecord(r);
    setEditable(false);
    setShowList(false);
    setIsPrintingView(true);
  };

  const backToList = () => {
    setShowList(true);
    setRecord(null);
    setEditable(false);
    setIsPrintingView(false);
    setMessage(null);
  };

  const handleAction = (action: ToolbarAction) => {
    switch (action) {
      case 'new': {
        const draft = createEmptyDocumentReceipt();
        draft.recordNo = nextDocumentReceiptNo(draft.branch);
        setRecord(draft);
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
        if (!record) return;
        documentReceiptRepo.remove(record.id);
        setRecord(null);
        setMessage({ severity: 'success', text: 'Document Receipt deleted.' });
        break;
      }
      case 'final': {
        if (!record) return;
        if (!record.partyCode) {
          setMessage({ severity: 'error', text: 'Party Code is required before finalizing.' });
          return;
        }
        const saved = documentReceiptRepo.save({ ...record, status: { final: true } });
        setRecord(saved);
        setEditable(false);
        setMessage({ severity: 'success', text: `Document Receipt ${saved.recordNo} finalized.` });
        break;
      }
      default:
        break;
    }
  };

  const handleSave = () => {
    if (!record) return;
    if (!record.partyCode) {
      setMessage({ severity: 'error', text: 'Party Code is required to save.' });
      return;
    }
    const saved = documentReceiptRepo.save(record);
    setRecord(saved);
    setMessage({ severity: 'success', text: `Document Receipt ${saved.recordNo} saved.` });
  };

  const disabledActions: ToolbarAction[] = [];
  if (!record) disabledActions.push('delete', 'final');
  if (record?.status.final) disabledActions.push('final');
  if (!editable) disabledActions.push('save');

  return (
    <PageShell
      breadcrumbs={['Freight', 'Transactions Menu (Sea Import)', 'Document Receipt']}
      title="Document Receipt"
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
          <DocumentReceiptGrid
            documents={documentReceiptRepo.list()}
            onOpen={loadRecord}
            onEdit={editRecordFromList}
            onDelete={deleteRecordFromList}
            onPrint={printRecordFromList}
          />
        </>
      ) : (
        <>
          {!isPrintingView && (
            <TransactionToolbar actions={editable ? ['delete', 'final', 'save'] : ['delete', 'final']} disabledActions={disabledActions} onAction={handleAction} />
          )}

          {record && (
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <Chip label={`Record No: ${record.recordNo}`} color="primary" />
              {record.status.final && <Chip label="FINAL" color="success" />}
              {editable && <Chip label="EDITING" color="info" variant="outlined" />}
            </Stack>
          )}

          {record && (
            isPrintingView ? (
              <DocumentReceiptPrintingTab document={record} />
            ) : (
              <DocumentReceiptEntryForm document={record} editable={editable} onChange={setRecord} />
            )
          )}
        </>
      )}
    </PageShell>
  );
}
