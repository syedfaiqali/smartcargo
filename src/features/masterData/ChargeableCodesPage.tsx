import { useState } from 'react';
import { v4 as uuid } from 'uuid';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { PageShell } from '../../layout/PageShell';
import { ChargeableCodeGrid } from './ChargeableCodeGrid';
import { chargeableRepo } from '../../data/masterDataService';
import { ChargeableCode } from '../../domain/masterData';

const breadcrumbs = ['Freight', 'Initial Setup', 'Chargeable Codes (MOP)'];

const emptyDraft = (): Omit<ChargeableCode, 'id' | 'createdAt' | 'updatedAt'> => ({
  code: '',
  name: '',
  description: '',
  ppCc: 'PP',
});

export function ChargeableCodesPage() {
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

  const startEdit = (item: ChargeableCode) => {
    setDraft({ ...emptyDraft(), ...item });
    setEditingId(item.id);
    setError(null);
    setMode('edit');
  };

  const startView = (item: ChargeableCode) => {
    setDraft({ ...emptyDraft(), ...item });
    setEditingId(item.id);
    setError(null);
    setMode('view');
  };

  const save = () => {
    if (!draft.code.trim()) {
      setError('Chargeable Code is required.');
      return;
    }
    const now = new Date().toISOString();
    const existing = editingId ? chargeableRepo.get(editingId) : undefined;
    chargeableRepo.save({
      ...draft,
      code: draft.code.trim(),
      name: draft.name.trim(),
      description: draft.description.trim(),
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
        title={mode === 'view' ? 'View chargeable code' : editingId ? 'Edit chargeable code' : 'Chargeable code entry'}
        actions={<Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={backToList}>Back to Chargeable Codes</Button>}
      >
        <Typography variant="overline" color="primary.main" sx={{ fontWeight: 700 }}>FREIGHT · INITIAL SETUP</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>Create the chargeable code, its AWB description, and prepaid/collect mode.</Typography>
        <Paper variant="outlined" sx={{ maxWidth: 480, p: 2.5 }}>
          <Box sx={{ display: 'grid', gap: 1.5 }}>
            <TextField label="Chargeable Code" value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value })} required disabled={readOnly || !!editingId} fullWidth />
            <TextField label="Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} disabled={readOnly} fullWidth />
            <TextField label="Description(For Awb)" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} disabled={readOnly} fullWidth />
            <TextField select label="PP/CC" value={draft.ppCc} onChange={(e) => setDraft({ ...draft, ppCc: e.target.value as 'PP' | 'CC' })} disabled={readOnly} fullWidth>
              <MenuItem value="PP">PP</MenuItem>
              <MenuItem value="CC">CC</MenuItem>
            </TextField>
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
      title="Chargeable Codes (MOP)"
      actions={<Button variant="contained" startIcon={<AddIcon />} onClick={startAdd}>New</Button>}
    >
      <ChargeableCodeGrid
        version={version}
        onChange={() => setVersion((v) => v + 1)}
        onEdit={startEdit}
        onView={startView}
      />
    </PageShell>
  );
}
