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
import { TermsAndConditionsGrid } from './TermsAndConditionsGrid';
import { termsRepo } from '../../data/masterDataService';
import { TermsAndConditions } from '../../domain/masterData';

const breadcrumbs = ['Freight', 'Initial Setup', 'Terms and Conditions'];

const emptyDraft = (): Omit<TermsAndConditions, 'id' | 'createdAt' | 'updatedAt'> => ({
  code: '',
  description: '',
});

export function TermsAndConditionsPage() {
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

  const startEdit = (item: TermsAndConditions) => {
    setDraft({ ...emptyDraft(), ...item });
    setEditingId(item.id);
    setError(null);
    setMode('edit');
  };

  const startView = (item: TermsAndConditions) => {
    setDraft({ ...emptyDraft(), ...item });
    setEditingId(item.id);
    setError(null);
    setMode('view');
  };

  const save = () => {
    if (!draft.code.trim()) {
      setError('Term Code is required.');
      return;
    }
    const now = new Date().toISOString();
    const existing = editingId ? termsRepo.get(editingId) : undefined;
    termsRepo.save({
      ...draft,
      code: draft.code.trim(),
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
        title={mode === 'view' ? 'View terms and conditions' : editingId ? 'Edit terms and conditions' : 'Terms and conditions entry'}
        actions={<Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={backToList}>Back to Terms and Conditions</Button>}
      >
        <Typography variant="overline" color="primary.main" sx={{ fontWeight: 700 }}>FREIGHT · INITIAL SETUP</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>Create the reusable terms and conditions text and its code.</Typography>
        <Paper variant="outlined" sx={{ maxWidth: 720, p: 2.5 }}>
          <Box sx={{ display: 'grid', gap: 1.5 }}>
            <TextField label="Term Code" value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value })} required disabled={readOnly || !!editingId} sx={{ maxWidth: 200 }} />
            <TextField label="Terms & Conditions" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} disabled={readOnly} multiline minRows={6} fullWidth />
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
      title="Terms and Conditions"
      actions={<Button variant="contained" startIcon={<AddIcon />} onClick={startAdd}>New</Button>}
    >
      <TermsAndConditionsGrid
        version={version}
        onChange={() => setVersion((v) => v + 1)}
        onEdit={startEdit}
        onView={startView}
      />
    </PageShell>
  );
}
