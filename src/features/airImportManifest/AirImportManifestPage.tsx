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
import { AirImportManifest } from '../../domain/airImportManifest';
import { createEmptyAirImportManifest } from '../../domain/airImportManifestFactory';
import { airImportManifestRepo, ensureAirImportManifestDemo, findAirImportManifestByMawbNo, findAirImportJobsByMawbNo, findMasterJobByMawbNo, populateManifestFromAirImportJobs, populateManifestFromMasterJob } from '../../data/airImportManifestService';
import { ManifestEntryForm } from './ManifestEntryForm';
import { PrintingTab } from './PrintingTab';
import { AirImportManifestGrid } from './AirImportManifestGrid';

export function AirImportManifestPage() {
  ensureAirImportManifestDemo();
  const [manifest, setManifest] = useState<AirImportManifest | null>(null);
  const [editable, setEditable] = useState(false);
  const [tab, setTab] = useState(0);
  const [showList, setShowList] = useState(true);
  const [printingOnly, setPrintingOnly] = useState(false);
  const [message, setMessage] = useState<{ severity: 'success' | 'error' | 'warning'; text: string } | null>(null);

  const loadManifest = (m: AirImportManifest) => {
    setManifest(m);
    setEditable(false);
    setTab(0);
    setPrintingOnly(false);
    setShowList(false);
  };

  const loadSavedMawb = (mawbNo: string) => {
    const saved = findAirImportManifestByMawbNo(mawbNo);
    if (saved && saved.id !== manifest?.id) {
      setManifest(saved);
      setEditable(true);
      setMessage({ severity: 'success', text: `Loaded saved manifest ${saved.mawbNo}.` });
      return;
    }

    const jobs = findAirImportJobsByMawbNo(mawbNo);
    if (jobs.length && manifest) {
      setManifest(populateManifestFromAirImportJobs(manifest, jobs));
      setMessage({ severity: 'success', text: `Loaded ${jobs.length} Air-Import job record${jobs.length === 1 ? '' : 's'} for MAWB ${jobs[0].mawbNo}.` });
      return;
    }

    const masterJob = findMasterJobByMawbNo(mawbNo);
    if (!masterJob || !manifest) return;
    setManifest(populateManifestFromMasterJob(manifest, masterJob));
    setMessage({ severity: 'success', text: `Loaded MAWB job ${masterJob.jobNo} and its linked HAWB records.` });
  };

  const handleAction = (action: ToolbarAction) => {
    switch (action) {
      case 'new': {
        const draft = createEmptyAirImportManifest();
        setManifest(draft);
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
        if (!manifest) {
          setMessage({ severity: 'warning', text: 'Load a manifest first (SEARCH or Detail/Search tab).' });
          return;
        }
        setEditable(true);
        break;
      }
      default:
        break;
    }
  };

  const handleSave = () => {
    if (!manifest) return;
    if (!manifest.mawbNo) {
      setMessage({ severity: 'error', text: 'MAWB No. is required to save.' });
      return;
    }
    const saved = airImportManifestRepo.save(manifest);
    setManifest(saved);
    setMessage({ severity: 'success', text: `Manifest ${saved.mawbNo} saved.` });
  };

  const disabledActions: ToolbarAction[] = [];
  if (!manifest) disabledActions.push('edit');
  if (!editable || tab !== 0 || printingOnly) disabledActions.push('save');

  return (
    <PageShell breadcrumbs={['Freight', 'Transactions Menu (Air Import)', 'Manifest Inbond Shipments (Air-Import)']} title="Manifest Inbond Shipments (Import-Air)">
      {message && (
        <Alert severity={message.severity} onClose={() => setMessage(null)} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      {showList ? (
        <>
          <TransactionToolbar actions={['new']} onAction={handleAction} />
          <AirImportManifestGrid
            manifests={airImportManifestRepo.list()}
            onOpen={loadManifest}
            onEdit={(item) => { setManifest(item); setEditable(true); setTab(0); setPrintingOnly(false); setShowList(false); }}
            onDelete={(item) => { airImportManifestRepo.remove(item.id); setMessage({ severity: 'success', text: 'Manifest deleted.' }); }}
            onPrint={(item) => { setManifest(item); setEditable(false); setTab(0); setPrintingOnly(true); setShowList(false); }}
          />
        </>
      ) : (
        <>
          <Stack direction="row" justifyContent="flex-end" sx={{ mb: 1 }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => { setPrintingOnly(false); setShowList(true); }}>Back to List</Button>
          </Stack>
          {!printingOnly && <TransactionToolbar actions={['save']} disabledActions={disabledActions} onAction={handleAction} />}

      {manifest && (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Chip label={`MAWB No: ${manifest.mawbNo || '(unassigned)'}`} color="primary" />
          {manifest.status.final && <Chip label="FINAL" color="success" />}
          {editable && <Chip label="EDITING" color="info" variant="outlined" />}
        </Stack>
      )}

      <Tabs value={0} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label={printingOnly ? 'Printing' : 'Entry'} />
      </Tabs>

      {!manifest ? (
        <Alert severity="info">Click New to create a manifest.</Alert>
      ) : (
        printingOnly ? <PrintingTab manifest={manifest} /> : <ManifestEntryForm manifest={manifest} editable={editable} onChange={setManifest} onSavedMawbEntered={loadSavedMawb} />
      )}
        </>
      )}
    </PageShell>
  );
}
