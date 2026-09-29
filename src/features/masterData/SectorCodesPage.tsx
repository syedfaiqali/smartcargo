import { useState } from 'react';
import { v4 as uuid } from 'uuid';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { PageShell } from '../../layout/PageShell';
import { EditableCodeTable } from './EditableCodeTable';
import { sectorRepo } from '../../data/masterDataService';
import { SectorCode } from '../../domain/masterData';

const breadcrumbs = ['Freight', 'Initial Setup', 'Sector Codes'];
const emptyDraft = (): Omit<SectorCode, 'id' | 'createdAt' | 'updatedAt'> => ({ code: '', name: '' });

export function SectorCodesPage() {
  const [version, setVersion] = useState(0);
  const [isEntry, setIsEntry] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState(emptyDraft);

  const closeEntry = () => {
    setEditingId(null);
    setIsEntry(false);
  };

  const save = () => {
    if (!draft.code.trim()) return;
    const now = new Date().toISOString();
    const existing = editingId ? sectorRepo.get(editingId) : undefined;
    sectorRepo.save({
      ...draft,
      code: draft.code.trim(),
      name: draft.name.trim(),
      id: existing?.id ?? uuid(),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    });
    setVersion((value) => value + 1);
    closeEntry();
  };

  if (isEntry) {
    return (
      <PageShell
        breadcrumbs={breadcrumbs}
        title={editingId ? 'Edit Sector Code' : 'Sector Code Entry'}
        actions={<Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={closeEntry}>Back to Sector Codes</Button>}
      >
        <Typography variant="overline" color="primary.main" sx={{ fontWeight: 700 }}>FREIGHT · INITIAL SETUP</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>Create the Sector Code and Sector Name.</Typography>
        <Paper variant="outlined" sx={{ maxWidth: 680, p: 2.5 }}>
          <Box sx={{ display: 'grid', gap: 1.5 }}>
            <TextField label="Sector Code" value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value })} required fullWidth />
            <TextField label="Sector Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} fullWidth />
          </Box>
          <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
            <Button variant="contained" onClick={save}>Save</Button>
            <Button onClick={closeEntry}>Cancel</Button>
          </Stack>
        </Paper>
      </PageShell>
    );
  }

  return (
    <PageShell
      breadcrumbs={breadcrumbs}
      title="Sector Codes"
      actions={<Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditingId(null); setDraft(emptyDraft()); setIsEntry(true); }}>Add</Button>}
    >
      <EditableCodeTable
        title="Sector Codes"
        fields={[
          { key: 'code', label: 'Sector Code' },
          { key: 'name', label: 'Sector Name' },
        ]}
        repo={sectorRepo}
        emptyItem={emptyDraft()}
        showAddButton={false}
        version={version}
        onChange={() => setVersion((value) => value + 1)}
        onEditRecord={(sector) => { setDraft({ ...emptyDraft(), ...sector }); setEditingId(sector.id); setIsEntry(true); }}
      />
    </PageShell>
  );
}
