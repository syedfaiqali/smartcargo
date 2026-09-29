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
import { EditableCodeTable } from './EditableCodeTable';
import { countryRepo, sectorRepo } from '../../data/masterDataService';
import { CountryCode } from '../../domain/masterData';

const breadcrumbs = ['Freight', 'Initial Setup', 'Country Codes'];
const emptyDraft = (): Omit<CountryCode, 'id' | 'createdAt' | 'updatedAt'> => ({ code: '', name: '', sectorCode: '' });

export function CountryCodesPage() {
  const [version, setVersion] = useState(0);
  const [isEntry, setIsEntry] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState(emptyDraft);
  const sectors = sectorRepo.list();

  const closeEntry = () => { setEditingId(null); setIsEntry(false); };
  const save = () => {
    if (!draft.code.trim()) return;
    const now = new Date().toISOString();
    const existing = editingId ? countryRepo.get(editingId) : undefined;
    countryRepo.save({ ...draft, code: draft.code.trim(), name: draft.name.trim(), sectorCode: draft.sectorCode.trim(), id: existing?.id ?? uuid(), createdAt: existing?.createdAt ?? now, updatedAt: now });
    setVersion((value) => value + 1);
    closeEntry();
  };

  if (isEntry) {
    return (
      <PageShell breadcrumbs={breadcrumbs} title={editingId ? 'Edit Country Code' : 'Country Code Entry'} actions={<Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={closeEntry}>Back to Country Codes</Button>}>
        <Typography variant="overline" color="primary.main" sx={{ fontWeight: 700 }}>FREIGHT · INITIAL SETUP</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>Create the Country Code, Country Name, and Sector Code.</Typography>
        <Paper variant="outlined" sx={{ maxWidth: 680, p: 2.5 }}>
          <Box sx={{ display: 'grid', gap: 1.5 }}>
            <TextField label="Country Code" value={draft.code} onChange={(event) => setDraft({ ...draft, code: event.target.value })} required fullWidth />
            <TextField label="Country Name" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} fullWidth />
            <TextField select label="Sector Code" value={draft.sectorCode} onChange={(event) => setDraft({ ...draft, sectorCode: event.target.value })} fullWidth>
              <MenuItem value="">Select Sector</MenuItem>
              {sectors.map((sector) => <MenuItem key={sector.code} value={sector.code}>{sector.code} — {sector.name}</MenuItem>)}
            </TextField>
          </Box>
          <Stack direction="row" spacing={1} sx={{ mt: 3 }}><Button variant="contained" onClick={save}>Save</Button><Button onClick={closeEntry}>Cancel</Button></Stack>
        </Paper>
      </PageShell>
    );
  }

  return (
    <PageShell breadcrumbs={breadcrumbs} title="Country Codes" actions={<Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditingId(null); setDraft(emptyDraft()); setIsEntry(true); }}>Add</Button>}>
      <EditableCodeTable
        title="Country Codes"
        fields={[{ key: 'code', label: 'Country Code' }, { key: 'name', label: 'Country Name' }]}
        repo={countryRepo}
        emptyItem={emptyDraft()}
        showAddButton={false}
        showFilters={false}
        globalSearch
        version={version}
        onChange={() => setVersion((value) => value + 1)}
        onEditRecord={(country) => { setDraft({ ...emptyDraft(), ...country }); setEditingId(country.id); setIsEntry(true); }}
      />
    </PageShell>
  );
}
