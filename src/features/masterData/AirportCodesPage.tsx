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
import { airportRepo, countryRepo } from '../../data/masterDataService';
import { AirportCode } from '../../domain/masterData';

const breadcrumbs = ['Freight', 'Initial Setup', 'Airport / Destination Codes'];
const emptyDraft = (): Omit<AirportCode, 'id' | 'createdAt' | 'updatedAt'> => ({ code: '', name: '', country: '' });

export function AirportCodesPage() {
  const [version, setVersion] = useState(0);
  const [isEntry, setIsEntry] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState(emptyDraft);
  const countries = countryRepo.list();

  const closeEntry = () => { setEditingId(null); setIsEntry(false); };
  const save = () => {
    if (!draft.code.trim()) return;
    const now = new Date().toISOString();
    const existing = editingId ? airportRepo.get(editingId) : undefined;
    airportRepo.save({ ...draft, code: draft.code.trim().toUpperCase(), name: draft.name.trim(), country: draft.country, id: existing?.id ?? uuid(), createdAt: existing?.createdAt ?? now, updatedAt: now });
    setVersion((value) => value + 1);
    closeEntry();
  };

  if (isEntry) {
    return (
      <PageShell breadcrumbs={breadcrumbs} title={editingId ? 'Edit Airport / Destination Code' : 'Airport / Destination Code Entry'} actions={<Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={closeEntry}>Back to Airport / Destination Codes</Button>}>
        <Typography variant="overline" color="primary.main" sx={{ fontWeight: 700 }}>FREIGHT · INITIAL SETUP</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>Create the destination code, name, and Country Code.</Typography>
        <Paper variant="outlined" sx={{ maxWidth: 680, p: 2.5 }}>
          <Box sx={{ display: 'grid', gap: 1.5 }}>
            <TextField label="Code" value={draft.code} onChange={(event) => setDraft({ ...draft, code: event.target.value })} required fullWidth />
            <TextField label="Name" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} fullWidth />
            <TextField select label="Country Code" value={draft.country} onChange={(event) => setDraft({ ...draft, country: event.target.value })} fullWidth>
              <MenuItem value="">Select Country</MenuItem>
              {countries.map((country) => <MenuItem key={country.code} value={country.code}>{country.code} — {country.name}</MenuItem>)}
            </TextField>
          </Box>
          <Stack direction="row" spacing={1} sx={{ mt: 3 }}><Button variant="contained" onClick={save}>Save</Button><Button onClick={closeEntry}>Cancel</Button></Stack>
        </Paper>
      </PageShell>
    );
  }

  return (
    <PageShell breadcrumbs={breadcrumbs} title="Airport / Destination Codes" actions={<Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditingId(null); setDraft(emptyDraft()); setIsEntry(true); }}>Add</Button>}>
      <EditableCodeTable
        title="Airport / Destination Codes"
        fields={[{ key: 'code', label: 'Code' }, { key: 'name', label: 'Name' }]}
        repo={airportRepo}
        emptyItem={emptyDraft()}
        showAddButton={false}
        showFilters={false}
        globalSearch
        version={version}
        onChange={() => setVersion((value) => value + 1)}
        onEditRecord={(airport) => { setDraft({ ...emptyDraft(), ...airport }); setEditingId(airport.id); setIsEntry(true); }}
      />
    </PageShell>
  );
}
