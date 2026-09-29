import { useEffect, useState } from 'react';
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
import { OwnerCodeGrid } from './OwnerCodeGrid';
import { ownerRepo } from '../../data/masterDataService';
import { OwnerCode } from '../../domain/masterData';

const breadcrumbs = ['Freight', 'Initial Setup', 'Owner Codes'];

const emptyDraft = (): Omit<OwnerCode, 'id' | 'createdAt' | 'updatedAt'> => ({
  code: '',
  name: '',
  station: '',
  phoneFaxNo: '',
  email: '',
  website: '',
  iataCode: '',
  accountNo: '',
  commissionPercent: 0,
  whtPercent: 0,
  logoName: '',
});

export function OwnerCodesPage() {
  const [version, setVersion] = useState(0);
  const [mode, setMode] = useState<'list' | 'edit' | 'view'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [error, setError] = useState<string | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
    };
  }, [logoPreviewUrl]);

  const backToList = () => {
    setMode('list');
    setEditingId(null);
    setError(null);
    setLogoPreviewUrl(null);
  };

  const startAdd = () => {
    setDraft(emptyDraft());
    setEditingId(null);
    setError(null);
    setLogoPreviewUrl(null);
    setMode('edit');
  };

  const startEdit = (item: OwnerCode) => {
    setDraft({ ...emptyDraft(), ...item });
    setEditingId(item.id);
    setError(null);
    setLogoPreviewUrl(null);
    setMode('edit');
  };

  const startView = (item: OwnerCode) => {
    setDraft({ ...emptyDraft(), ...item });
    setEditingId(item.id);
    setError(null);
    setLogoPreviewUrl(null);
    setMode('view');
  };

  const handleLogoChange = (file: File | undefined) => {
    if (!file) return;
    setDraft({ ...draft, logoName: file.name });
    setLogoPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
  };

  const save = () => {
    if (!draft.code.trim()) {
      setError('Owner Code is required.');
      return;
    }
    const now = new Date().toISOString();
    const existing = editingId ? ownerRepo.get(editingId) : undefined;
    ownerRepo.save({
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
        title={mode === 'view' ? 'View owner code' : editingId ? 'Edit owner code' : 'Owner code entry'}
        actions={<Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={backToList}>Back to Owner Codes</Button>}
      >
        <Typography variant="overline" color="primary.main" sx={{ fontWeight: 700 }}>FREIGHT · INITIAL SETUP</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>Create the owner identification, contact details, and logo.</Typography>
        <Paper variant="outlined" sx={{ maxWidth: 820, p: 2.5 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr auto' }, gap: 2.5 }}>
            <Box sx={{ display: 'grid', gap: 1.5 }}>
              <TextField label="Owner Code" value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value })} required disabled={readOnly || !!editingId} fullWidth />
              <TextField label="Owner Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} disabled={readOnly} fullWidth />
              <TextField label="Station" value={draft.station} onChange={(e) => setDraft({ ...draft, station: e.target.value })} disabled={readOnly} fullWidth />
              <TextField label="Phone/Fax No." value={draft.phoneFaxNo} onChange={(e) => setDraft({ ...draft, phoneFaxNo: e.target.value })} disabled={readOnly} fullWidth />
              <TextField label="Email" type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} disabled={readOnly} fullWidth />
              <TextField label="Website" value={draft.website} onChange={(e) => setDraft({ ...draft, website: e.target.value })} disabled={readOnly} fullWidth />
              <TextField label="IATA Code" value={draft.iataCode} onChange={(e) => setDraft({ ...draft, iataCode: e.target.value })} disabled={readOnly} fullWidth />
              <TextField label="Account No." value={draft.accountNo} onChange={(e) => setDraft({ ...draft, accountNo: e.target.value })} disabled={readOnly} fullWidth />
              <TextField label="Commission %" type="number" value={draft.commissionPercent} onChange={(e) => setDraft({ ...draft, commissionPercent: Number(e.target.value) })} disabled={readOnly} fullWidth />
              <TextField label="WHT %" type="number" value={draft.whtPercent} onChange={(e) => setDraft({ ...draft, whtPercent: Number(e.target.value) })} disabled={readOnly} fullWidth />
            </Box>
            <Paper variant="outlined" sx={{ width: { xs: '100%', md: 260 }, p: 1.5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: '100%',
                  height: 180,
                  bgcolor: 'action.hover',
                  border: '1px dashed',
                  borderColor: 'divider',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                {logoPreviewUrl ? (
                  <Box component="img" src={logoPreviewUrl} alt="Owner logo" sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                ) : (
                  <Typography variant="caption" color="text.secondary">No image selected</Typography>
                )}
              </Box>
              {!readOnly && (
                <Button component="label" variant="outlined" fullWidth>
                  Upload Image
                  <input hidden type="file" accept="image/*" onChange={(e) => handleLogoChange(e.target.files?.[0])} />
                </Button>
              )}
              {draft.logoName && (
                <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: '100%' }}>
                  {draft.logoName}
                </Typography>
              )}
            </Paper>
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
      title="Owner Codes"
      actions={<Button variant="contained" startIcon={<AddIcon />} onClick={startAdd}>New</Button>}
    >
      <OwnerCodeGrid
        version={version}
        onChange={() => setVersion((v) => v + 1)}
        onEdit={startEdit}
        onView={startView}
      />
    </PageShell>
  );
}
