import { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { LocalInvoice } from '../../../domain/localInvoice';
import { FormRow, FormField } from '../../../components/FormGrid';
import { finalizeMultipleLocalInvoices, searchLocalInvoices, LocalInvoiceFilter } from '../../../data/localInvoiceService';
import { partyRepo, airportRepo } from '../../../data/masterDataService';

interface DetailSearchTabProps {
  onOpenInvoice: (invoice: LocalInvoice) => void;
}

const BRANCHES = ['KHI', 'LHE', 'ISB'];

export function DetailSearchTab({ onOpenInvoice }: DetailSearchTabProps) {
  const [branches, setBranches] = useState<string[]>(['KHI']);
  const [partyCode, setPartyCode] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [consignee, setConsignee] = useState('');
  const [checkDate, setCheckDate] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startInvoiceNo, setStartInvoiceNo] = useState('');
  const [endInvoiceNo, setEndInvoiceNo] = useState('ZZZZZZZZZZZZ');
  const [mawbJobNo, setMawbJobNo] = useState('');
  const [mawbNo, setMawbNo] = useState('');
  const [hawbJobNo, setHawbJobNo] = useState('');
  const [hawbNo, setHawbNo] = useState('');
  const [status, setStatus] = useState<LocalInvoiceFilter['status']>('ALL');
  const [results, setResults] = useState<LocalInvoice[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const parties = partyRepo.list();
  const airports = airportRepo.list();

  const runSearch = () => {
    const found = searchLocalInvoices({
      branches,
      partyCode: partyCode || undefined,
      airportOfDeparture: origin || undefined,
      destination: destination || undefined,
      consignee: consignee || undefined,
      checkDate,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      startInvoiceNo: startInvoiceNo || undefined,
      endInvoiceNo: endInvoiceNo || undefined,
      mawbJobNo: mawbJobNo || undefined,
      mawbNo: mawbNo || undefined,
      hawbJobNo: hawbJobNo || undefined,
      hawbNo: hawbNo || undefined,
      status,
    });
    setResults(found);
    setSelected(new Set());
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const handleFinalMultiple = () => {
    finalizeMultipleLocalInvoices(Array.from(selected));
    runSearch();
  };

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Filter Fields
      </Typography>
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <FormRow>
          <FormField md={4}>
            <Autocomplete
              multiple
              options={BRANCHES}
              value={branches}
              onChange={(_, v) => setBranches(v)}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => <Chip label={option} size="small" {...getTagProps({ index })} key={option} />)
              }
              renderInput={(params) => <TextField {...params} label="Branch" placeholder="Branch" />}
            />
          </FormField>
          <FormField md={4}>
            <TextField select label="Party Code" fullWidth value={partyCode} onChange={(e) => setPartyCode(e.target.value)}>
              <MenuItem value="">Any</MenuItem>
              {parties.map((p) => (
                <MenuItem key={p.code} value={p.code}>
                  {p.code} — {p.name}
                </MenuItem>
              ))}
            </TextField>
          </FormField>
          <FormField md={4}>
            <TextField label="Consignee" fullWidth value={consignee} onChange={(e) => setConsignee(e.target.value)} />
          </FormField>
        </FormRow>
        <FormRow>
          <FormField md={4}>
            <TextField select label="A/Port of Dep" fullWidth value={origin} onChange={(e) => setOrigin(e.target.value)}>
              <MenuItem value="">Any</MenuItem>
              {airports.map((a) => (
                <MenuItem key={a.code} value={a.code}>
                  {a.code}
                </MenuItem>
              ))}
            </TextField>
          </FormField>
          <FormField md={4}>
            <TextField label="Destination" fullWidth value={destination} onChange={(e) => setDestination(e.target.value)} />
          </FormField>
          <FormField md={4}>
            <TextField label="Starting Invoice No." fullWidth value={startInvoiceNo} onChange={(e) => setStartInvoiceNo(e.target.value)} />
          </FormField>
        </FormRow>
        <FormRow>
          <FormField md={4}>
            <TextField label="Ending Invoice No." fullWidth value={endInvoiceNo} onChange={(e) => setEndInvoiceNo(e.target.value)} />
          </FormField>
          <FormField md={2}>
            <FormControlLabel control={<Checkbox checked={checkDate} onChange={(e) => setCheckDate(e.target.checked)} />} label="Check Date" />
          </FormField>
          <FormField md={3}>
            <TextField
              label="Starting Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={startDate}
              disabled={!checkDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </FormField>
          <FormField md={3}>
            <TextField
              label="Ending Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={endDate}
              disabled={!checkDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </FormField>
        </FormRow>
        <FormRow>
          <FormField md={3}>
            <TextField label="MAWB Job No." fullWidth value={mawbJobNo} onChange={(e) => setMawbJobNo(e.target.value)} />
          </FormField>
          <FormField md={3}>
            <TextField label="MAWB No." fullWidth value={mawbNo} onChange={(e) => setMawbNo(e.target.value)} />
          </FormField>
          <FormField md={3}>
            <TextField label="HAWB Job No." fullWidth value={hawbJobNo} onChange={(e) => setHawbJobNo(e.target.value)} />
          </FormField>
          <FormField md={3}>
            <TextField label="HAWB No." fullWidth value={hawbNo} onChange={(e) => setHawbNo(e.target.value)} />
          </FormField>
        </FormRow>

        <FormControl sx={{ mt: 1 }}>
          <FormLabel>Show Invoices</FormLabel>
          <RadioGroup row value={status} onChange={(e) => setStatus(e.target.value as LocalInvoiceFilter['status'])}>
            <FormControlLabel value="FINAL" control={<Radio size="small" />} label="Final" />
            <FormControlLabel value="UN_FINAL" control={<Radio size="small" />} label="Un-Final" />
            <FormControlLabel value="POSTED" control={<Radio size="small" />} label="Posted" />
            <FormControlLabel value="UN_POSTED" control={<Radio size="small" />} label="Un-Posted" />
            <FormControlLabel value="VOID" control={<Radio size="small" />} label="Void" />
            <FormControlLabel value="UN_VOID" control={<Radio size="small" />} label="Un-Void" />
            <FormControlLabel value="ALL" control={<Radio size="small" />} label="All" />
          </RadioGroup>
        </FormControl>

        <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
          <Button variant="contained" onClick={runSearch}>
            Show Detail
          </Button>
          <Button variant="outlined" color="success" disabled={selected.size === 0} onClick={handleFinalMultiple}>
            Final Multiple Invoices ({selected.size})
          </Button>
        </Box>
      </Paper>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" />
              <TableCell>Invoice No.</TableCell>
              <TableCell>Invoice Date</TableCell>
              <TableCell>HAWB No. / Job</TableCell>
              <TableCell>MAWB No. / Job</TableCell>
              <TableCell>Party</TableCell>
              <TableCell>Destination</TableCell>
              <TableCell>Invoice Total PKR</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {results.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    No records — adjust filters and click Show Detail.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              results.map((inv) => (
                <TableRow key={inv.id} hover selected={selected.has(inv.id)}>
                  <TableCell padding="checkbox">
                    <Checkbox size="small" checked={selected.has(inv.id)} onChange={() => toggleSelect(inv.id)} />
                  </TableCell>
                  <TableCell>{inv.invoiceNo}</TableCell>
                  <TableCell>{inv.invoiceDate}</TableCell>
                  <TableCell>{inv.house.awbNo ? `${inv.house.awbNo} / ${inv.house.jobNo}` : '—'}</TableCell>
                  <TableCell>{inv.master.awbNo ? `${inv.master.awbNo} / ${inv.master.jobNo}` : '—'}</TableCell>
                  <TableCell>{inv.partyName || inv.partyCode}</TableCell>
                  <TableCell>{inv.destination}</TableCell>
                  <TableCell>{inv.invoiceTotal.toFixed(2)}</TableCell>
                  <TableCell>
                    {inv.status.void ? (
                      <Chip size="small" label="VOID" color="warning" />
                    ) : inv.status.final ? (
                      <Chip size="small" label="FINAL" color="success" />
                    ) : (
                      <Chip size="small" label="OPEN" variant="outlined" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => onOpenInvoice(inv)}>
                      Open
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
