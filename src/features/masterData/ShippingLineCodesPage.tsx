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
import { ShippingLineCodeGrid } from './ShippingLineCodeGrid';
import { shippingLineRepo } from '../../data/masterDataService';
import { ShippingLineCode } from '../../domain/masterData';

const breadcrumbs = ['Freight', 'Initial Setup', 'Shipping Line Codes'];

const emptyDraft = (): Omit<ShippingLineCode, 'id' | 'createdAt' | 'updatedAt'> => ({
  code: '',
  name: '',
  address: '',
  email: '',
  website: '',
  phoneNo: '',
  faxNo: '',
  contactPerson: '',
  ntnNo: '',
});

export function ShippingLineCodesPage() {
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

  const startEdit = (item: ShippingLineCode) => {
    setDraft({ ...emptyDraft(), ...item });
    setEditingId(item.id);
    setError(null);
    setMode('edit');
  };

  const startView = (item: ShippingLineCode) => {
    setDraft({ ...emptyDraft(), ...item });
    setEditingId(item.id);
    setError(null);
    setMode('view');
  };

  const save = () => {
    if (!draft.code.trim()) {
      setError('Shipping Line Code is required.');
      return;
    }
    const now = new Date().toISOString();
    const existing = editingId ? shippingLineRepo.get(editingId) : undefined;
    shippingLineRepo.save({
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
        title={mode === 'view' ? 'View shipping line code' : editingId ? 'Edit shipping line code' : 'Shipping line code entry'}
        actions={<Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={backToList}>Back to Shipping Line Codes</Button>}
      >
        <Typography variant="overline" color="primary.main" sx={{ fontWeight: 700 }}>FREIGHT · INITIAL SETUP</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>Create the shipping line identification and contact details.</Typography>
        <Paper variant="outlined" sx={{ maxWidth: 960, p: 2.5 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5 }}>
            <Box sx={{ display: 'grid', gap: 1.5 }}>
              <TextField label="Shipping Line Code" value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value })} required disabled={readOnly || !!editingId} fullWidth />
              <TextField label="Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} disabled={readOnly} fullWidth />
              <TextField label="Address" value={draft.address} onChange={(e) => setDraft({ ...draft, address: e.target.value })} disabled={readOnly} multiline minRows={3} fullWidth />
            </Box>
            <Box sx={{ display: 'grid', gap: 1.5 }}>
              <TextField label="Email" type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} disabled={readOnly} fullWidth />
              <TextField label="Website" value={draft.website} onChange={(e) => setDraft({ ...draft, website: e.target.value })} disabled={readOnly} fullWidth />
              <TextField label="Phone No." value={draft.phoneNo} onChange={(e) => setDraft({ ...draft, phoneNo: e.target.value })} disabled={readOnly} fullWidth />
              <TextField label="Fax No." value={draft.faxNo} onChange={(e) => setDraft({ ...draft, faxNo: e.target.value })} disabled={readOnly} fullWidth />
              <TextField label="Contact Person" value={draft.contactPerson} onChange={(e) => setDraft({ ...draft, contactPerson: e.target.value })} disabled={readOnly} fullWidth />
              <TextField label="NTN No." value={draft.ntnNo} onChange={(e) => setDraft({ ...draft, ntnNo: e.target.value })} disabled={readOnly} fullWidth />
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
      title="Shipping Line Codes"
      actions={<Button variant="contained" startIcon={<AddIcon />} onClick={startAdd}>New</Button>}
    >
      <ShippingLineCodeGrid
        version={version}
        onChange={() => setVersion((v) => v + 1)}
        onEdit={startEdit}
        onView={startView}
      />
    </PageShell>
  );
}
