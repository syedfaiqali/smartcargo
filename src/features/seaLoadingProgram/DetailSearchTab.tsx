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
import { SeaLoadingProgram } from '../../domain/seaLoadingProgram';
import { FormRow, FormField } from '../../components/FormGrid';
import { LoadingProgramFilter, searchLoadingPrograms } from '../../data/seaLoadingProgramService';
import { partyRepo, shippingLineRepo } from '../../data/masterDataService';

interface DetailSearchTabProps {
  onOpenProgram: (program: SeaLoadingProgram) => void;
}

const BRANCHES = ['KHI', 'LHE', 'ISB'];

export function DetailSearchTab({ onOpenProgram }: DetailSearchTabProps) {
  const [branches, setBranches] = useState<string[]>(['KHI']);
  const [partyCode, setPartyCode] = useState('');
  const [shippingLine, setShippingLine] = useState('');
  const [destination, setDestination] = useState('');
  const [lclFcl, setLclFcl] = useState('');
  const [checkDate, setCheckDate] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<LoadingProgramFilter['status']>('ALL');
  const [results, setResults] = useState<SeaLoadingProgram[]>([]);

  const parties = partyRepo.list();
  const shippingLines = shippingLineRepo.list();

  const runSearch = () => {
    setResults(
      searchLoadingPrograms({
        branches,
        partyCode: partyCode || undefined,
        shippingLine: shippingLine || undefined,
        destination: destination || undefined,
        lclFcl: lclFcl || undefined,
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
            <TextField select label="Shipping Line" fullWidth value={shippingLine} onChange={(e) => setShippingLine(e.target.value)}>
              <MenuItem value="">Any</MenuItem>
              {shippingLines.map((s) => (
                <MenuItem key={s.code} value={s.code}>
                  {s.code} — {s.name}
                </MenuItem>
              ))}
            </TextField>
          </FormField>
        </FormRow>
        <FormRow>
          <FormField md={4}>
            <TextField label="Destination" fullWidth value={destination} onChange={(e) => setDestination(e.target.value)} />
          </FormField>
          <FormField md={4}>
            <TextField select label="LCL/FCL" fullWidth value={lclFcl} onChange={(e) => setLclFcl(e.target.value)}>
              <MenuItem value="">Any</MenuItem>
              <MenuItem value="LCL">LCL</MenuItem>
              <MenuItem value="FCL">FCL</MenuItem>
            </TextField>
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
          <RadioGroup row value={status} onChange={(e) => setStatus(e.target.value as LoadingProgramFilter['status'])}>
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
              <TableCell>Load Program No. / Date</TableCell>
              <TableCell>Party</TableCell>
              <TableCell>Shipping Line</TableCell>
              <TableCell>Vessel / Voyage</TableCell>
              <TableCell>Destination</TableCell>
              <TableCell>LCL/FCL</TableCell>
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
              results.map((program) => (
                <TableRow key={program.id} hover>
                  <TableCell>
                    {program.loadProgramNo} / {program.date}
                  </TableCell>
                  <TableCell>{program.partyName || program.partyCode}</TableCell>
                  <TableCell>{program.shippingLine}</TableCell>
                  <TableCell>
                    {program.vessel} / {program.voyage}
                  </TableCell>
                  <TableCell>{program.destination}</TableCell>
                  <TableCell>{program.lclFcl}</TableCell>
                  <TableCell>
                    {program.status.final ? <Chip size="small" label="FINAL" color="success" /> : <Chip size="small" label="OPEN" variant="outlined" />}
                  </TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => onOpenProgram(program)}>
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
