import { useState } from 'react';
import { v4 as uuid } from 'uuid';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { PageShell } from '../../layout/PageShell';
import { ContainerTypeGrid } from './ContainerTypeGrid';
import { containerTypeRepo } from '../../data/masterDataService';
import { ContainerType } from '../../domain/masterData';

const breadcrumbs = ['Freight', 'Initial Setup', 'Container Types'];
const commonSizes = ['20', '40', '45'];

const emptyDraft = (): Omit<ContainerType, 'id' | 'createdAt' | 'updatedAt'> => ({
  code: '',
  size: '',
  containerType: '',
  teus: 0,
});

export function ContainerTypesPage() {
  const [version, setVersion] = useState(0);
  const [mode, setMode] = useState<'list' | 'edit' | 'view'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [error, setError] = useState<string | null>(null);

  const backToList = () => {
    setMode('list');
    setEditingId(null);
    setError(null);
  };

  const startAdd = () => {
    setDraft(emptyDraft());
    setEditingId(null);
    setError(null);
    setMode('edit');
  };

  const startEdit = (item: ContainerType) => {
    setDraft({ ...emptyDraft(), ...item });
    setEditingId(item.id);
    setError(null);
    setMode('edit');
  };

  const startView = (item: ContainerType) => {
    setDraft({ ...emptyDraft(), ...item });
    setEditingId(item.id);
    setError(null);
    setMode('view');
  };

  const save = () => {
    if (!draft.size.trim()) {
      setError('Container Size is required.');
      return;
    }
    const now = new Date().toISOString();
    const existing = editingId ? containerTypeRepo.get(editingId) : undefined;
    containerTypeRepo.save({
      ...draft,
      code: existing?.code ?? `${draft.size.trim()}-${draft.containerType.trim() || uuid().slice(0, 4)}`.toUpperCase(),
      size: draft.size.trim(),
      containerType: draft.containerType.trim(),
      id: existing?.id ?? uuid(),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    });
    setVersion((v) => v + 1);
    backToList();
  };

  if (mode === 'edit' || mode === 'view') {
    const readOnly = mode === 'view';
    return (
      <PageShell
        breadcrumbs={breadcrumbs}
        title={mode === 'view' ? 'View container type' : editingId ? 'Edit container type' : 'Container type entry'}
        actions={<Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={backToList}>Back to Container Types</Button>}
      >
        <Typography variant="overline" color="primary.main" sx={{ fontWeight: 700 }}>FREIGHT · INITIAL SETUP</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>Create the container size, type, and its TEU count.</Typography>
        <Paper variant="outlined" sx={{ maxWidth: 640, p: 2.5 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 1.5 }}>
            <Autocomplete
              freeSolo
              options={commonSizes}
              value={draft.size || null}
              onChange={(_, value) => setDraft({ ...draft, size: value ?? '' })}
              onInputChange={(_, value) => setDraft({ ...draft, size: value })}
              disabled={readOnly}
              renderInput={(params) => <TextField {...params} label="Container Size" required fullWidth />}
            />
            <TextField label="Container Type" value={draft.containerType} onChange={(e) => setDraft({ ...draft, containerType: e.target.value })} disabled={readOnly} fullWidth />
            <TextField label="No. of Teus" type="number" value={draft.teus} onChange={(e) => setDraft({ ...draft, teus: Number(e.target.value) })} disabled={readOnly} fullWidth />
          </Box>
          {error && (
            <Typography variant="caption" sx={{ display: 'block', color: 'error.main', mt: 1.5 }}>
              {error}
            </Typography>
          )}
          {!readOnly && (
            <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
              <Button variant="contained" onClick={save}>Save</Button>
              <Button onClick={backToList}>Cancel</Button>
            </Stack>
          )}
        </Paper>
      </PageShell>
    );
  }

  return (
    <PageShell
      breadcrumbs={breadcrumbs}
      title="Container Types"
      actions={<Button variant="contained" startIcon={<AddIcon />} onClick={startAdd}>New</Button>}
    >
      <ContainerTypeGrid
        version={version}
        onChange={() => setVersion((v) => v + 1)}
        onEdit={startEdit}
        onView={startView}
      />
    </PageShell>
  );
}
