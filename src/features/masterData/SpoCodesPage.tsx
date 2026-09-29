import { useState } from 'react';
import { v4 as uuid } from 'uuid';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { PageShell } from '../../layout/PageShell';
import { SpoCodeGrid } from './SpoCodeGrid';
import { spoRepo } from '../../data/masterDataService';
import { controlCodeRepo } from '../../data/financeSetupService';
import { SpoCode } from '../../domain/masterData';

const ASSOCIATED_PARTIES_GREEN = '#2e7d32';
const ASSOCIATED_PARTIES_GREEN_BG = '#e8f5e9';

function AssociatedPartiesTable() {
  return (
    <Box sx={{ mt: 3 }}>
      <Table size="small" sx={{ border: `1.5px solid ${ASSOCIATED_PARTIES_GREEN}`, borderRadius: 1, overflow: 'hidden' }}>
        <TableHead>
          <TableRow>
            <TableCell
              colSpan={2}
              align="center"
              sx={{ bgcolor: ASSOCIATED_PARTIES_GREEN_BG, color: ASSOCIATED_PARTIES_GREEN, fontWeight: 700, borderBottom: `1.5px solid ${ASSOCIATED_PARTIES_GREEN}` }}
            >
              Associated Parties
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ bgcolor: ASSOCIATED_PARTIES_GREEN_BG, color: ASSOCIATED_PARTIES_GREEN, fontWeight: 700, borderRight: `1px solid ${ASSOCIATED_PARTIES_GREEN}`, borderBottom: `1.5px solid ${ASSOCIATED_PARTIES_GREEN}`, width: 160 }}>
              Code
            </TableCell>
            <TableCell sx={{ bgcolor: ASSOCIATED_PARTIES_GREEN_BG, color: ASSOCIATED_PARTIES_GREEN, fontWeight: 700, borderBottom: `1.5px solid ${ASSOCIATED_PARTIES_GREEN}` }}>
              Name
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell colSpan={2} align="center" sx={{ color: ASSOCIATED_PARTIES_GREEN, fontWeight: 600, py: 1.5 }}>
              No Party found.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Box>
  );
}

const breadcrumbs = ['Freight', 'Initial Setup', 'SPO Codes'];

const emptyDraft = (): Omit<SpoCode, 'id' | 'createdAt' | 'updatedAt'> => ({
  code: '',
  description: '',
  sharePercent: 0,
  splitedSharePercent: 0,
  financeCode: '',
  designation: '',
  mobileNo: '',
  email: '',
  active: 'Y',
});

export function SpoCodesPage() {
  const [version, setVersion] = useState(0);
  const [mode, setMode] = useState<'list' | 'edit' | 'view'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [error, setError] = useState<string | null>(null);
  const controlCodes = controlCodeRepo.list();

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

  const startEdit = (item: SpoCode) => {
    setDraft({ ...emptyDraft(), ...item });
    setEditingId(item.id);
    setError(null);
    setMode('edit');
  };

  const startView = (item: SpoCode) => {
    setDraft({ ...emptyDraft(), ...item });
    setEditingId(item.id);
    setError(null);
    setMode('view');
  };

  const save = () => {
    if (!draft.code.trim()) {
      setError('SPO Code is required.');
      return;
    }
    const now = new Date().toISOString();
    const existing = editingId ? spoRepo.get(editingId) : undefined;
    spoRepo.save({
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
        title={mode === 'view' ? 'View SPO code' : editingId ? 'Edit SPO code' : 'SPO code entry'}
        actions={<Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={backToList}>Back to SPO Codes</Button>}
      >
        <Typography variant="overline" color="primary.main" sx={{ fontWeight: 700 }}>FREIGHT · INITIAL SETUP</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>Sales person / SPO identification, finance linkage and contact details.</Typography>
        <Paper variant="outlined" sx={{ maxWidth: 720, p: 2.5 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <TextField label="SPO Code" value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value })} required disabled={readOnly || !!editingId} fullWidth />
            <TextField label="SPO Name" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} disabled={readOnly} fullWidth />
            <TextField label="SPO Share %" type="number" value={draft.sharePercent} onChange={(e) => setDraft({ ...draft, sharePercent: Number(e.target.value) })} disabled={readOnly} fullWidth />
            <TextField label="Splited Share %" type="number" value={draft.splitedSharePercent} onChange={(e) => setDraft({ ...draft, splitedSharePercent: Number(e.target.value) })} disabled={readOnly} fullWidth />
            <TextField select label="Finance Code" value={draft.financeCode} onChange={(e) => setDraft({ ...draft, financeCode: e.target.value })} disabled={readOnly} fullWidth>
              <MenuItem value="">Not set</MenuItem>
              {controlCodes.map((c) => (
                <MenuItem key={c.code} value={c.code}>{c.code} — {c.name}</MenuItem>
              ))}
            </TextField>
            <TextField label="Designation" value={draft.designation} onChange={(e) => setDraft({ ...draft, designation: e.target.value })} disabled={readOnly} fullWidth />
            <TextField label="Mobile No" value={draft.mobileNo} onChange={(e) => setDraft({ ...draft, mobileNo: e.target.value })} disabled={readOnly} fullWidth />
            <TextField label="Email" type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} disabled={readOnly} fullWidth />
            <TextField select label="Active (Y/N)" value={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.value as 'Y' | 'N' })} disabled={readOnly} fullWidth>
              <MenuItem value="Y">Y</MenuItem>
              <MenuItem value="N">N</MenuItem>
            </TextField>
          </Box>

          <AssociatedPartiesTable />

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
      title="SPO Codes"
      actions={<Button variant="contained" startIcon={<AddIcon />} onClick={startAdd}>New</Button>}
    >
      <SpoCodeGrid
        version={version}
        onChange={() => setVersion((v) => v + 1)}
        onEdit={startEdit}
        onView={startView}
      />
    </PageShell>
  );
}
