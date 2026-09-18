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
import { SeaImportManifest } from '../../domain/seaImportManifest';
import { createEmptySeaImportManifest } from '../../domain/seaImportManifestFactory';
import { seaImportManifestRepo, ensureSeaImportManifestDemo } from '../../data/seaImportManifestService';
import { ManifestEntryForm } from './ManifestEntryForm';
import { PrintingTab } from './PrintingTab';
import { SeaImportManifestGrid } from './SeaImportManifestGrid';

export function SeaImportManifestPage() {
  ensureSeaImportManifestDemo();
  const [manifest, setManifest] = useState<SeaImportManifest | null>(null);
  const [editable, setEditable] = useState(false);
  const [tab, setTab] = useState(0);
  const [showList, setShowList] = useState(true);
  const [printingOnly, setPrintingOnly] = useState(false);
  const [message, setMessage] = useState<{ severity: 'success' | 'error' | 'warning'; text: string } | null>(null);

  const loadManifest = (m: SeaImportManifest) => {
    setManifest(m);
    setEditable(false);
    setTab(0);
    setPrintingOnly(false);
    setShowList(false);
  };

  const handleAction = (action: ToolbarAction) => {
    switch (action) {
      case 'new': {
        const draft = createEmptySeaImportManifest();
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
    if (!manifest.mblNo) {
      setMessage({ severity: 'error', text: 'MBL No. is required to save.' });
      return;
    }
    const saved = seaImportManifestRepo.save(manifest);
    setManifest(saved);
    setMessage({ severity: 'success', text: `Manifest ${saved.mblNo} saved.` });
  };

  const disabledActions: ToolbarAction[] = [];
  if (!manifest) disabledActions.push('edit');
  if (!editable || tab !== 0 || printingOnly) disabledActions.push('save');

  return (
    <PageShell breadcrumbs={['Freight', 'Transactions Menu (Sea Import)', 'Manifest Inbond Shipments (Sea-Import)']} title="Manifest Inbond Shipments (Import-Sea)">
      {message && (
        <Alert severity={message.severity} onClose={() => setMessage(null)} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      {showList ? <><TransactionToolbar actions={['new']} onAction={handleAction} /><SeaImportManifestGrid manifests={seaImportManifestRepo.list()} onOpen={loadManifest} onEdit={(item) => { setManifest(item); setEditable(true); setTab(0); setPrintingOnly(false); setShowList(false); }} onDelete={(item) => { seaImportManifestRepo.remove(item.id); setMessage({ severity: 'success', text: 'Manifest deleted.' }); }} onPrint={(item) => { setManifest(item); setEditable(false); setTab(0); setPrintingOnly(true); setShowList(false); }} /></> : <>
        <Stack direction="row" justifyContent="flex-end" sx={{ mb: 1 }}><Button startIcon={<ArrowBackIcon />} onClick={() => { setPrintingOnly(false); setShowList(true); }}>Back to List</Button></Stack>
        {!printingOnly && <TransactionToolbar actions={['save']} disabledActions={disabledActions} onAction={handleAction} />}

      {manifest && (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Chip label={`MBL No: ${manifest.mblNo || '(unassigned)'}`} color="primary" />
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
        printingOnly ? <PrintingTab manifest={manifest} /> : <ManifestEntryForm manifest={manifest} editable={editable} onChange={setManifest} />
      )}</>}
    </PageShell>
  );
}
