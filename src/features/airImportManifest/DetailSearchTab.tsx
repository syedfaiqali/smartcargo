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
import { AirImportManifest } from '../../domain/airImportManifest';
import { FormRow, FormField } from '../../components/FormGrid';
import { AirImportManifestFilter, searchAirImportManifests } from '../../data/airImportManifestService';
import { foreignAgentRepo } from '../../data/masterDataService';

interface DetailSearchTabProps {
  onOpenManifest: (manifest: AirImportManifest) => void;
}

const BRANCHES = ['KHI', 'LHE', 'ISB'];

export function DetailSearchTab({ onOpenManifest }: DetailSearchTabProps) {
  const [branches, setBranches] = useState<string[]>(['KHI']);
  const [foreignAgent, setForeignAgent] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [mawbNo, setMawbNo] = useState('');
  const [checkDate, setCheckDate] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<AirImportManifestFilter['status']>('ALL');
  const [results, setResults] = useState<AirImportManifest[]>([]);

  const foreignAgents = foreignAgentRepo.list();

  const runSearch = () => {
    setResults(
      searchAirImportManifests({
        branches,
        foreignAgent: foreignAgent || undefined,
        origin: origin || undefined,
        destination: destination || undefined,
        mawbNo: mawbNo || undefined,
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
            <TextField select label="Foreign Agent" fullWidth value={foreignAgent} onChange={(e) => setForeignAgent(e.target.value)}>
              <MenuItem value="">Any</MenuItem>
              {foreignAgents.map((a) => (
                <MenuItem key={a.code} value={a.code}>
                  {a.code} — {a.name}
                </MenuItem>
              ))}
            </TextField>
          </FormField>
          <FormField md={4}>
            <TextField label="MAWB No." fullWidth value={mawbNo} onChange={(e) => setMawbNo(e.target.value)} />
          </FormField>
        </FormRow>
        <FormRow>
          <FormField md={4}>
            <TextField label="Origin" fullWidth value={origin} onChange={(e) => setOrigin(e.target.value)} />
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
          <RadioGroup row value={status} onChange={(e) => setStatus(e.target.value as AirImportManifestFilter['status'])}>
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
              <TableCell>MAWB No. / Date</TableCell>
              <TableCell>Foreign Agent</TableCell>
              <TableCell>Origin / Destination</TableCell>
              <TableCell>Flight No. / Date</TableCell>
              <TableCell>HAWBs</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {results.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    No records — adjust filters and click Show Detail.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              results.map((manifest) => (
                <TableRow key={manifest.id} hover>
                  <TableCell>
                    {manifest.mawbNo} / {manifest.mawbDate}
                  </TableCell>
                  <TableCell>{manifest.foreignAgent}</TableCell>
                  <TableCell>
                    {manifest.origin} → {manifest.destination}
                  </TableCell>
                  <TableCell>
                    {manifest.flightNo} / {manifest.flightDate}
                  </TableCell>
                  <TableCell>{manifest.hawbLines.length}</TableCell>
                  <TableCell>
                    {manifest.status.final ? <Chip size="small" label="FINAL" color="success" /> : <Chip size="small" label="OPEN" variant="outlined" />}
                  </TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => onOpenManifest(manifest)}>
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
