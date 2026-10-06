import { useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { PageShell } from '../../layout/PageShell';
import { DateField } from '../../components/DateField';
import { NumberField } from '../../components/NumberField';
import { bankRepo } from '../../data/masterDataService';
import { getBankReconciliation, markChequesCleared, ensureBankReconciliationSampleVouchers, ReconciliationChequeRow } from '../../data/financeReportsService';
import { printBankReconciliation } from './bankReconciliationReport';

const BRANCHES = ['KHI', 'LHE', 'ISB'];
const today = () => new Date().toISOString().slice(0, 10);

function ChequeGrid({
  title,
  rows,
  clearDates,
  onClearDateChange,
  selected,
  onToggle,
}: {
  title: string;
  rows: ReconciliationChequeRow[];
  clearDates: Record<string, string>;
  onClearDateChange: (voucherId: string, value: string) => void;
  selected: string[];
  onToggle: (voucherId: string) => void;
}) {
  const total = rows.reduce((sum, r) => sum + r.amount, 0);
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
        {title}
      </Typography>
      <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
        <Box sx={{ maxHeight: 340, overflowY: 'auto' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" />
                <TableCell>Year</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Voc. No</TableCell>
                <TableCell>Voc. Date</TableCell>
                <TableCell>Br.</TableCell>
                <TableCell>Particulars</TableCell>
                <TableCell>Chq. No.</TableCell>
                <TableCell>Chq. Date</TableCell>
                <TableCell>Chq. Clear Date</TableCell>
                <TableCell align="right">Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                      No un-cleared entries.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.voucherId} hover selected={selected.includes(row.voucherId)}>
                    <TableCell padding="checkbox">
                      <Checkbox size="small" checked={selected.includes(row.voucherId)} onChange={() => onToggle(row.voucherId)} />
                    </TableCell>
                    <TableCell>{row.voucherDate.slice(0, 4)}</TableCell>
                    <TableCell>{row.type}</TableCell>
                    <TableCell>{row.voucherNo}</TableCell>
                    <TableCell>{row.voucherDate}</TableCell>
                    <TableCell>{row.branch}</TableCell>
                    <TableCell sx={{ maxWidth: 260 }}>{row.particulars}</TableCell>
                    <TableCell>{row.chequeNo || '—'}</TableCell>
                    <TableCell>{row.chequeDate || '—'}</TableCell>
                    <TableCell sx={{ minWidth: 130 }}>
                      <TextField
                        size="small"
                        type="date"
                        fullWidth
                        value={clearDates[row.voucherId] ?? ''}
                        onChange={(e) => onClearDateChange(row.voucherId, e.target.value)}
                      />
                    </TableCell>
                    <TableCell align="right">{row.amount.toLocaleString('en-PK', { minimumFractionDigits: 2 })}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1.5, py: 0.75, bgcolor: '#eef2f7', borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary">
            Showing {rows.length} of {rows.length} entries
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            Total {total.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}

export function BankReconciliationPage() {
  ensureBankReconciliationSampleVouchers();
  const banks = bankRepo.list();

  const [branches, setBranches] = useState<string[]>(['KHI']);
  const [bankCode, setBankCode] = useState('');
  const [asOnDate, setAsOnDate] = useState(today());
  const [shown, setShown] = useState(false);
  const [version, setVersion] = useState(0);

  const [issuedSelected, setIssuedSelected] = useState<string[]>([]);
  const [depositedSelected, setDepositedSelected] = useState<string[]>([]);
  const [clearDates, setClearDates] = useState<Record<string, string>>({});
  const [bankStatementBalance, setBankStatementBalance] = useState(0);
  const [message, setMessage] = useState<{ severity: 'success' | 'error'; text: string } | null>(null);

  const data = useMemo(() => {
    if (!shown || !bankCode) return null;
    void version;
    return getBankReconciliation(bankCode, asOnDate, branches);
  }, [shown, bankCode, asOnDate, branches, version]);

  const addTotal = data?.issuedUncleared.reduce((sum, r) => sum + r.amount, 0) ?? 0;
  const lessTotal = data?.depositedUncleared.reduce((sum, r) => sum + r.amount, 0) ?? 0;

  const chequesIssuedCleared = issuedSelected.reduce((sum, id) => sum + (data?.issuedUncleared.find((r) => r.voucherId === id)?.amount ?? 0), 0);
  const chequesDepositedCleared = depositedSelected.reduce((sum, id) => sum + (data?.depositedUncleared.find((r) => r.voucherId === id)?.amount ?? 0), 0);
  const bookBalanceAfterClearing = (data?.bookBalance ?? 0) + chequesIssuedCleared - chequesDepositedCleared;
  const difference = bankStatementBalance - bookBalanceAfterClearing;

  const handleShowDetail = () => {
    if (!bankCode) {
      setMessage({ severity: 'error', text: 'Select a Bank Code first.' });
      return;
    }
    setMessage(null);
    setShown(true);
    setIssuedSelected([]);
    setDepositedSelected([]);
    setClearDates({});
    setBankStatementBalance(0);
  };

  const setClearDate = (voucherId: string, value: string) => setClearDates((current) => ({ ...current, [voucherId]: value }));

  const toggleIssued = (id: string) => {
    setIssuedSelected((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]));
    if (!clearDates[id]) setClearDate(id, asOnDate);
  };
  const toggleDeposited = (id: string) => {
    setDepositedSelected((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]));
    if (!clearDates[id]) setClearDate(id, asOnDate);
  };

  const handleUpdate = () => {
    const ids = [...issuedSelected, ...depositedSelected];
    if (ids.length === 0) {
      setMessage({ severity: 'error', text: 'Select at least one cheque to mark as cleared.' });
      return;
    }
    const missingDate = ids.find((id) => !clearDates[id]);
    if (missingDate) {
      setMessage({ severity: 'error', text: 'Enter a Chq. Clear Date for every selected cheque.' });
      return;
    }
    for (const id of ids) {
      markChequesCleared([id], clearDates[id]);
    }
    setMessage({ severity: 'success', text: `${ids.length} cheque(s) marked as cleared.` });
    setIssuedSelected([]);
    setDepositedSelected([]);
    setVersion((v) => v + 1);
  };

  const handlePrint = () => {
    if (!data) return;
    const bank = banks.find((b) => b.code === bankCode);
    printBankReconciliation(data, {
      branch: branches[0] ?? 'KHI',
      bankCode,
      bankName: bank?.name ?? '',
      asOnDate,
      currencyCode: 'PKR',
      userName: 'Supervisor',
    });
  };

  return (
    <PageShell breadcrumbs={['Finance', 'Bank Reconciliation']} title="Bank Reconciliation">
      {message && (
        <Alert severity={message.severity} onClose={() => setMessage(null)} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} md={3}>
            <Autocomplete
              multiple
              options={BRANCHES}
              value={branches}
              onChange={(_, value) => setBranches(value)}
              renderTags={(value, getTagProps) => value.map((option, index) => <Chip label={option} size="small" {...getTagProps({ index })} key={option} />)}
              renderInput={(params) => <TextField {...params} label="Branch" placeholder="Branch" />}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField select label="Bank Code" fullWidth value={bankCode} onChange={(e) => { setBankCode(e.target.value); setShown(false); }}>
              <MenuItem value="">Select Bank</MenuItem>
              {banks.map((b) => (
                <MenuItem key={b.code} value={b.code}>
                  {b.code} — {b.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <DateField label="As On Date" value={asOnDate} onChange={(value) => { setAsOnDate(value || today()); setShown(false); }} />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button variant="contained" fullWidth onClick={handleShowDetail}>
              Show Detail
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {!shown || !data ? (
        <Alert severity="info">Select a Bank Code and click Show Detail to load the reconciliation worksheet.</Alert>
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <ChequeGrid
              title="Add: Cheques issued but not presented/Debited by Bank"
              rows={data.issuedUncleared}
              clearDates={clearDates}
              onClearDateChange={setClearDate}
              selected={issuedSelected}
              onToggle={toggleIssued}
            />
            <ChequeGrid
              title="Less: Cheques Deposited but not yet credited by Bank"
              rows={data.depositedUncleared}
              clearDates={clearDates}
              onClearDateChange={setClearDate}
              selected={depositedSelected}
              onToggle={toggleDeposited}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
              <Box sx={{ '& > div': { display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1.5, py: 1, borderBottom: '1px solid #e2e8f0', gap: 1 } }}>
                <Box>
                  <Typography variant="body2">Balance As On {asOnDate} as per Books</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {data.bookBalance.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2">Add: Cheques issued but not presented</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {addTotal.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                  </Typography>
                </Box>
                <Box sx={{ bgcolor: '#eef2f7' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>Total</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {(data.bookBalance + addTotal).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2">Less: Cheques Deposited but not yet credited</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {lessTotal.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                  </Typography>
                </Box>
                <Box sx={{ bgcolor: '#eef2f7' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>Total</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {(data.bookBalance + addTotal - lessTotal).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ bgcolor: '#dcfce7', textAlign: 'center', py: 0.75, fontWeight: 700, fontSize: 13 }}>
                Cheques Marked As (Cleared)
              </Box>
              <Box sx={{ p: 1.5, display: 'grid', gap: 1.25 }}>
                <NumberField label="Cheques Issued" value={issuedSelected.length} fullWidth InputProps={{ readOnly: true }} />
                <NumberField label="Cheques Deposited" value={depositedSelected.length} fullWidth InputProps={{ readOnly: true }} />
                <NumberField
                  label="Book Balance after Chq. Cleared"
                  value={bookBalanceAfterClearing.toFixed(2)}
                  fullWidth
                  InputProps={{ readOnly: true }}
                  sx={{ '& .MuiInputBase-input': { fontWeight: 700, color: 'primary.main' } }}
                />
                <NumberField
                  label={`Bal. as on ${asOnDate} as per Bank Statement`}
                  value={bankStatementBalance}
                  fullWidth
                  onChange={(e) => setBankStatementBalance(Number(e.target.value) || 0)}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1, py: 1, bgcolor: Math.abs(difference) < 0.01 ? '#dcfce7' : '#fee2e2', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>Difference</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {difference.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, p: 1.5, pt: 0 }}>
                <Button variant="contained" onClick={handleUpdate}>
                  Update
                </Button>
                <Button variant="outlined" onClick={handlePrint}>
                  Print
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
    </PageShell>
  );
}
