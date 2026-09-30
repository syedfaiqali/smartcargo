import { Fragment, useEffect, useState } from 'react';
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
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import TablePagination from '@mui/material/TablePagination';
import { Job, JobKind } from '../../../domain/job';
import { FormRow, FormField } from '../../../components/FormGrid';
import { finalizeMultiple, searchJobs, JobFilter } from '../../../data/jobService';
import { partyRepo, ownerRepo, spoRepo, airportRepo } from '../../../data/masterDataService';

interface DetailSearchTabProps {
  kind: JobKind;
  onOpenJob: (job: Job) => void;
  onEditJob?: (job: Job) => void;
  onDeleteJob?: (job: Job) => void;
  onPrintJob?: (job: Job) => void;
}

const BRANCHES = ['KHI', 'LHE', 'ISB'];

export function DetailSearchTab({ kind, onOpenJob, onEditJob, onDeleteJob, onPrintJob }: DetailSearchTabProps) {
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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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

  useEffect(() => {
    runSearch();
    setPage(0);
    // The visible grid filters should update results immediately.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branches, partyCode, owner, startDate, endDate, startJobNo, startMawbNo, origin, destination, status]);
  const paginatedResults = results.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const operationalRow = (job: Job) => {
    const pieces = job.chargeLines.reduce((total, line) => total + line.pcs, 0);
    const weight = job.chargeLines.reduce((total, line) => total + line.grossWt, 0);
    const ownerName = owners.find((item) => item.code === job.owner)?.name ?? '';
    return (
      <TableRow key={`operational-${job.id}`} hover>
        <TableCell>
          <Tooltip title="Open"><IconButton size="small" color="primary" onClick={() => onOpenJob(job)}><VisibilityOutlinedIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Edit"><IconButton size="small" color="primary" onClick={() => onEditJob?.(job)}><EditOutlinedIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => { onDeleteJob?.(job); runSearch(); }}><DeleteOutlineIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Printing"><IconButton size="small" color="primary" onClick={() => onPrintJob?.(job)}><PrintOutlinedIcon fontSize="small" /></IconButton></Tooltip>
        </TableCell>
        <TableCell>{job.jobNo}</TableCell><TableCell>{job.branch}</TableCell><TableCell>{job.mawbNo}</TableCell><TableCell>{job.jobDate}</TableCell><TableCell>PP</TableCell><TableCell>{job.party.name || job.party.agentParty || job.party.partyCode}</TableCell><TableCell>{job.consignee.name || '—'}</TableCell><TableCell>{job.owner || '—'}</TableCell><TableCell>{ownerName || '—'}</TableCell><TableCell>{job.routing.hsCode || '—'}</TableCell><TableCell>{job.routing.airportOfDeparture || '—'}</TableCell><TableCell>{job.routing.destination || '—'}</TableCell><TableCell>{pieces}</TableCell><TableCell>{weight}</TableCell><TableCell>{job.chargeLines[0]?.rate ?? 0}</TableCell><TableCell>{job.totals.payableToAirline.toFixed(2)}</TableCell><TableCell>{job.status.void ? 'Y' : ''}</TableCell><TableCell>{job.status.final ? 'Y' : ''}</TableCell>
      </TableRow>
    );
  };

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          display: 'none',
          p: 1.5,
          mb: 0,
          borderRadius: '8px 8px 0 0',
          bgcolor: '#f5f7fa',
          border: '1px solid #d7dee8',
          borderBottom: 0,
        }}
      >
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

      <Box sx={{ display: 'none', gridTemplateColumns: { xs: '1fr', md: '0.4fr 1.2fr 1.2fr 1.4fr 1.7fr 1.4fr 1fr 1.2fr 1fr 0.7fr' }, gap: 1, p: 1.25, bgcolor: '#f5f7fa', border: '1px solid #d7dee8', borderBottom: 0, borderRadius: '8px 8px 0 0' }}>
        <Box />
        <TextField size="small" placeholder="Job No." value={startJobNo} onChange={(e) => setStartJobNo(e.target.value)} />
        <TextField size="small" type="date" value={startDate} onChange={(e) => { setCheckDate(true); setStartDate(e.target.value); }} />
        <TextField size="small" placeholder="MAWB No." value={startMawbNo} onChange={(e) => setStartMawbNo(e.target.value)} />
        <TextField select size="small" value={partyCode} onChange={(e) => setPartyCode(e.target.value)} SelectProps={{ displayEmpty: true }}>
          <MenuItem value="">All parties</MenuItem>
          {parties.map((party) => <MenuItem key={party.code} value={party.code}>{party.code} — {party.name}</MenuItem>)}
        </TextField>
        <TextField select size="small" value={owner} onChange={(e) => setOwner(e.target.value)} SelectProps={{ displayEmpty: true }}>
          <MenuItem value="">All owners</MenuItem>
          {owners.map((item) => <MenuItem key={item.code} value={item.code}>{item.code} — {item.name}</MenuItem>)}
        </TextField>
        <TextField select size="small" value={origin} onChange={(e) => setOrigin(e.target.value)} SelectProps={{ displayEmpty: true }}>
          <MenuItem value="">All origins</MenuItem>
          {airports.map((airport) => <MenuItem key={airport.code} value={airport.code}>{airport.code}</MenuItem>)}
        </TextField>
        <TextField size="small" placeholder="Destination" value={destination} onChange={(e) => setDestination(e.target.value)} />
        <TextField select size="small" value={status} onChange={(e) => setStatus(e.target.value as JobFilter['status'])}>
          <MenuItem value="ALL">All statuses</MenuItem><MenuItem value="FINAL">Final</MenuItem><MenuItem value="UN_FINAL">Un-final</MenuItem><MenuItem value="VOID">Void</MenuItem><MenuItem value="UN_VOID">Un-void</MenuItem>
        </TextField>
        <Box />
      </Box>

      <Box sx={{ display: 'none', gridTemplateColumns: '70px 120px 90px 130px 120px 80px 210px 180px 120px 150px 110px 90px 90px 70px 80px 80px 120px 70px 70px', gap: 0.5, p: 1, overflowX: 'auto', bgcolor: '#f5f7fa', border: '1px solid #d7dee8', borderBottom: 0 }}>
        <Box /><TextField size="small" placeholder="Job No." value={startJobNo} onChange={(e) => setStartJobNo(e.target.value)} /><TextField size="small" placeholder="Branch" /><TextField size="small" placeholder="MAWB No." value={startMawbNo} onChange={(e) => setStartMawbNo(e.target.value)} /><TextField size="small" type="date" value={startDate} onChange={(e) => { setCheckDate(true); setStartDate(e.target.value); }} /><TextField size="small" placeholder="PP/CC" />
        <TextField select size="small" value={partyCode} onChange={(e) => setPartyCode(e.target.value)}><MenuItem value="">All parties</MenuItem>{parties.map((party) => <MenuItem key={party.code} value={party.code}>{party.name}</MenuItem>)}</TextField><TextField size="small" placeholder="Consignee" /><TextField select size="small" value={owner} onChange={(e) => setOwner(e.target.value)}><MenuItem value="">All owners</MenuItem>{owners.map((item) => <MenuItem key={item.code} value={item.code}>{item.code}</MenuItem>)}</TextField><TextField size="small" placeholder="Owner name" /><TextField size="small" placeholder="HS Code" /><TextField select size="small" value={origin} onChange={(e) => setOrigin(e.target.value)}><MenuItem value="">Origin</MenuItem>{airports.map((airport) => <MenuItem key={airport.code} value={airport.code}>{airport.code}</MenuItem>)}</TextField><TextField size="small" placeholder="Dest." value={destination} onChange={(e) => setDestination(e.target.value)} /><TextField size="small" placeholder="Pcs" /><TextField size="small" placeholder="Weight" /><TextField size="small" placeholder="Rate" /><TextField size="small" placeholder="Net" /><TextField size="small" placeholder="Void" /><TextField select size="small" value={status} onChange={(e) => setStatus(e.target.value as JobFilter['status'])}><MenuItem value="ALL">Final</MenuItem><MenuItem value="FINAL">Y</MenuItem><MenuItem value="UN_FINAL">N</MenuItem></TextField>
      </Box>

      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '0 0 8px 8px' }}>
        <Table
          size="small"
          sx={{
            minWidth: 1850,
            '& .MuiTableCell-root': { borderRight: '1px solid #d7dee8' },
            '& .MuiTableCell-root:last-child': { borderRight: 0 },
            '& .MuiTableHead-root .MuiTableCell-root': { borderBottom: '1px solid #9aaeca' },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell rowSpan={2}>Action</TableCell>
              <TableCell colSpan={2} align="center">JOB</TableCell>
              <TableCell rowSpan={2}>MAWB No.</TableCell><TableCell rowSpan={2}>Date</TableCell><TableCell rowSpan={2}>PP/CC</TableCell><TableCell rowSpan={2}>Party/Agent Party Name/SPO Name</TableCell><TableCell rowSpan={2}>Consignee Name</TableCell>
              <TableCell colSpan={2} align="center">OWNER</TableCell>
              <TableCell rowSpan={2}>HS Code</TableCell><TableCell rowSpan={2}>Origin</TableCell><TableCell rowSpan={2}>Dest.</TableCell><TableCell rowSpan={2}>Pcs</TableCell><TableCell rowSpan={2}>Weight</TableCell><TableCell rowSpan={2}>Rate</TableCell><TableCell rowSpan={2}>Net Payable</TableCell><TableCell rowSpan={2}>Void</TableCell><TableCell rowSpan={2}>Final</TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="center" sx={{ width: 95 }}>No.</TableCell><TableCell align="center" sx={{ width: 95 }}>Branch</TableCell><TableCell align="center" sx={{ width: 135 }}>Code</TableCell><TableCell align="center" sx={{ width: 135 }}>Name</TableCell>
            </TableRow>
            <TableRow>
              <TableCell /><TableCell><TextField size="small" placeholder="Job No." value={startJobNo} onChange={(e) => setStartJobNo(e.target.value)} /></TableCell><TableCell><TextField size="small" placeholder="Branch" /></TableCell><TableCell><TextField size="small" placeholder="MAWB" value={startMawbNo} onChange={(e) => setStartMawbNo(e.target.value)} /></TableCell><TableCell><TextField size="small" type="date" value={startDate} onChange={(e) => { setCheckDate(true); setStartDate(e.target.value); }} /></TableCell><TableCell><TextField size="small" placeholder="PP/CC" /></TableCell><TableCell><TextField select size="small" value={partyCode} onChange={(e) => setPartyCode(e.target.value)}><MenuItem value="">Party</MenuItem>{parties.map((party) => <MenuItem key={party.code} value={party.code}>{party.name}</MenuItem>)}</TextField></TableCell><TableCell><TextField size="small" placeholder="Consignee" /></TableCell><TableCell><TextField select size="small" value={owner} onChange={(e) => setOwner(e.target.value)}><MenuItem value="">Owner</MenuItem>{owners.map((item) => <MenuItem key={item.code} value={item.code}>{item.code}</MenuItem>)}</TextField></TableCell><TableCell><TextField size="small" placeholder="Owner name" /></TableCell><TableCell><TextField size="small" placeholder="HS" /></TableCell><TableCell><TextField select size="small" value={origin} onChange={(e) => setOrigin(e.target.value)}><MenuItem value="">Origin</MenuItem>{airports.map((airport) => <MenuItem key={airport.code} value={airport.code}>{airport.code}</MenuItem>)}</TextField></TableCell><TableCell><TextField size="small" placeholder="Dest." value={destination} onChange={(e) => setDestination(e.target.value)} /></TableCell><TableCell><TextField size="small" placeholder="Pcs" /></TableCell><TableCell><TextField size="small" placeholder="Weight" /></TableCell><TableCell><TextField size="small" placeholder="Rate" /></TableCell><TableCell><TextField size="small" placeholder="Net" /></TableCell><TableCell><TextField size="small" placeholder="Void" /></TableCell><TableCell><TextField select size="small" value={status} onChange={(e) => setStatus(e.target.value as JobFilter['status'])}><MenuItem value="ALL">Final</MenuItem><MenuItem value="FINAL">Y</MenuItem><MenuItem value="UN_FINAL">N</MenuItem></TextField></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {results.length === 0 ? (
              <TableRow>
                <TableCell colSpan={19} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    No records — adjust filters and click SELECT / Show Detail.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedResults.map((job) => (
                <Fragment key={job.id}>
                  {operationalRow(job)}
                  <TableRow key={job.id} sx={{ display: 'none' }}>
                  <TableCell padding="checkbox">
                    <Checkbox size="small" checked={selected.has(job.id)} onChange={() => toggleSelect(job.id)} />
                  </TableCell>
                  <TableCell>{job.jobNo}</TableCell>
                  <TableCell>{job.jobDate}</TableCell>
                  <TableCell>{kind === 'MAWB' ? job.mawbNo : `${job.hawbNo || '—'} / ${job.parentJobNo || '—'}`}</TableCell>
                  <TableCell>{job.party.name || job.party.partyCode}</TableCell>
                  <TableCell>{job.owner || '—'}</TableCell>
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
                    <Tooltip title="Open">
                      <IconButton size="small" color="primary" onClick={() => onOpenJob(job)}><VisibilityOutlinedIcon fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton size="small" color="primary" onClick={() => onEditJob?.(job)}><EditOutlinedIcon fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => { onDeleteJob?.(job); runSearch(); }}><DeleteOutlineIcon fontSize="small" /></IconButton>
                    </Tooltip>
                  </TableCell>
                  </TableRow>
                </Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={results.length}
        page={page}
        onPageChange={(_, nextPage) => setPage(nextPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(event) => { setRowsPerPage(Number(event.target.value)); setPage(0); }}
        rowsPerPageOptions={[5, 10, 25, 50]}
        labelRowsPerPage="Rows per page"
      />
    </Box>
  );
}
