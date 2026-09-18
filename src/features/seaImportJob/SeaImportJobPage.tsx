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
import { SeaImportJob } from '../../domain/seaImportJob';
import { createEmptySeaImportJob } from '../../domain/seaImportJobFactory';
import { seaImportJobRepo, nextSeaImportJobNo, voidSeaImportJob, ensureSeaImportJobDemo } from '../../data/seaImportJobService';
import { JobEntryForm } from './JobEntryForm';
import { ContainerTab } from './ContainerTab';
import { PrintingTab } from './PrintingTab';
import { SeaImportJobGrid } from './SeaImportJobGrid';

export function SeaImportJobPage() {
  ensureSeaImportJobDemo();
  const [job, setJob] = useState<SeaImportJob | null>(null);
  const [editable, setEditable] = useState(false);
  const [tab, setTab] = useState(0);
  const [showList, setShowList] = useState(true);
  const [printingOnly, setPrintingOnly] = useState(false);
  const [message, setMessage] = useState<{ severity: 'success' | 'error' | 'warning'; text: string } | null>(null);

  const loadJob = (j: SeaImportJob) => {
    setJob(j);
    setEditable(false);
    setTab(0);
    setPrintingOnly(false);
    setShowList(false);
  };

  const handleAction = (action: ToolbarAction) => {
    switch (action) {
      case 'new': {
        const draft = createEmptySeaImportJob();
        draft.jobNo = nextSeaImportJobNo(draft.branch);
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
        seaImportJobRepo.remove(job.id);
        setJob(null);
        setMessage({ severity: 'success', text: 'Job deleted.' });
        break;
      }
      case 'final': {
        if (!job) return;
        if (!job.mblNo || !job.partyCode) {
          setMessage({ severity: 'error', text: 'MBL No. and Party Code are required before finalizing.' });
          return;
        }
        const saved = seaImportJobRepo.save({ ...job, status: { ...job.status, final: true } });
        setJob(saved);
        setEditable(false);
        setMessage({ severity: 'success', text: `Job ${saved.jobNo} finalized.` });
        break;
      }
      case 'void': {
        if (!job) return;
        const updated = voidSeaImportJob(job.id);
        if (updated) {
          setJob(updated);
          setMessage({ severity: 'success', text: `Job ${updated.jobNo} voided.` });
        }
        break;
      }
      case 'copy': {
        if (!job) return;
        const draft: SeaImportJob = {
          ...job,
          id: crypto.randomUUID(),
          jobNo: nextSeaImportJobNo(job.branch),
          mblNo: '',
          hblNo: '',
          hblLines: [],
          containers: [],
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
    const saved = seaImportJobRepo.save(job);
    setJob(saved);
    setMessage({ severity: 'success', text: `Job ${saved.jobNo} saved.` });
  };

  const disabledActions: ToolbarAction[] = [];
  if (!job) disabledActions.push('edit', 'delete', 'final', 'void', 'copy');
  if (job?.status.final) disabledActions.push('edit', 'delete', 'final');
  if (job?.status.void) disabledActions.push('final', 'edit');
  if (!editable || tab !== 0 || printingOnly) disabledActions.push('save');

  return (
    <PageShell breadcrumbs={['Freight', 'Transactions Menu (Sea Import)', 'Inbond Shipment Entry and Documents Printing (Sea-Import)']} title="Inbond Shipments (Import-Sea)">
      {message && (
        <Alert severity={message.severity} onClose={() => setMessage(null)} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      {showList ? <><TransactionToolbar actions={['new']} onAction={handleAction}/><SeaImportJobGrid jobs={seaImportJobRepo.list()} onOpen={loadJob} onEdit={(item)=>{setJob(item);setEditable(true);setTab(0);setPrintingOnly(false);setShowList(false)}} onDelete={(item)=>{seaImportJobRepo.remove(item.id);setMessage({severity:'success',text:'Job deleted.'})}} onPrint={(item)=>{setJob(item);setEditable(false);setTab(0);setPrintingOnly(true);setShowList(false)}}/></> : <>
      <Stack direction="row" justifyContent="flex-end" sx={{mb:1}}><Button startIcon={<ArrowBackIcon/>} onClick={()=>{setPrintingOnly(false);setShowList(true)}}>Back to List</Button></Stack>{!printingOnly && <TransactionToolbar actions={['save','final','void','copy']} disabledActions={disabledActions} onAction={handleAction}/>} 

      {job && (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Chip label={`Job No: ${job.jobNo}`} color="primary" />
          {job.status.final && <Chip label="FINAL" color="success" />}
          {job.status.void && <Chip label="VOID" color="warning" />}
          {editable && <Chip label="EDITING" color="info" variant="outlined" />}
        </Stack>
      )}</>}

      {!showList && <>
      <Tabs value={printingOnly ? 0 : tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        {printingOnly ? <Tab value={0} label="Printing" /> : <><Tab value={0} label="Entry" onClick={() => setTab(0)} /><Tab value={1} label="Container" onClick={() => setTab(1)} /></>}
      </Tabs>

      {!job ? (
        <Alert severity="info">Click New to create a job.</Alert>
      ) : (
        printingOnly ? <PrintingTab job={job} /> : <>{tab === 0 && <JobEntryForm job={job} editable={editable} onChange={setJob} />}{tab === 1 && <ContainerTab job={job} editable={editable} onChange={setJob} />}</>
      )}
      </>}
    </PageShell>
  );
}
