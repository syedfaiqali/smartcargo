import { useState } from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
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

const TAB_LABELS = ['Entry', 'Charges', 'K.B.', 'Remarks', 'Detail/Search', 'Printing'] as const;

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
  const [originalMawb, setOriginalMawb] = useState<string>('');
  const [originalParentJobNo, setOriginalParentJobNo] = useState<string>('');
  const [message, setMessage] = useState<{ severity: 'success' | 'error' | 'warning'; text: string } | null>(null);

  const loadJob = (j: Job) => {
    setJob(j);
    setOriginalMawb(j.mawbNo);
    setOriginalParentJobNo(j.parentJobNo ?? '');
    setEditable(false);
    setTab(0);
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
        setTab(0);
        setMessage(null);
        break;
      }
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
        setMessage({ severity: 'success', text: `Copied into new draft job ${draft.jobNo}.` });
        break;
      }
      case 'search':
        setTab(4);
        break;
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

  return (
    <PageShell breadcrumbs={breadcrumbs} title={title}>
      {message && (
        <Alert severity={message.severity} onClose={() => setMessage(null)} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      <TransactionToolbar
        actions={['search', 'new', 'edit', 'delete', 'final', 'void', 'copy']}
        disabledActions={disabledActions}
        onAction={handleAction}
      />

      {job && (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Chip label={`Job No: ${job.jobNo}`} color="primary" />
          {kind === 'HAWB' && <Chip label={`HAWB No: ${job.hawbNo || '—'}`} variant="outlined" />}
          {job.status.final && <Chip label="FINAL" color="success" />}
          {job.status.void && <Chip label="VOID" color="warning" />}
          {editable && <Chip label="EDITING" color="info" variant="outlined" />}
        </Stack>
      )}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        {TAB_LABELS.map((label) => (
          <Tab key={label} label={label} />
        ))}
      </Tabs>

      {tab === 4 ? (
        <DetailSearchTab kind={kind} onOpenJob={loadJob} />
      ) : !job ? (
        <Alert severity="info">Click NEW to create a job, or use the Detail/Search tab to find an existing one.</Alert>
      ) : (
        <>
          {tab === 0 && <EntryTab job={job} editable={editable} onChange={setJob} />}
          {tab === 1 && <ChargesTab job={job} editable={editable} onChange={setJob} />}
          {tab === 2 && <KbTab job={job} editable={editable} onChange={setJob} />}
          {tab === 3 && <RemarksTab job={job} editable={editable} onChange={setJob} />}
          {tab === 5 && <PrintingTab job={job} editable={editable} onChange={setJob} />}

          {editable && tab !== 4 && (
            <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
              <Chip label="SAVE" color="primary" onClick={handleSave} sx={{ cursor: 'pointer', px: 2, py: 2.5, fontWeight: 700 }} />
            </Box>
          )}
        </>
      )}
    </PageShell>
  );
}
