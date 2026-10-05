import { confirmDelete } from '../../components/deleteConfirmation';
import { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Checkbox from '@mui/material/Checkbox';
import SearchIcon from '@mui/icons-material/Search';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import LinearProgress from '@mui/material/LinearProgress';
import TablePagination from '@mui/material/TablePagination';
import { PageShell } from '../../layout/PageShell';
import { ToolbarAction } from '../../components/TransactionToolbar';
import { FormRow, FormField } from '../../components/FormGrid';
import { themeColors } from '../../theme/themeColors';
import { airlineRepo, ownerRepo } from '../../data/masterDataService';
import {
  awbStockRepo,
  calculateAwbCheckDigit,
  checkAwbRange,
  createSingleAwb,
  getStockSummary,
  searchAwbStock,
  writeAwbRange,
} from '../../data/awbStockService';
import { AwbRangeCheckResult, AwbStock } from '../../domain/awbStock';

const today = () => new Date().toISOString().slice(0, 10);

export function AwbStockPage() {
  const airlines = airlineRepo.list();
  const owners = ownerRepo.list();

  const [mode, setMode] = useState<'idle' | 'single-new'>('idle');
  const [rangeDialogOpen, setRangeDialogOpen] = useState(false);

  // single-entry form state
  const [awbNo, setAwbNo] = useState('');
  const [airlineCode, setAirlineCode] = useState(airlines[0]?.code ?? '');
  const [receiptDate, setReceiptDate] = useState(today());
  const [ownerCode, setOwnerCode] = useState(owners[0]?.code ?? '');
  const [awbUsed, setAwbUsed] = useState<'Y' | 'N'>('N');
  const [awbDate, setAwbDate] = useState('');
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [isViewingRecord, setIsViewingRecord] = useState(false);
  const [awbLookup, setAwbLookup] = useState('');
  const [isResultsVisible, setIsResultsVisible] = useState(false);

  // filter state
  const [filterAirline, setFilterAirline] = useState('');
  const [filterOwner, setFilterOwner] = useState('');
  const [filterStart, setFilterStart] = useState('');
  const [filterEnd, setFilterEnd] = useState('');
  const [filterUsed, setFilterUsed] = useState<'BOTH' | 'Y' | 'N'>('BOTH');
  const [rows, setRows] = useState<AwbStock[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // range popup state
  const [rangeAirline, setRangeAirline] = useState(airlines[0]?.code ?? '');
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');
  const [rangeReceiptDate, setRangeReceiptDate] = useState(today());
  const [rangeOwner, setRangeOwner] = useState(owners[0]?.code ?? '');
  const [rangeResult, setRangeResult] = useState<AwbRangeCheckResult | null>(null);
  const [rangeError, setRangeError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ severity: 'success' | 'error'; text: string } | null>(null);
  const [recordDialog, setRecordDialog] = useState<{ mode: 'view' | 'edit'; record: AwbStock } | null>(null);

  const rangeStartCheckDigit = useMemo(() => calculateAwbCheckDigit(rangeStart), [rangeStart]);
  const rangeEndCheckDigit = useMemo(() => calculateAwbCheckDigit(rangeEnd), [rangeEnd]);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- rows triggers recompute after mutations even though its value isn't read
  const summary = useMemo(() => (filterAirline ? getStockSummary(filterAirline) : null), [filterAirline, rows]);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- rows triggers recompute after stock mutations
  const selectedAirlineSummary = useMemo(() => getStockSummary(airlineCode), [airlineCode, rows]);
  const selectedAirlineUsage = selectedAirlineSummary.total
    ? Math.round((selectedAirlineSummary.used / selectedAirlineSummary.total) * 100)
    : 0;
  const paginatedRows = useMemo(
    () => rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [page, rows, rowsPerPage]
  );

  useEffect(() => {
    setRows(searchAwbStock({
      airlineCode: filterAirline || undefined,
      ownerCode: filterOwner || undefined,
      startReceiptDate: filterStart || undefined,
      endReceiptDate: filterEnd || undefined,
      awbUsed: filterUsed,
    }));
    setPage(0);
  }, [filterAirline, filterEnd, filterOwner, filterStart, filterUsed]);

  useEffect(() => {
    setSelectedIds((selected) => {
      const visibleSelections = selected.filter((id) => rows.some((row) => row.id === id));
      return visibleSelections.length === selected.length ? selected : visibleSelections;
    });
  }, [rows]);

  const handleAction = (action: ToolbarAction) => {
    if (action === 'new') {
      setMode('single-new');
      setAwbNo('');
      setAwbUsed('N');
      setAwbDate('');
      setReceiptDate(today());
      return;
    }
    if (action === 'cancel') {
      setMode('idle');
      setEditingRecordId(null);
      return;
    }
    if (action === 'search') {
      handleShowDetail();
    }
  };

  const handleSaveSingle = () => {
    if (!awbNo || !airlineCode || !ownerCode) {
      setMessage({ severity: 'error', text: 'Air Waybill No., Airline and Owner Code are required.' });
      return;
    }
    if (editingRecordId) {
      const existing = awbStockRepo.get(editingRecordId);
      if (existing) {
        awbStockRepo.save({ ...existing, awbNo, airlineCode, receiptDate, ownerCode, awbUsed, awbDate, updatedAt: new Date().toISOString() });
        setMessage({ severity: 'success', text: `AWB ${awbNo} updated.` });
      }
    } else {
      createSingleAwb({ awbNo, airlineCode, receiptDate, ownerCode, awbUsed, awbDate });
      setMessage({ severity: 'success', text: `AWB ${awbNo} registered.` });
    }
    setEditingRecordId(null);
    setIsViewingRecord(false);
    setMode('idle');
    handleShowDetail();
  };

  const handleShowDetail = () => {
    setRows(
      searchAwbStock({
        airlineCode: filterAirline || undefined,
        ownerCode: filterOwner || undefined,
        startReceiptDate: filterStart || undefined,
        endReceiptDate: filterEnd || undefined,
        awbUsed: filterUsed,
      })
    );
    setIsResultsVisible(true);
  };

  const handleClearFilters = () => {
    setFilterAirline('');
    setFilterOwner('');
    setFilterStart('');
    setFilterEnd('');
    setFilterUsed('BOTH');
    setRows(searchAwbStock({ awbUsed: 'BOTH' }));
  };

  const handleAwbLookup = () => {
    const searchValue = awbLookup.trim().toLowerCase();
    if (!searchValue) {
      setMessage({ severity: 'error', text: 'Enter an Air Waybill No. to search.' });
      return;
    }
    const match = awbStockRepo.find((record) => record.awbNo.toLowerCase() === searchValue)[0];
    if (match) {
      setMessage(null);
      setAwbNo(match.awbNo);
      setAirlineCode(match.airlineCode);
      setReceiptDate(match.receiptDate);
      setOwnerCode(match.ownerCode);
      setAwbUsed(match.awbUsed);
      setAwbDate(match.awbDate);
      setEditingRecordId(null);
      setIsViewingRecord(true);
      setIsResultsVisible(true);
    } else {
      setMessage({ severity: 'error', text: `No AWB stock record found for ${awbLookup.trim()}.` });
    }
  };

  const handleClearAwbLookup = () => {
    setAwbLookup('');
    setAwbNo('');
    setAirlineCode(airlines[0]?.code ?? '');
    setReceiptDate(today());
    setOwnerCode(owners[0]?.code ?? '');
    setAwbUsed('N');
    setAwbDate('');
    setEditingRecordId(null);
    setIsViewingRecord(false);
    setIsResultsVisible(false);
    setMessage(null);
  };

  const handleCheckAwb = () => {
    if (!rangeAirline || !rangeStart || !rangeEnd) {
      setRangeError('Airline Code, Starting and Ending AWB No. are required.');
      return;
    }
    if (!/^\d{7}$/.test(rangeStart) || !/^\d{7}$/.test(rangeEnd)) {
      setRangeError('Enter a seven-digit AWB serial number. The final check digit is calculated automatically.');
      return;
    }
    if (Number(rangeEnd) < Number(rangeStart)) {
      setRangeError('Ending AWB No. must be greater than or equal to Starting AWB No.');
      return;
    }
    setRangeError(null);
    setRangeResult(checkAwbRange({ airlineCode: rangeAirline, startAwbNo: rangeStart, endAwbNo: rangeEnd }));
  };

  const handleWriteRange = () => {
    if (!rangeResult || rangeResult.newAwbNos.length === 0) return;
    writeAwbRange({
      airlineCode: rangeAirline,
      ownerCode: rangeOwner,
      receiptDate: rangeReceiptDate,
      newAwbNos: rangeResult.newAwbNos,
    });
    setMessage({ severity: 'success', text: `${rangeResult.newAwbNos.length} AWB number(s) written to stock.` });
    setRangeDialogOpen(false);
    setRangeResult(null);
    setRangeStart('');
    setRangeEnd('');
    handleShowDetail();
  };

  const handleDeleteRow = (id: string) => {
    awbStockRepo.remove(id);
    setSelectedIds((selected) => selected.filter((selectedId) => selectedId !== id));
    handleShowDetail();
  };

  const toggleRowSelection = (id: string) => {
    setSelectedIds((selected) => selected.includes(id)
      ? selected.filter((selectedId) => selectedId !== id)
      : [...selected, id]);
  };

  const togglePageSelection = (checked: boolean) => {
    const pageIds = paginatedRows.map((row) => row.id);
    setSelectedIds((selected) => checked
      ? [...new Set([...selected, ...pageIds])]
      : selected.filter((id) => !pageIds.includes(id)));
  };

  const handleDeleteSelected = () => {
    if (!selectedIds.length) return;
    selectedIds.forEach((id) => awbStockRepo.remove(id));
    setMessage({ severity: 'success', text: `${selectedIds.length} AWB record(s) deleted.` });
    setSelectedIds([]);
    handleShowDetail();
  };

  const handleEditRow = (record: AwbStock) => {
    setIsViewingRecord(false);
    setEditingRecordId(record.id);
    setAwbNo(record.awbNo);
    setAirlineCode(record.airlineCode);
    setReceiptDate(record.receiptDate);
    setOwnerCode(record.ownerCode);
    setAwbUsed(record.awbUsed);
    setAwbDate(record.awbDate);
    setMode('single-new');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewRow = (record: AwbStock) => {
    setEditingRecordId(null);
    setAwbNo(record.awbNo);
    setAirlineCode(record.airlineCode);
    setReceiptDate(record.receiptDate);
    setOwnerCode(record.ownerCode);
    setAwbUsed(record.awbUsed);
    setAwbDate(record.awbDate);
    setIsViewingRecord(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveRecord = () => {
    if (!recordDialog) return;
    awbStockRepo.save({ ...recordDialog.record, updatedAt: new Date().toISOString() });
    setRecordDialog(null);
    setMessage({ severity: 'success', text: 'AWB stock record updated.' });
    handleShowDetail();
  };

  return (
    <PageShell
      breadcrumbs={['Freight', 'Transactions Menu (Air Export)', 'Air Waybill Stock']}
      title="Air Waybill Stock"
      subtitle="Register, filter, and review received airline stock."
      actions={
        <>
          <Button
            variant="contained"
            startIcon={<AddIcon fontSize="small" />}
            onClick={() => {
              setRangeResult(null);
              setRangeError(null);
              setRangeStart('');
              setRangeEnd('');
              setRangeReceiptDate(today());
              setRangeDialogOpen(true);
            }}
          >
            New
          </Button>
        </>
      }
    >
      {message && (
        <Alert severity={message.severity} onClose={() => setMessage(null)} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ mb: 2, p: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <TextField
          size="small"
          label="Search by Air Waybill No."
          placeholder="e.g. 214-50001002"
          value={awbLookup}
          onChange={(e) => setAwbLookup(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleAwbLookup(); }}
          sx={{ width: { xs: '100%', sm: 360 } }}
        />
        <Button variant="contained" startIcon={<SearchIcon />} onClick={handleAwbLookup}>Search</Button>
        <Button variant="text" onClick={handleClearAwbLookup}>Clear</Button>
      </Paper>

      {isResultsVisible && (
      <Paper variant="outlined" sx={{ mb: 2, overflow: 'hidden', borderTop: `3px solid ${themeColors.primary}` }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2.5,
            py: 1.5,
            borderBottom: `1px solid ${themeColors.border}`,
          }}
        >
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: 14.5 }}>Register Single AWB</Typography>
            <Typography variant="caption" sx={{ color: themeColors.textSecondary }}>Add one received AWB, or use Bulk AWB Range for a delivery batch.</Typography>
          </Box>
          <Button
            size="small"
            variant="text"
            sx={{ fontSize: 11, color: themeColors.textSecondary, fontWeight: 600 }}
            onClick={() => setRangeDialogOpen(true)}
          >
            New — Bulk AWB Range
          </Button>
        </Box>
        <Box sx={{ p: 2.5 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={9}>
          <FormRow>
            <FormField>
              <TextField
                label="Air Waybill No."
                fullWidth
                disabled={isViewingRecord}
                value={awbNo}
                onChange={(e) => setAwbNo(e.target.value)}
                placeholder="e.g. 214-12345678"
              />
            </FormField>
            <FormField>
              <TextField select label="Airline Code" fullWidth disabled={isViewingRecord} value={airlineCode} onChange={(e) => setAirlineCode(e.target.value)}>
                {airlines.map((a) => (
                  <MenuItem key={a.code} value={a.code}>
                    {a.code} — {a.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField>
              <TextField
                label="Reciept Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                disabled={isViewingRecord}
                value={receiptDate}
                onChange={(e) => setReceiptDate(e.target.value)}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField>
              <TextField select label="Owner Code" fullWidth disabled={isViewingRecord} value={ownerCode} onChange={(e) => setOwnerCode(e.target.value)}>
                {owners.map((o) => (
                  <MenuItem key={o.code} value={o.code}>
                    {o.code} — {o.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField>
              <TextField select label="AWB Used Y/N" fullWidth disabled={isViewingRecord} value={awbUsed} onChange={(e) => setAwbUsed(e.target.value as 'Y' | 'N')}>
                <MenuItem value="N">N</MenuItem>
                <MenuItem value="Y">Y</MenuItem>
              </TextField>
            </FormField>
            <FormField>
              <TextField
                label="AWB Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={awbDate}
                onChange={(e) => setAwbDate(e.target.value)}
                disabled={isViewingRecord || awbUsed === 'N'}
              />
            </FormField>
          </FormRow>
          <Stack direction="row" spacing={1}>
            {!isViewingRecord && <Button variant="contained" onClick={handleSaveSingle}>Save</Button>}
            <Button variant="text" onClick={() => { setMode('idle'); setEditingRecordId(null); setIsViewingRecord(false); }}>
              Cancel
            </Button>
          </Stack>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper variant="outlined" sx={{ height: '100%', overflow: 'hidden', bgcolor: '#fff' }}>
                <Box sx={{ px: 1.5, py: 1, bgcolor: `${themeColors.primary}14`, borderBottom: `1px solid ${themeColors.border}` }}>
                  <Typography align="center" variant="subtitle2" sx={{ fontWeight: 700 }}>Airline Stock</Typography>
                </Box>
                {[
                  ['Total', selectedAirlineSummary.total],
                  ['Used', selectedAirlineSummary.used],
                  ['Un-Used', selectedAirlineSummary.unused],
                ].map(([label, value]) => (
                  <Box key={label} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1.5, py: 1, borderBottom: `1px solid ${themeColors.border}` }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{label}</Typography>
                    <Typography sx={{ minWidth: 36, px: 1, py: 0.25, textAlign: 'center', border: `1px solid ${themeColors.border}`, borderRadius: 0.5, fontWeight: 700 }}>{value}</Typography>
                  </Box>
                ))}
                <Box sx={{ px: 1.5, py: 1.25, bgcolor: `${themeColors.primary}08` }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>Stock utilisation</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>{selectedAirlineUsage}% used</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={selectedAirlineUsage} sx={{ height: 6, borderRadius: 3 }} />
                  <Typography variant="caption" sx={{ display: 'block', mt: 0.75, color: themeColors.textSecondary }}>
                    {selectedAirlineSummary.unused} AWB{selectedAirlineSummary.unused === 1 ? '' : 's'} ready for assignment
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      )}

      {summary && (
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Chip label={`Total: ${summary.total}`} color="primary" variant="outlined" />
          <Chip label={`Used: ${summary.used}`} color="warning" variant="outlined" />
          <Chip label={`Un-Used: ${summary.unused}`} color="success" variant="outlined" />
        </Stack>
      )}

      <Paper variant="outlined" sx={{ overflow: 'hidden', borderTop: `3px solid ${themeColors.primary}` }}>
        <Box
          sx={{
            display: 'none',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2.5,
            py: 1.5,
            borderBottom: `1px solid ${themeColors.border}`,
          }}
        >
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: 15 }}>Search AWB Stock</Typography>
            <Typography variant="caption" sx={{ color: themeColors.textSecondary }}>Find a record by airline, owner, receipt period, or usage status.</Typography>
          </Box>
          <Chip
            size="small"
            label={`${rows.length} record${rows.length === 1 ? '' : 's'}`}
            sx={{ bgcolor: themeColors.pageBackground, fontSize: 11, fontWeight: 600, height: 22 }}
          />
        </Box>
        <Box sx={{ display: 'none' }}>
          <FormRow>
            <FormField>
              <TextField select label="Airline" fullWidth value={filterAirline} onChange={(e) => setFilterAirline(e.target.value)} sx={{ bgcolor: '#fff' }}>
                <MenuItem value="">All Airlines</MenuItem>
                {airlines.map((a) => (
                  <MenuItem key={a.code} value={a.code}>
                    {a.code} — {a.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField>
              <TextField select label="Owner" fullWidth value={filterOwner} onChange={(e) => setFilterOwner(e.target.value)} sx={{ bgcolor: '#fff' }}>
                <MenuItem value="">All Owners</MenuItem>
                {owners.map((o) => (
                  <MenuItem key={o.code} value={o.code}>
                    {o.code} — {o.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField>
              <TextField select label="Usage status" fullWidth value={filterUsed} onChange={(e) => setFilterUsed(e.target.value as 'BOTH' | 'Y' | 'N')} sx={{ bgcolor: '#fff' }}>
                <MenuItem value="BOTH">Both</MenuItem>
                <MenuItem value="Y">Y</MenuItem>
                <MenuItem value="N">N</MenuItem>
              </TextField>
            </FormField>
          </FormRow>
          <FormRow>
            <FormField xs={6} sm={6} md={6}>
              <TextField
                label="Receipt date — from"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={filterStart}
                onChange={(e) => setFilterStart(e.target.value)}
                sx={{ bgcolor: '#fff' }}
              />
            </FormField>
            <FormField xs={6} sm={6} md={6}>
              <TextField
                label="Receipt date — to"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={filterEnd}
                onChange={(e) => setFilterEnd(e.target.value)}
                sx={{ bgcolor: '#fff' }}
              />
            </FormField>
            <FormField xs={12} sm={12} md={12}>
              <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                <Button variant="text" onClick={handleClearFilters}>Clear filters</Button>
                <Button variant="contained" startIcon={<SearchIcon />} sx={{ minWidth: 150 }} onClick={handleShowDetail}>
                  Search stock
                </Button>
              </Stack>
            </FormField>
          </FormRow>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 2fr 1.5fr 1.5fr 2.5fr 1.5fr' }, gap: 1, p: 1.25, bgcolor: themeColors.pageBackground, borderBottom: `1px solid ${themeColors.border}` }}>
          <Box />
          <Box />
          <TextField select size="small" value={filterAirline} onChange={(e) => setFilterAirline(e.target.value)} SelectProps={{ displayEmpty: true }}>
            <MenuItem value="">All airlines</MenuItem>
            {airlines.map((a) => <MenuItem key={a.code} value={a.code}>{a.code} — {a.name}</MenuItem>)}
          </TextField>
          <TextField select size="small" value={filterOwner} onChange={(e) => setFilterOwner(e.target.value)} SelectProps={{ displayEmpty: true }}>
            <MenuItem value="">All owners</MenuItem>
            {owners.map((o) => <MenuItem key={o.code} value={o.code}>{o.code} — {o.name}</MenuItem>)}
          </TextField>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
            <TextField size="small" type="date" value={filterStart} onChange={(e) => setFilterStart(e.target.value)} InputProps={{ inputProps: { 'aria-label': 'Receipt date from' } }} />
            <TextField size="small" type="date" value={filterEnd} onChange={(e) => setFilterEnd(e.target.value)} InputProps={{ inputProps: { 'aria-label': 'Receipt date to' } }} />
          </Box>
          <TextField select size="small" value={filterUsed} onChange={(e) => setFilterUsed(e.target.value as 'BOTH' | 'Y' | 'N')}>
            <MenuItem value="BOTH">All statuses</MenuItem><MenuItem value="Y">Used</MenuItem><MenuItem value="N">Un-used</MenuItem>
          </TextField>
        </Box>

        {selectedIds.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1, px: 1.5, py: 1, borderBottom: `1px solid ${themeColors.border}` }}>
            <Typography variant="body2">{selectedIds.length} selected</Typography>
            <Button size="small" color="error" variant="contained" startIcon={<DeleteOutlineIcon />} onClick={() => confirmDelete(handleDeleteSelected)}>
              Delete selected
            </Button>
          </Box>
        )}

        <TableContainer>
          <Table size="small" sx={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '4%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '19%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '12.5%' }} />
              <col style={{ width: '12.5%' }} />
              <col style={{ width: '14%' }} />
            </colgroup>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    size="small"
                    checked={paginatedRows.length > 0 && paginatedRows.every((row) => selectedIds.includes(row.id))}
                    indeterminate={paginatedRows.some((row) => selectedIds.includes(row.id)) && !paginatedRows.every((row) => selectedIds.includes(row.id))}
                    onChange={(_, checked) => togglePageSelection(checked)}
                    inputProps={{ 'aria-label': 'Select all records on this page' }}
                  />
                </TableCell>
                <TableCell>Action</TableCell>
                <TableCell>AWB No.</TableCell>
                <TableCell>Airline</TableCell>
                <TableCell>Owner</TableCell>
                <TableCell>Receipt Date</TableCell>
                <TableCell>AWB Date</TableCell>
                <TableCell>AWB Used</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ border: 0 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, py: 5 }}>
                      <InsertDriveFileOutlinedIcon sx={{ fontSize: 32, color: themeColors.border }} />
                      <Typography variant="body2" sx={{ color: themeColors.textSecondary }}>
                        No records yet — use Show Detail to search, or New AWB to register stock.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRows.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        size="small"
                        checked={selectedIds.includes(row.id)}
                        onChange={() => toggleRowSelection(row.id)}
                        inputProps={{ 'aria-label': `Select AWB ${row.awbNo}` }}
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View">
                        <IconButton size="small" color="primary" onClick={() => handleViewRow(row)}>
                          <VisibilityOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton size="small" color="primary" onClick={() => handleEditRow(row)}>
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => confirmDelete(() => handleDeleteRow(row.id))}>
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                    <TableCell>{row.awbNo}</TableCell>
                    <TableCell>{row.airlineCode}</TableCell>
                    <TableCell>{row.ownerCode}</TableCell>
                    <TableCell>{row.receiptDate}</TableCell>
                    <TableCell>{row.awbDate || '—'}</TableCell>
                    <TableCell>
                      <Chip size="small" label={row.awbUsed} color={row.awbUsed === 'Y' ? 'warning' : 'success'} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={rows.length}
          page={page}
          onPageChange={(_, nextPage) => setPage(nextPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => { setRowsPerPage(Number(event.target.value)); setPage(0); }}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Rows per page"
        />
      </Paper>

      <Dialog open={Boolean(recordDialog)} onClose={() => setRecordDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle>{recordDialog?.mode === 'edit' ? 'Edit Air Waybill Stock' : 'Air Waybill Stock Details'}</DialogTitle>
        {recordDialog && (
          <DialogContent>
            <FormRow>
              <FormField xs={12} sm={12} md={12}>
                <TextField label="Air Waybill No." fullWidth value={recordDialog.record.awbNo} InputProps={{ readOnly: true }} />
              </FormField>
            </FormRow>
            <FormRow>
              <FormField xs={6} sm={6} md={6}>
                <TextField
                  select
                  label="Airline Code"
                  fullWidth
                  disabled={recordDialog.mode === 'view'}
                  value={recordDialog.record.airlineCode}
                  onChange={(e) => setRecordDialog({ ...recordDialog, record: { ...recordDialog.record, airlineCode: e.target.value } })}
                >
                  {airlines.map((a) => <MenuItem key={a.code} value={a.code}>{a.code} — {a.name}</MenuItem>)}
                </TextField>
              </FormField>
              <FormField xs={6} sm={6} md={6}>
                <TextField
                  select
                  label="Owner Code"
                  fullWidth
                  disabled={recordDialog.mode === 'view'}
                  value={recordDialog.record.ownerCode}
                  onChange={(e) => setRecordDialog({ ...recordDialog, record: { ...recordDialog.record, ownerCode: e.target.value } })}
                >
                  {owners.map((o) => <MenuItem key={o.code} value={o.code}>{o.code} — {o.name}</MenuItem>)}
                </TextField>
              </FormField>
            </FormRow>
            <FormRow>
              <FormField xs={6} sm={6} md={6}>
                <TextField
                  label="Receipt Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ readOnly: recordDialog.mode === 'view' }}
                  value={recordDialog.record.receiptDate}
                  onChange={(e) => setRecordDialog({ ...recordDialog, record: { ...recordDialog.record, receiptDate: e.target.value } })}
                />
              </FormField>
              <FormField xs={6} sm={6} md={6}>
                <TextField
                  select
                  label="AWB Used Y/N"
                  fullWidth
                  disabled={recordDialog.mode === 'view'}
                  value={recordDialog.record.awbUsed}
                  onChange={(e) => setRecordDialog({ ...recordDialog, record: { ...recordDialog.record, awbUsed: e.target.value as 'Y' | 'N' } })}
                >
                  <MenuItem value="N">N</MenuItem><MenuItem value="Y">Y</MenuItem>
                </TextField>
              </FormField>
            </FormRow>
            <FormRow>
              <FormField xs={6} sm={6} md={6}>
                <TextField
                  label="AWB Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ readOnly: recordDialog.mode === 'view' }}
                  value={recordDialog.record.awbDate}
                  onChange={(e) => setRecordDialog({ ...recordDialog, record: { ...recordDialog.record, awbDate: e.target.value } })}
                />
              </FormField>
            </FormRow>
          </DialogContent>
        )}
        <DialogActions>
          <Button onClick={() => setRecordDialog(null)}>Close</Button>
          {recordDialog?.mode === 'edit' && <Button variant="contained" onClick={handleSaveRecord}>Save</Button>}
        </DialogActions>
      </Dialog>

      <Dialog
        open={rangeDialogOpen}
        onClose={() => setRangeDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2.5, overflow: 'hidden' } }}
      >
        <DialogTitle>Air Waybill Stock (Received From Airline) — Bulk Range Entry</DialogTitle>
        <DialogContent sx={{ bgcolor: themeColors.pageBackground, pt: '22px !important' }}>
          <Box sx={{ p: 2, bgcolor: '#fff', border: `1px solid ${themeColors.border}`, borderRadius: 1.5 }}>
          {rangeError && <Alert severity="error" onClose={() => setRangeError(null)} sx={{ mb: 2 }}>{rangeError}</Alert>}
          <FormRow>
            <FormField xs={12} sm={12} md={12}>
              <TextField select label="Give Airline Code" fullWidth value={rangeAirline} onChange={(e) => setRangeAirline(e.target.value)}>
                {airlines.map((a) => (
                  <MenuItem key={a.code} value={a.code}>
                    {a.code} — {a.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
          </FormRow>
          <FormRow>
            <FormField xs={8} sm={8} md={8}>
              <TextField
                label="Starting AWB No"
                fullWidth
                value={rangeStart}
                onChange={(e) => setRangeStart(e.target.value.replace(/\D/g, '').slice(0, 7))}
                placeholder="1234567"
                inputProps={{ inputMode: 'numeric', maxLength: 7 }}
                helperText="Seven-digit serial number"
              />
            </FormField>
            <FormField xs={4} sm={4} md={4}>
              <TextField
                label="Check Digit"
                fullWidth
                value={rangeStartCheckDigit}
                InputProps={{ readOnly: true }}
                sx={{ '& .MuiInputBase-input': { fontWeight: 700 } }}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField xs={8} sm={8} md={8}>
              <TextField
                label="Ending AWB No"
                fullWidth
                value={rangeEnd}
                onChange={(e) => setRangeEnd(e.target.value.replace(/\D/g, '').slice(0, 7))}
                placeholder="1234567"
                inputProps={{ inputMode: 'numeric', maxLength: 7 }}
                helperText="Seven-digit serial number"
              />
            </FormField>
            <FormField xs={4} sm={4} md={4}>
              <TextField
                label="Check Digit"
                fullWidth
                value={rangeEndCheckDigit}
                InputProps={{ readOnly: true }}
                sx={{ '& .MuiInputBase-input': { fontWeight: 700 } }}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField xs={6} sm={6} md={6}>
              <TextField
                label="Give Reciept Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={rangeReceiptDate}
                onChange={(e) => setRangeReceiptDate(e.target.value)}
              />
            </FormField>
            <FormField xs={6} sm={6} md={6}>
              <TextField select label="Give Owner Code" fullWidth value={rangeOwner} onChange={(e) => setRangeOwner(e.target.value)}>
                {owners.map((o) => (
                  <MenuItem key={o.code} value={o.code}>
                    {o.code} — {o.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
          </FormRow>
          <Button variant="contained" onClick={handleCheckAwb} sx={{ px: 3, fontWeight: 700 }}>
            Check AWB
          </Button>

          {rangeResult && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Paper variant="outlined" sx={{ p: 1.25, textAlign: 'center', borderTop: `3px solid ${themeColors.primary}` }}>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>Total Given</Typography>
                    <Typography variant="h6">{rangeResult.given}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper variant="outlined" sx={{ p: 1.25, textAlign: 'center', borderTop: '3px solid #ed6c02' }}>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>Duplicate</Typography>
                    <Typography variant="h6" color="warning.main">
                      {rangeResult.duplicate}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper variant="outlined" sx={{ p: 1.25, textAlign: 'center', borderTop: '3px solid #2e7d32' }}>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>Ready to Save</Typography>
                    <Typography variant="h6" color="success.main">
                      {rangeResult.toBeWritten}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5, borderTop: `1px solid ${themeColors.border}` }}>
          <Button onClick={() => setRangeDialogOpen(false)}>Close</Button>
          <Button variant="contained" disabled={!rangeResult || rangeResult.toBeWritten === 0} onClick={handleWriteRange}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </PageShell>
  );
}
