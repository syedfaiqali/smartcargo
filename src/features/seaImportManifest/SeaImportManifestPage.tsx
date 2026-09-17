import { useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import { PageShell } from '../../layout/PageShell';
import { TransactionToolbar, ToolbarAction } from '../../components/TransactionToolbar';
import { SeaImportManifest } from '../../domain/seaImportManifest';
import { createEmptySeaImportManifest } from '../../domain/seaImportManifestFactory';
import { seaImportManifestRepo } from '../../data/seaImportManifestService';
import { ManifestEntryForm } from './ManifestEntryForm';
import { DetailSearchTab } from './DetailSearchTab';
import { PrintingTab } from './PrintingTab';

export function SeaImportManifestPage() {
  const [manifest, setManifest] = useState<SeaImportManifest | null>(null);
  const [editable, setEditable] = useState(false);
  const [tab, setTab] = useState(0);
  const [message, setMessage] = useState<{ severity: 'success' | 'error' | 'warning'; text: string } | null>(null);

  const loadManifest = (m: SeaImportManifest) => {
    setManifest(m);
    setEditable(false);
    setTab(0);
  };

  const handleAction = (action: ToolbarAction) => {
    switch (action) {
      case 'new': {
        const draft = createEmptySeaImportManifest();
        setManifest(draft);
        setEditable(true);
        setTab(0);
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
      case 'search':
        setTab(1);
        break;
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
  if (!editable || tab !== 0) disabledActions.push('save');

  return (
    <PageShell breadcrumbs={['Freight', 'Transactions Menu (Sea Import)', 'Manifest Inbond Shipments (Sea-Import)']} title="Manifest Inbond Shipments (Import-Sea)">
      {message && (
        <Alert severity={message.severity} onClose={() => setMessage(null)} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      <TransactionToolbar
        actions={['search', 'top', 'bottom', 'prev', 'next', 'new', 'save', 'edit']}
        disabledActions={disabledActions}
        onAction={handleAction}
      />

      {manifest && (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Chip label={`MBL No: ${manifest.mblNo || '(unassigned)'}`} color="primary" />
          {manifest.status.final && <Chip label="FINAL" color="success" />}
          {editable && <Chip label="EDITING" color="info" variant="outlined" />}
        </Stack>
      )}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="Entry" />
        <Tab label="Detail/Search" />
        <Tab label="Printing" />
      </Tabs>

      {tab === 1 ? (
        <DetailSearchTab onOpenManifest={loadManifest} />
      ) : !manifest ? (
        <Alert severity="info">Click NEW to create a manifest, or use the Detail/Search tab to find an existing one.</Alert>
      ) : (
        <>
          {tab === 0 && <ManifestEntryForm manifest={manifest} editable={editable} onChange={setManifest} />}
          {tab === 2 && <PrintingTab manifest={manifest} />}
        </>
      )}
    </PageShell>
  );
}
