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
import { AirImportJob } from '../../domain/airImportJob';
import { createEmptyAirImportJob } from '../../domain/airImportJobFactory';
import { airImportJobRepo, nextAirImportJobNo, voidAirImportJob, ensureAirImportJobDemo } from '../../data/airImportJobService';
import { JobEntryForm } from './JobEntryForm';
import { PrintingTab } from './PrintingTab';
import { AirImportJobGrid } from './AirImportJobGrid';

export function AirImportJobPage() {
  ensureAirImportJobDemo();
  const [job, setJob] = useState<AirImportJob | null>(null);
  const [editable, setEditable] = useState(false);
  const [tab, setTab] = useState(0);
  const [showList, setShowList] = useState(true);
  const [printingOnly, setPrintingOnly] = useState(false);
  const [message, setMessage] = useState<{ severity: 'success' | 'error' | 'warning'; text: string } | null>(null);

  const loadJob = (j: AirImportJob) => {
    setJob(j);
    setEditable(false);
    setTab(0);
    setPrintingOnly(false);
    setShowList(false);
  };

  const handleAction = (action: ToolbarAction) => {
    switch (action) {
      case 'new': {
        const draft = createEmptyAirImportJob();
        draft.jobNo = nextAirImportJobNo(draft.branch);
        setJob(draft);
        setEditable(true);
        setTab(0);
        setPrintingOnly(false);
        setShowList(false);
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
        airImportJobRepo.remove(job.id);
        setJob(null);
        setMessage({ severity: 'success', text: 'Job deleted.' });
        break;
      }
      case 'final': {
        if (!job) return;
        if (!job.mawbNo || !job.partyCode) {
          setMessage({ severity: 'error', text: 'MAWB No. and Party Code are required before finalizing.' });
          return;
        }
        const saved = airImportJobRepo.save({ ...job, status: { ...job.status, final: true } });
        setJob(saved);
        setEditable(false);
        setMessage({ severity: 'success', text: `Job ${saved.jobNo} finalized.` });
        break;
      }
      case 'void': {
        if (!job) return;
        const updated = voidAirImportJob(job.id);
        if (updated) {
          setJob(updated);
          setMessage({ severity: 'success', text: `Job ${updated.jobNo} voided.` });
        }
        break;
      }
      case 'copy': {
        if (!job) return;
        const draft: AirImportJob = {
          ...job,
          id: crypto.randomUUID(),
          jobNo: nextAirImportJobNo(job.branch),
          mawbNo: '',
          hawbNo: '',
          houseAirwayBills: [],
          status: { final: false, void: false, posted: false, closed: false },
        };
        setJob(draft);
        setEditable(true);
        setMessage({ severity: 'success', text: `Copied into new draft job ${draft.jobNo}.` });
        break;
      }
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
    const saved = airImportJobRepo.save(job);
    setJob(saved);
    setMessage({ severity: 'success', text: `Job ${saved.jobNo} saved.` });
  };

  const disabledActions: ToolbarAction[] = [];
  if (!job) disabledActions.push('edit', 'delete', 'final', 'void', 'copy');
  if (job?.status.final) disabledActions.push('edit', 'delete', 'final');
  if (job?.status.void) disabledActions.push('final', 'edit');
  if (!editable || tab !== 0 || printingOnly) disabledActions.push('save');

  return (
    <PageShell breadcrumbs={['Freight', 'Transactions Menu (Air Import)', 'Inbond Shipments Entry and Documents Printing (Air-Import)']} title="Inbond Shipments (Air - Import)">
      {message && (
        <Alert severity={message.severity} onClose={() => setMessage(null)} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      {showList ? (
        <>
          <TransactionToolbar actions={['new']} onAction={handleAction} />
          <AirImportJobGrid
            jobs={airImportJobRepo.list()}
            onOpen={loadJob}
            onEdit={(item) => { setJob(item); setEditable(true); setTab(0); setPrintingOnly(false); setShowList(false); }}
            onDelete={(item) => { airImportJobRepo.remove(item.id); setMessage({ severity: 'success', text: 'Job deleted.' }); }}
            onPrint={(item) => { setJob(item); setEditable(false); setTab(0); setPrintingOnly(true); setShowList(false); }}
          />
        </>
      ) : (
        <>
          <Stack direction="row" justifyContent="flex-end" sx={{ mb: 1 }}><Button startIcon={<ArrowBackIcon />} onClick={() => { setPrintingOnly(false); setShowList(true); }}>Back to List</Button></Stack>
          {!printingOnly && <TransactionToolbar actions={['save', 'final', 'void', 'copy']} disabledActions={disabledActions} onAction={handleAction} />}

      {job && (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Chip label={`Job No: ${job.jobNo}`} color="primary" />
          {job.status.final && <Chip label="FINAL" color="success" />}
          {job.status.void && <Chip label="VOID" color="warning" />}
          {editable && <Chip label="EDITING" color="info" variant="outlined" />}
        </Stack>
      )}

      <Tabs value={0} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label={printingOnly ? 'Printing' : 'Entry'} />
      </Tabs>

      {!job ? (
        <Alert severity="info">Click New to create a job.</Alert>
      ) : (
        printingOnly ? <PrintingTab job={job} /> : <JobEntryForm job={job} editable={editable} onChange={setJob} />
      )}
        </>
      )}
    </PageShell>
  );
}
