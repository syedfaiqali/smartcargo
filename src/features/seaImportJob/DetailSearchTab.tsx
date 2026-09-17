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
import { SeaImportJob } from '../../domain/seaImportJob';
import { FormRow, FormField } from '../../components/FormGrid';
import { SeaImportJobFilter, searchSeaImportJobs } from '../../data/seaImportJobService';
import { partyRepo, foreignAgentRepo, shippingLineRepo } from '../../data/masterDataService';

interface DetailSearchTabProps {
  onOpenJob: (job: SeaImportJob) => void;
}

const BRANCHES = ['KHI', 'LHE', 'ISB'];

export function DetailSearchTab({ onOpenJob }: DetailSearchTabProps) {
  const [branches, setBranches] = useState<string[]>(['KHI']);
  const [partyCode, setPartyCode] = useState('');
  const [foreignAgent, setForeignAgent] = useState('');
  const [shippingLine, setShippingLine] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [mblNo, setMblNo] = useState('');
  const [hblNo, setHblNo] = useState('');
  const [checkDate, setCheckDate] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<SeaImportJobFilter['status']>('ALL');
  const [results, setResults] = useState<SeaImportJob[]>([]);

  const parties = partyRepo.list();
  const foreignAgents = foreignAgentRepo.list();
  const shippingLines = shippingLineRepo.list();

  const runSearch = () => {
    setResults(
      searchSeaImportJobs({
        branches,
        partyCode: partyCode || undefined,
        foreignAgent: foreignAgent || undefined,
        shippingLine: shippingLine || undefined,
        origin: origin || undefined,
        destination: destination || undefined,
        mblNo: mblNo || undefined,
        hblNo: hblNo || undefined,
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
            <TextField select label="Foreign Agent" fullWidth value={foreignAgent} onChange={(e) => setForeignAgent(e.target.value)}>
              <MenuItem value="">Any</MenuItem>
              {foreignAgents.map((a) => (
                <MenuItem key={a.code} value={a.code}>
                  {a.code} — {a.name}
                </MenuItem>
              ))}
            </TextField>
          </FormField>
        </FormRow>
        <FormRow>
          <FormField md={3}>
            <TextField select label="Shipping Line" fullWidth value={shippingLine} onChange={(e) => setShippingLine(e.target.value)}>
              <MenuItem value="">Any</MenuItem>
              {shippingLines.map((s) => (
                <MenuItem key={s.code} value={s.code}>
                  {s.code} — {s.name}
                </MenuItem>
              ))}
            </TextField>
          </FormField>
          <FormField md={3}>
            <TextField label="Origin" fullWidth value={origin} onChange={(e) => setOrigin(e.target.value)} />
          </FormField>
          <FormField md={3}>
            <TextField label="Destination" fullWidth value={destination} onChange={(e) => setDestination(e.target.value)} />
          </FormField>
        </FormRow>
        <FormRow>
          <FormField md={3}>
            <TextField label="MBL No." fullWidth value={mblNo} onChange={(e) => setMblNo(e.target.value)} />
          </FormField>
          <FormField md={3}>
            <TextField label="HBL No." fullWidth value={hblNo} onChange={(e) => setHblNo(e.target.value)} />
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
          <RadioGroup row value={status} onChange={(e) => setStatus(e.target.value as SeaImportJobFilter['status'])}>
            <FormControlLabel value="FINAL" control={<Radio size="small" />} label="Final" />
            <FormControlLabel value="UN_FINAL" control={<Radio size="small" />} label="Un-Final" />
            <FormControlLabel value="VOID" control={<Radio size="small" />} label="Void" />
            <FormControlLabel value="UN_VOID" control={<Radio size="small" />} label="Un-Void" />
            <FormControlLabel value="CLOSED" control={<Radio size="small" />} label="Closed" />
            <FormControlLabel value="UN_CLOSED" control={<Radio size="small" />} label="Un-Closed" />
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
              <TableCell>Job No. / Date</TableCell>
              <TableCell>MBL / HBL No.</TableCell>
              <TableCell>Party</TableCell>
              <TableCell>Foreign Agent</TableCell>
              <TableCell>Origin / Destination</TableCell>
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
              results.map((job) => (
                <TableRow key={job.id} hover>
                  <TableCell>
                    {job.jobNo} / {job.jobDate}
                  </TableCell>
                  <TableCell>
                    {job.mblNo} / {job.hblNo}
                  </TableCell>
                  <TableCell>{job.partyName || job.partyCode}</TableCell>
                  <TableCell>{job.foreignAgent}</TableCell>
                  <TableCell>
                    {job.origin} → {job.destination}
                  </TableCell>
                  <TableCell>
                    {job.status.void ? (
                      <Chip size="small" label="VOID" color="warning" />
                    ) : job.status.closed ? (
                      <Chip size="small" label="CLOSED" color="default" />
                    ) : job.status.final ? (
                      <Chip size="small" label="FINAL" color="success" />
                    ) : (
                      <Chip size="small" label="OPEN" variant="outlined" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => onOpenJob(job)}>
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
