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
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { PageShell } from '../../layout/PageShell';
import { TransactionToolbar, ToolbarAction } from '../../components/TransactionToolbar';
import { FormRow, FormField, SectionHeader } from '../../components/FormGrid';
import { Voucher, VoucherAccountLine, VoucherKind } from '../../domain/voucher';
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
import { controlCodeRepo } from '../../data/financeSetupService';
import { VoucherGrid } from './VoucherGrid';
import { VoucherPrintingTab } from './VoucherPrintingTab';

interface ClearingVoucherPageProps {
  kind: Extract<VoucherKind, 'RECEIPT' | 'PAYMENT'>;
  title?: string;
  mode: 'BANK' | 'CASH';
}

interface CostLine {
  id: string;
  action: string;
  accountCode: string;
  description: string;
  branch: string;
  jobType: string;
  masterJob: string;
  houseJob: string;
  airwayBill: string;
  houseCnNo: string;
  expenseAmount: number;
}

const newCostLine = (): CostLine => ({
  id: uuid(), action: '', accountCode: '', description: '', branch: '', jobType: '',
  masterJob: '', houseJob: '', airwayBill: '', houseCnNo: '', expenseAmount: 0,
});

export function ClearingVoucherPage({ kind, title: titleOverride }: ClearingVoucherPageProps) {
  const title = titleOverride ?? (kind === 'RECEIPT' ? 'Receipt Voucher' : 'Payment Voucher');
const TITLES: Record<string, string> = {
  RECEIPT_BANK: 'BRV - Bank Receipt Voucher',
  RECEIPT_CASH: 'CRV - Cash Receipt Voucher',
  PAYMENT_BANK: 'BPV - Bank Payment Voucher',
  PAYMENT_CASH: 'CPV - Cash Payment Voucher',
};

export function ClearingVoucherPage({ kind, mode }: ClearingVoucherPageProps) {
  const title = TITLES[`${kind}_${mode}`];
  const parties = partyRepo.list();
  const banks = bankRepo.list();
  const currencies = currencyRepo.list();
  const controlCodes = controlCodeRepo.list();

  const [voucher, setVoucher] = useState<Voucher | null>(null);
  const [editable, setEditable] = useState(false);
  const [searching, setSearching] = useState(false);
  const [sources, setSources] = useState<ClearableSource[]>([]);
  const [allocations, setAllocations] = useState<Record<string, number>>({});
  const [message, setMessage] = useState<{ severity: 'success' | 'error' | 'warning'; text: string } | null>(null);
  const [results, setResults] = useState<Voucher[]>([]);
  const [showList, setShowList] = useState(true);
  const [isPrintingView, setIsPrintingView] = useState(false);
  const [tab, setTab] = useState(0);
  const [costLines, setCostLines] = useState<CostLine[]>([]);
  const [costForm, setCostForm] = useState({
    accountCode: '', jobType: '', jobYear: '', station: '', houseJobNo: '', masterJobRunNo: '',
    courierCnNo: '', hawbHblNo: '', mawbMblNo: '', amount: '', partyName: '', invoiceNo: '',
    invoiceYear: '', invoiceAmount: '',
  });

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
  const accountLines = voucher?.accountLines ?? [];
  const totalDebit = accountLines.filter((line) => line.debitCredit === 'D').reduce((total, line) => total + (line.amount || 0), 0);
  const totalCredit = accountLines.filter((line) => line.debitCredit === 'C').reduce((total, line) => total + (line.amount || 0), 0);
  const voucherTotal = totalDebit || totalCredit || totalAllocated;
  const addAccountLine = () => {
    if (!voucher) return;
    const line: VoucherAccountLine = { id: uuid(), action: '', debitCredit: 'D', accountCode: '', particulars: '', analysis: '', billNo: '', billDate: '', currencyCode: voucher.currencyCode, exchangeRate: voucher.exchangeRate, amount: 0 };
    setVoucher({ ...voucher, accountLines: [...accountLines, line] });
  };
  const updateAccountLine = (id: string, patch: Partial<VoucherAccountLine>) => {
    if (!voucher) return;
    setVoucher({ ...voucher, accountLines: accountLines.map((line) => line.id === id ? { ...line, ...patch } : line) });
  };
  const removeAccountLine = (id: string) => {
    if (!voucher) return;
    setVoucher({ ...voucher, accountLines: accountLines.filter((line) => line.id !== id) });
  };

  const handleAction = (action: ToolbarAction) => {
    switch (action) {
      case 'new': {
        const draft = createEmptyVoucher(kind);
        draft.voucherNo = nextVoucherNo(kind, draft.branch);
        if (mode === 'CASH') draft.bankCode = '';
        setVoucher(draft);
        setEditable(true);
        setSearching(false);
        setSources([]);
        setAllocations({});
        setMessage(null);
        setTab(0);
        setCostLines([]);
        setCostForm({ accountCode: '', jobType: '', jobYear: '', station: '', houseJobNo: '', masterJobRunNo: '', courierCnNo: '', hawbHblNo: '', mawbMblNo: '', amount: '', partyName: '', invoiceNo: '', invoiceYear: '', invoiceAmount: '' });
        setShowList(false);
        setIsPrintingView(false);
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
        setShowList(true);
        setMessage({ severity: 'success', text: 'Voucher deleted.' });
        break;
      }
      case 'final': {
        if (!voucher) return;
        if (!voucher.partyCode || voucher.clearingLines.length === 0) {
          setMessage({ severity: 'error', text: 'Party and at least one cleared source line are required before finalizing.' });
          return;
        }
        if (mode === 'BANK' && !voucher.bankCode) {
          setMessage({ severity: 'error', text: 'Bank Code is required before finalizing.' });
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
    const saved = voucherRepo.save({ ...voucher, clearingLines, amount: voucherTotal });
    setVoucher(saved);
    setMessage({ severity: 'success', text: `Voucher ${saved.voucherNo} saved.` });
  };

  const disabledActions: ToolbarAction[] = [];
  if (!voucher) disabledActions.push('edit', 'delete', 'final');
  if (voucher?.final) disabledActions.push('edit', 'delete', 'final');

  const openVoucher = (item: Voucher, edit = false) => {
    setVoucher(item);
    setEditable(edit && !item.final);
    setSearching(false);
    setTab(0);
    setShowList(false);
    setIsPrintingView(false);
    setCostLines([]);
    setCostForm({ accountCode: item.accountCode ?? '', jobType: '', jobYear: '', station: item.branch, houseJobNo: '', masterJobRunNo: '', courierCnNo: '', hawbHblNo: '', mawbMblNo: '', amount: String(item.amount || ''), partyName: item.partyName, invoiceNo: '', invoiceYear: '', invoiceAmount: '' });
    loadSources(item.partyCode);
    const allocs: Record<string, number> = {};
    item.clearingLines.forEach((line) => { allocs[line.sourceId] = line.amountCleared; });
    setAllocations(allocs);
  };

  const deleteFromList = (item: Voucher) => {
    voucherRepo.remove(item.id);
    setMessage({ severity: 'success', text: `Voucher ${item.voucherNo} deleted.` });
  };

  const printFromList = (item: Voucher) => {
    setVoucher(item);
    setEditable(false);
    setSearching(false);
    setShowList(false);
    setIsPrintingView(true);
  };

  const updateCostForm = (field: keyof typeof costForm, value: string) => setCostForm((current) => ({ ...current, [field]: value }));
  const updateCostLine = (id: string, field: keyof CostLine, value: string) => setCostLines((current) => current.map((line) => line.id === id ? { ...line, [field]: field === 'expenseAmount' ? Number(value) : value } : line));
  const costDetailTotal = costLines.reduce((total, line) => total + (line.expenseAmount || 0), 0);
  const costAccountTotal = Number(costForm.amount) || 0;

  return (
    <PageShell breadcrumbs={['Finance', title]} title={title} actions={!showList ? <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => { setShowList(true); setVoucher(null); setEditable(false); setSearching(false); setIsPrintingView(false); setMessage(null); }}>Back to List</Button> : undefined}>
      {message && (
        <Alert severity={message.severity} onClose={() => setMessage(null)} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      {showList ? (
        <>
          <TransactionToolbar actions={['new']} onAction={handleAction} />
          <VoucherGrid vouchers={searchVouchers({ kind })} onOpen={(item) => openVoucher(item)} onEdit={(item) => openVoucher(item, true)} onDelete={deleteFromList} onPrint={printFromList} />
        </>
      ) : (
        <>
      {!isPrintingView && <TransactionToolbar actions={editable ? ['save', 'delete', 'final'] : ['edit', 'delete', 'final']} disabledActions={disabledActions} onAction={(action) => action === 'save' ? handleSave() : handleAction(action)} />}

      {voucher && !searching && (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Chip label={`Voucher No: ${voucher.voucherNo}`} color="primary" />
          {voucher.final && <Chip label="FINAL" color="success" />}
          {editable && <Chip label="EDITING" color="info" variant="outlined" />}
        </Stack>
      )}

      <Tabs value={isPrintingView ? 0 : tab} onChange={(_, value) => !isPrintingView && setTab(value)} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        {isPrintingView ? <Tab value={0} label="Printing" /> : <><Tab value={0} label="Entry" onClick={() => setTab(0)} /><Tab value={1} label="Docs. Knock Off" onClick={() => setTab(1)} /><Tab value={2} label="COST" onClick={() => setTab(2)} /></>}
      </Tabs>

      {isPrintingView && voucher ? <VoucherPrintingTab voucher={voucher} /> : searching ? (
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
                            openVoucher(v);
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
        <Alert severity="info">{tab === 0 ? `Click NEW to create a ${title.toLowerCase()}, or SEARCH to find an existing one.` : `Create or open a ${title.toLowerCase()} before entering ${tab === 1 ? 'invoice knock-off' : 'cost'} details.`}</Alert>
      ) : (
        <Box>
          {tab === 0 ? <>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={4}>
                <SectionHeader>Bank Payment Voucher</SectionHeader>
                <FormRow><FormField md={6}><TextField label="Branch" fullWidth value={voucher.branch} disabled={!editable} onChange={(e) => setVoucher({ ...voucher, branch: e.target.value })} /></FormField><FormField md={6}><TextField label="Entry Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={voucher.entryDate ?? voucher.voucherDate} disabled={!editable} onChange={(e) => setVoucher({ ...voucher, entryDate: e.target.value })} /></FormField></FormRow>
                <FormRow><FormField md={6}><TextField label="Voucher No." fullWidth value={voucher.voucherNo} disabled /></FormField><FormField md={6}><TextField label="Voucher Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={voucher.voucherDate} disabled={!editable} onChange={(e) => setVoucher({ ...voucher, voucherDate: e.target.value })} /></FormField></FormRow>
                <FormRow><FormField md={12}><TextField select label="Pay To" fullWidth value={voucher.partyCode} disabled={!editable} onChange={(e) => setPartyCode(e.target.value)}>{parties.map((party) => <MenuItem key={party.code} value={party.code}>{party.code} — {party.name}</MenuItem>)}</TextField></FormField></FormRow>
                <FormRow><FormField md={6}><TextField label="Cheque No." fullWidth value={voucher.chequeNo ?? ''} disabled={!editable} onChange={(e) => setVoucher({ ...voucher, chequeNo: e.target.value })} /></FormField><FormField md={6}><TextField label="Cheque Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={voucher.chequeDate ?? ''} disabled={!editable} onChange={(e) => setVoucher({ ...voucher, chequeDate: e.target.value })} /></FormField></FormRow>
                <FormRow><FormField md={6}><TextField select label="Cheque Status" fullWidth value={voucher.chequeStatus ?? 'Un Cleared'} disabled={!editable} onChange={(e) => setVoucher({ ...voucher, chequeStatus: e.target.value as Voucher['chequeStatus'] })}><MenuItem value="Un Cleared">Un Cleared</MenuItem><MenuItem value="Cleared">Cleared</MenuItem></TextField></FormField><FormField md={6}><TextField label="Clearing Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={voucher.clearingDate ?? ''} disabled={!editable} onChange={(e) => setVoucher({ ...voucher, clearingDate: e.target.value })} /></FormField></FormRow>
                <FormRow><FormField md={6}><TextField select label="Cheque Type" fullWidth value={voucher.chequeType ?? 'Open'} disabled={!editable} onChange={(e) => setVoucher({ ...voucher, chequeType: e.target.value as Voucher['chequeType'] })}><MenuItem value="Open">Open</MenuItem><MenuItem value="Crossed">Crossed</MenuItem></TextField></FormField><FormField md={6}><TextField select label="Bank" fullWidth value={voucher.bankCode} disabled={!editable} onChange={(e) => setVoucher({ ...voucher, bankCode: e.target.value })}><MenuItem value="">(cash)</MenuItem>{banks.map((bank) => <MenuItem key={bank.code} value={bank.code}>{bank.code} — {bank.name}</MenuItem>)}</TextField></FormField></FormRow>
              </Grid>
              <Grid item xs={12} md={2}><SectionHeader>Voucher Total</SectionHeader><Paper variant="outlined" sx={{ p: 1.5 }}><Stack spacing={1}><Typography variant="body2">Debit <strong style={{ float: 'right' }}>{totalDebit.toFixed(2)}</strong></Typography><Typography variant="body2">Credit <strong style={{ float: 'right' }}>{totalCredit.toFixed(2)}</strong></Typography><Typography variant="body2">Difference <strong style={{ float: 'right' }}>{(totalDebit - totalCredit).toFixed(2)}</strong></Typography><Typography variant="body2" sx={{ pt: 1, borderTop: 1, borderColor: 'divider' }}>Cleared Invoices Total <strong style={{ float: 'right' }}>{totalAllocated.toFixed(2)}</strong></Typography></Stack></Paper></Grid>
              <Grid item xs={12} md={3}><SectionHeader>Attachment</SectionHeader><Paper variant="outlined" sx={{ height: 190, display: 'grid', placeItems: 'center', color: 'text.disabled' }}><Typography variant="body2">No attachment selected</Typography></Paper></Grid>
            </Grid>
            <SectionHeader>Voucher Detail</SectionHeader>
            <Paper variant="outlined" sx={{ overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: 1300, '& .MuiTableCell-root': { borderRight: '1px solid', borderColor: 'divider', verticalAlign: 'top', p: 0.75 }, '& .MuiTableHead-root .MuiTableCell-root': { bgcolor: '#f8fafc', fontWeight: 700, textAlign: 'center', verticalAlign: 'middle' }, '& .MuiTableBody-root .MuiTableRow-root': { bgcolor: '#e7e9ff' } }}>
                <TableHead><TableRow><TableCell>Action</TableCell><TableCell>D/C</TableCell><TableCell>Account Code</TableCell><TableCell>Particulars</TableCell><TableCell>Analysis</TableCell><TableCell>Bill</TableCell><TableCell>Currency</TableCell><TableCell>Ex. Rate</TableCell><TableCell>FC/PKR Amount</TableCell></TableRow></TableHead>
                <TableBody>{accountLines.length === 0 ? <TableRow><TableCell colSpan={9} align="center" sx={{ py: 2 }}><Typography variant="body2" color="text.secondary">No data available in table</Typography></TableCell></TableRow> : accountLines.map((line) => <TableRow key={line.id} sx={{ height: 88 }}>
                  <TableCell sx={{ minWidth: 130, whiteSpace: 'nowrap', textAlign: 'center' }}><IconButton size="small" color="primary" disabled={!editable} aria-label="Edit line" onClick={() => updateAccountLine(line.id, { action: 'EDIT' })}><EditOutlinedIcon fontSize="small" /></IconButton><IconButton size="small" color="error" disabled={!editable} aria-label="Delete line" onClick={() => removeAccountLine(line.id)}><DeleteIcon fontSize="small" /></IconButton></TableCell>
                  <TableCell sx={{ minWidth: 105 }}><TextField select size="small" fullWidth value={line.debitCredit} disabled={!editable} onChange={(e) => updateAccountLine(line.id, { debitCredit: e.target.value as 'D' | 'C' })}><MenuItem value="D">Debit</MenuItem><MenuItem value="C">Credit</MenuItem></TextField></TableCell>
                  <TableCell sx={{ minWidth: 310 }}><TextField select size="small" fullWidth value={line.accountCode} disabled={!editable} SelectProps={{ displayEmpty: true }} onChange={(e) => updateAccountLine(line.id, { accountCode: e.target.value })}><MenuItem value="">Select Account Code...</MenuItem>{controlCodes.map((code) => <MenuItem key={code.code} value={code.code}>{code.code} — {code.name}</MenuItem>)}</TextField></TableCell>
                  <TableCell sx={{ minWidth: 220, position: 'relative' }}><TextField aria-label="Account description" size="small" fullWidth value={controlCodes.find((code) => code.code === line.accountCode)?.name ?? ''} disabled placeholder="Account description" sx={{ position: 'absolute', left: -316, top: 43, width: 310 }} /><TextField size="small" fullWidth multiline minRows={2} value={line.particulars} disabled={!editable} onChange={(e) => updateAccountLine(line.id, { particulars: e.target.value })} /></TableCell>
                  <TableCell sx={{ minWidth: 200 }}><TextField select size="small" fullWidth value={line.analysis} disabled={!editable} SelectProps={{ displayEmpty: true }} onChange={(e) => updateAccountLine(line.id, { analysis: e.target.value })}><MenuItem value="">Select Analysis Code...</MenuItem>{[...new Set(['GENERAL', 'JOB', 'COST', ...accountLines.map((accountLine) => accountLine.analysis).filter(Boolean)])].map((analysis) => <MenuItem key={analysis} value={analysis}>{analysis}</MenuItem>)}</TextField></TableCell>
                  <TableCell sx={{ minWidth: 160 }}><Stack spacing={0.5}><TextField size="small" fullWidth placeholder="Bill No." value={line.billNo ?? ''} disabled={!editable} onChange={(e) => updateAccountLine(line.id, { billNo: e.target.value })} /><TextField size="small" fullWidth type="date" InputLabelProps={{ shrink: true }} value={line.billDate ?? line.bill ?? ''} disabled={!editable} onChange={(e) => updateAccountLine(line.id, { billDate: e.target.value })} /></Stack></TableCell>
                  <TableCell sx={{ minWidth: 145 }}><TextField select size="small" fullWidth value={line.currencyCode} disabled={!editable} onChange={(e) => updateAccountLine(line.id, { currencyCode: e.target.value })}>{currencies.map((currency) => <MenuItem key={currency.code} value={currency.code}>{currency.code}</MenuItem>)}</TextField></TableCell>
                  <TableCell sx={{ minWidth: 130 }}><TextField size="small" type="number" inputProps={{ min: 0, step: '0.0001' }} fullWidth value={line.exchangeRate} disabled={!editable} onChange={(e) => updateAccountLine(line.id, { exchangeRate: Number(e.target.value) })} /></TableCell>
                  <TableCell sx={{ minWidth: 175 }}><Stack spacing={0.5}><TextField size="small" type="number" inputProps={{ min: 0, step: '0.01' }} fullWidth value={line.amount} disabled={!editable} onChange={(e) => updateAccountLine(line.id, { amount: Number(e.target.value) })} /><TextField size="small" fullWidth value={(line.amount * line.exchangeRate).toFixed(2)} disabled inputProps={{ style: { textAlign: 'right', fontWeight: 700 } }} /></Stack></TableCell>
                </TableRow>)}</TableBody>
              </Table>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1, py: 0.5, bgcolor: '#f4f4f5', borderTop: 1, borderColor: 'divider' }}><Typography variant="body2">Showing {accountLines.length ? `1 to ${accountLines.length}` : '0 to 0'} of {accountLines.length} entries</Typography><Button size="small" variant="contained" startIcon={<AddIcon />} disabled={!editable} onClick={addAccountLine}>Add</Button></Box>
            </Paper>
            {false && <Grid container spacing={2}>
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
              {mode === 'BANK' && (
                <FormRow>
                  <FormField md={12}>
                    <TextField select label="Bank Code" fullWidth value={voucher.bankCode} disabled={!editable} onChange={(e) => setVoucher({ ...voucher, bankCode: e.target.value })}>
                      {banks.map((b) => (
                        <MenuItem key={b.code} value={b.code}>
                          {b.code} — {b.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </FormField>
                </FormRow>
              )}
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
          </Grid>}</> : tab === 1 ? (
            <Box>
              <SectionHeader>Bank Payment Voucher (Detail of Invoices)</SectionHeader>
              <Paper variant="outlined" sx={{ p: 1.5, mb: 1.5, bgcolor: '#eef7ff', borderColor: 'primary.main' }}>
                <Typography align="center" variant="overline" sx={{ display: 'block', fontWeight: 700, letterSpacing: 3, bgcolor: '#d8f7ce', border: 1, borderColor: 'success.main', mb: 1 }}>Voucher</Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6} sm={3} md={1.5}><TextField label="Branch" size="small" fullWidth value={voucher.branch} disabled /></Grid>
                  <Grid item xs={6} sm={3} md={1.5}><TextField label="Voucher No." size="small" fullWidth value={voucher.voucherNo} disabled /></Grid>
                  <Grid item xs={6} sm={3} md={1.5}><TextField label="Voucher Date" size="small" fullWidth value={voucher.voucherDate} disabled /></Grid>
                  <Grid item xs={6} sm={3} md={1.5}><TextField label="Currency" size="small" fullWidth value={voucher.currencyCode} disabled /></Grid>
                  <Grid item xs={6} sm={3} md={2}><TextField label="Exchange Rate" size="small" fullWidth value={voucher.exchangeRate} disabled /></Grid>
                  <Grid item xs={12} sm={6} md={4}><TextField label="Account Code" select size="small" fullWidth value={voucher.accountCode ?? ''} disabled={!editable} onChange={(event) => setVoucher({ ...voucher, accountCode: event.target.value })}><MenuItem value="">Select an Option</MenuItem>{banks.map((bank) => <MenuItem key={bank.code} value={bank.code}>{bank.code} — {bank.name}</MenuItem>)}</TextField></Grid>
                </Grid>
              </Paper>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6} md={3}><Paper variant="outlined" sx={{ p: 1.25 }}><Typography variant="body2" fontWeight={700}>Transaction Total</Typography><Typography align="right" color="primary.main" fontWeight={700}>{voucherTotal.toFixed(2)}</Typography></Paper></Grid>
                <Grid item xs={12} sm={6} md={3}><Paper variant="outlined" sx={{ p: 1.25 }}><Typography variant="body2" fontWeight={700}>Detail Total</Typography><Typography align="right" color="primary.main" fontWeight={700}>{totalAllocated.toFixed(2)}</Typography></Paper></Grid>
                <Grid item xs={12} sm={6} md={3}><Paper variant="outlined" sx={{ p: 1.25 }}><Typography variant="body2" fontWeight={700}>Difference Total</Typography><Typography align="right" color="primary.main" fontWeight={700}>{(voucherTotal - totalAllocated).toFixed(2)}</Typography></Paper></Grid>
                <Grid item xs={12} sm={6} md={3}><Paper variant="outlined" sx={{ p: 1.25 }}><Typography variant="body2" fontWeight={700}>Exchange Difference</Typography><Typography align="right" color="primary.main" fontWeight={700}>PKR 0.00</Typography></Paper></Grid>
              </Grid>
              <SectionHeader>Invoice Knock Off Detail</SectionHeader>
              <Paper variant="outlined" sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead><TableRow><TableCell padding="checkbox" /><TableCell>Invoice No.</TableCell><TableCell>Type</TableCell><TableCell>Job No.</TableCell><TableCell align="right">Invoice Total</TableCell><TableCell align="right">Already Cleared</TableCell><TableCell align="right">Balance</TableCell><TableCell align="right">Knock Off Amount</TableCell></TableRow></TableHead>
                  <TableBody>{!voucher.partyCode ? <TableRow><TableCell colSpan={8} align="center"><Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>Select Pay To on the Entry tab to load outstanding invoices.</Typography></TableCell></TableRow> : sources.length === 0 ? <TableRow><TableCell colSpan={8} align="center"><Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>No outstanding invoices are available for this party.</Typography></TableCell></TableRow> : sources.map((source) => <TableRow key={source.id} hover selected={allocations[source.id] !== undefined}><TableCell padding="checkbox"><Checkbox size="small" checked={allocations[source.id] !== undefined} disabled={!editable} onChange={() => toggleAllocation(source)} /></TableCell><TableCell>{source.docNo}</TableCell><TableCell>{source.type}</TableCell><TableCell>{source.jobNo || '—'}</TableCell><TableCell align="right">{source.totalAmount.toFixed(2)}</TableCell><TableCell align="right">{source.clearedAmount.toFixed(2)}</TableCell><TableCell align="right">{source.balance.toFixed(2)}</TableCell><TableCell align="right" sx={{ minWidth: 135 }}>{allocations[source.id] !== undefined && <TextField variant="standard" type="number" value={allocations[source.id]} disabled={!editable} onChange={(event) => setAllocationAmount(source.id, Number(event.target.value))} inputProps={{ min: 0, max: source.balance }} />}</TableCell></TableRow>)}</TableBody>
                </Table>
              </Paper>
              {false && <>
              <SectionHeader>Saved Invoice Detail</SectionHeader>
              <Paper variant="outlined" sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead><TableRow><TableCell padding="checkbox" /><TableCell>Invoice No.</TableCell><TableCell>Type</TableCell><TableCell>Job No.</TableCell><TableCell align="right">Invoice Total</TableCell><TableCell align="right">Already Cleared</TableCell><TableCell align="right">Balance</TableCell><TableCell align="right">Knock Off Amount</TableCell></TableRow></TableHead>
                  <TableBody>{voucher.clearingLines.length === 0 ? <TableRow><TableCell colSpan={4} align="center"><Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>No invoice detail is available for this voucher.</Typography></TableCell></TableRow> : voucher.clearingLines.map((line) => <TableRow key={line.id}><TableCell>{line.sourceDocNo}</TableCell><TableCell>{line.sourceType}</TableCell><TableCell>{line.jobNo || '—'}</TableCell><TableCell align="right">{line.amountCleared.toFixed(2)}</TableCell></TableRow>)}</TableBody>
                </Table>
              </Paper>
              </>}
            </Box>
          ) : tab === 2 ? (
            <Box>
              <SectionHeader>Bank Payment Voucher (Cost Sheet)</SectionHeader>
              <Grid container spacing={1.5} alignItems="stretch">
                <Grid item xs={12} md={3}>
                  <Paper variant="outlined" sx={{ p: 1.25, height: '100%', bgcolor: '#f3faff' }}>
                    <Typography align="center" variant="overline" sx={{ display: 'block', mb: 1, fontWeight: 700, letterSpacing: 3, bgcolor: '#ddf7d9', border: 1, borderColor: 'success.light' }}>Voucher</Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={4}><TextField size="small" label="Voucher No." fullWidth value={voucher.voucherNo} disabled /></Grid>
                      <Grid item xs={2}><TextField size="small" label="Type" fullWidth value="BPV" disabled /></Grid>
                      <Grid item xs={6}><TextField size="small" label="Branch" fullWidth value={voucher.branch} disabled /></Grid>
                      <Grid item xs={12}><TextField select size="small" label="Account Code" fullWidth value={costForm.accountCode} disabled={!editable} onChange={(event) => updateCostForm('accountCode', event.target.value)}><MenuItem value="">Select Account Code</MenuItem>{banks.map((bank) => <MenuItem key={bank.code} value={bank.code}>{bank.code} — {bank.name}</MenuItem>)}</TextField></Grid>
                    </Grid>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Paper variant="outlined" sx={{ p: 1.25, height: '100%', bgcolor: '#f3faff' }}>
                    <Typography align="center" variant="overline" sx={{ display: 'block', mb: 1, fontWeight: 700, letterSpacing: 3, bgcolor: '#ddf7d9', border: 1, borderColor: 'success.light' }}>Job</Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={12}><TextField select size="small" label="Type" fullWidth value={costForm.jobType} disabled={!editable} onChange={(event) => updateCostForm('jobType', event.target.value)}><MenuItem value="">Select Type</MenuItem><MenuItem value="Air Import">Air Import</MenuItem><MenuItem value="Air Export">Air Export</MenuItem><MenuItem value="Sea Import">Sea Import</MenuItem><MenuItem value="Sea Export">Sea Export</MenuItem></TextField></Grid>
                      <Grid item xs={6}><TextField size="small" label="Job Year" fullWidth value={costForm.jobYear} disabled={!editable} onChange={(event) => updateCostForm('jobYear', event.target.value)} /></Grid>
                      <Grid item xs={6}><TextField size="small" label="Station" fullWidth value={costForm.station} disabled={!editable} onChange={(event) => updateCostForm('station', event.target.value)} /></Grid>
                      <Grid item xs={12}><TextField size="small" label="H/Job No." fullWidth value={costForm.houseJobNo} disabled={!editable} onChange={(event) => updateCostForm('houseJobNo', event.target.value)} /></Grid>
                      <Grid item xs={12}><TextField size="small" label="M/Job/Run No." fullWidth value={costForm.masterJobRunNo} disabled={!editable} onChange={(event) => updateCostForm('masterJobRunNo', event.target.value)} /></Grid>
                      <Grid item xs={12}><TextField size="small" label="Courier C/N No." fullWidth value={costForm.courierCnNo} disabled={!editable} onChange={(event) => updateCostForm('courierCnNo', event.target.value)} /></Grid>
                      <Grid item xs={12}><TextField size="small" label="HAWB/HBL No." fullWidth value={costForm.hawbHblNo} disabled={!editable} onChange={(event) => updateCostForm('hawbHblNo', event.target.value)} /></Grid>
                      <Grid item xs={12}><TextField size="small" label="MAWB/MBL No." fullWidth value={costForm.mawbMblNo} disabled={!editable} onChange={(event) => updateCostForm('mawbMblNo', event.target.value)} /></Grid>
                      <Grid item xs={12}><TextField size="small" label="Amount" type="number" fullWidth value={costForm.amount} disabled={!editable} onChange={(event) => updateCostForm('amount', event.target.value)} /></Grid>
                    </Grid>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={2}>
                  <Paper variant="outlined" sx={{ p: 1.25, height: '100%', bgcolor: '#f3faff' }}>
                    <Typography align="center" variant="overline" sx={{ display: 'block', mb: 1, fontWeight: 700, letterSpacing: 3, bgcolor: '#ddf7d9', border: 1, borderColor: 'success.light' }}>Totals</Typography>
                    <Stack spacing={1}><TextField size="small" label="Account Total" value={costAccountTotal.toFixed(2)} disabled /><TextField size="small" label="Detail Total" value={costDetailTotal.toFixed(2)} disabled /><TextField size="small" label="Difference" value={(costAccountTotal - costDetailTotal).toFixed(2)} disabled /></Stack>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper variant="outlined" sx={{ p: 1.25, height: '100%', bgcolor: '#f3faff' }}>
                    <Typography align="center" variant="overline" sx={{ display: 'block', mb: 1, fontWeight: 700, letterSpacing: 3, bgcolor: '#ddf7d9', border: 1, borderColor: 'success.light' }}>Invoice Detail</Typography>
                    <Grid container spacing={1}><Grid item xs={12}><TextField size="small" label="Party Name" fullWidth value={costForm.partyName} disabled={!editable} onChange={(event) => updateCostForm('partyName', event.target.value)} /></Grid><Grid item xs={4}><TextField size="small" label="Invoice No." fullWidth value={costForm.invoiceNo} disabled={!editable} onChange={(event) => updateCostForm('invoiceNo', event.target.value)} /></Grid><Grid item xs={3}><TextField size="small" label="Year" fullWidth value={costForm.invoiceYear} disabled={!editable} onChange={(event) => updateCostForm('invoiceYear', event.target.value)} /></Grid><Grid item xs={5}><TextField size="small" label="Invoice Amount" type="number" fullWidth value={costForm.invoiceAmount} disabled={!editable} onChange={(event) => updateCostForm('invoiceAmount', event.target.value)} /></Grid></Grid>
                  </Paper>
                </Grid>
              </Grid>
              <Paper variant="outlined" sx={{ mt: 1.5, overflowX: 'auto' }}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1, borderBottom: 1, borderColor: 'divider' }}><Button size="small" variant="contained" startIcon={<AddIcon />} disabled={!editable} onClick={() => setCostLines((current) => [...current, newCostLine()])}>Add</Button></Box>
                <Table size="small" sx={{ minWidth: 1200 }}><TableHead><TableRow><TableCell rowSpan={2}>Action</TableCell><TableCell colSpan={3} align="center">Account</TableCell><TableCell colSpan={4} align="center">Job</TableCell><TableCell colSpan={2} align="center">AirWay Bill</TableCell><TableCell rowSpan={2} align="right">Expense Amount</TableCell><TableCell rowSpan={2} /></TableRow><TableRow><TableCell>Code</TableCell><TableCell>Description</TableCell><TableCell>Branch</TableCell><TableCell>Type</TableCell><TableCell>Master</TableCell><TableCell>House</TableCell><TableCell>Master</TableCell><TableCell>House / CN No.</TableCell></TableRow></TableHead><TableBody>{costLines.length === 0 ? <TableRow><TableCell colSpan={12} align="center" sx={{ py: 2 }}><Typography variant="body2" color="text.secondary">No data available in table</Typography></TableCell></TableRow> : costLines.map((line) => <TableRow key={line.id}><TableCell><TextField variant="standard" value={line.action} disabled={!editable} onChange={(event) => updateCostLine(line.id, 'action', event.target.value)} /></TableCell><TableCell><TextField variant="standard" value={line.accountCode} disabled={!editable} onChange={(event) => updateCostLine(line.id, 'accountCode', event.target.value)} /></TableCell><TableCell><TextField variant="standard" value={line.description} disabled={!editable} onChange={(event) => updateCostLine(line.id, 'description', event.target.value)} /></TableCell><TableCell><TextField variant="standard" value={line.branch} disabled={!editable} onChange={(event) => updateCostLine(line.id, 'branch', event.target.value)} /></TableCell><TableCell><TextField variant="standard" value={line.jobType} disabled={!editable} onChange={(event) => updateCostLine(line.id, 'jobType', event.target.value)} /></TableCell><TableCell><TextField variant="standard" value={line.masterJob} disabled={!editable} onChange={(event) => updateCostLine(line.id, 'masterJob', event.target.value)} /></TableCell><TableCell><TextField variant="standard" value={line.houseJob} disabled={!editable} onChange={(event) => updateCostLine(line.id, 'houseJob', event.target.value)} /></TableCell><TableCell><TextField variant="standard" value={line.airwayBill} disabled={!editable} onChange={(event) => updateCostLine(line.id, 'airwayBill', event.target.value)} /></TableCell><TableCell><TextField variant="standard" value={line.houseCnNo} disabled={!editable} onChange={(event) => updateCostLine(line.id, 'houseCnNo', event.target.value)} /></TableCell><TableCell><TextField variant="standard" type="number" value={line.expenseAmount} disabled={!editable} onChange={(event) => updateCostLine(line.id, 'expenseAmount', event.target.value)} /></TableCell><TableCell><IconButton size="small" disabled={!editable} onClick={() => setCostLines((current) => current.filter((item) => item.id !== line.id))}><DeleteIcon fontSize="small" /></IconButton></TableCell></TableRow>)}</TableBody></Table>
              </Paper>
            </Box>
          ) : null}

        </Box>
      )}
        </>
      )}
    </PageShell>
  );
}
