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
import { Job, JobKind } from '../../../domain/job';
import { FormRow, FormField } from '../../../components/FormGrid';
import { finalizeMultiple, searchJobs, JobFilter } from '../../../data/jobService';
import { partyRepo, ownerRepo, spoRepo, airportRepo } from '../../../data/masterDataService';

interface DetailSearchTabProps {
  kind: JobKind;
  onOpenJob: (job: Job) => void;
}

const BRANCHES = ['KHI', 'LHE', 'ISB'];

export function DetailSearchTab({ kind, onOpenJob }: DetailSearchTabProps) {
  const [branches, setBranches] = useState<string[]>(['KHI']);
  const [partyCode, setPartyCode] = useState('');
  const [owner, setOwner] = useState('');
  const [spoCode, setSpoCode] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [hsCode, setHsCode] = useState('');
  const [startJobNo, setStartJobNo] = useState('');
  const [endJobNo, setEndJobNo] = useState('ZZZZZZZZZZZZ');
  const [checkDate, setCheckDate] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateField, setDateField] = useState<'AWB_DATE' | 'JOB_DATE'>('JOB_DATE');
  const [startMawbNo, setStartMawbNo] = useState('');
  const [endMawbNo, setEndMawbNo] = useState('ZZZ-ZZZZZZZZ');
  const [formENo, setFormENo] = useState('');
  const [status, setStatus] = useState<JobFilter['status']>('ALL');
  const [results, setResults] = useState<Job[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const parties = partyRepo.list();
  const owners = ownerRepo.list();
  const spoCodes = spoRepo.list();
  const airports = airportRepo.list();

  const runSearch = () => {
    const found = searchJobs({
      kind,
      branches,
      partyCode: partyCode || undefined,
      owner: owner || undefined,
      spoCode: spoCode || undefined,
      originAirport: origin || undefined,
      destination: destination || undefined,
      hsCode: hsCode || undefined,
      startJobNo: startJobNo || undefined,
      endJobNo: endJobNo || undefined,
      checkDate,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      dateField,
      startMawbNo: startMawbNo || undefined,
      endMawbNo: endMawbNo || undefined,
      formENo: formENo || undefined,
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
    finalizeMultiple(Array.from(selected));
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
            <TextField select label="Owner" fullWidth value={owner} onChange={(e) => setOwner(e.target.value)}>
              <MenuItem value="">Any</MenuItem>
              {owners.map((o) => (
                <MenuItem key={o.code} value={o.code}>
                  {o.code} — {o.name}
                </MenuItem>
              ))}
            </TextField>
          </FormField>
        </FormRow>
        <FormRow>
          <FormField md={4}>
            <TextField select label="SPO Code" fullWidth value={spoCode} onChange={(e) => setSpoCode(e.target.value)}>
              <MenuItem value="">Any</MenuItem>
              {spoCodes.map((s) => (
                <MenuItem key={s.code} value={s.code}>
                  {s.code}
                </MenuItem>
              ))}
            </TextField>
          </FormField>
          <FormField md={4}>
            <TextField select label="Airport of Dep. (Origin)" fullWidth value={origin} onChange={(e) => setOrigin(e.target.value)}>
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
        </FormRow>
        <FormRow>
          <FormField md={4}>
            <TextField label="HS Code" fullWidth value={hsCode} onChange={(e) => setHsCode(e.target.value)} />
          </FormField>
          <FormField md={4}>
            <TextField label="Give Starting Job No." fullWidth value={startJobNo} onChange={(e) => setStartJobNo(e.target.value)} />
          </FormField>
          <FormField md={4}>
            <TextField label="Give Ending Job No." fullWidth value={endJobNo} onChange={(e) => setEndJobNo(e.target.value)} />
          </FormField>
        </FormRow>
        <FormRow>
          <FormField md={4}>
            <TextField select label="Date Field" fullWidth value={dateField} onChange={(e) => setDateField(e.target.value as 'AWB_DATE' | 'JOB_DATE')}>
              <MenuItem value="JOB_DATE">Job Date</MenuItem>
              <MenuItem value="AWB_DATE">AWB Date</MenuItem>
            </TextField>
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
          <FormField md={4}>
            <TextField label="Give Starting MAWB No." fullWidth value={startMawbNo} onChange={(e) => setStartMawbNo(e.target.value)} />
          </FormField>
          <FormField md={4}>
            <TextField label="Give Ending MAWB No." fullWidth value={endMawbNo} onChange={(e) => setEndMawbNo(e.target.value)} />
          </FormField>
          <FormField md={4}>
            <TextField label="Form 'E' No." fullWidth value={formENo} onChange={(e) => setFormENo(e.target.value)} />
          </FormField>
        </FormRow>

        <FormControl sx={{ mt: 1 }}>
          <FormLabel>Status</FormLabel>
          <RadioGroup row value={status} onChange={(e) => setStatus(e.target.value as JobFilter['status'])}>
            <FormControlLabel value="FINAL" control={<Radio size="small" />} label="Final" />
            <FormControlLabel value="UN_FINAL" control={<Radio size="small" />} label="Un-Final" />
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
            Final Multiple {kind === 'MAWB' ? 'AWB' : 'HAWB'} ({selected.size})
          </Button>
        </Box>
      </Paper>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" />
              <TableCell>Job No.</TableCell>
              <TableCell>Job Date</TableCell>
              <TableCell>{kind === 'MAWB' ? 'MAWB No.' : 'HAWB No. / Master Job'}</TableCell>
              <TableCell>Party</TableCell>
              <TableCell>Origin</TableCell>
              <TableCell>Destination</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {results.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    No records — adjust filters and click SELECT / Show Detail.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              results.map((job) => (
                <TableRow key={job.id} hover selected={selected.has(job.id)}>
                  <TableCell padding="checkbox">
                    <Checkbox size="small" checked={selected.has(job.id)} onChange={() => toggleSelect(job.id)} />
                  </TableCell>
                  <TableCell>{job.jobNo}</TableCell>
                  <TableCell>{job.jobDate}</TableCell>
                  <TableCell>{kind === 'MAWB' ? job.mawbNo : `${job.hawbNo || '—'} / ${job.parentJobNo || '—'}`}</TableCell>
                  <TableCell>{job.party.name || job.party.partyCode}</TableCell>
                  <TableCell>{job.routing.airportOfDeparture}</TableCell>
                  <TableCell>{job.routing.destination}</TableCell>
                  <TableCell>
                    {job.status.void ? (
                      <Chip size="small" label="VOID" color="warning" />
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
