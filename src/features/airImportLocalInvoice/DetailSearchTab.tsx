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
import Checkbox from '@mui/material/Checkbox';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { AirImportLocalInvoice } from '../../domain/airImportLocalInvoice';
import { FormRow, FormField } from '../../components/FormGrid';
import { AirImportInvoiceFilter, searchAirImportInvoices } from '../../data/airImportLocalInvoiceService';
import { partyRepo } from '../../data/masterDataService';

interface DetailSearchTabProps {
  onOpenInvoice: (invoice: AirImportLocalInvoice) => void;
}

const BRANCHES = ['KHI', 'LHE', 'ISB'];

export function DetailSearchTab({ onOpenInvoice }: DetailSearchTabProps) {
  const [branches, setBranches] = useState<string[]>(['KHI']);
  const [partyCode, setPartyCode] = useState('');
  const [destination, setDestination] = useState('');
  const [checkDate, setCheckDate] = useState(true);
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<AirImportInvoiceFilter['status']>('ALL');
  const [results, setResults] = useState<AirImportLocalInvoice[]>([]);

  const parties = partyRepo.list();

  const runSearch = () => {
    setResults(
      searchAirImportInvoices({
        branches,
        partyCode: partyCode || undefined,
        destination: destination || undefined,
        checkDate,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        status,
      })
    );
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
              renderTags={(value, getTagProps) => value.map((option, index) => <Chip label={option} size="small" {...getTagProps({ index })} key={option} />)}
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
            <TextField label="Destination" fullWidth value={destination} onChange={(e) => setDestination(e.target.value)} />
          </FormField>
        </FormRow>
        <FormRow>
          <FormField md={3}>
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

        <FormControl sx={{ mt: 1 }}>
          <FormLabel>Status</FormLabel>
          <RadioGroup row value={status} onChange={(e) => setStatus(e.target.value as AirImportInvoiceFilter['status'])}>
            <FormControlLabel value="FINAL" control={<Radio size="small" />} label="Final" />
            <FormControlLabel value="UN_FINAL" control={<Radio size="small" />} label="Un-Final" />
            <FormControlLabel value="VOID" control={<Radio size="small" />} label="Void" />
            <FormControlLabel value="UN_VOID" control={<Radio size="small" />} label="Un-Void" />
            <FormControlLabel value="ALL" control={<Radio size="small" />} label="All" />
          </RadioGroup>
        </FormControl>

        <Box sx={{ mt: 1 }}>
          <Button variant="contained" onClick={runSearch}>
            Show Detail
          </Button>
        </Box>
      </Paper>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Invoice No. / Date</TableCell>
              <TableCell>Job No.</TableCell>
              <TableCell>Party</TableCell>
              <TableCell>Origin / Destination</TableCell>
              <TableCell>MAWB/HAWB No.</TableCell>
              <TableCell align="right">Invoice Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {results.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    No data available — adjust filters and click Show Detail.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              results.map((invoice) => (
                <TableRow key={invoice.id} hover>
                  <TableCell>
                    {invoice.invoiceNo} / {invoice.date}
                  </TableCell>
                  <TableCell>{invoice.jobNo}</TableCell>
                  <TableCell>{invoice.partyName || invoice.partyCode}</TableCell>
                  <TableCell>
                    {invoice.origin} → {invoice.destination}
                  </TableCell>
                  <TableCell>
                    {invoice.mawbNo} / {invoice.hawbNo}
                  </TableCell>
                  <TableCell align="right">{invoice.invoiceTotalPkr.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell>
                    {invoice.status.void ? (
                      <Chip size="small" label="VOID" color="warning" />
                    ) : invoice.status.final ? (
                      <Chip size="small" label="FINAL" color="success" />
                    ) : (
                      <Chip size="small" label="OPEN" variant="outlined" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => onOpenInvoice(invoice)}>
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
