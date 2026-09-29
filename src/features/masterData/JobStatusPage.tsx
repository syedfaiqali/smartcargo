import { useState } from 'react';
import { v4 as uuid } from 'uuid';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { PageShell } from '../../layout/PageShell';
import { JobStatusGrid } from './JobStatusGrid';
import { jobStatusRepo } from '../../data/masterDataService';
import { JobStatusCode } from '../../domain/masterData';

const breadcrumbs = ['Freight', 'Initial Setup', 'Job Status'];

/** Derives a stable code from the status name, e.g. "In Transit" -> "IN_TRANSIT", disambiguated on collision. */
function codeFromDescription(description: string, existingCodes: Set<string>, keepCode?: string): string {
  const base = description
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'STATUS';

  if (base === keepCode || !existingCodes.has(base)) return base;
  let suffix = 2;
  while (existingCodes.has(`${base}_${suffix}`)) suffix += 1;
  return `${base}_${suffix}`;
}

export function JobStatusPage() {
  const [version, setVersion] = useState(0);
  const [mode, setMode] = useState<'list' | 'edit' | 'view'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const backToList = () => {
    setMode('list');
    setEditingId(null);
    setError(null);
  };

  const startAdd = () => {
    setDescription('');
    setEditingId(null);
    setError(null);
    setMode('edit');
  };

  const startEdit = (item: JobStatusCode) => {
    setDescription(item.description);
    setEditingId(item.id);
    setError(null);
    setMode('edit');
  };

  const startView = (item: JobStatusCode) => {
    setDescription(item.description);
    setEditingId(item.id);
    setError(null);
    setMode('view');
  };

  const save = () => {
    const trimmed = description.trim();
    if (!trimmed) {
      setError('Job Status is required.');
      return;
    }
    const now = new Date().toISOString();
    const existing = editingId ? jobStatusRepo.get(editingId) : undefined;
    const existingCodes = new Set(jobStatusRepo.list().filter((s) => s.id !== editingId).map((s) => s.code));
    const code = existing ? existing.code : codeFromDescription(trimmed, existingCodes);

    jobStatusRepo.save({
      code,
      description: trimmed,
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
        title={mode === 'view' ? 'View job status' : editingId ? 'Edit job status' : 'Job status entry'}
        actions={<Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={backToList}>Back to Job Status</Button>}
      >
        <Typography variant="overline" color="primary.main" sx={{ fontWeight: 700 }}>FREIGHT · INITIAL SETUP</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>Status label shown against a job in the transactions menu.</Typography>
        <Paper variant="outlined" sx={{ maxWidth: 480, p: 2.5 }}>
          <TextField
            label="Job Status"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            disabled={readOnly}
            fullWidth
            autoFocus={!readOnly}
          />
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
      title="Job Status"
      actions={<Button variant="contained" startIcon={<AddIcon />} onClick={startAdd}>New</Button>}
    >
      <JobStatusGrid
        version={version}
        onChange={() => setVersion((v) => v + 1)}
        onEdit={startEdit}
        onView={startView}
      />
    </PageShell>
  );
}
