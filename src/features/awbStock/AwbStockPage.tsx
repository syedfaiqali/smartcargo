import { useMemo, useState } from 'react';
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
import SearchIcon from '@mui/icons-material/Search';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import { PageShell } from '../../layout/PageShell';
import { ToolbarAction } from '../../components/TransactionToolbar';
import { FormRow, FormField } from '../../components/FormGrid';
import { themeColors } from '../../theme/themeColors';
import { airlineRepo, ownerRepo } from '../../data/masterDataService';
import {
  awbStockRepo,
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

  // filter state
  const [filterAirline, setFilterAirline] = useState('');
  const [filterOwner, setFilterOwner] = useState('');
  const [filterStart, setFilterStart] = useState('');
  const [filterEnd, setFilterEnd] = useState('');
  const [filterUsed, setFilterUsed] = useState<'BOTH' | 'Y' | 'N'>('BOTH');
  const [rows, setRows] = useState<AwbStock[]>([]);

  // range popup state
  const [rangeAirline, setRangeAirline] = useState(airlines[0]?.code ?? '');
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');
  const [rangeReceiptDate, setRangeReceiptDate] = useState(today());
  const [rangeOwner, setRangeOwner] = useState(owners[0]?.code ?? '');
  const [rangeResult, setRangeResult] = useState<AwbRangeCheckResult | null>(null);
  const [message, setMessage] = useState<{ severity: 'success' | 'error'; text: string } | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- rows triggers recompute after mutations even though its value isn't read
  const summary = useMemo(() => (filterAirline ? getStockSummary(filterAirline) : null), [filterAirline, rows]);

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
    createSingleAwb({ awbNo, airlineCode, receiptDate, ownerCode, awbUsed, awbDate });
    setMessage({ severity: 'success', text: `AWB ${awbNo} registered.` });
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
  };

  const handleCheckAwb = () => {
    if (!rangeAirline || !rangeStart || !rangeEnd) {
      setMessage({ severity: 'error', text: 'Airline Code, Starting and Ending AWB No. are required.' });
      return;
    }
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
    handleShowDetail();
  };

  return (
    <PageShell
      breadcrumbs={['Freight', 'Transactions Menu (Air Export)', 'Air Waybill Stock']}
      title="Air Waybill Stock"
      subtitle="Register, filter, and review received airline stock."
      actions={
        <>
          <Button variant="outlined" startIcon={<SearchIcon fontSize="small" />} onClick={handleShowDetail}>
            Search
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteOutlineIcon fontSize="small" />}
            onClick={() => handleAction('delete')}
          >
            Delete
          </Button>
          <Button variant="contained" startIcon={<AddIcon fontSize="small" />} onClick={() => handleAction('new')}>
            New AWB
          </Button>
        </>
      }
    >
      {message && (
        <Alert severity={message.severity} onClose={() => setMessage(null)} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ mb: 2, overflow: 'hidden' }}>
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
          <Typography sx={{ fontWeight: 700, fontSize: 14.5 }}>Register Single AWB</Typography>
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
          <FormRow>
            <FormField>
              <TextField
                label="Air Waybill No."
                fullWidth
                value={awbNo}
                onChange={(e) => setAwbNo(e.target.value)}
                placeholder="e.g. 214-12345678"
              />
            </FormField>
            <FormField>
              <TextField select label="Airline Code" fullWidth value={airlineCode} onChange={(e) => setAirlineCode(e.target.value)}>
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
                value={receiptDate}
                onChange={(e) => setReceiptDate(e.target.value)}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField>
              <TextField select label="Owner Code" fullWidth value={ownerCode} onChange={(e) => setOwnerCode(e.target.value)}>
                {owners.map((o) => (
                  <MenuItem key={o.code} value={o.code}>
                    {o.code} — {o.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField>
              <TextField select label="AWB Used Y/N" fullWidth value={awbUsed} onChange={(e) => setAwbUsed(e.target.value as 'Y' | 'N')}>
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
                disabled={awbUsed === 'N'}
              />
            </FormField>
          </FormRow>
          <Stack direction="row" spacing={1}>
            <Button variant="contained" onClick={handleSaveSingle}>
              Save
            </Button>
            <Button variant="text" onClick={() => setMode('idle')}>
              Cancel
            </Button>
          </Stack>
        </Box>
      </Paper>

      {summary && (
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Chip label={`Total: ${summary.total}`} color="primary" variant="outlined" />
          <Chip label={`Used: ${summary.used}`} color="warning" variant="outlined" />
          <Chip label={`Un-Used: ${summary.unused}`} color="success" variant="outlined" />
        </Stack>
      )}

      <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
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
          <Typography sx={{ fontWeight: 700, fontSize: 14.5 }}>Detail / Filter</Typography>
          <Chip
            size="small"
            label={`${rows.length} record${rows.length === 1 ? '' : 's'}`}
            sx={{ bgcolor: themeColors.pageBackground, fontSize: 11, fontWeight: 600, height: 22 }}
          />
        </Box>
        <Box sx={{ p: 2.5 }}>
          <FormRow>
            <FormField>
              <TextField select label="Select AirLine Code" fullWidth value={filterAirline} onChange={(e) => setFilterAirline(e.target.value)}>
                <MenuItem value="">All Airlines</MenuItem>
                {airlines.map((a) => (
                  <MenuItem key={a.code} value={a.code}>
                    {a.code} — {a.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField>
              <TextField select label="Select Owner Code" fullWidth value={filterOwner} onChange={(e) => setFilterOwner(e.target.value)}>
                <MenuItem value="">All Owners</MenuItem>
                {owners.map((o) => (
                  <MenuItem key={o.code} value={o.code}>
                    {o.code} — {o.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField>
              <TextField select label="AWB Used Y/N" fullWidth value={filterUsed} onChange={(e) => setFilterUsed(e.target.value as 'BOTH' | 'Y' | 'N')}>
                <MenuItem value="BOTH">Both</MenuItem>
                <MenuItem value="Y">Y</MenuItem>
                <MenuItem value="N">N</MenuItem>
              </TextField>
            </FormField>
          </FormRow>
          <FormRow>
            <FormField>
              <TextField
                label="Give Starting Recieved Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={filterStart}
                onChange={(e) => setFilterStart(e.target.value)}
              />
            </FormField>
            <FormField>
              <TextField
                label="Give Ending Recieved Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={filterEnd}
                onChange={(e) => setFilterEnd(e.target.value)}
              />
            </FormField>
            <FormField>
              <Button variant="contained" fullWidth sx={{ height: '40px' }} onClick={handleShowDetail}>
                Show Detail
              </Button>
            </FormField>
          </FormRow>
        </Box>

        <TableContainer sx={{ borderTop: `1px solid ${themeColors.border}` }}>
          <Table size="small">
            <TableHead>
              <TableRow>
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
                  <TableCell colSpan={7} align="center" sx={{ border: 0 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, py: 5 }}>
                      <InsertDriveFileOutlinedIcon sx={{ fontSize: 32, color: themeColors.border }} />
                      <Typography variant="body2" sx={{ color: themeColors.textSecondary }}>
                        No records yet — use Show Detail to search, or New AWB to register stock.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>
                      <Button size="small" color="error" onClick={() => handleDeleteRow(row.id)}>
                        Delete
                      </Button>
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
      </Paper>

      <Dialog open={rangeDialogOpen} onClose={() => setRangeDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Air Waybill Stock (Received From Airline) — Bulk Range Entry</DialogTitle>
        <DialogContent>
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
            <FormField xs={6} sm={6} md={6}>
              <TextField label="Give Starting AWB No" fullWidth value={rangeStart} onChange={(e) => setRangeStart(e.target.value)} placeholder="001-1000" />
            </FormField>
            <FormField xs={6} sm={6} md={6}>
              <TextField label="Give Ending AWB No" fullWidth value={rangeEnd} onChange={(e) => setRangeEnd(e.target.value)} placeholder="001-1099" />
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
          <Button variant="outlined" onClick={handleCheckAwb}>
            Check AWB
          </Button>

          {rangeResult && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Paper variant="outlined" sx={{ p: 1, textAlign: 'center' }}>
                    <Typography variant="caption">Total Given</Typography>
                    <Typography variant="h6">{rangeResult.given}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper variant="outlined" sx={{ p: 1, textAlign: 'center' }}>
                    <Typography variant="caption">Duplicate</Typography>
                    <Typography variant="h6" color="warning.main">
                      {rangeResult.duplicate}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper variant="outlined" sx={{ p: 1, textAlign: 'center' }}>
                    <Typography variant="caption">To Be Written</Typography>
                    <Typography variant="h6" color="success.main">
                      {rangeResult.toBeWritten}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRangeDialogOpen(false)}>Close</Button>
          <Button variant="contained" disabled={!rangeResult || rangeResult.toBeWritten === 0} onClick={handleWriteRange}>
            Write {rangeResult?.toBeWritten ?? 0} New Record(s)
          </Button>
        </DialogActions>
      </Dialog>
    </PageShell>
  );
}
