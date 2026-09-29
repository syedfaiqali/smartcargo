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
import { InvoiceChargeCodeGrid } from './InvoiceChargeCodeGrid';
import { invoiceChargeRepo } from '../../data/masterDataService';
import { controlCodeRepo } from '../../data/financeSetupService';
import { InvoiceChargeCode } from '../../domain/masterData';

const breadcrumbs = ['Freight', 'Initial Setup', 'Invoice Charges Codes'];

const emptyDraft = (): Omit<InvoiceChargeCode, 'id' | 'createdAt' | 'updatedAt'> => ({
  code: '',
  description: '',
  awbAbbreviation: '',
  financeCode: '',
});

export function InvoiceChargeCodesPage() {
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

  const startEdit = (item: InvoiceChargeCode) => {
    setDraft({ ...emptyDraft(), ...item });
    setEditingId(item.id);
    setError(null);
    setMode('edit');
  };

  const startView = (item: InvoiceChargeCode) => {
    setDraft({ ...emptyDraft(), ...item });
    setEditingId(item.id);
    setError(null);
    setMode('view');
  };

  const save = () => {
    if (!draft.code.trim()) {
      setError('Code is required.');
      return;
    }
    const now = new Date().toISOString();
    const existing = editingId ? invoiceChargeRepo.get(editingId) : undefined;
    invoiceChargeRepo.save({
      ...draft,
      code: draft.code.trim(),
      description: draft.description.trim(),
      awbAbbreviation: draft.awbAbbreviation.trim(),
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
        title={mode === 'view' ? 'View invoice charge code' : editingId ? 'Edit invoice charge code' : 'Invoice charge code entry'}
        actions={<Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={backToList}>Back to Invoice Charges Codes</Button>}
      >
        <Typography variant="overline" color="primary.main" sx={{ fontWeight: 700 }}>FREIGHT · INITIAL SETUP</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>Create the invoice charge code, its AWB abbreviation, and finance linkage.</Typography>
        <Paper variant="outlined" sx={{ maxWidth: 480, p: 2.5 }}>
          <Box sx={{ display: 'grid', gap: 1.5 }}>
            <TextField label="Code" value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value })} required disabled={readOnly || !!editingId} fullWidth />
            <TextField label="Description" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} disabled={readOnly} fullWidth />
            <TextField label="Text For AWB Printing (Abbreviation)" value={draft.awbAbbreviation} onChange={(e) => setDraft({ ...draft, awbAbbreviation: e.target.value })} disabled={readOnly} fullWidth />
            <TextField select label="Finance Code" value={draft.financeCode} onChange={(e) => setDraft({ ...draft, financeCode: e.target.value })} disabled={readOnly} fullWidth>
              <MenuItem value="">Select Account Code</MenuItem>
              {controlCodes.map((c) => (
                <MenuItem key={c.code} value={c.code}>{c.code} — {c.name}</MenuItem>
              ))}
            </TextField>
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
      title="Invoice Charges Codes"
      actions={<Button variant="contained" startIcon={<AddIcon />} onClick={startAdd}>New</Button>}
    >
      <InvoiceChargeCodeGrid
        version={version}
        onChange={() => setVersion((v) => v + 1)}
        onEdit={startEdit}
        onView={startView}
      />
    </PageShell>
  );
}
