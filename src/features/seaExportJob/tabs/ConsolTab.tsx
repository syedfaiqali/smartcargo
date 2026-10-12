import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { FormField, FormRow } from '../../../components/FormGrid';
import { WorkflowSection } from '../../../components/WorkflowSection';
import { findConsolCandidateJobs, seaExportJobRepo } from '../../../data/seaExportJobService';
import { agentRepo, containerTypeRepo, foreignAgentRepo, partyRepo, seaPortRepo, shippingLineRepo } from '../../../data/masterDataService';
import { SeaExportJob } from '../../../domain/seaExportJob';

interface ConsolTabProps {
  job: SeaExportJob;
  editable: boolean;
  onChange: (job: SeaExportJob) => void;
}

export function ConsolTab({ job, editable, onChange }: ConsolTabProps) {
  const foreignAgents = foreignAgentRepo.list();
  const shippingLines = shippingLineRepo.list();
  const seaPorts = seaPortRepo.list();
  const parties = partyRepo.list();
  const agents = agentRepo.list();
  const sizes = [...new Set(containerTypeRepo.list().map((item) => item.size).filter(Boolean))];
  const consol = job.consol;
  const [openSections, setOpenSections] = useState({ filters: true, details: true, voyage: true, grid: true });
  const [branch, setBranch] = useState(job.branch);
  const [checkDate, setCheckDate] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [marked, setMarked] = useState<'Y' | 'N' | 'BOTH'>('Y');
  const [consolFilter, setConsolFilter] = useState('');
  const [candidates, setCandidates] = useState<SeaExportJob[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [gridFilter, setGridFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const setConsol = (patch: Partial<SeaExportJob['consol']>) =>
    onChange({ ...job, consol: { ...consol, ...patch } });
  const toggleSection = (key: keyof typeof openSections) =>
    setOpenSections((current) => ({ ...current, [key]: !current[key] }));
  const branches = [...new Set([job.branch, ...seaExportJobRepo.list().map((item) => item.branch)].filter(Boolean))];
  const lastConsolNo = seaExportJobRepo.find((item) => item.branch === branch && !!item.consol.consolNo).slice(-1)[0]?.consol.consolNo ?? '';
  const filteredCandidates = useMemo(() => candidates.filter((candidate) => {
    const searchable = [candidate.consolNo, candidate.jobNo, candidate.date, candidate.branch, candidate.jobType,
      candidate.mblNo, candidate.hblNo, candidate.lclFcl, candidate.vessel, candidate.voyage,
      candidate.partyName, candidate.partyCode, candidate.foreignAgent, candidate.spoCode,
      candidate.shippingLine, candidate.portOfLoad, candidate.destination,
      ...candidate.containers.map((container) => container.containerNo),
    ].join(' ').toLowerCase();
    return searchable.includes(gridFilter.trim().toLowerCase()) &&
      (!consolFilter || candidate.consolNo.toLowerCase().includes(consolFilter.trim().toLowerCase()));
  }), [candidates, gridFilter, consolFilter]);
  const currentPage = Math.min(page, Math.max(0, Math.ceil(filteredCandidates.length / rowsPerPage) - 1));
  const paginatedCandidates = filteredCandidates.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);

  const showDetail = () => {
    setCandidates(findConsolCandidateJobs({
      branch,
      startDate: checkDate ? startDate || undefined : undefined,
      endDate: checkDate ? endDate || undefined : undefined,
      marked,
    }));
    setSelected(new Set());
    setPage(0);
  };
  const toggleSelect = (id: string) => setSelected((current) => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const updateSelected = () => {
    if (!editable || !consol.consolNo || selected.size === 0) return;
    selected.forEach((id) => {
      const candidate = candidates.find((item) => item.id === id);
      if (candidate) seaExportJobRepo.save({ ...candidate, consolNo: consol.consolNo, consolYN: 'Y' });
    });
    showDetail();
  };
  const select = (label: string, value: string, options: Array<{ value: string; label: string }>, onSelect: (value: string) => void, disabled = !editable) => (
    <TextField select label={label} fullWidth value={value} disabled={disabled} onChange={(event) => onSelect(event.target.value)}>
      <MenuItem value="">Select {label}</MenuItem>
      {value && !options.some((option) => option.value === value) && <MenuItem value={value}>{value}</MenuItem>}
      {options.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
    </TextField>
  );
  const portOptions = seaPorts.map((port) => ({ value: port.code, label: `${port.code} — ${port.name}` }));
  const containerNumbers = (candidate: SeaExportJob) => candidate.containers.map((container) => container.containerNo).filter(Boolean).join(', ');
  const partySummary = (candidate: SeaExportJob) => [candidate.partyName || candidate.partyCode, candidate.foreignAgent, candidate.spoCode].filter(Boolean).join(' / ');

  return (
    <Box>
      <Typography component="div" sx={{ display: 'inline-block', px: 1.5, py: 0.65, mb: 1.25, borderRadius: 1, bgcolor: 'primary.main', color: 'primary.contrastText', fontSize: 16, fontWeight: 700 }}>
        JOBS (SEA-EXPORT)
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <WorkflowSection title="Job Filters" subtitle="Choose the branch, dates and consol status for job search" open={openSections.filters} onToggle={() => toggleSection('filters')}>
            <FormRow>
              <FormField><TextField select label="Branch" fullWidth value={branch} onChange={(event) => setBranch(event.target.value)}>
                {branches.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField></FormField>
              <FormField><TextField label="Last Consol No." fullWidth value={lastConsolNo} disabled /></FormField>
              <FormField><TextField select label="LCL/FCL" fullWidth value={consol.lclFcl} disabled={!editable} onChange={(event) => setConsol({ lclFcl: event.target.value as 'LCL' | 'FCL' })}>
                <MenuItem value="LCL">LCL</MenuItem><MenuItem value="FCL">FCL</MenuItem>
              </TextField></FormField>
            </FormRow>
            <FormRow>
              <FormField><FormControl component="fieldset">
                <FormLabel>Check Date</FormLabel>
                <RadioGroup row value={checkDate ? 'Y' : 'N'} onChange={(event) => setCheckDate(event.target.value === 'Y')}>
                  <FormControlLabel value="Y" control={<Radio size="small" />} label="Yes" />
                  <FormControlLabel value="N" control={<Radio size="small" />} label="No" />
                </RadioGroup>
              </FormControl></FormField>
              <FormField><TextField label="Give Starting Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={startDate} disabled={!checkDate} onChange={(event) => setStartDate(event.target.value)} /></FormField>
              <FormField><TextField label="Give Ending Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={endDate} disabled={!checkDate} onChange={(event) => setEndDate(event.target.value)} /></FormField>
            </FormRow>
            <FormRow>
              <FormField><TextField label="Consol No. Filter" fullWidth value={consolFilter} onChange={(event) => setConsolFilter(event.target.value)} /></FormField>
              <FormField><FormControl component="fieldset">
                <FormLabel>Show Jobs Consol</FormLabel>
                <RadioGroup row value={marked} onChange={(event) => setMarked(event.target.value as 'Y' | 'N' | 'BOTH')}>
                  <FormControlLabel value="Y" control={<Radio size="small" />} label="Marked Yes" />
                  <FormControlLabel value="N" control={<Radio size="small" />} label="Marked No" />
                  <FormControlLabel value="BOTH" control={<Radio size="small" />} label="Both" />
                </RadioGroup>
              </FormControl></FormField>
            </FormRow>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={showDetail}>Show Detail</Button>
              <Button variant="outlined" disabled={!editable || !consol.consolNo || selected.size === 0} onClick={updateSelected}>Update ({selected.size})</Button>
            </Stack>
          </WorkflowSection>
        </Grid>

        <Grid item xs={12} md={5}>
          <WorkflowSection title="Consol Details" subtitle="Set consolidation number, agents, ports and master B/L" open={openSections.details} onToggle={() => toggleSection('details')}>
            <FormRow>
              <FormField><TextField label="Consol No." fullWidth value={consol.consolNo} disabled={!editable} onChange={(event) => setConsol({ consolNo: event.target.value })} /></FormField>
              <FormField>{select('Foreign Agent', consol.foreignAgent, foreignAgents.map((item) => ({ value: item.code, label: `${item.code} — ${item.name}` })), (value) => setConsol({ foreignAgent: value }))}</FormField>
              <FormField>{select('Shipping Line', consol.shippingLine, shippingLines.map((item) => ({ value: item.code, label: `${item.code} — ${item.name}` })), (value) => setConsol({ shippingLine: value }))}</FormField>
            </FormRow>
            <FormRow>
              <FormField>{select('S/Line Agent', consol.sLineAgent, parties.map((item) => ({ value: item.code, label: `${item.code} — ${item.name}` })), (value) => setConsol({ sLineAgent: value }))}</FormField>
              <FormField>{select('Port of Load', consol.portOfLoad, portOptions, (value) => setConsol({ portOfLoad: value }))}</FormField>
              <FormField>{select('Port of Discharge', consol.portOfDischarge, portOptions, (value) => setConsol({ portOfDischarge: value }))}</FormField>
            </FormRow>
            <FormRow>
              <FormField><TextField label="Wharf" fullWidth value={consol.wharf} disabled={!editable} onChange={(event) => setConsol({ wharf: event.target.value })} /></FormField>
              <FormField><TextField label="Terminal" fullWidth value={consol.terminal} disabled={!editable} onChange={(event) => setConsol({ terminal: event.target.value })} /></FormField>
              <FormField><TextField label="MBL No." fullWidth value={consol.mblNo} disabled={!editable} onChange={(event) => setConsol({ mblNo: event.target.value })} /></FormField>
            </FormRow>
            <FormRow><FormField><TextField label="MBL Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={consol.mblDate} disabled={!editable} onChange={(event) => setConsol({ mblDate: event.target.value })} /></FormField></FormRow>
          </WorkflowSection>
        </Grid>

        <Grid item xs={12} md={3}>
          <WorkflowSection title="Vessel & Container" subtitle="Enter vessel schedule and container details" open={openSections.voyage} onToggle={() => toggleSection('voyage')}>
            <FormRow>
              <FormField><TextField label="Vessel" fullWidth value={consol.vessel} disabled={!editable} onChange={(event) => setConsol({ vessel: event.target.value })} /></FormField>
              <FormField><TextField label="Voyage" fullWidth value={consol.voyage} disabled={!editable} onChange={(event) => setConsol({ voyage: event.target.value })} /></FormField>
            </FormRow>
            <FormRow>
              <FormField><TextField label="Rotation No." fullWidth value={consol.rotationNo} disabled={!editable} onChange={(event) => setConsol({ rotationNo: event.target.value })} /></FormField>
              <FormField><TextField label="Container No." fullWidth value={consol.containerNo} disabled={!editable} onChange={(event) => setConsol({ containerNo: event.target.value })} /></FormField>
            </FormRow>
            <FormRow>
              <FormField>{select('Size', consol.size, sizes.map((size) => ({ value: size, label: size })), (value) => setConsol({ size: value }))}</FormField>
              <FormField><TextField label="Seal No." fullWidth value={consol.sealNo} disabled={!editable} onChange={(event) => setConsol({ sealNo: event.target.value })} /></FormField>
            </FormRow>
            <FormRow><FormField md={12}><TextField label="Container Types" fullWidth value={consol.containerTypes} disabled={!editable} onChange={(event) => setConsol({ containerTypes: event.target.value })} /></FormField></FormRow>
            <FormRow>
              <FormField><TextField label="PickUp/Stuffing" type="date" fullWidth InputLabelProps={{ shrink: true }} value={consol.pickupStuffing} disabled={!editable} onChange={(event) => setConsol({ pickupStuffing: event.target.value })} /></FormField>
              <FormField><TextField label="Cut Off Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={consol.cutOffDate} disabled={!editable} onChange={(event) => setConsol({ cutOffDate: event.target.value })} /></FormField>
            </FormRow>
            <FormRow>
              <FormField><TextField label="Sailing Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={consol.sailingDate} disabled={!editable} onChange={(event) => setConsol({ sailingDate: event.target.value })} /></FormField>
              <FormField><TextField label="POL ETA" type="date" fullWidth InputLabelProps={{ shrink: true }} value={consol.polEta} disabled={!editable} onChange={(event) => setConsol({ polEta: event.target.value })} /></FormField>
              <FormField><TextField label="ETA Time" type="time" fullWidth value={consol.polEtaTime ?? ''} disabled={!editable} onChange={(event) => setConsol({ polEtaTime: event.target.value })} /></FormField>
            </FormRow>
            <FormRow>
              <FormField><TextField label="POL ETD" type="date" fullWidth InputLabelProps={{ shrink: true }} value={consol.polEtd} disabled={!editable} onChange={(event) => setConsol({ polEtd: event.target.value })} /></FormField>
              <FormField><TextField label="ETD Time" type="time" fullWidth value={consol.polEtdTime ?? ''} disabled={!editable} onChange={(event) => setConsol({ polEtdTime: event.target.value })} /></FormField>
              <FormField><TextField label="ETA At Dest" type="date" fullWidth InputLabelProps={{ shrink: true }} value={consol.etaAtDest} disabled={!editable} onChange={(event) => setConsol({ etaAtDest: event.target.value })} /></FormField>
            </FormRow>
            <FormRow><FormField><TextField label="Destination ETA Time" type="time" fullWidth value={consol.etaAtDestTime ?? ''} disabled={!editable} onChange={(event) => setConsol({ etaAtDestTime: event.target.value })} /></FormField></FormRow>
          </WorkflowSection>
        </Grid>
      </Grid>

      <WorkflowSection title="Job Selection Grid" subtitle="Select eligible export jobs to attach to this consolidation" open={openSections.grid} onToggle={() => toggleSection('grid')}>
        <Stack direction="row" justifyContent="flex-end" sx={{ mb: 1.5 }}>
          <TextField label="Search jobs" value={gridFilter} onChange={(event) => { setGridFilter(event.target.value); setPage(0); }} />
        </Stack>
        <Paper variant="outlined" sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 1850, '& .MuiTableCell-root': { whiteSpace: 'nowrap' } }}>
            <TableHead>
              <TableRow>
                <TableCell rowSpan={2} padding="checkbox"><Checkbox size="small" checked={paginatedCandidates.length > 0 && paginatedCandidates.every((item) => selected.has(item.id))} indeterminate={paginatedCandidates.some((item) => selected.has(item.id)) && !paginatedCandidates.every((item) => selected.has(item.id))} onChange={(event) => setSelected((current) => {
                  const next = new Set(current);
                  paginatedCandidates.forEach((item) => event.target.checked ? next.add(item.id) : next.delete(item.id));
                  return next;
                })} /></TableCell>
                <TableCell rowSpan={2}>Sr.No.</TableCell>
                <TableCell rowSpan={2}>Consol No.</TableCell>
                <TableCell colSpan={4} align="center">Job</TableCell>
                <TableCell rowSpan={2}>MBL/HBL No.</TableCell>
                <TableCell rowSpan={2}>LCL/FCL</TableCell>
                <TableCell rowSpan={2}>Container Nos.</TableCell>
                <TableCell rowSpan={2}>Vessel</TableCell>
                <TableCell rowSpan={2}>Voyage</TableCell>
                <TableCell rowSpan={2}>ETD</TableCell>
                <TableCell rowSpan={2}>PCS</TableCell>
                <TableCell rowSpan={2}>Grs. Weight</TableCell>
                <TableCell rowSpan={2}>Party / Agent / SPO</TableCell>
                <TableCell rowSpan={2}>Shipping Line</TableCell>
                <TableCell rowSpan={2}>Loading Place</TableCell>
                <TableCell rowSpan={2}>Discharge Place</TableCell>
              </TableRow>
              <TableRow><TableCell>No.</TableCell><TableCell>Date</TableCell><TableCell>Branch</TableCell><TableCell>Type</TableCell></TableRow>
            </TableHead>
            <TableBody>
              {paginatedCandidates.length === 0 ? <TableRow><TableCell colSpan={20} align="center" sx={{ py: 3 }}>No jobs found. Set filters and select Show Detail.</TableCell></TableRow> : paginatedCandidates.map((candidate, index) => (
                <TableRow key={candidate.id} hover selected={selected.has(candidate.id)}>
                  <TableCell padding="checkbox"><Checkbox size="small" checked={selected.has(candidate.id)} onChange={() => toggleSelect(candidate.id)} /></TableCell>
                  <TableCell>{currentPage * rowsPerPage + index + 1}</TableCell>
                  <TableCell>{candidate.consolNo}</TableCell>
                  <TableCell>{candidate.jobNo}</TableCell>
                  <TableCell>{candidate.date}</TableCell>
                  <TableCell>{candidate.branch}</TableCell>
                  <TableCell>{candidate.jobType}</TableCell>
                  <TableCell>{[candidate.mblNo, candidate.hblNo].filter(Boolean).join(' / ')}</TableCell>
                  <TableCell>{candidate.lclFcl}</TableCell>
                  <TableCell>{containerNumbers(candidate)}</TableCell>
                  <TableCell>{candidate.vessel}</TableCell>
                  <TableCell>{candidate.voyage}</TableCell>
                  <TableCell>{candidate.polEtd}</TableCell>
                  <TableCell>{candidate.noOfPackages}</TableCell>
                  <TableCell>{candidate.grossWeight}</TableCell>
                  <TableCell>{partySummary(candidate)}</TableCell>
                  <TableCell>{candidate.shippingLine}</TableCell>
                  <TableCell>{candidate.portOfLoad}</TableCell>
                  <TableCell>{candidate.destination}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
        <TablePagination component="div" count={filteredCandidates.length} page={currentPage} rowsPerPage={rowsPerPage} onPageChange={(_, nextPage) => setPage(nextPage)} onRowsPerPageChange={(event) => { setRowsPerPage(Number(event.target.value)); setPage(0); }} rowsPerPageOptions={[5, 10, 25, 50]} labelRowsPerPage="Rows per page" />
        <Button variant="contained" disabled={!editable || !consol.consolNo || selected.size === 0} onClick={updateSelected}>Update Selected Jobs ({selected.size})</Button>
      </WorkflowSection>
    </Box>
  );
}
