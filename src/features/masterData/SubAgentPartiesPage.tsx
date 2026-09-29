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
import { SubAgentPartyGrid } from './SubAgentPartyGrid';
import { subAgentPartyRepo, countryRepo } from '../../data/masterDataService';
import { SubAgentParty } from '../../domain/masterData';

const breadcrumbs = ['Freight', 'Initial Setup', 'Sub-Agent Parties'];

const emptyDraft = (): Omit<SubAgentParty, 'id' | 'createdAt' | 'updatedAt'> => ({
  code: '',
  name: '',
  address: '',
  phoneNo: '',
  faxNo: '',
  contactPerson: '',
  exportRegNo: '',
  saleTaxNo: '',
  ntnNo: '',
  zipCode: '',
  cityCode: '',
  countryCode: '',
  email: '',
  website: '',
});

export function SubAgentPartiesPage() {
  const [version, setVersion] = useState(0);
  const [mode, setMode] = useState<'list' | 'edit' | 'view'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [error, setError] = useState<string | null>(null);
  const countries = countryRepo.list();

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

  const startEdit = (item: SubAgentParty) => {
    setDraft({ ...emptyDraft(), ...item });
    setEditingId(item.id);
    setError(null);
    setMode('edit');
  };

  const startView = (item: SubAgentParty) => {
    setDraft({ ...emptyDraft(), ...item });
    setEditingId(item.id);
    setError(null);
    setMode('view');
  };

  const save = () => {
    if (!draft.code.trim()) {
      setError("Agent's Party Code is required.");
      return;
    }
    const now = new Date().toISOString();
    const existing = editingId ? subAgentPartyRepo.get(editingId) : undefined;
    subAgentPartyRepo.save({
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
        title={mode === 'view' ? 'View sub-agent party' : editingId ? 'Edit sub-agent party' : 'Sub-agent party entry'}
        actions={<Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={backToList}>Back to Sub-Agent Parties</Button>}
      >
        <Typography variant="overline" color="primary.main" sx={{ fontWeight: 700 }}>FREIGHT · INITIAL SETUP</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>Create the sub-agent party identification, registration and contact details.</Typography>
        <Paper variant="outlined" sx={{ maxWidth: 960, p: 2.5 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5 }}>
            <Box sx={{ display: 'grid', gap: 1.5 }}>
              <TextField label="Agent's Party Code" value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value })} required disabled={readOnly || !!editingId} fullWidth />
              <TextField label="Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} disabled={readOnly} fullWidth />
              <TextField label="Address" value={draft.address} onChange={(e) => setDraft({ ...draft, address: e.target.value })} disabled={readOnly} multiline minRows={3} fullWidth />
              <TextField label="Email" type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} disabled={readOnly} fullWidth />
              <TextField label="Website" value={draft.website} onChange={(e) => setDraft({ ...draft, website: e.target.value })} disabled={readOnly} fullWidth />
            </Box>
            <Box sx={{ display: 'grid', gap: 1.5 }}>
              <TextField label="Phone No." value={draft.phoneNo} onChange={(e) => setDraft({ ...draft, phoneNo: e.target.value })} disabled={readOnly} fullWidth />
              <TextField label="Fax No." value={draft.faxNo} onChange={(e) => setDraft({ ...draft, faxNo: e.target.value })} disabled={readOnly} fullWidth />
              <TextField label="Contact Person" value={draft.contactPerson} onChange={(e) => setDraft({ ...draft, contactPerson: e.target.value })} disabled={readOnly} fullWidth />
              <TextField label="Export Reg No." value={draft.exportRegNo} onChange={(e) => setDraft({ ...draft, exportRegNo: e.target.value })} disabled={readOnly} fullWidth />
              <TextField label="Sale Tax No." value={draft.saleTaxNo} onChange={(e) => setDraft({ ...draft, saleTaxNo: e.target.value })} disabled={readOnly} fullWidth />
              <TextField label="NTN No." value={draft.ntnNo} onChange={(e) => setDraft({ ...draft, ntnNo: e.target.value })} disabled={readOnly} fullWidth />
              <TextField label="Zip Code" value={draft.zipCode} onChange={(e) => setDraft({ ...draft, zipCode: e.target.value })} disabled={readOnly} fullWidth />
              <TextField label="City Code" value={draft.cityCode} onChange={(e) => setDraft({ ...draft, cityCode: e.target.value })} disabled={readOnly} fullWidth />
              <Autocomplete
                options={countries}
                getOptionLabel={(country) => `${country.code} — ${country.name}`}
                isOptionEqualToValue={(option, value) => option.code === value.code}
                value={countries.find((c) => c.code === draft.countryCode) ?? null}
                onChange={(_, value) => setDraft({ ...draft, countryCode: value?.code ?? '' })}
                disabled={readOnly}
                renderInput={(params) => <TextField {...params} label="Country Code" placeholder="Choose Country ...." fullWidth />}
              />
            </Box>
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
      title="Sub-Agent Parties"
      actions={<Button variant="contained" startIcon={<AddIcon />} onClick={startAdd}>New</Button>}
    >
      <SubAgentPartyGrid
        version={version}
        onChange={() => setVersion((v) => v + 1)}
        onEdit={startEdit}
        onView={startView}
      />
    </PageShell>
  );
}
