import { useState } from 'react';
import { v4 as uuid } from 'uuid';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { PageShell } from '../../layout/PageShell';
import { TransactionToolbar, ToolbarAction } from '../../components/TransactionToolbar';
import { FormRow, FormField, SectionHeader } from '../../components/FormGrid';
import { Voucher } from '../../domain/voucher';
import { createEmptyVoucher } from '../../domain/voucherFactory';
import { voucherRepo, nextVoucherNo, searchVouchers } from '../../data/voucherService';

const COMMON_ACCOUNT_HEADS = [
  'Commission Income',
  'WHT Payable',
  'WHT Receivable',
  'SPO Commission Payable',
  'K.B. / Rate-Difference Adjustment',
  'Bank/Cash',
];

export function JournalVoucherPage() {
  const [voucher, setVoucher] = useState<Voucher | null>(null);
  const [editable, setEditable] = useState(false);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<Voucher[]>([]);
  const [message, setMessage] = useState<{ severity: 'success' | 'error' | 'warning'; text: string } | null>(null);

  const totalDebit = voucher?.journalLines.reduce((s, l) => s + l.debit, 0) ?? 0;
  const totalCredit = voucher?.journalLines.reduce((s, l) => s + l.credit, 0) ?? 0;
  const balanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

  const addLine = () => {
    if (!voucher) return;
    setVoucher({ ...voucher, journalLines: [...voucher.journalLines, { id: uuid(), accountHead: '', description: '', debit: 0, credit: 0 }] });
  };
  const updateLine = (id: string, patch: Partial<Voucher['journalLines'][number]>) => {
    if (!voucher) return;
    setVoucher({ ...voucher, journalLines: voucher.journalLines.map((l) => (l.id === id ? { ...l, ...patch } : l)) });
  };
  const removeLine = (id: string) => {
    if (!voucher) return;
    setVoucher({ ...voucher, journalLines: voucher.journalLines.filter((l) => l.id !== id) });
  };

  const handleAction = (action: ToolbarAction) => {
    switch (action) {
      case 'new': {
        const draft = createEmptyVoucher('JOURNAL');
        draft.voucherNo = nextVoucherNo('JOURNAL', draft.branch);
        setVoucher(draft);
        setEditable(true);
        setSearching(false);
        setMessage(null);
        break;
      }
      case 'edit': {
        if (!voucher) {
          setMessage({ severity: 'warning', text: 'Load a voucher first (SEARCH).' });
          return;
        }
        if (voucher.final) {
          setMessage({ severity: 'warning', text: 'This voucher is FINAL and cannot be edited.' });
          return;
        }
        setEditable(true);
        break;
      }
      case 'delete': {
        if (!voucher) return;
        voucherRepo.remove(voucher.id);
        setVoucher(null);
        setMessage({ severity: 'success', text: 'Voucher deleted.' });
        break;
      }
      case 'final': {
        if (!voucher) return;
        if (!balanced) {
          setMessage({ severity: 'error', text: 'Total Debit must equal Total Credit before finalizing.' });
          return;
        }
        const saved = voucherRepo.save({ ...voucher, final: true, amount: totalDebit });
        setVoucher(saved);
        setEditable(false);
        setMessage({ severity: 'success', text: `Voucher ${saved.voucherNo} finalized.` });
        break;
      }
      case 'search':
        setSearching(true);
        setResults(searchVouchers({ kind: 'JOURNAL' }));
        break;
      default:
        break;
    }
  };

  const handleSave = () => {
    if (!voucher) return;
    if (voucher.journalLines.length === 0) {
      setMessage({ severity: 'error', text: 'At least one journal line is required to save.' });
      return;
    }
    const saved = voucherRepo.save({ ...voucher, amount: totalDebit });
    setVoucher(saved);
    setMessage({ severity: 'success', text: `Voucher ${saved.voucherNo} saved.` });
  };

  const disabledActions: ToolbarAction[] = [];
  if (!voucher) disabledActions.push('edit', 'delete', 'final');
  if (voucher?.final) disabledActions.push('edit', 'delete', 'final');

  return (
    <PageShell breadcrumbs={['Finance', 'JVR - Journal Voucher']} title="JVR - Journal Voucher">
      {message && (
        <Alert severity={message.severity} onClose={() => setMessage(null)} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      <TransactionToolbar actions={['search', 'new', 'edit', 'delete', 'final']} disabledActions={disabledActions} onAction={handleAction} />

      {voucher && !searching && (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Chip label={`Voucher No: ${voucher.voucherNo}`} color="primary" />
          {voucher.final && <Chip label="FINAL" color="success" />}
          {editable && <Chip label="EDITING" color="info" variant="outlined" />}
        </Stack>
      )}

      {searching ? (
        <Paper variant="outlined" sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Voucher No.</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                      No journal vouchers found.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                results.map((v) => (
                  <TableRow key={v.id} hover>
                    <TableCell>{v.voucherNo}</TableCell>
                    <TableCell>{v.voucherDate}</TableCell>
                    <TableCell>{v.amount.toFixed(2)}</TableCell>
                    <TableCell>{v.final ? <Chip size="small" label="FINAL" color="success" /> : <Chip size="small" label="OPEN" variant="outlined" />}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        onClick={() => {
                          setVoucher(v);
                          setEditable(false);
                          setSearching(false);
                        }}
                      >
                        Open
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Paper>
      ) : !voucher ? (
        <Alert severity="info">Click NEW to create a journal voucher, or SEARCH to find an existing one.</Alert>
      ) : (
        <Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <SectionHeader>Header</SectionHeader>
              <FormRow>
                <FormField md={6}>
                  <TextField label="Branch" fullWidth value={voucher.branch} disabled={!editable} onChange={(e) => setVoucher({ ...voucher, branch: e.target.value })} />
                </FormField>
                <FormField md={6}>
                  <TextField label="Voucher No." fullWidth value={voucher.voucherNo} disabled />
                </FormField>
              </FormRow>
              <FormRow>
                <FormField md={12}>
                  <TextField
                    label="Voucher Date"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={voucher.voucherDate}
                    disabled={!editable}
                    onChange={(e) => setVoucher({ ...voucher, voucherDate: e.target.value })}
                  />
                </FormField>
              </FormRow>
              <FormRow>
                <FormField md={12}>
                  <TextField label="Remarks" fullWidth multiline minRows={3} value={voucher.remarks} disabled={!editable} onChange={(e) => setVoucher({ ...voucher, remarks: e.target.value })} />
                </FormField>
              </FormRow>

              <Paper variant="outlined" sx={{ p: 1.5 }}>
                <Grid container spacing={1}>
                  <Grid item xs={7}>
                    <Typography variant="body2">Total Debit</Typography>
                  </Grid>
                  <Grid item xs={5}>
                    <Typography variant="body2" align="right">
                      {totalDebit.toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid item xs={7}>
                    <Typography variant="body2">Total Credit</Typography>
                  </Grid>
                  <Grid item xs={5}>
                    <Typography variant="body2" align="right">
                      {totalCredit.toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Chip size="small" label={balanced ? 'Balanced' : 'Not Balanced'} color={balanced ? 'success' : 'warning'} sx={{ mt: 1 }} />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12} md={8}>
              <SectionHeader>Journal Lines</SectionHeader>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Common account heads: {COMMON_ACCOUNT_HEADS.join(', ')}
              </Typography>
              <Paper variant="outlined" sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Account Head</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Debit</TableCell>
                      <TableCell>Credit</TableCell>
                      <TableCell />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {voucher.journalLines.map((line) => (
                      <TableRow key={line.id}>
                        <TableCell sx={{ minWidth: 180 }}>
                          <TextField variant="standard" fullWidth value={line.accountHead} disabled={!editable} onChange={(e) => updateLine(line.id, { accountHead: e.target.value })} />
                        </TableCell>
                        <TableCell sx={{ minWidth: 180 }}>
                          <TextField variant="standard" fullWidth value={line.description} disabled={!editable} onChange={(e) => updateLine(line.id, { description: e.target.value })} />
                        </TableCell>
                        <TableCell sx={{ minWidth: 100 }}>
                          <TextField variant="standard" type="number" value={line.debit} disabled={!editable} onChange={(e) => updateLine(line.id, { debit: Number(e.target.value) })} />
                        </TableCell>
                        <TableCell sx={{ minWidth: 100 }}>
                          <TextField variant="standard" type="number" value={line.credit} disabled={!editable} onChange={(e) => updateLine(line.id, { credit: Number(e.target.value) })} />
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" disabled={!editable} onClick={() => removeLine(line.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={2} sx={{ fontWeight: 700 }}>
                        Total
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{totalDebit.toFixed(2)}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{totalCredit.toFixed(2)}</TableCell>
                      <TableCell />
                    </TableRow>
                  </TableBody>
                </Table>
                <Button size="small" startIcon={<AddIcon />} disabled={!editable} onClick={addLine} sx={{ m: 1 }}>
                  Add Line
                </Button>
              </Paper>
            </Grid>
          </Grid>

          {editable && (
            <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
              <Chip label="SAVE" color="primary" onClick={handleSave} sx={{ cursor: 'pointer', px: 2, py: 2.5, fontWeight: 700 }} />
            </Box>
          )}
        </Box>
      )}
    </PageShell>
  );
}
