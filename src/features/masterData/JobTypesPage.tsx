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
import { EditableCodeTable } from './EditableCodeTable';
import { jobTypeRepo } from '../../data/masterDataService';
import { JobType } from '../../domain/masterData';

const breadcrumbs = ['Freight', 'Initial Setup', 'Job Types'];
const emptyDraft = (): Omit<JobType, 'id' | 'createdAt' | 'updatedAt'> => ({
  code: '', description: '', incomeCode: '', incomeDescription: '',
});

export function JobTypesPage() {
  const [version, setVersion] = useState(0);
  const [isEntry, setIsEntry] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState(emptyDraft);

  const closeEntry = () => {
    setEditingId(null);
    setIsEntry(false);
  };

  const save = () => {
    if (!draft.code.trim()) return;
    const now = new Date().toISOString();
    const existing = editingId ? jobTypeRepo.get(editingId) : undefined;
    jobTypeRepo.save({
      ...draft,
      code: draft.code.trim(),
      description: draft.description.trim(),
      incomeCode: draft.incomeCode.trim(),
      incomeDescription: draft.incomeDescription.trim(),
      id: existing?.id ?? uuid(),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    });
    setVersion((value) => value + 1);
    closeEntry();
  };

  if (isEntry) {
    return (
      <PageShell
        breadcrumbs={breadcrumbs}
        title={editingId ? 'Edit Job Type' : 'Job Type Entry'}
        actions={<Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={closeEntry}>Back to Job Types</Button>}
      >
        <Typography variant="overline" color="primary.main" sx={{ fontWeight: 700 }}>FREIGHT · INITIAL SETUP</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>Create the Job Code, Job Type, and related Income Code.</Typography>
        <Paper variant="outlined" sx={{ maxWidth: 680, p: 2.5 }}>
          <Box sx={{ display: 'grid', gap: 1.5 }}>
            <TextField label="Job Code" value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value })} required fullWidth />
            <TextField label="Job Type" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} fullWidth />
            <TextField label="Income Code" placeholder="Enter Income Code ..." value={draft.incomeCode} onChange={(e) => setDraft({ ...draft, incomeCode: e.target.value })} fullWidth />
          </Box>
          <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
            <Button variant="contained" onClick={save}>Save</Button>
            <Button onClick={closeEntry}>Cancel</Button>
          </Stack>
        </Paper>
      </PageShell>
    );
  }

  return (
    <PageShell
      breadcrumbs={breadcrumbs}
      title="Job Types"
      actions={<Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditingId(null); setDraft(emptyDraft()); setIsEntry(true); }}>Add</Button>}
    >
      <EditableCodeTable
        title="Job Types"
        fields={[
          { key: 'code', label: 'Job Code' },
          { key: 'description', label: 'Job Type' },
          { key: 'incomeCode', label: 'Code', group: 'Income' },
          { key: 'incomeDescription', label: 'Description', group: 'Income' },
        ]}
        repo={jobTypeRepo}
        emptyItem={emptyDraft()}
        showFilters={false}
        showAddButton={false}
        version={version}
        onChange={() => setVersion((value) => value + 1)}
        onEditRecord={(jobType) => { setDraft({ ...emptyDraft(), ...jobType }); setEditingId(jobType.id); setIsEntry(true); }}
      />
    </PageShell>
  );
}
