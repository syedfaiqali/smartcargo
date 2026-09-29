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
import { CommodityCodeGrid } from './CommodityCodeGrid';
import { commodityRepo } from '../../data/masterDataService';
import { CommodityCode, CommodityType } from '../../domain/masterData';

const breadcrumbs = ['Freight', 'Initial Setup', 'Commodity Codes'];
const commodityTypes: CommodityType[] = ['Dry Cargo', 'Perishable'];

const emptyDraft = (): Omit<CommodityCode, 'id' | 'createdAt' | 'updatedAt'> => ({
  code: '',
  description: '',
  commodityType: '',
  hsCode: '',
});

export function CommodityCodesPage() {
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

  const startEdit = (item: CommodityCode) => {
    setDraft({ ...emptyDraft(), ...item });
    setEditingId(item.id);
    setError(null);
    setMode('edit');
  };

  const startView = (item: CommodityCode) => {
    setDraft({ ...emptyDraft(), ...item });
    setEditingId(item.id);
    setError(null);
    setMode('view');
  };

  const save = () => {
    if (!draft.code.trim()) {
      setError('Commodity Code is required.');
      return;
    }
    const now = new Date().toISOString();
    const existing = editingId ? commodityRepo.get(editingId) : undefined;
    commodityRepo.save({
      ...draft,
      code: draft.code.trim(),
      description: draft.description.trim(),
      hsCode: draft.hsCode.trim(),
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
        title={mode === 'view' ? 'View commodity code' : editingId ? 'Edit commodity code' : 'Commodity code entry'}
        actions={<Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={backToList}>Back to Commodity Codes</Button>}
      >
        <Typography variant="overline" color="primary.main" sx={{ fontWeight: 700 }}>FREIGHT · INITIAL SETUP</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>Create the commodity code, name, type, and H.S code.</Typography>
        <Paper variant="outlined" sx={{ maxWidth: 480, p: 2.5 }}>
          <Box sx={{ display: 'grid', gap: 1.5 }}>
            <TextField label="Commodity Code" value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value })} required disabled={readOnly || !!editingId} fullWidth />
            <TextField label="Commodity Name" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} disabled={readOnly} fullWidth />
            <Autocomplete
              options={commodityTypes}
              value={draft.commodityType || null}
              onChange={(_, value) => setDraft({ ...draft, commodityType: value ?? '' })}
              disabled={readOnly}
              renderInput={(params) => <TextField {...params} label="Commodity Type" fullWidth />}
            />
            <TextField label="H.S Code" value={draft.hsCode} onChange={(e) => setDraft({ ...draft, hsCode: e.target.value })} disabled={readOnly} fullWidth />
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
      title="Commodity Codes"
      actions={<Button variant="contained" startIcon={<AddIcon />} onClick={startAdd}>New</Button>}
    >
      <CommodityCodeGrid
        version={version}
        onChange={() => setVersion((v) => v + 1)}
        onEdit={startEdit}
        onView={startView}
      />
    </PageShell>
  );
}
