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
import { ForeignAgentInvoice, ForeignAgentInvoiceVariant } from '../../../domain/foreignAgentInvoice';
import { VariantConfig } from '../variantConfig';
import { FormRow, FormField } from '../../../components/FormGrid';
import { AgentInvoiceFilter, finalizeMultipleAgentInvoices, searchAgentInvoices } from '../../../data/foreignAgentInvoiceService';
import { foreignAgentRepo } from '../../../data/masterDataService';

interface DetailSearchTabProps {
  variant: ForeignAgentInvoiceVariant;
  config: VariantConfig;
  onOpenInvoice: (invoice: ForeignAgentInvoice) => void;
}

const BRANCHES = ['KHI', 'LHE', 'ISB'];

export function DetailSearchTab({ variant, config, onOpenInvoice }: DetailSearchTabProps) {
  const [branches, setBranches] = useState<string[]>(['KHI']);
  const [fAgentCode, setFAgentCode] = useState('');
  const [checkDate, setCheckDate] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<AgentInvoiceFilter['status']>('ALL');
  const [results, setResults] = useState<ForeignAgentInvoice[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const foreignAgents = foreignAgentRepo.list();

  const runSearch = () => {
    const found = searchAgentInvoices({ variant, branches, fAgentCode: fAgentCode || undefined, checkDate, startDate: startDate || undefined, endDate: endDate || undefined, status });
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
    finalizeMultipleAgentInvoices(Array.from(selected));
    runSearch();
  };

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        6.9.1 Search Criteria
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
            <TextField select label="F/Agent Code" fullWidth value={fAgentCode} onChange={(e) => setFAgentCode(e.target.value)}>
              <MenuItem value="">Any</MenuItem>
              {foreignAgents.map((a) => (
                <MenuItem key={a.code} value={a.code}>
                  {a.code} — {a.name}
                </MenuItem>
              ))}
            </TextField>
          </FormField>
          <FormField md={4}>
            <FormControlLabel control={<Checkbox checked={checkDate} onChange={(e) => setCheckDate(e.target.checked)} />} label="Check Date" />
          </FormField>
        </FormRow>
        <FormRow>
          <FormField md={6}>
            <TextField
              label="Give Starting Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={startDate}
              disabled={!checkDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </FormField>
          <FormField md={6}>
            <TextField
              label="Give Ending Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={endDate}
              disabled={!checkDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </FormField>
        </FormRow>

        <Typography variant="subtitle2" sx={{ mt: 1, mb: 0.5 }}>
          6.9.2 Status Filter &amp; Actions
        </Typography>
        <FormControl>
          <FormLabel>Status</FormLabel>
          <RadioGroup row value={status} onChange={(e) => setStatus(e.target.value as AgentInvoiceFilter['status'])}>
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
            SELECT / Show Detail
          </Button>
          <Button variant="outlined" color="success" disabled={selected.size === 0} onClick={handleFinalMultiple}>
            {config.bulkFinalizeLabel} ({selected.size})
          </Button>
        </Box>
      </Paper>

      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        6.9.3 Result Grid
      </Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" />
              <TableCell>{config.searchGridGroupLabel} No.</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Master Air Job / AWB</TableCell>
              <TableCell>Foreign Agent</TableCell>
              <TableCell>Route</TableCell>
              <TableCell>Curr.</TableCell>
              <TableCell>Amount (PKR)</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {results.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    No records — adjust filters and click SELECT / Show Detail.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              results.map((inv) => (
                <TableRow key={inv.id} hover selected={selected.has(inv.id)}>
                  <TableCell padding="checkbox">
                    <Checkbox size="small" checked={selected.has(inv.id)} onChange={() => toggleSelect(inv.id)} />
                  </TableCell>
                  <TableCell>{inv.documentNo}</TableCell>
                  <TableCell>{inv.documentDate}</TableCell>
                  <TableCell>
                    {inv.mawbJobNo} / {inv.mawbNo}
                  </TableCell>
                  <TableCell>
                    {inv.fAgentCode} — {inv.fAgentName}
                  </TableCell>
                  <TableCell>
                    {inv.origin} → {inv.destination}
                  </TableCell>
                  <TableCell>{inv.currencyCode}</TableCell>
                  <TableCell>{(inv.totalInvoiceAmount * (inv.exchangeRate || 1)).toFixed(2)}</TableCell>
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
