import { useState } from 'react';
import { v4 as uuid } from 'uuid';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { PageShell } from '../../layout/PageShell';
import { TransactionToolbar, ToolbarAction } from '../../components/TransactionToolbar';
import { FormRow, FormField, SectionHeader } from '../../components/FormGrid';
import { Voucher, VoucherKind } from '../../domain/voucher';
import { createEmptyVoucher } from '../../domain/voucherFactory';
import {
  voucherRepo,
  nextVoucherNo,
  finalizeVoucher,
  searchVouchers,
  findReceivableSources,
  findPayableSources,
  ClearableSource,
} from '../../data/voucherService';
import { partyRepo, bankRepo, currencyRepo } from '../../data/masterDataService';

interface ClearingVoucherPageProps {
  kind: Extract<VoucherKind, 'RECEIPT' | 'PAYMENT'>;
}

export function ClearingVoucherPage({ kind }: ClearingVoucherPageProps) {
  const title = kind === 'RECEIPT' ? 'Receipt Voucher' : 'Payment Voucher';
  const parties = partyRepo.list();
  const banks = bankRepo.list();
  const currencies = currencyRepo.list();

  const [voucher, setVoucher] = useState<Voucher | null>(null);
  const [editable, setEditable] = useState(false);
  const [searching, setSearching] = useState(false);
  const [sources, setSources] = useState<ClearableSource[]>([]);
  const [allocations, setAllocations] = useState<Record<string, number>>({});
  const [message, setMessage] = useState<{ severity: 'success' | 'error' | 'warning'; text: string } | null>(null);
  const [results, setResults] = useState<Voucher[]>([]);

  const loadSources = (partyCode: string) => {
    const found = kind === 'RECEIPT' ? findReceivableSources(partyCode || undefined) : findPayableSources(partyCode || undefined);
    setSources(found);
  };

  const setPartyCode = (partyCode: string) => {
    if (!voucher) return;
    const p = parties.find((x) => x.code === partyCode);
    setVoucher({ ...voucher, partyCode, partyName: p?.name ?? '' });
    loadSources(partyCode);
    setAllocations({});
  };

  const toggleAllocation = (source: ClearableSource) => {
    setAllocations((prev) => {
      const next = { ...prev };
      if (next[source.id] !== undefined) {
        delete next[source.id];
      } else {
        next[source.id] = source.balance;
      }
      return next;
    });
  };

  const setAllocationAmount = (id: string, value: number) => {
    setAllocations((prev) => ({ ...prev, [id]: value }));
  };

  const totalAllocated = Object.values(allocations).reduce((a, v) => a + (v || 0), 0);

  const handleAction = (action: ToolbarAction) => {
    switch (action) {
      case 'new': {
        const draft = createEmptyVoucher(kind);
        draft.voucherNo = nextVoucherNo(kind, draft.branch);
        setVoucher(draft);
        setEditable(true);
        setSearching(false);
        setSources([]);
        setAllocations({});
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
        if (!voucher.partyCode || voucher.clearingLines.length === 0) {
          setMessage({ severity: 'error', text: 'Party and at least one cleared source line are required before finalizing.' });
          return;
        }
        const saved = finalizeVoucher(voucher.id);
        if (saved) {
          setVoucher(saved);
          setEditable(false);
          setMessage({ severity: 'success', text: `Voucher ${saved.voucherNo} finalized and applied to source documents.` });
        }
        break;
      }
      case 'search':
        setSearching(true);
        setResults(searchVouchers({ kind }));
        break;
      default:
        break;
    }
  };

  const handleSave = () => {
    if (!voucher) return;
    if (!voucher.partyCode) {
      setMessage({ severity: 'error', text: 'Party is required to save.' });
      return;
    }
    const clearingLines = Object.entries(allocations)
      .filter(([, amt]) => amt > 0)
      .map(([sourceId, amt]) => {
        const src = sources.find((s) => s.id === sourceId)!;
        return { id: uuid(), sourceType: src.type, sourceId: src.id, sourceDocNo: src.docNo, jobNo: src.jobNo, amountCleared: amt };
      });
    const saved = voucherRepo.save({ ...voucher, clearingLines, amount: totalAllocated });
    setVoucher(saved);
    setMessage({ severity: 'success', text: `Voucher ${saved.voucherNo} saved.` });
  };

  const disabledActions: ToolbarAction[] = [];
  if (!voucher) disabledActions.push('edit', 'delete', 'final');
  if (voucher?.final) disabledActions.push('edit', 'delete', 'final');

  return (
    <PageShell breadcrumbs={['Finance', title]} title={title}>
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
        <Box>
          <SectionHeader>Search {title}s</SectionHeader>
          <Paper variant="outlined" sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Voucher No.</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Party</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                        No {title.toLowerCase()}s found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  results.map((v) => (
                    <TableRow key={v.id} hover>
                      <TableCell>{v.voucherNo}</TableCell>
                      <TableCell>{v.voucherDate}</TableCell>
                      <TableCell>{v.partyName || v.partyCode}</TableCell>
                      <TableCell>{v.amount.toFixed(2)}</TableCell>
                      <TableCell>{v.final ? <Chip size="small" label="FINAL" color="success" /> : <Chip size="small" label="OPEN" variant="outlined" />}</TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          onClick={() => {
                            setVoucher(v);
                            setEditable(false);
                            setSearching(false);
                            loadSources(v.partyCode);
                            const allocs: Record<string, number> = {};
                            v.clearingLines.forEach((l) => {
                              allocs[l.sourceId] = l.amountCleared;
                            });
                            setAllocations(allocs);
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
        </Box>
      ) : !voucher ? (
        <Alert severity="info">Click NEW to create a {title.toLowerCase()}, or SEARCH to find an existing one.</Alert>
      ) : (
        <Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <SectionHeader>Voucher Header</SectionHeader>
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
                  <TextField
                    select
                    label={kind === 'RECEIPT' ? 'Party (Customer/Agent)' : 'Party (Vendor/Agent)'}
                    fullWidth
                    value={voucher.partyCode}
                    disabled={!editable}
                    onChange={(e) => setPartyCode(e.target.value)}
                  >
                    {parties.map((p) => (
                      <MenuItem key={p.code} value={p.code}>
                        {p.code} — {p.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </FormField>
              </FormRow>
              <FormRow>
                <FormField md={12}>
                  <TextField select label="Bank Code" fullWidth value={voucher.bankCode} disabled={!editable} onChange={(e) => setVoucher({ ...voucher, bankCode: e.target.value })}>
                    <MenuItem value="">(cash)</MenuItem>
                    {banks.map((b) => (
                      <MenuItem key={b.code} value={b.code}>
                        {b.code} — {b.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </FormField>
              </FormRow>
              <FormRow>
                <FormField md={6}>
                  <TextField select label="Currency" fullWidth value={voucher.currencyCode} disabled={!editable} onChange={(e) => setVoucher({ ...voucher, currencyCode: e.target.value })}>
                    {currencies.map((c) => (
                      <MenuItem key={c.code} value={c.code}>
                        {c.code}
                      </MenuItem>
                    ))}
                  </TextField>
                </FormField>
                <FormField md={6}>
                  <TextField
                    label="Exchange Rate"
                    type="number"
                    fullWidth
                    value={voucher.exchangeRate}
                    disabled={!editable}
                    onChange={(e) => setVoucher({ ...voucher, exchangeRate: Number(e.target.value) })}
                  />
                </FormField>
              </FormRow>
              <FormRow>
                <FormField md={12}>
                  <TextField label="Remarks" fullWidth multiline minRows={2} value={voucher.remarks} disabled={!editable} onChange={(e) => setVoucher({ ...voucher, remarks: e.target.value })} />
                </FormField>
              </FormRow>

              <Paper variant="outlined" sx={{ p: 1.5, mt: 1 }}>
                <Grid container spacing={1}>
                  <Grid item xs={7}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      Total Allocated
                    </Typography>
                  </Grid>
                  <Grid item xs={5}>
                    <Typography variant="body2" align="right" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {totalAllocated.toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12} md={8}>
              <SectionHeader>{kind === 'RECEIPT' ? 'Outstanding Receivables' : 'Outstanding Payables'}</SectionHeader>
              {!voucher.partyCode ? (
                <Alert severity="info">Select a Party to see its outstanding {kind === 'RECEIPT' ? 'invoices' : 'payables'}.</Alert>
              ) : (
                <Paper variant="outlined" sx={{ overflowX: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell padding="checkbox" />
                        <TableCell>Doc No.</TableCell>
                        <TableCell>Job No.</TableCell>
                        <TableCell>Total</TableCell>
                        <TableCell>Cleared</TableCell>
                        <TableCell>Balance</TableCell>
                        <TableCell>Applying</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sources.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} align="center">
                            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                              No outstanding {kind === 'RECEIPT' ? 'invoices' : 'payables'} for this party.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        sources.map((s) => (
                          <TableRow key={s.id} hover selected={allocations[s.id] !== undefined}>
                            <TableCell padding="checkbox">
                              <Checkbox size="small" checked={allocations[s.id] !== undefined} disabled={!editable} onChange={() => toggleAllocation(s)} />
                            </TableCell>
                            <TableCell>{s.docNo}</TableCell>
                            <TableCell>{s.jobNo}</TableCell>
                            <TableCell>{s.totalAmount.toFixed(2)}</TableCell>
                            <TableCell>{s.clearedAmount.toFixed(2)}</TableCell>
                            <TableCell>{s.balance.toFixed(2)}</TableCell>
                            <TableCell sx={{ minWidth: 100 }}>
                              {allocations[s.id] !== undefined && (
                                <TextField
                                  variant="standard"
                                  type="number"
                                  value={allocations[s.id]}
                                  disabled={!editable}
                                  onChange={(e) => setAllocationAmount(s.id, Number(e.target.value))}
                                />
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </Paper>
              )}
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
