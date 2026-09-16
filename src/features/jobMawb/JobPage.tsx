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
import { Job, JobKind } from '../../domain/job';
import { createEmptyJob } from '../../domain/jobFactory';
import { jobRepo, nextJobNo, nextHawbNo, voidJob, syncHouseAwbsOnMaster } from '../../data/jobService';
import { consumeAwb, isAwbAvailable, releaseAwb } from '../../data/awbStockService';
import { airlineRepo } from '../../data/masterDataService';
import { EntryTab } from './tabs/EntryTab';
import { ChargesTab } from './tabs/ChargesTab';
import { KbTab } from './tabs/KbTab';
import { RemarksTab } from './tabs/RemarksTab';
import { DetailSearchTab } from './tabs/DetailSearchTab';
import { PrintingTab } from './tabs/PrintingTab';

const TAB_LABELS = ['Entry', 'Charges', 'K.B.', 'Remarks'] as const;

function guessAirlineFromMawb(mawbNo: string): string | undefined {
  const prefix = mawbNo.split('-')[0];
  return airlineRepo.list().find((a) => a.code === prefix)?.code ?? airlineRepo.list()[0]?.code;
}

interface JobPageProps {
  kind: JobKind;
  breadcrumbs: string[];
  title: string;
}

export function JobPage({ kind, breadcrumbs, title }: JobPageProps) {
  const [tab, setTab] = useState(0);
  const [job, setJob] = useState<Job | null>(null);
  const [editable, setEditable] = useState(false);
  const [isPrintingView, setIsPrintingView] = useState(false);
  const [originalMawb, setOriginalMawb] = useState<string>('');
  const [originalParentJobNo, setOriginalParentJobNo] = useState<string>('');
  const [message, setMessage] = useState<{ severity: 'success' | 'error' | 'warning'; text: string } | null>(null);

  const loadJob = (j: Job) => {
    setJob(j);
    setOriginalMawb(j.mawbNo);
    setOriginalParentJobNo(j.parentJobNo ?? '');
    setEditable(false);
    setIsPrintingView(false);
    setTab(0);
  };

  const editJobFromList = (j: Job) => {
    if (j.status.final) {
      setMessage({ severity: 'warning', text: 'This job is FINAL and cannot be edited.' });
      return;
    }
    loadJob(j);
    setEditable(true);
  };

  const printJobFromList = (j: Job) => {
    loadJob(j);
    setEditable(true);
    setIsPrintingView(true);
  };

  const deleteJobFromList = (j: Job) => {
    jobRepo.remove(j.id);
    if (kind === 'MAWB' && j.mawbNo) releaseAwb(j.mawbNo, guessAirlineFromMawb(j.mawbNo) ?? '');
    if (kind === 'HAWB' && j.parentJobNo) syncHouseAwbsOnMaster(j.parentJobNo);
    setMessage({ severity: 'success', text: `Job ${j.jobNo} deleted.` });
  };

  const handleAction = (action: ToolbarAction) => {
    switch (action) {
      case 'new': {
        const draft = createEmptyJob(kind);
        draft.jobNo = nextJobNo(kind, draft.branch);
        if (kind === 'HAWB') draft.hawbNo = nextHawbNo(draft.branch);
        setJob(draft);
        setOriginalMawb('');
        setOriginalParentJobNo('');
        setEditable(true);
        setIsPrintingView(false);
        setTab(0);
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
        setIsPrintingView(false);
        break;
      }
      case 'delete': {
        if (!job) return;
        jobRepo.remove(job.id);
        if (kind === 'MAWB' && job.mawbNo) releaseAwb(job.mawbNo, guessAirlineFromMawb(job.mawbNo) ?? '');
        if (kind === 'HAWB' && job.parentJobNo) syncHouseAwbsOnMaster(job.parentJobNo);
        setJob(null);
        setMessage({ severity: 'success', text: 'Job deleted.' });
        break;
      }
      case 'final': {
        if (!job) return;
        if (kind === 'MAWB' && !job.mawbNo) {
          setMessage({ severity: 'error', text: 'MAWB No. is required before finalizing.' });
          return;
        }
        if (kind === 'HAWB' && !job.parentJobNo) {
          setMessage({ severity: 'error', text: 'Master Job No. (MAWB) is required before finalizing.' });
          return;
        }
        const saved = persistJob(job, true);
        if (saved) {
          setJob(saved);
          setEditable(false);
          setMessage({ severity: 'success', text: `Job ${saved.jobNo} finalized.` });
        }
        break;
      }
      case 'void': {
        if (!job) return;
        const updated = voidJob(job.id);
        if (updated) {
          setJob(updated);
          setMessage({ severity: 'success', text: `Job ${updated.jobNo} voided.` });
        }
        break;
      }
      case 'copy': {
        if (!job) return;
        const draft: Job = {
          ...job,
          id: crypto.randomUUID(),
          jobNo: nextJobNo(kind, job.branch),
          hawbNo: kind === 'HAWB' ? nextHawbNo(job.branch) : job.hawbNo,
          mawbNo: kind === 'MAWB' ? '' : job.mawbNo,
          parentJobNo: kind === 'HAWB' ? job.parentJobNo : undefined,
          status: { final: false, void: false, posted: false },
        };
        setJob(draft);
        setOriginalMawb('');
        setOriginalParentJobNo('');
        setEditable(true);
        setIsPrintingView(false);
        setMessage({ severity: 'success', text: `Copied into new draft job ${draft.jobNo}.` });
        break;
      }
      default:
        break;
    }
  };

  const persistJob = (current: Job, finalize = false): Job | null => {
    if (kind === 'MAWB') {
      if (!current.mawbNo) {
        setMessage({ severity: 'error', text: 'MAWB No. is required to save.' });
        return null;
      }
      const airline = guessAirlineFromMawb(current.mawbNo) ?? '';

      // Consume the newly-assigned MAWB No. against AWB Stock if it changed.
      if (current.mawbNo !== originalMawb) {
        if (originalMawb) releaseAwb(originalMawb, airline);
        if (!isAwbAvailable(current.mawbNo, airline)) {
          setMessage({
            severity: 'error',
            text: `MAWB No. ${current.mawbNo} is not an Un-Used AWB in stock for airline ${airline}. Register it first on the Air Waybill Stock screen.`,
          });
          return null;
        }
        consumeAwb(current.mawbNo, airline, current.jobNo, current.awbDate || current.jobDate);
        setOriginalMawb(current.mawbNo);
      }
    } else {
      if (!current.parentJobNo) {
        setMessage({ severity: 'error', text: 'Master Job No. (MAWB) is required to save.' });
        return null;
      }
    }

    const toSave: Job = finalize ? { ...current, status: { ...current.status, final: true } } : current;
    const saved = jobRepo.save(toSave);

    if (kind === 'HAWB') {
      // Keep the Master's "House Air Waybills" grid (docs 2.8) in sync with this House job.
      if (originalParentJobNo && originalParentJobNo !== saved.parentJobNo) {
        syncHouseAwbsOnMaster(originalParentJobNo);
      }
      if (saved.parentJobNo) {
        syncHouseAwbsOnMaster(saved.parentJobNo);
        setOriginalParentJobNo(saved.parentJobNo);
      }
    }

    return saved;
  };

  const handleSave = () => {
    if (!job) return;
    const saved = persistJob(job);
    if (saved) {
      setJob(saved);
      setMessage({ severity: 'success', text: `Job ${saved.jobNo} saved.` });
    }
  };

  const disabledActions: ToolbarAction[] = [];
  if (!job) disabledActions.push('edit', 'delete', 'final', 'void', 'copy');
  if (job?.status.final) disabledActions.push('edit', 'delete', 'final');
  if (job?.status.void) disabledActions.push('final', 'edit');
  if (!editable) disabledActions.push('save');

  return (
    <PageShell
      breadcrumbs={breadcrumbs}
      title={title}
      actions={job ? (
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => { setJob(null); setEditable(false); setIsPrintingView(false); setTab(0); setMessage(null); }}
        >
          Back to List
        </Button>
      ) : undefined}
    >
      {message && (
        <Alert severity={message.severity} onClose={() => setMessage(null)} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      {!isPrintingView && (!job || tab === 0) && (
          <TransactionToolbar
          actions={job ? ['save', 'final', 'void', 'copy'] : ['new']}
          disabledActions={disabledActions}
          onAction={handleAction}
        />
      )}

      {job && !isPrintingView && (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Chip label={`Job No: ${job.jobNo}`} color="primary" />
          {kind === 'HAWB' && <Chip label={`HAWB No: ${job.hawbNo || '—'}`} variant="outlined" />}
          {job.status.final && <Chip label="FINAL" color="success" />}
          {job.status.void && <Chip label="VOID" color="warning" />}
          {editable && <Chip label="EDITING" color="info" variant="outlined" />}
        </Stack>
      )}

      {job && isPrintingView && (
        <Tabs value={0} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider', '& .MuiTab-root': { fontWeight: 700 } }}>
          <Tab label="Printing" />
        </Tabs>
      )}

      {job && !isPrintingView && (
        <Tabs
          value={tab}
          onChange={(_, v) => { setTab(v); setIsPrintingView(false); }}
          sx={{
            mb: 2,
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': { fontWeight: 700, color: '#334155' },
            '& .Mui-selected': { color: '#123b72' },
          }}
        >
          {TAB_LABELS.map((label) => (
            <Tab key={label} label={label} />
          ))}
        </Tabs>
      )}

      {!job ? (
        <DetailSearchTab kind={kind} onOpenJob={loadJob} onEditJob={editJobFromList} onDeleteJob={deleteJobFromList} onPrintJob={printJobFromList} />
      ) : (
        <Box
          sx={{
            '& .MuiInputBase-input, & .MuiSelect-select': { fontWeight: 600, color: '#172554' },
            '& .MuiInputLabel-root': { fontWeight: 600, color: '#475569' },
            '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: '#172554', opacity: 1, fontWeight: 600 },
          }}
        >
          {isPrintingView ? <PrintingTab job={job} editable={editable} onChange={setJob} /> : <>
            {tab === 0 && <EntryTab job={job} editable={editable} onChange={setJob} />}
            {tab === 1 && <ChargesTab job={job} editable={editable} onChange={setJob} />}
            {tab === 2 && <KbTab job={job} editable={editable} onChange={setJob} />}
            {tab === 3 && <RemarksTab job={job} editable={editable} onChange={setJob} />}
          </>}

        </Box>
      )}
    </PageShell>
  );
}
