import { useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TablePagination from '@mui/material/TablePagination';
import { FormRow, FormField, SectionHeader } from '../../../components/FormGrid';
import { SeaExportJob } from '../../../domain/seaExportJob';
import { findConsolCandidateJobs, seaExportJobRepo } from '../../../data/seaExportJobService';
import { foreignAgentRepo, seaPortRepo, shippingLineRepo } from '../../../data/masterDataService';

interface ConsolTabProps {
  job: SeaExportJob;
  editable: boolean;
  onChange: (job: SeaExportJob) => void;
}

export function ConsolTab({ job, editable, onChange }: ConsolTabProps) {
  const foreignAgents = foreignAgentRepo.list();
  const shippingLines = shippingLineRepo.list();
  const seaPorts = seaPortRepo.list();
  const consol = job.consol;
  const setConsol = (patch: Partial<SeaExportJob['consol']>) => onChange({ ...job, consol: { ...consol, ...patch } });

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [checkDate, setCheckDate] = useState(false);
  const [marked, setMarked] = useState<'Y' | 'N' | 'BOTH'>('BOTH');
  const [candidates, setCandidates] = useState<SeaExportJob[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [gridFilter, setGridFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [gridPage, setGridPage] = useState(0);
  const [gridRowsPerPage, setGridRowsPerPage] = useState(10);
  const filteredCandidates = candidates.filter((candidate) => {
    const searchable = [candidate.consolNo, candidate.jobNo, candidate.date, candidate.branch, candidate.jobType, candidate.mblNo, candidate.hblNo, candidate.lclFcl, candidate.partyName, candidate.shippingLine, candidate.portOfLoad, candidate.destination].join(' ').toLowerCase();
    return searchable.includes(gridFilter.toLowerCase()) && Object.values(columnFilters).every((value) => searchable.includes(value.toLowerCase()));
  });
  const paginatedCandidates = filteredCandidates.slice(gridPage * gridRowsPerPage, gridPage * gridRowsPerPage + gridRowsPerPage);

  const lastConsolNo = seaExportJobRepo.find((j) => j.branch === job.branch && !!j.consol.consolNo).slice(-1)[0]?.consol.consolNo ?? '';

  const handleShowDetail = () => {
    setCandidates(findConsolCandidateJobs({ branch: job.branch, startDate: checkDate ? startDate : undefined, endDate: checkDate ? endDate : undefined, marked }));
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const handleUpdate = () => {
    if (!editable || !consol.consolNo) return;
    selected.forEach((id) => {
      const candidate = candidates.find((c) => c.id === id);
      if (!candidate) return;
      seaExportJobRepo.save({ ...candidate, consolNo: consol.consolNo, consolYN: 'Y' });
    });
    setSelected(new Set());
    handleShowDetail();
  };

  return (
    <Box>
      <Typography component="div" sx={{ display: 'inline-block', px: 1.5, py: 0.65, mb: 1.25, borderRadius: 1, bgcolor: '#075a9d', color: 'white', fontSize: 19, fontWeight: 700, boxShadow: 2 }}>
        JOBS (SEA-EXPORT)
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <SectionHeader>Filter Jobs</SectionHeader>
          <FormRow>
            <FormField md={12}>
              <TextField label="Branch" fullWidth value={job.branch} disabled />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Last Consol No." fullWidth value={lastConsolNo} disabled />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField select label="LCL-FCL" fullWidth value={consol.lclFcl} disabled={!editable} onChange={(e) => setConsol({ lclFcl: e.target.value as 'LCL' | 'FCL' })}>
                <MenuItem value="LCL">LCL</MenuItem>
                <MenuItem value="FCL">FCL</MenuItem>
              </TextField>
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <FormControlLabel control={<Checkbox checked={checkDate} onChange={(e) => setCheckDate(e.target.checked)} />} label="Check Date" />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Starting Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={startDate} disabled={!checkDate} onChange={(e) => setStartDate(e.target.value)} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Ending Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={endDate} disabled={!checkDate} onChange={(e) => setEndDate(e.target.value)} />
            </FormField>
          </FormRow>
          <FormControl sx={{ mb: 1 }}>
            <FormLabel>Show Jobs Consol</FormLabel>
            <RadioGroup value={marked} onChange={(e) => setMarked(e.target.value as 'Y' | 'N' | 'BOTH')}>
              <FormControlLabel value="Y" control={<Radio size="small" />} label="Marked Yes" />
              <FormControlLabel value="N" control={<Radio size="small" />} label="Marked No" />
              <FormControlLabel value="BOTH" control={<Radio size="small" />} label="Both" />
            </RadioGroup>
          </FormControl>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="contained" onClick={handleShowDetail}>Show Detail</Button>
            <Button variant="contained" disabled={!editable || !consol.consolNo || selected.size === 0} onClick={handleUpdate}>Update</Button>
          </Box>
        </Grid>

        <Grid item xs={12} md={4.5}>
          <SectionHeader>Consol Details</SectionHeader>
          <FormRow>
            <FormField md={12}>
              <TextField label="Consol No." fullWidth value={consol.consolNo} disabled={!editable} onChange={(e) => setConsol({ consolNo: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField select label="Foreign Agent" fullWidth value={consol.foreignAgent} disabled={!editable} onChange={(e) => setConsol({ foreignAgent: e.target.value })}>
                {foreignAgents.map((a) => (
                  <MenuItem key={a.code} value={a.code}>
                    {a.code} — {a.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField select label="Shipping Line" fullWidth value={consol.shippingLine} disabled={!editable} onChange={(e) => setConsol({ shippingLine: e.target.value })}>
                {shippingLines.map((s) => (
                  <MenuItem key={s.code} value={s.code}>
                    {s.code} — {s.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={6}>
              <TextField label="S/Line Agent" fullWidth value={consol.sLineAgent} disabled={!editable} onChange={(e) => setConsol({ sLineAgent: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField select label="Port of Load" fullWidth value={consol.portOfLoad} disabled={!editable} onChange={(e) => setConsol({ portOfLoad: e.target.value })}>
                {seaPorts.map((p) => (
                  <MenuItem key={p.code} value={p.code}>
                    {p.code}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={6}>
              <TextField select label="Port of Discharge" fullWidth value={consol.portOfDischarge} disabled={!editable} onChange={(e) => setConsol({ portOfDischarge: e.target.value })}>
                {seaPorts.map((p) => (
                  <MenuItem key={p.code} value={p.code}>
                    {p.code}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField label="Wharf" fullWidth value={consol.wharf} disabled={!editable} onChange={(e) => setConsol({ wharf: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField label="Terminal" fullWidth value={consol.terminal} disabled={!editable} onChange={(e) => setConsol({ terminal: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField label="MBL No." fullWidth value={consol.mblNo} disabled={!editable} onChange={(e) => setConsol({ mblNo: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField label="Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={consol.mblDate} disabled={!editable} onChange={(e) => setConsol({ mblDate: e.target.value })} />
            </FormField>
          </FormRow>
        </Grid>

        <Grid item xs={12} md={4.5}>
          <SectionHeader>Voyage &amp; Container</SectionHeader>
          <FormRow>
            <FormField md={6}>
              <TextField label="Vessel" fullWidth value={consol.vessel} disabled={!editable} onChange={(e) => setConsol({ vessel: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField label="Voyage" fullWidth value={consol.voyage} disabled={!editable} onChange={(e) => setConsol({ voyage: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Rotation No." fullWidth value={consol.rotationNo} disabled={!editable} onChange={(e) => setConsol({ rotationNo: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={4}>
              <TextField label="Container No." fullWidth value={consol.containerNo} disabled={!editable} onChange={(e) => setConsol({ containerNo: e.target.value })} />
            </FormField>
            <FormField md={4}>
              <TextField label="Size" fullWidth value={consol.size} disabled={!editable} onChange={(e) => setConsol({ size: e.target.value })} />
            </FormField>
            <FormField md={4}>
              <TextField label="Seal No." fullWidth value={consol.sealNo} disabled={!editable} onChange={(e) => setConsol({ sealNo: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Container Types" fullWidth value={consol.containerTypes} disabled={!editable} onChange={(e) => setConsol({ containerTypes: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField
                label="PickUp/Stuffing"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={consol.pickupStuffing}
                disabled={!editable}
                onChange={(e) => setConsol({ pickupStuffing: e.target.value })}
              />
            </FormField>
            <FormField md={6}>
              <TextField
                label="Cut Off Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={consol.cutOffDate}
                disabled={!editable}
                onChange={(e) => setConsol({ cutOffDate: e.target.value })}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={4}>
              <TextField
                label="Sailing Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={consol.sailingDate}
                disabled={!editable}
                onChange={(e) => setConsol({ sailingDate: e.target.value })}
              />
            </FormField>
            <FormField md={4}>
              <TextField label="POL ETA" type="date" fullWidth InputLabelProps={{ shrink: true }} value={consol.polEta} disabled={!editable} onChange={(e) => setConsol({ polEta: e.target.value })} />
            </FormField>
            <FormField md={4}>
              <TextField label="POL ETD" type="date" fullWidth InputLabelProps={{ shrink: true }} value={consol.polEtd} disabled={!editable} onChange={(e) => setConsol({ polEtd: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField
                label="ETA At Dest"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={consol.etaAtDest}
                disabled={!editable}
                onChange={(e) => setConsol({ etaAtDest: e.target.value })}
              />
            </FormField>
          </FormRow>
          <Button variant="contained" disabled={!editable || !consol.consolNo || selected.size === 0} onClick={handleUpdate}>
            Update ({selected.size} selected)
          </Button>
        </Grid>
      </Grid>

      <SectionHeader>Job Selection Grid</SectionHeader>
      <Paper variant="outlined" sx={{ overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 1700, '& .MuiTableCell-root': { borderRight: '1px solid #d7dee8' }, '& .MuiTableHead-root .MuiTableCell-root': { fontWeight: 700, borderColor: '#315a9a', bgcolor: '#f8fafc' } }}>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" />
              <TableCell>Sr.No.</TableCell>
              <TableCell>Consol No.</TableCell>
              <TableCell>Job No.</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Branch</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>MBL/HBL No.</TableCell>
              <TableCell>LCL/FCL</TableCell>
              <TableCell>Container Nos.</TableCell><TableCell>Vessel</TableCell><TableCell>Voyage</TableCell><TableCell>ETD</TableCell><TableCell>PCS</TableCell><TableCell>Grs. Weight</TableCell><TableCell>Party/Agent Party Name/SPO Name</TableCell><TableCell>Shipping Line</TableCell><TableCell>Loading Place</TableCell><TableCell>Discharge Place</TableCell>
            </TableRow>
            <TableRow>
              <TableCell padding="checkbox" />
              {['Sr.', 'Consol', 'Job', 'Date', 'Branch', 'Type', 'MBL/HBL', 'LCL/FCL', 'Container', 'Vessel', 'Voyage', 'ETD', 'PCS', 'Weight', 'Party', 'Shipping', 'Loading', 'Discharge'].map((placeholder) => (
                <TableCell key={placeholder}>
                  <TextField size="small" select={['Branch', 'Type', 'LCL/FCL'].includes(placeholder)} placeholder={placeholder} value={columnFilters[placeholder] ?? ''} onChange={(event) => { setColumnFilters({ ...columnFilters, [placeholder]: event.target.value }); setGridPage(0); }} SelectProps={{ displayEmpty: true }} sx={{ minWidth: 75, '& .MuiInputBase-input, & .MuiSelect-select': { py: 0.55, fontSize: 12 } }}>
                    {['Branch', 'Type', 'LCL/FCL'].includes(placeholder) && <MenuItem value="">All</MenuItem>}
                    {placeholder === 'Branch' && ['KHI', 'LHE', 'ISB'].map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
                    {placeholder === 'Type' && ['EXPORT', 'IMPORT', 'Freight'].map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
                    {placeholder === 'LCL/FCL' && ['LCL', 'FCL'].map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
                  </TextField>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCandidates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={19} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    No jobs — adjust filters and click Show Detail.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedCandidates.map((c, index) => (
                <TableRow key={c.id} hover selected={selected.has(c.id)}>
                  <TableCell padding="checkbox">
                    <Checkbox size="small" checked={selected.has(c.id)} onChange={() => toggleSelect(c.id)} />
                  </TableCell>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{c.consolNo}</TableCell>
                  <TableCell>
                    {c.jobNo} / {c.date}
                  </TableCell>
                  <TableCell>
                    {c.mblNo} / {c.hblNo}
                  </TableCell>
                  <TableCell>{c.lclFcl}</TableCell>
                  <TableCell>
                    {c.vessel} / {c.voyage}
                  </TableCell>
                  <TableCell>{c.partyName || c.partyCode}</TableCell>
                  <TableCell>
                    {c.portOfLoad} → {c.destination}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination component="div" count={filteredCandidates.length} page={gridPage} rowsPerPage={gridRowsPerPage} onPageChange={(_, nextPage) => setGridPage(nextPage)} onRowsPerPageChange={(event) => { setGridRowsPerPage(Number(event.target.value)); setGridPage(0); }} rowsPerPageOptions={[5, 10, 25, 50]} labelRowsPerPage="Rows per page" />
      </Paper>
    </Box>
  );
}
