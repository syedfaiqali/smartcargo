import { useState } from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
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

const TAB_LABELS = ['Entry', 'B/L Screen', 'Container', 'Job Charges', 'Detail/Search', 'Printing', 'Consol', 'Instruction Letter'] as const;

export function SeaExportJobPage() {
  const [tab, setTab] = useState(0);
  const [job, setJob] = useState<SeaExportJob | null>(null);
  const [editable, setEditable] = useState(false);
  const [message, setMessage] = useState<{ severity: 'success' | 'error' | 'warning'; text: string } | null>(null);

  const loadJob = (j: SeaExportJob) => {
    setJob(j);
    setEditable(false);
    setTab(0);
  };

  const handleAction = (action: ToolbarAction) => {
    switch (action) {
      case 'new': {
        const draft = createEmptySeaExportJob();
        draft.jobNo = nextSeaJobNo(draft.branch);
        setJob(draft);
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
        setTab(4);
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

  return (
    <PageShell breadcrumbs={['Freight', 'Transactions Menu (Sea Export)', 'Jobs Entry and Documents Printing (Sea-Export)']} title="Jobs Entry and Documents Printing (Sea-Export)">
      {message && (
        <Alert severity={message.severity} onClose={() => setMessage(null)} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      <TransactionToolbar
        actions={['search', 'new', 'edit', 'delete', 'final', 'close', 'void', 'copy']}
        disabledActions={disabledActions}
        onAction={handleAction}
      />

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
        {TAB_LABELS.map((label) => (
          <Tab key={label} label={label} />
        ))}
      </Tabs>

      {tab === 4 ? (
        <DetailSearchTab onOpenJob={loadJob} />
      ) : !job ? (
        <Alert severity="info">Click NEW to create a job, or use the Detail/Search tab to find an existing one.</Alert>
      ) : (
        <>
          {tab === 0 && <EntryTab job={job} editable={editable} onChange={setJob} />}
          {tab === 1 && <BlScreenTab job={job} editable={editable} onChange={setJob} />}
          {tab === 2 && <ContainerTab job={job} editable={editable} onChange={setJob} />}
          {tab === 3 && <JobChargesTab job={job} editable={editable} onChange={setJob} />}
          {tab === 5 && <PrintingTab job={job} editable={editable} onChange={setJob} />}
          {tab === 6 && <ConsolTab job={job} editable={editable} onChange={setJob} />}
          {tab === 7 && <InstructionLetterTab job={job} editable={editable} onChange={setJob} />}

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
