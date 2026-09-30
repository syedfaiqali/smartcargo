import { useState } from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { PageShell } from '../../layout/PageShell';
import { TransactionToolbar, ToolbarAction } from '../../components/TransactionToolbar';
import { SeaExportJob } from '../../domain/seaExportJob';
import { createEmptySeaExportJob } from '../../domain/seaExportJobFactory';
import { seaExportJobRepo, nextSeaJobNo, voidSeaJob, closeSeaJob } from '../../data/seaExportJobService';
import { EntryTab } from './tabs/EntryTab';
import { BlScreenTab } from './tabs/BlScreenTab';
import { ContainerTab } from './tabs/ContainerTab';
import { JobChargesTab } from './tabs/JobChargesTab';
import { DetailSearchTab } from './tabs/DetailSearchTab';
import { PrintingTab } from './tabs/PrintingTab';
import { ConsolTab } from './tabs/ConsolTab';
import { InstructionLetterTab } from './tabs/InstructionLetterTab';
import { SeaExportJobGrid } from './SeaExportJobGrid';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setCurrentSeaExportJob } from '../../store/seaExportJobSlice';

const TAB_LABELS = ['Entry', 'B/L Screen', 'Container', 'Job Charges', 'Consol', 'Instruction Letter'] as const;

export function SeaExportJobPage() {
  const dispatch = useAppDispatch();
  const [tab, setTab] = useState(0);
  const [showList, setShowList] = useState(true);
  const [isPrintingView, setIsPrintingView] = useState(false);
  const job = useAppSelector((state) => state.seaExportJob.currentJob);
  const setJob = (nextJob: SeaExportJob | null) => dispatch(setCurrentSeaExportJob(nextJob));
  const [editable, setEditable] = useState(false);
  const [message, setMessage] = useState<{ severity: 'success' | 'error' | 'warning'; text: string } | null>(null);

  const loadJob = (j: SeaExportJob) => {
    setJob(j);
    setEditable(false);
    setTab(0);
    setShowList(false);
    setIsPrintingView(false);
  };

  const editJobFromList = (j: SeaExportJob) => { if (j.status.final) { setMessage({ severity: 'warning', text: 'This job is FINAL and cannot be edited.' }); return; } setJob(j); setEditable(true); setTab(0); setShowList(false); };
  const deleteJobFromList = (j: SeaExportJob) => { seaExportJobRepo.remove(j.id); setMessage({ severity: 'success', text: `Job ${j.jobNo} deleted.` }); };
  const printJobFromList = (j: SeaExportJob) => { setJob(j); setEditable(false); setTab(0); setShowList(false); setIsPrintingView(true); };

  const handleAction = (action: ToolbarAction) => {
    switch (action) {
      case 'new': {
        const draft = createEmptySeaExportJob();
        draft.jobNo = nextSeaJobNo(draft.branch);
        setJob(draft);
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
        if (!job) {
          setMessage({ severity: 'warning', text: 'Load a job first (SEARCH or Detail/Search tab).' });
          return;
        }
        if (job.status.final) {
          setMessage({ severity: 'warning', text: 'This job is FINAL and cannot be edited.' });
          return;
        }
        setEditable(true);
        break;
      }
      case 'delete': {
        if (!job) return;
        seaExportJobRepo.remove(job.id);
        setJob(null);
        setMessage({ severity: 'success', text: 'Job deleted.' });
        break;
      }
      case 'final': {
        if (!job) return;
        if (!job.jobType || !job.partyCode || !job.portOfLoad || !job.destination) {
          setMessage({ severity: 'error', text: 'Job Type, Party Code, Port of Load and Destination are required before finalizing.' });
          return;
        }
        const saved = seaExportJobRepo.save({ ...job, status: { ...job.status, final: true } });
        setJob(saved);
        setEditable(false);
        setMessage({ severity: 'success', text: `Job ${saved.jobNo} finalized.` });
        break;
      }
      case 'close': {
        if (!job) return;
        const updated = closeSeaJob(job.id);
        if (updated) {
          setJob(updated);
          setMessage({ severity: 'success', text: `Job ${updated.jobNo} closed.` });
        }
        break;
      }
      case 'void': {
        if (!job) return;
        const updated = voidSeaJob(job.id);
        if (updated) {
          setJob(updated);
          setMessage({ severity: 'success', text: `Job ${updated.jobNo} voided.` });
        }
        break;
      }
      case 'copy': {
        if (!job) return;
        const draft: SeaExportJob = {
          ...job,
          id: crypto.randomUUID(),
          jobNo: nextSeaJobNo(job.branch),
          mblNo: '',
          hblNo: '',
          bookingNo: '',
          containers: [],
          status: { final: false, void: false, posted: false, closed: false },
        };
        setJob(draft);
        setEditable(true);
        setMessage({ severity: 'success', text: `Copied into new draft job ${draft.jobNo}.` });
        break;
      }
      case 'search':
        setShowList(true);
        setJob(null);
        setEditable(false);
        setIsPrintingView(false);
        break;
      default:
        break;
    }
  };

  const handleSave = () => {
    if (!job) return;
    if (!job.partyCode) {
      setMessage({ severity: 'error', text: 'Party Code is required to save.' });
      return;
    }
    const saved = seaExportJobRepo.save(job);
    setJob(saved);
    setMessage({ severity: 'success', text: `Job ${saved.jobNo} saved.` });
  };

  const disabledActions: ToolbarAction[] = [];
  if (!job) disabledActions.push('edit', 'delete', 'final', 'void', 'copy', 'close');
  if (job?.status.final) disabledActions.push('edit', 'delete', 'final');
  if (job?.status.void || job?.status.closed) disabledActions.push('final', 'edit', 'close');
  if (!editable || isPrintingView) disabledActions.push('save');

  return (
    <PageShell breadcrumbs={['Freight', 'Transactions Menu (Sea Export)', 'Jobs Entry and Documents Printing (Sea-Export)']} title="Jobs Entry and Documents Printing (Sea-Export)" actions={!showList ? <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => { setShowList(true); setJob(null); setEditable(false); setTab(0); setIsPrintingView(false); setMessage(null); }}>Back to List</Button> : undefined}>
      {message && (
        <Alert severity={message.severity} onClose={() => setMessage(null)} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      {showList ? <><TransactionToolbar actions={['new']} onAction={handleAction} /><SeaExportJobGrid jobs={seaExportJobRepo.list()} onOpen={loadJob} onEdit={editJobFromList} onDelete={deleteJobFromList} onPrint={printJobFromList} /></> : <>{!isPrintingView && <TransactionToolbar
        actions={['save', 'final', 'void', 'copy']}
        disabledActions={disabledActions}
        onAction={handleAction}
      />}

      <Box sx={{ '& .MuiInputBase-input, & .MuiSelect-select': { color: '#172554', fontWeight: 700 }, '& .MuiInputLabel-root': { color: '#475569', fontWeight: 700 }, '& .MuiInputBase-input.Mui-disabled, & .MuiSelect-select.Mui-disabled': { WebkitTextFillColor: '#172554', color: '#172554', opacity: 1, fontWeight: 700 }, '& .MuiInputLabel-root.Mui-disabled': { color: '#475569', opacity: 1, fontWeight: 700 }, '& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline': { borderColor: '#cbd5e1' } }}>
      {job && (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Chip label={`Job No: ${job.jobNo}`} color="primary" />
          {job.status.final && <Chip label="FINAL" color="success" />}
          {job.status.closed && <Chip label="CLOSED" />}
          {job.status.void && <Chip label="VOID" color="warning" />}
          {editable && <Chip label="EDITING" color="info" variant="outlined" />}
        </Stack>
      )}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        {(isPrintingView ? ['Printing'] : TAB_LABELS).map((label) => (
          <Tab key={label} label={label} />
        ))}
      </Tabs>

      {!job ? (
        <Alert severity="info">Click NEW to create a job.</Alert>
      ) : (
        <>
          {!isPrintingView && <>
            {tab === 0 && <EntryTab job={job} editable={editable} onChange={setJob} />}
            {tab === 1 && <BlScreenTab job={job} editable={editable} onChange={setJob} />}
            {tab === 2 && <ContainerTab job={job} editable={editable} onChange={setJob} />}
            {tab === 3 && <JobChargesTab job={job} editable={editable} onChange={setJob} />}
          </>}
          {isPrintingView ? <PrintingTab job={job} editable={editable} onChange={setJob} /> : <><>{tab === 4 && <ConsolTab job={job} editable={editable} onChange={setJob} />}</>{tab === 5 && <InstructionLetterTab job={job} editable={editable} onChange={setJob} />}</>}

        </>
      )}
      </Box></>}
    </PageShell>
  );
}
