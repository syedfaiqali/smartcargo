import { useState } from 'react';
import { v4 as uuid } from 'uuid';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
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
import { PayableTypeCodeGrid } from './PayableTypeCodeGrid';
import { payableTypeRepo, partyRepo } from '../../data/masterDataService';
import { controlCodeRepo } from '../../data/financeSetupService';
import { PayableTypeCode, PAYABLE_TYPE_DEPTS, PayableTypeDeptRow } from '../../domain/masterData';

const breadcrumbs = ['Freight', 'Initial Setup', 'Payable Type Codes'];

const emptyDeptRows = (): PayableTypeDeptRow[] => PAYABLE_TYPE_DEPTS.map(({ dept }) => ({
  dept,
  otherExpenseCode: '',
  otherExpenseAmount: 0,
  otherIncomeCode: '',
  otherIncomeAmount: 0,
}));

const emptyDraft = (): Omit<PayableTypeCode, 'id' | 'createdAt' | 'updatedAt'> => ({
  code: '',
  description: '',
  vendorCode: '',
  deptRows: emptyDeptRows(),
});

export function PayableTypeCodesPage() {
  const [version, setVersion] = useState(0);
  const [mode, setMode] = useState<'list' | 'edit' | 'view'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [error, setError] = useState<string | null>(null);
  const parties = partyRepo.list();
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

  const startEdit = (item: PayableTypeCode) => {
    setDraft({ ...emptyDraft(), ...item, deptRows: item.deptRows?.length ? item.deptRows : emptyDeptRows() });
    setEditingId(item.id);
    setError(null);
    setMode('edit');
  };

  const startView = (item: PayableTypeCode) => {
    setDraft({ ...emptyDraft(), ...item, deptRows: item.deptRows?.length ? item.deptRows : emptyDeptRows() });
    setEditingId(item.id);
    setError(null);
    setMode('view');
  };

  const updateDeptRow = (index: number, patch: Partial<PayableTypeDeptRow>) => {
    setDraft({
      ...draft,
      deptRows: draft.deptRows.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    });
  };

  const save = () => {
    if (!draft.code.trim()) {
      setError('Type Code is required.');
      return;
    }
    const now = new Date().toISOString();
    const existing = editingId ? payableTypeRepo.get(editingId) : undefined;
    payableTypeRepo.save({
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
        title={mode === 'view' ? 'View payable type code' : editingId ? 'Edit payable type code' : 'Payable type code entry'}
        actions={<Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={backToList}>Back to Payable Type Codes</Button>}
      >
        <Typography variant="overline" color="primary.main" sx={{ fontWeight: 700 }}>FREIGHT · INITIAL SETUP</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>Create the payable type and its default other-expense/other-income accounts per department.</Typography>
        <Paper variant="outlined" sx={{ maxWidth: 1180, p: 2.5 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5, mb: 2.5 }}>
            <TextField label="Type Code" value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value })} required disabled={readOnly || !!editingId} fullWidth />
            <TextField label="Description" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} disabled={readOnly} fullWidth />
            <Autocomplete
              options={parties}
              getOptionLabel={(party) => `${party.code} — ${party.name}`}
              isOptionEqualToValue={(option, value) => option.code === value.code}
              value={parties.find((p) => p.code === draft.vendorCode) ?? null}
              onChange={(_, value) => setDraft({ ...draft, vendorCode: value?.code ?? '' })}
              disabled={readOnly}
              renderInput={(params) => <TextField {...params} label="Vendor Code" placeholder="Select Vendor Code" fullWidth />}
              sx={{ gridColumn: { xs: 'auto', sm: '1 / -1' } }}
            />
          </Box>

          <Table size="small" sx={{ border: '1.5px solid', borderColor: 'success.main', '& td, & th': { borderColor: 'success.light' } }}>
            <TableHead>
              <TableRow sx={{ '& th': { bgcolor: 'success.50', fontWeight: 700 } }}>
                <TableCell>Dept.</TableCell>
                <TableCell colSpan={2} align="center">Other Expense (Dr.)</TableCell>
                <TableCell colSpan={2} align="center">Other Income (Cr.)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {draft.deptRows.map((row, index) => {
                const deptLabel = PAYABLE_TYPE_DEPTS.find((d) => d.dept === row.dept)?.label ?? row.dept;
                return (
                  <TableRow key={row.dept}>
                    <TableCell sx={{ fontWeight: 700, bgcolor: 'success.50' }}>{deptLabel}</TableCell>
                    <TableCell sx={{ minWidth: 200 }}>
                      <Autocomplete
                        size="small"
                        options={controlCodes}
                        getOptionLabel={(c) => `${c.code} — ${c.name}`}
                        isOptionEqualToValue={(option, value) => option.code === value.code}
                        value={controlCodes.find((c) => c.code === row.otherExpenseCode) ?? null}
                        onChange={(_, value) => updateDeptRow(index, { otherExpenseCode: value?.code ?? '' })}
                        disabled={readOnly}
                        renderInput={(params) => <TextField {...params} placeholder={`Select ${deptLabel} Other Expense .....`} />}
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: 110 }}>
                      <TextField
                        size="small"
                        type="number"
                        value={row.otherExpenseAmount}
                        onChange={(e) => updateDeptRow(index, { otherExpenseAmount: Number(e.target.value) })}
                        disabled={readOnly}
                        fullWidth
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: 200 }}>
                      <Autocomplete
                        size="small"
                        options={controlCodes}
                        getOptionLabel={(c) => `${c.code} — ${c.name}`}
                        isOptionEqualToValue={(option, value) => option.code === value.code}
                        value={controlCodes.find((c) => c.code === row.otherIncomeCode) ?? null}
                        onChange={(_, value) => updateDeptRow(index, { otherIncomeCode: value?.code ?? '' })}
                        disabled={readOnly}
                        renderInput={(params) => <TextField {...params} placeholder={`Select ${deptLabel} Other Income .....`} />}
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: 110 }}>
                      <TextField
                        size="small"
                        type="number"
                        value={row.otherIncomeAmount}
                        onChange={(e) => updateDeptRow(index, { otherIncomeAmount: Number(e.target.value) })}
                        disabled={readOnly}
                        fullWidth
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

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
      title="Payable Type Codes"
      actions={<Button variant="contained" startIcon={<AddIcon />} onClick={startAdd}>New</Button>}
    >
      <PayableTypeCodeGrid
        version={version}
        onChange={() => setVersion((v) => v + 1)}
        onEdit={startEdit}
        onView={startView}
      />
    </PageShell>
  );
}
