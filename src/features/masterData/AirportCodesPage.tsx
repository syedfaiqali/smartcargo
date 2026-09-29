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
import { AirportCodeGrid } from './AirportCodeGrid';
import { airportRepo, countryRepo, sectorRepo } from '../../data/masterDataService';
import { AirportCode } from '../../domain/masterData';

const breadcrumbs = ['Freight', 'Initial Setup', 'Airport / Destination Codes'];

const emptyDraft = (): Omit<AirportCode, 'id' | 'createdAt' | 'updatedAt'> => ({
  code: '',
  name: '',
  countryCode: '',
  sectorCode: '',
});

export function AirportCodesPage() {
  const [version, setVersion] = useState(0);
  const [mode, setMode] = useState<'list' | 'edit' | 'view'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [error, setError] = useState<string | null>(null);
  const countries = countryRepo.list();
  const sectors = sectorRepo.list();

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

  const startEdit = (item: AirportCode) => {
    setDraft({ ...emptyDraft(), ...item });
    setEditingId(item.id);
    setError(null);
    setMode('edit');
  };

  const startView = (item: AirportCode) => {
    setDraft({ ...emptyDraft(), ...item });
    setEditingId(item.id);
    setError(null);
    setMode('view');
  };

  const save = () => {
    if (!draft.code.trim()) {
      setError('Destination Code is required.');
      return;
    }
    const now = new Date().toISOString();
    const existing = editingId ? airportRepo.get(editingId) : undefined;
    airportRepo.save({
      ...draft,
      code: draft.code.trim(),
      name: draft.name.trim(),
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
        title={mode === 'view' ? 'View destination code' : editingId ? 'Edit destination code' : 'Destination code entry'}
        actions={<Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={backToList}>Back to Airport / Destination Codes</Button>}
      >
        <Typography variant="overline" color="primary.main" sx={{ fontWeight: 700 }}>FREIGHT · INITIAL SETUP</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>Create the destination code, name, and its sector/country linkage.</Typography>
        <Paper variant="outlined" sx={{ maxWidth: 480, p: 2.5 }}>
          <Box sx={{ display: 'grid', gap: 1.5 }}>
            <TextField label="Destination Code" value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value })} required disabled={readOnly || !!editingId} fullWidth />
            <TextField label="Destination Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} disabled={readOnly} fullWidth />
            <Autocomplete
              options={sectors}
              getOptionLabel={(sector) => `${sector.code} — ${sector.name}`}
              isOptionEqualToValue={(option, value) => option.code === value.code}
              value={sectors.find((s) => s.code === draft.sectorCode) ?? null}
              onChange={(_, value) => setDraft({ ...draft, sectorCode: value?.code ?? '' })}
              disabled={readOnly}
              renderInput={(params) => <TextField {...params} label="Sector Code" placeholder="Select Sector" fullWidth />}
            />
            <Autocomplete
              options={countries}
              getOptionLabel={(country) => `${country.code} — ${country.name}`}
              isOptionEqualToValue={(option, value) => option.code === value.code}
              value={countries.find((c) => c.code === draft.countryCode) ?? null}
              onChange={(_, value) => setDraft({ ...draft, countryCode: value?.code ?? '' })}
              disabled={readOnly}
              renderInput={(params) => <TextField {...params} label="Country Code" placeholder="Select Country Code" fullWidth />}
            />
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
      title="Airport / Destination Codes"
      actions={<Button variant="contained" startIcon={<AddIcon />} onClick={startAdd}>New</Button>}
    >
      <AirportCodeGrid
        version={version}
        onChange={() => setVersion((v) => v + 1)}
        onEdit={startEdit}
        onView={startView}
      />
    </PageShell>
  );
}
