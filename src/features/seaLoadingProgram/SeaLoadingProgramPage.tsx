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
import { SeaLoadingProgram } from '../../domain/seaLoadingProgram';
import { createEmptySeaLoadingProgram } from '../../domain/seaLoadingProgramFactory';
import { seaLoadingProgramRepo, nextLoadProgramNo, ensureLoadingProgramDemo } from '../../data/seaLoadingProgramService';
import { LoadingProgramEntryForm } from './LoadingProgramEntryForm';
import { LoadingProgramGrid } from './LoadingProgramGrid';
import { LoadingProgramPrintingTab } from './LoadingProgramPrintingTab';

export function SeaLoadingProgramPage() {
  ensureLoadingProgramDemo();
  const [program, setProgram] = useState<SeaLoadingProgram | null>(null);
  const [editable, setEditable] = useState(false);
  const [showList, setShowList] = useState(true);
  const [tab, setTab] = useState(0);
  const [isPrintingView, setIsPrintingView] = useState(false);
  const [message, setMessage] = useState<{ severity: 'success' | 'error' | 'warning'; text: string } | null>(null);

  const loadProgram = (p: SeaLoadingProgram) => {
    setProgram(p);
    setEditable(false);
    setShowList(false);
    setTab(0);
    setIsPrintingView(false);
  };

  const editProgramFromList = (p: SeaLoadingProgram) => {
    if (p.status.final) {
      setMessage({ severity: 'warning', text: 'This loading program is FINAL and cannot be edited.' });
      return;
    }
    setProgram(p);
    setEditable(true);
    setShowList(false);
    setTab(0);
    setIsPrintingView(false);
  };

  const deleteProgramFromList = (p: SeaLoadingProgram) => {
    seaLoadingProgramRepo.remove(p.id);
    setMessage({ severity: 'success', text: `Loading program ${p.loadProgramNo} deleted.` });
  };

  const printProgramFromList = (p: SeaLoadingProgram) => {
    setProgram(p);
    setEditable(false);
    setShowList(false);
    setTab(0);
    setIsPrintingView(true);
  };

  const handleAction = (action: ToolbarAction) => {
    switch (action) {
      case 'new': {
        const draft = createEmptySeaLoadingProgram();
        draft.loadProgramNo = nextLoadProgramNo(draft.branch);
        setProgram(draft);
        setEditable(true);
        setShowList(false);
        setTab(0);
        setIsPrintingView(false);
        setMessage(null);
        break;
      }
      case 'save':
        handleSave();
        break;
      case 'edit': {
        if (!program) {
          setMessage({ severity: 'warning', text: 'Load a loading program first (SEARCH).' });
          return;
        }
        if (program.status.final) {
          setMessage({ severity: 'warning', text: 'This loading program is FINAL and cannot be edited.' });
          return;
        }
        setEditable(true);
        break;
      }
      case 'delete': {
        if (!program) return;
        seaLoadingProgramRepo.remove(program.id);
        setProgram(null);
        setMessage({ severity: 'success', text: 'Loading program deleted.' });
        break;
      }
      case 'search':
        setShowList(true);
        setProgram(null);
        setEditable(false);
        setTab(0);
        break;
      default:
        break;
    }
  };

  const handleSave = () => {
    if (!program) return;
    if (!program.partyCode) {
      setMessage({ severity: 'error', text: 'Party Code is required to save.' });
      return;
    }
    const saved = seaLoadingProgramRepo.save(program);
    setProgram(saved);
    setMessage({ severity: 'success', text: `Loading program ${saved.loadProgramNo} saved.` });
  };

  const disabledActions: ToolbarAction[] = [];
  if (!program) disabledActions.push('edit', 'delete');
  if (program?.status.final) disabledActions.push('edit', 'delete');
  if (!editable || tab !== 0) disabledActions.push('save');

  return (
    <PageShell
      breadcrumbs={['Freight', 'Transactions Menu (Sea Export)', 'Loading Program Entry and Printing']}
      title="Loading Program (Sea-Export)"
      actions={!showList ? <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => { setShowList(true); setProgram(null); setEditable(false); setTab(0); setIsPrintingView(false); setMessage(null); }}>Back to List</Button> : undefined}
    >
      {message && (
        <Alert severity={message.severity} onClose={() => setMessage(null)} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      {showList ? (
        <>
          <TransactionToolbar actions={['new']} onAction={handleAction} />
          <LoadingProgramGrid programs={seaLoadingProgramRepo.list()} onOpen={loadProgram} onEdit={editProgramFromList} onDelete={deleteProgramFromList} onPrint={printProgramFromList} />
        </>
      ) : (
        <>
          {!isPrintingView && <TransactionToolbar
            actions={['save']}
            disabledActions={disabledActions}
            onAction={handleAction}
          />}

          {program && (
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <Chip label={`Load Program No: ${program.loadProgramNo}`} color="primary" />
              {program.status.final && <Chip label="FINAL" color="success" />}
              {editable && <Chip label="EDITING" color="info" variant="outlined" />}
            </Stack>
          )}

          <Tabs value={0} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Tab label={isPrintingView ? 'Printing' : 'Entry'} />
          </Tabs>

          {!program ? (
            <Alert severity="info">Click New to create a loading program.</Alert>
          ) : (
            <>
              {isPrintingView ? <LoadingProgramPrintingTab program={program} /> : <LoadingProgramEntryForm program={program} editable={editable} onChange={setProgram} />}
            </>
          )}
        </>
      )}
    </PageShell>
  );
}
