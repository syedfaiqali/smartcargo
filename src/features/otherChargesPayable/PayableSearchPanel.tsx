import { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
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
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { FormRow, FormField } from '../../components/FormGrid';
import { OtherChargesPayable } from '../../domain/otherChargesPayable';
import { PayableFilter, searchPayables } from '../../data/otherChargesPayableService';
import { partyRepo, payableTypeRepo } from '../../data/masterDataService';

interface PayableSearchPanelProps {
  onOpenPayable: (payable: OtherChargesPayable) => void;
}

export function PayableSearchPanel({ onOpenPayable }: PayableSearchPanelProps) {
  const [partyCode, setPartyCode] = useState('');
  const [payableType, setPayableType] = useState('');
  const [mJobNo, setMJobNo] = useState('');
  const [status, setStatus] = useState<PayableFilter['status']>('ALL');
  const [results, setResults] = useState<OtherChargesPayable[]>([]);

  const parties = partyRepo.list();
  const payableTypes = payableTypeRepo.list();

  const runSearch = () => {
    setResults(searchPayables({ partyCode: partyCode || undefined, payableType: payableType || undefined, mJobNo: mJobNo || undefined, status }));
  };

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Search Other Charges Payable
      </Typography>
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <FormRow>
          <FormField md={4}>
            <TextField select label="Party (Vendor)" fullWidth value={partyCode} onChange={(e) => setPartyCode(e.target.value)}>
              <MenuItem value="">Any</MenuItem>
              {parties.map((p) => (
                <MenuItem key={p.code} value={p.code}>
                  {p.code} — {p.name}
                </MenuItem>
              ))}
            </TextField>
          </FormField>
          <FormField md={4}>
            <TextField select label="Payable Type" fullWidth value={payableType} onChange={(e) => setPayableType(e.target.value)}>
              <MenuItem value="">Any</MenuItem>
              {payableTypes.map((t) => (
                <MenuItem key={t.code} value={t.code}>
                  {t.code} — {t.description}
                </MenuItem>
              ))}
            </TextField>
          </FormField>
          <FormField md={4}>
            <TextField label="M/Job No." fullWidth value={mJobNo} onChange={(e) => setMJobNo(e.target.value)} />
          </FormField>
        </FormRow>

        <FormControl sx={{ mt: 1 }}>
          <FormLabel>Status</FormLabel>
          <RadioGroup row value={status} onChange={(e) => setStatus(e.target.value as PayableFilter['status'])}>
            <FormControlLabel value="FINAL" control={<Radio size="small" />} label="Final" />
            <FormControlLabel value="UN_FINAL" control={<Radio size="small" />} label="Un-Final" />
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
              <TableCell>Credit Note No.</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Payable Type</TableCell>
              <TableCell>Party</TableCell>
              <TableCell>M/Job No.</TableCell>
              <TableCell>Total Charges</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {results.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    No records — adjust filters and click Show Detail.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              results.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell>{p.creditNoteNo}</TableCell>
                  <TableCell>{p.date}</TableCell>
                  <TableCell>{p.payableType}</TableCell>
                  <TableCell>{p.partyName || p.partyCode}</TableCell>
                  <TableCell>{p.mJobNo}</TableCell>
                  <TableCell>{p.totalCharges.toFixed(2)}</TableCell>
                  <TableCell>
                    {p.status.final ? <Chip size="small" label="FINAL" color="success" /> : <Chip size="small" label="OPEN" variant="outlined" />}
                  </TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => onOpenPayable(p)}>
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
