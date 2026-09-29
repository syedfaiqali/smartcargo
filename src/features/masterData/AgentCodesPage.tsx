import { useState } from 'react';
import { v4 as uuid } from 'uuid';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { PageShell } from '../../layout/PageShell';
import { AgentCodeGrid } from './AgentCodeGrid';
import { agentRepo, countryRepo } from '../../data/masterDataService';
import { AgentCode } from '../../domain/masterData';

const breadcrumbs = ['Freight', 'Initial Setup', 'Clearing / Delivery Agent Codes'];

const emptyDraft = (): Omit<AgentCode, 'id' | 'createdAt' | 'updatedAt'> => ({
  code: '',
  name: '',
  kind: 'CLEARING',
  address: '',
  countryCode: '',
  phoneNo: '',
  faxNo: '',
  contactPerson: '',
  email: '',
  website: '',
});

export function AgentCodesPage() {
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

  const startEdit = (item: AgentCode) => {
    setDraft({ ...emptyDraft(), ...item });
    setEditingId(item.id);
    setError(null);
    setMode('edit');
  };

  const startView = (item: AgentCode) => {
    setDraft({ ...emptyDraft(), ...item });
    setEditingId(item.id);
    setError(null);
    setMode('view');
  };

  const save = () => {
    if (!draft.code.trim()) {
      setError('Agent Code is required.');
      return;
    }
    const now = new Date().toISOString();
    const existing = editingId ? agentRepo.get(editingId) : undefined;
    agentRepo.save({
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
        title={mode === 'view' ? 'View agent code' : editingId ? 'Edit agent code' : 'Clearing / delivery agent code entry'}
        actions={<Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={backToList}>Back to Clearing / Delivery Agent Codes</Button>}
      >
        <Typography variant="overline" color="primary.main" sx={{ fontWeight: 700 }}>FREIGHT · INITIAL SETUP</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>Create the clearing/delivery agent identification and contact details.</Typography>
        <Paper variant="outlined" sx={{ maxWidth: 960, p: 2.5 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5 }}>
            <Box sx={{ display: 'grid', gap: 1.5 }}>
              <TextField label="Delivery Agent Code" value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value })} required disabled={readOnly || !!editingId} fullWidth />
              <TextField select label="Kind" value={draft.kind} onChange={(e) => setDraft({ ...draft, kind: e.target.value as 'CLEARING' | 'DELIVERY' })} disabled={readOnly} fullWidth>
                <MenuItem value="CLEARING">Clearing</MenuItem>
                <MenuItem value="DELIVERY">Delivery</MenuItem>
              </TextField>
              <TextField label="Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} disabled={readOnly} fullWidth />
              <TextField label="Address" value={draft.address} onChange={(e) => setDraft({ ...draft, address: e.target.value })} disabled={readOnly} multiline minRows={4} fullWidth />
            </Box>
            <Box sx={{ display: 'grid', gap: 1.5 }}>
              <Autocomplete
                options={countries}
                getOptionLabel={(country) => `${country.code} — ${country.name}`}
                isOptionEqualToValue={(option, value) => option.code === value.code}
                value={countries.find((c) => c.code === draft.countryCode) ?? null}
                onChange={(_, value) => setDraft({ ...draft, countryCode: value?.code ?? '' })}
                disabled={readOnly}
                renderInput={(params) => <TextField {...params} label="Country Code" placeholder="Select Country Code" fullWidth />}
              />
              <TextField label="Fax No." value={draft.faxNo} onChange={(e) => setDraft({ ...draft, faxNo: e.target.value })} disabled={readOnly} fullWidth />
              <TextField label="Phone No." value={draft.phoneNo} onChange={(e) => setDraft({ ...draft, phoneNo: e.target.value })} disabled={readOnly} fullWidth />
              <TextField label="Contact Person" value={draft.contactPerson} onChange={(e) => setDraft({ ...draft, contactPerson: e.target.value })} disabled={readOnly} fullWidth />
              <TextField label="Email" type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} disabled={readOnly} fullWidth />
              <TextField label="Website" value={draft.website} onChange={(e) => setDraft({ ...draft, website: e.target.value })} disabled={readOnly} fullWidth />
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
      title="Clearing / Delivery Agent Codes"
      actions={<Button variant="contained" startIcon={<AddIcon />} onClick={startAdd}>New</Button>}
    >
      <AgentCodeGrid
        version={version}
        onChange={() => setVersion((v) => v + 1)}
        onEdit={startEdit}
        onView={startView}
      />
    </PageShell>
  );
}
