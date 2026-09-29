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
import { SignatoryCodeGrid } from './SignatoryCodeGrid';
import { signatoryRepo } from '../../data/masterDataService';
import { SignatoryCode } from '../../domain/masterData';

const breadcrumbs = ['Freight', 'Initial Setup', 'Signatory Codes'];

const emptyDraft = (): Omit<SignatoryCode, 'id' | 'createdAt' | 'updatedAt'> => ({
  code: '',
  name: '',
  designation: '',
  fatherName: '',
  cnicNo: '',
  email: '',
  signatureImageName: '',
});

export function SignatoryCodesPage() {
  const [version, setVersion] = useState(0);
  const [mode, setMode] = useState<'list' | 'edit' | 'view'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [error, setError] = useState<string | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    };
  }, [imagePreviewUrl]);

  const backToList = () => {
    setMode('list');
    setEditingId(null);
    setError(null);
    setImagePreviewUrl(null);
  };

  const startAdd = () => {
    setDraft(emptyDraft());
    setEditingId(null);
    setError(null);
    setImagePreviewUrl(null);
    setMode('edit');
  };

  const startEdit = (item: SignatoryCode) => {
    setDraft({ ...emptyDraft(), ...item });
    setEditingId(item.id);
    setError(null);
    setImagePreviewUrl(null);
    setMode('edit');
  };

  const startView = (item: SignatoryCode) => {
    setDraft({ ...emptyDraft(), ...item });
    setEditingId(item.id);
    setError(null);
    setImagePreviewUrl(null);
    setMode('view');
  };

  const handleImageChange = (file: File | undefined) => {
    if (!file) return;
    setDraft({ ...draft, signatureImageName: file.name });
    setImagePreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
  };

  const save = () => {
    if (!draft.code.trim()) {
      setError('Signatory Code is required.');
      return;
    }
    const now = new Date().toISOString();
    const existing = editingId ? signatoryRepo.get(editingId) : undefined;
    signatoryRepo.save({
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
        title={mode === 'view' ? 'View signatory code' : editingId ? 'Edit signatory code' : 'Signatory code entry'}
        actions={<Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={backToList}>Back to Signatory Codes</Button>}
      >
        <Typography variant="overline" color="primary.main" sx={{ fontWeight: 700 }}>FREIGHT · INITIAL SETUP</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>Create the signatory identification and upload their signature image.</Typography>
        <Paper variant="outlined" sx={{ maxWidth: 820, p: 2.5 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr auto' }, gap: 2.5 }}>
            <Box sx={{ display: 'grid', gap: 1.5 }}>
              <TextField label="Signatory Code" value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value })} required disabled={readOnly || !!editingId} fullWidth />
              <TextField label="Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} disabled={readOnly} fullWidth />
              <TextField label="Designation" value={draft.designation} onChange={(e) => setDraft({ ...draft, designation: e.target.value })} disabled={readOnly} fullWidth />
              <TextField label="Father Name" value={draft.fatherName} onChange={(e) => setDraft({ ...draft, fatherName: e.target.value })} disabled={readOnly} fullWidth />
              <TextField label="CNIC No." value={draft.cnicNo} onChange={(e) => setDraft({ ...draft, cnicNo: e.target.value })} disabled={readOnly} fullWidth />
              <TextField label="Email" type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} disabled={readOnly} fullWidth />
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
                {imagePreviewUrl ? (
                  <Box component="img" src={imagePreviewUrl} alt="Signature" sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                ) : (
                  <Typography variant="caption" color="text.secondary">No image selected</Typography>
                )}
              </Box>
              {!readOnly && (
                <Button component="label" variant="outlined" fullWidth>
                  Upload Image
                  <input hidden type="file" accept="image/*" onChange={(e) => handleImageChange(e.target.files?.[0])} />
                </Button>
              )}
              {draft.signatureImageName && (
                <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: '100%' }}>
                  {draft.signatureImageName}
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
      title="Signatory Codes"
      actions={<Button variant="contained" startIcon={<AddIcon />} onClick={startAdd}>New</Button>}
    >
      <SignatoryCodeGrid
        version={version}
        onChange={() => setVersion((v) => v + 1)}
        onEdit={startEdit}
        onView={startView}
      />
    </PageShell>
  );
}
