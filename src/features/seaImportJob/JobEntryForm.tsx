import { confirmDelete } from '../../components/deleteConfirmation';
import { v4 as uuid } from 'uuid';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import { FormField, SectionHeader } from '../../components/FormGrid';
import { SeaImportJob } from '../../domain/seaImportJob';
import {
  agentRepo,
  currencyRepo,
  foreignAgentRepo,
  jobStatusRepo,
  jobTypeRepo,
  partyRepo,
  seaPortRepo,
  shippingLineRepo,
  spoRepo,
  subAgentPartyRepo,
} from '../../data/masterDataService';

interface JobEntryFormProps {
  job: SeaImportJob;
  editable: boolean;
  onChange: (job: SeaImportJob) => void;
}

export function JobEntryForm({ job, editable, onChange }: JobEntryFormProps) {
  const jobTypes = jobTypeRepo.list();
  const parties = partyRepo.list();
  const subAgentParties = subAgentPartyRepo.list();
  const foreignAgents = foreignAgentRepo.list();
  const shippingLines = shippingLineRepo.list();
  const spoCodes = spoRepo.list();
  const seaPorts = seaPortRepo.list();
  const currencies = currencyRepo.list();
  const clearingAgents = agentRepo.find((a) => a.kind === 'CLEARING');
  const jobStatuses = jobStatusRepo.list();

  const apply = (patch: Partial<SeaImportJob>) => onChange({ ...job, ...patch });

  const setPartyCode = (partyCode: string) => {
    const p = parties.find((x) => x.code === partyCode);
    apply({ partyCode, partyName: p?.name ?? '' });
  };

  const addHblLine = () => {
    apply({ hblLines: [...job.hblLines, { id: uuid(), no: '', jobNo: '', containers: '' }] });
  };
  const updateHblLine = (id: string, patch: Partial<SeaImportJob['hblLines'][number]>) => {
    apply({ hblLines: job.hblLines.map((l) => (l.id === id ? { ...l, ...patch } : l)) });
  };
  const removeHblLine = (id: string) => apply({ hblLines: job.hblLines.filter((l) => l.id !== id) });

  const addSecurityLine = () => {
    apply({ containerSecurityLines: [...job.containerSecurityLines, { id: uuid(), instrument: '', no: '', date: '', amount: 0 }] });
  };
  const updateSecurityLine = (id: string, patch: Partial<SeaImportJob['containerSecurityLines'][number]>) => {
    apply({ containerSecurityLines: job.containerSecurityLines.map((l) => (l.id === id ? { ...l, ...patch } : l)) });
  };
  const removeSecurityLine = (id: string) => apply({ containerSecurityLines: job.containerSecurityLines.filter((l) => l.id !== id) });
  const securityTotal = job.containerSecurityLines.reduce((sum, l) => sum + l.amount, 0);

  const addConsoleContainerLine = () => {
    apply({ consoleJobContainers: [...job.consoleJobContainers, { id: uuid(), branch: job.branch, jobNo: '', containers: '' }] });
  };
  const updateConsoleContainerLine = (id: string, patch: Partial<SeaImportJob['consoleJobContainers'][number]>) => {
    apply({ consoleJobContainers: job.consoleJobContainers.map((l) => (l.id === id ? { ...l, ...patch } : l)) });
  };
  const removeConsoleContainerLine = (id: string) => apply({ consoleJobContainers: job.consoleJobContainers.filter((l) => l.id !== id) });

  return (
    <Box
      sx={{
        '& .MuiInputBase-input, & .MuiSelect-select': { color: '#172554', fontWeight: 700 },
        '& .MuiInputLabel-root': { color: '#475569', fontWeight: 700 },
        '& .MuiInputBase-input.Mui-disabled, & .MuiSelect-select.Mui-disabled': {
          WebkitTextFillColor: '#172554',
          color: '#172554',
          opacity: 1,
          fontWeight: 700,
        },
        '& .MuiInputLabel-root.Mui-disabled': { color: '#475569', opacity: 1, fontWeight: 700 },
        '& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline': { borderColor: '#cbd5e1' },
      }}
    >
      <Grid container spacing={1.5} sx={{ mb: 1.5 }} alignItems="flex-start">
        <FormField md={2}>
          <TextField label="Branch" fullWidth value={job.branch} disabled={!editable} onChange={(e) => apply({ branch: e.target.value })} />
        </FormField>
        <FormField md={2}>
          <TextField label="Job No." fullWidth value={job.jobNo} disabled />
        </FormField>
        <FormField md={2}>
          <TextField
            label="Job Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={job.jobDate}
            disabled={!editable}
            onChange={(e) => apply({ jobDate: e.target.value })}
          />
        </FormField>
        <FormField md={2}>
          <TextField label="Console Job" fullWidth value={job.consoleJob} disabled={!editable} onChange={(e) => apply({ consoleJob: e.target.value })} />
        </FormField>
        <FormField md={2}>
          <TextField
            label="Final Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={job.finalDate}
            disabled={!editable}
            onChange={(e) => apply({ finalDate: e.target.value })}
          />
        </FormField>
        <FormField md={2}>
          <TextField select label="Job Type" fullWidth value={job.jobType} disabled={!editable} onChange={(e) => apply({ jobType: e.target.value })}>
            <MenuItem value="">Select Job Type</MenuItem>
            {jobTypes.map((t) => (
              <MenuItem key={t.code} value={t.code}>
                {t.code} — {t.description}
              </MenuItem>
            ))}
          </TextField>
        </FormField>
      </Grid>
      <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
        <FormField md={2}>
          <TextField select label="Nomination" fullWidth value={job.nomination} disabled={!editable} onChange={(e) => apply({ nomination: e.target.value as 'Y' | 'N' })}>
            <MenuItem value="N">N</MenuItem>
            <MenuItem value="Y">Y</MenuItem>
          </TextField>
        </FormField>
        <FormField md={5}>
          <TextField label="Commodity" fullWidth value={job.commodity} disabled={!editable} onChange={(e) => apply({ commodity: e.target.value })} />
        </FormField>
        <FormField md={5}>
          <TextField label="Quot. Ref No." fullWidth value={job.quotRefNo} disabled={!editable} onChange={(e) => apply({ quotRefNo: e.target.value })} />
        </FormField>
      </Grid>
      <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
        <FormField md={6}>
          <TextField
            label="D/O Issue Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={job.doIssueDate}
            disabled={!editable}
            onChange={(e) => apply({ doIssueDate: e.target.value })}
          />
        </FormField>
      </Grid>

      {/* MBL / HBL grid */}
      <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>B/L No.</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>PP/CC</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Pcs</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>UOM</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>CBM</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Grs. Weight</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Net. Weight</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell sx={{ minWidth: 130 }}>
                <TextField label="MBL No" variant="standard" fullWidth value={job.mblNo} disabled={!editable} onChange={(e) => apply({ mblNo: e.target.value })} />
              </TableCell>
              <TableCell sx={{ minWidth: 130 }}>
                <TextField type="date" variant="standard" fullWidth InputLabelProps={{ shrink: true }} value={job.mblDate} disabled={!editable} onChange={(e) => apply({ mblDate: e.target.value })} />
              </TableCell>
              <TableCell sx={{ minWidth: 70 }}>
                <TextField select variant="standard" value={job.mblPpCc} disabled={!editable} onChange={(e) => apply({ mblPpCc: e.target.value as 'PP' | 'CC' })}>
                  <MenuItem value="PP">PP</MenuItem>
                  <MenuItem value="CC">CC</MenuItem>
                </TextField>
              </TableCell>
              <TableCell sx={{ minWidth: 60 }}>
                <TextField variant="standard" type="number" value={job.mblPcs} disabled={!editable} onChange={(e) => apply({ mblPcs: Number(e.target.value) })} />
              </TableCell>
              <TableCell sx={{ minWidth: 80 }}>
                <TextField variant="standard" value={job.mblUom} disabled={!editable} onChange={(e) => apply({ mblUom: e.target.value })} />
              </TableCell>
              <TableCell sx={{ minWidth: 80 }}>
                <TextField variant="standard" type="number" value={job.mblCbm} disabled={!editable} onChange={(e) => apply({ mblCbm: Number(e.target.value) })} />
              </TableCell>
              <TableCell sx={{ minWidth: 90 }}>
                <TextField variant="standard" type="number" value={job.mblGrossWeight} disabled={!editable} onChange={(e) => apply({ mblGrossWeight: Number(e.target.value) })} />
              </TableCell>
              <TableCell sx={{ minWidth: 90 }}>
                <TextField variant="standard" type="number" value={job.mblNetWeight} disabled={!editable} onChange={(e) => apply({ mblNetWeight: Number(e.target.value) })} />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ minWidth: 130 }}>
                <TextField label="HBL No" variant="standard" fullWidth value={job.hblNo} disabled={!editable} onChange={(e) => apply({ hblNo: e.target.value })} />
              </TableCell>
              <TableCell sx={{ minWidth: 130 }}>
                <TextField type="date" variant="standard" fullWidth InputLabelProps={{ shrink: true }} value={job.hblDate} disabled={!editable} onChange={(e) => apply({ hblDate: e.target.value })} />
              </TableCell>
              <TableCell sx={{ minWidth: 70 }}>
                <TextField select variant="standard" value={job.hblPpCc} disabled={!editable} onChange={(e) => apply({ hblPpCc: e.target.value as 'PP' | 'CC' })}>
                  <MenuItem value="PP">PP</MenuItem>
                  <MenuItem value="CC">CC</MenuItem>
                </TextField>
              </TableCell>
              <TableCell sx={{ minWidth: 60 }}>
                <TextField variant="standard" type="number" value={job.hblPcs} disabled={!editable} onChange={(e) => apply({ hblPcs: Number(e.target.value) })} />
              </TableCell>
              <TableCell sx={{ minWidth: 80 }}>
                <TextField variant="standard" value={job.hblUom} disabled={!editable} onChange={(e) => apply({ hblUom: e.target.value })} />
              </TableCell>
              <TableCell sx={{ minWidth: 80 }}>
                <TextField variant="standard" type="number" value={job.hblCbm} disabled={!editable} onChange={(e) => apply({ hblCbm: Number(e.target.value) })} />
              </TableCell>
              <TableCell sx={{ minWidth: 90 }}>
                <TextField variant="standard" type="number" value={job.hblGrossWeight} disabled={!editable} onChange={(e) => apply({ hblGrossWeight: Number(e.target.value) })} />
              </TableCell>
              <TableCell sx={{ minWidth: 90 }}>
                <TextField variant="standard" type="number" value={job.hblNetWeight} disabled={!editable} onChange={(e) => apply({ hblNetWeight: Number(e.target.value) })} />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={3} align="right" sx={{ fontWeight: 700 }}>
                Total of HBL:
              </TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: '#1e3a5f', color: 'white' }}>{job.hblPcs}</TableCell>
              <TableCell />
              <TableCell sx={{ fontWeight: 700, bgcolor: '#1e3a5f', color: 'white' }}>{job.hblCbm.toFixed(2)}</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: '#1e3a5f', color: 'white' }}>{job.hblGrossWeight.toFixed(2)}</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: '#1e3a5f', color: 'white' }}>{job.hblNetWeight.toFixed(2)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Grid container spacing={2}>
        {/* LEFT COLUMN */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={1.5}>
            <FormField md={12}>
              <TextField label="Credit Limit" type="number" fullWidth value={job.creditLimit} disabled={!editable} onChange={(e) => apply({ creditLimit: Number(e.target.value) })} />
            </FormField>
            <FormField md={12}>
              <TextField select label="Party Code" fullWidth value={job.partyCode} disabled={!editable} onChange={(e) => setPartyCode(e.target.value)}>
                <MenuItem value="">(none)</MenuItem>
                {parties.map((p) => (
                  <MenuItem key={p.code} value={p.code}>
                    {p.code} — {p.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={12}>
              <TextField select label="Sub Agent Party" fullWidth value={job.subAgentParty} disabled={!editable} onChange={(e) => apply({ subAgentParty: e.target.value })}>
                <MenuItem value="">(none)</MenuItem>
                {subAgentParties.map((s) => (
                  <MenuItem key={s.code} value={s.code}>
                    {s.code} — {s.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={12}>
              <TextField select label="Foreign Agent" fullWidth value={job.foreignAgent} disabled={!editable} onChange={(e) => apply({ foreignAgent: e.target.value })}>
                <MenuItem value="">(none)</MenuItem>
                {foreignAgents.map((a) => (
                  <MenuItem key={a.code} value={a.code}>
                    {a.code} — {a.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={12}>
              <TextField select label="Shipping Line" fullWidth value={job.shippingLine} disabled={!editable} onChange={(e) => apply({ shippingLine: e.target.value })}>
                <MenuItem value="">(none)</MenuItem>
                {shippingLines.map((s) => (
                  <MenuItem key={s.code} value={s.code}>
                    {s.code} — {s.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={12}>
              <TextField label="S/Line Agent" fullWidth value={job.sLineAgent} disabled={!editable} onChange={(e) => apply({ sLineAgent: e.target.value })} />
            </FormField>
            <FormField md={12}>
              <TextField select label="SPO Code" fullWidth value={job.spoCode} disabled={!editable} onChange={(e) => apply({ spoCode: e.target.value })}>
                <MenuItem value="">(none)</MenuItem>
                {spoCodes.map((s) => (
                  <MenuItem key={s.code} value={s.code}>
                    {s.code} — {s.description}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={12}>
              <TextField select label="Origin" fullWidth value={job.origin} disabled={!editable} onChange={(e) => apply({ origin: e.target.value })}>
                <MenuItem value="">(none)</MenuItem>
                {seaPorts.map((p) => (
                  <MenuItem key={p.code} value={p.code}>
                    {p.code} — {p.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={12}>
              <TextField select label="Destination" fullWidth value={job.destination} disabled={!editable} onChange={(e) => apply({ destination: e.target.value })}>
                <MenuItem value="">(none)</MenuItem>
                {seaPorts.map((p) => (
                  <MenuItem key={p.code} value={p.code}>
                    {p.code} — {p.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={12}>
              <TextField select label="Port of Loading" fullWidth value={job.portOfLoading} disabled={!editable} onChange={(e) => apply({ portOfLoading: e.target.value })}>
                <MenuItem value="">(none)</MenuItem>
                {seaPorts.map((p) => (
                  <MenuItem key={p.code} value={p.code}>
                    {p.code} — {p.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={12}>
              <TextField select label="Port of Discharge" fullWidth value={job.portOfDischarge} disabled={!editable} onChange={(e) => apply({ portOfDischarge: e.target.value })}>
                <MenuItem value="">(none)</MenuItem>
                {seaPorts.map((p) => (
                  <MenuItem key={p.code} value={p.code}>
                    {p.code} — {p.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={12}>
              <TextField select label="Port of Shipment" fullWidth value={job.portOfShipment} disabled={!editable} onChange={(e) => apply({ portOfShipment: e.target.value })}>
                <MenuItem value="">(none)</MenuItem>
                {seaPorts.map((p) => (
                  <MenuItem key={p.code} value={p.code}>
                    {p.code} — {p.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={12}>
              <TextField select label="Via Port" fullWidth value={job.viaPort} disabled={!editable} onChange={(e) => apply({ viaPort: e.target.value })}>
                <MenuItem value="">(none)</MenuItem>
                {seaPorts.map((p) => (
                  <MenuItem key={p.code} value={p.code}>
                    {p.code} — {p.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={12}>
              <TextField label="Shed" fullWidth value={job.shed} disabled={!editable} onChange={(e) => apply({ shed: e.target.value })} />
            </FormField>
            <FormField md={12}>
              <TextField label="Terminal" fullWidth value={job.terminal} disabled={!editable} onChange={(e) => apply({ terminal: e.target.value })} />
            </FormField>
            <FormField md={12}>
              <TextField select label="Clearing Agent" fullWidth value={job.clearingAgent} disabled={!editable} onChange={(e) => apply({ clearingAgent: e.target.value })}>
                <MenuItem value="">(none)</MenuItem>
                {clearingAgents.map((a) => (
                  <MenuItem key={a.code} value={a.code}>
                    {a.code} — {a.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={12}>
              <TextField label="Operation Officer" fullWidth value={job.operationOfficer} disabled={!editable} onChange={(e) => apply({ operationOfficer: e.target.value })} />
            </FormField>
            <FormField md={12}>
              <TextField label="Stevedoring" fullWidth value={job.stevedoring} disabled={!editable} onChange={(e) => apply({ stevedoring: e.target.value })} />
            </FormField>
            <FormField md={12}>
              <TextField label="Marks &amp; No." fullWidth multiline minRows={2} value={job.marksAndNos} disabled={!editable} onChange={(e) => apply({ marksAndNos: e.target.value })} />
            </FormField>
          </Grid>
        </Grid>

        {/* MIDDLE COLUMN */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={1.5}>
            <FormField md={6}>
              <TextField label="Vessel" fullWidth value={job.vessel} disabled={!editable} onChange={(e) => apply({ vessel: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField label="Voyage" fullWidth value={job.voyage} disabled={!editable} onChange={(e) => apply({ voyage: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField label="Rotation No." fullWidth value={job.rotationNo} disabled={!editable} onChange={(e) => apply({ rotationNo: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField label="Stack Code" fullWidth value={job.stackCode} disabled={!editable} onChange={(e) => apply({ stackCode: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField
                label="E.T.A"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={job.eta}
                disabled={!editable}
                onChange={(e) => apply({ eta: e.target.value })}
              />
            </FormField>
            <FormField md={6}>
              <TextField
                label="E.T.D"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={job.etd}
                disabled={!editable}
                onChange={(e) => apply({ etd: e.target.value })}
              />
            </FormField>
            <FormField md={6}>
              <TextField label="B/E No." fullWidth value={job.beNo} disabled={!editable} onChange={(e) => apply({ beNo: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField
                label="B/E Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={job.beDate}
                disabled={!editable}
                onChange={(e) => apply({ beDate: e.target.value })}
              />
            </FormField>
            <FormField md={6}>
              <TextField label="Index No." fullWidth value={job.indexNo} disabled={!editable} onChange={(e) => apply({ indexNo: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField label="Sub Index No" fullWidth value={job.subIndexNo} disabled={!editable} onChange={(e) => apply({ subIndexNo: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField label="IGM No." fullWidth value={job.igmNo} disabled={!editable} onChange={(e) => apply({ igmNo: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField
                label="IGM Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={job.igmDate}
                disabled={!editable}
                onChange={(e) => apply({ igmDate: e.target.value })}
              />
            </FormField>
            <FormField md={6}>
              <TextField select label="LCL/FCL" fullWidth value={job.lclFcl} disabled={!editable} onChange={(e) => apply({ lclFcl: e.target.value as 'LCL' | 'FCL' })}>
                <MenuItem value="LCL">LCL</MenuItem>
                <MenuItem value="FCL">FCL</MenuItem>
              </TextField>
            </FormField>
            <FormField md={6}>
              <TextField
                label="Arrived Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={job.arrivedDate}
                disabled={!editable}
                onChange={(e) => apply({ arrivedDate: e.target.value })}
              />
            </FormField>
            <FormField md={6}>
              <TextField
                label="Doc. Rcv. Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={job.docRcvDate}
                disabled={!editable}
                onChange={(e) => apply({ docRcvDate: e.target.value })}
              />
            </FormField>
            <FormField md={6}>
              <TextField
                label="NOC Valid Date:"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={job.nocValidDate}
                disabled={!editable}
                onChange={(e) => apply({ nocValidDate: e.target.value })}
              />
            </FormField>
            <FormField md={12}>
              <TextField label="Transporter" fullWidth value={job.transporter} disabled={!editable} onChange={(e) => apply({ transporter: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField label="Guarantee" fullWidth value={job.guarantee} disabled={!editable} onChange={(e) => apply({ guarantee: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField label="Vehicle No." fullWidth value={job.vehicleNo} disabled={!editable} onChange={(e) => apply({ vehicleNo: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField label="Driver" fullWidth value={job.driver} disabled={!editable} onChange={(e) => apply({ driver: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField label="Driver Cell#" fullWidth value={job.driverCell} disabled={!editable} onChange={(e) => apply({ driverCell: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField select label="CY/CFS" fullWidth value={job.cyCfs} disabled={!editable} onChange={(e) => apply({ cyCfs: e.target.value as SeaImportJob['cyCfs'] })}>
                <MenuItem value="CY/CY">CY/CY</MenuItem>
                <MenuItem value="CY/CFS">CY/CFS</MenuItem>
                <MenuItem value="CFS/CY">CFS/CY</MenuItem>
                <MenuItem value="CFS/CFS">CFS/CFS</MenuItem>
              </TextField>
            </FormField>
            <FormField md={6}>
              <TextField label="VIR Number" fullWidth value={job.virNumber} disabled={!editable} onChange={(e) => apply({ virNumber: e.target.value })} />
            </FormField>
            <FormField md={12}>
              <TextField label="Cust. Ref No." fullWidth value={job.custRefNo} disabled={!editable} onChange={(e) => apply({ custRefNo: e.target.value })} />
            </FormField>
            <FormField md={12}>
              <TextField label="HS Code" fullWidth value={job.hsCode} disabled={!editable} onChange={(e) => apply({ hsCode: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField label="Berth No." fullWidth value={job.berthNo} disabled={!editable} onChange={(e) => apply({ berthNo: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField label="Free Days" type="number" fullWidth value={job.freeDays} disabled={!editable} onChange={(e) => apply({ freeDays: Number(e.target.value) })} />
            </FormField>
            <FormField md={6}>
              <TextField
                label="Total Detention Days"
                type="number"
                fullWidth
                value={job.totalDetentionDays}
                disabled={!editable}
                onChange={(e) => apply({ totalDetentionDays: Number(e.target.value) })}
              />
            </FormField>
            <FormField md={6}>
              <TextField select label="Currency" fullWidth value={job.currency} disabled={!editable} onChange={(e) => apply({ currency: e.target.value })}>
                <MenuItem value="">(none)</MenuItem>
                {currencies.map((c) => (
                  <MenuItem key={c.code} value={c.code}>
                    {c.code}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={6}>
              <TextField label="Ex.Rate" type="number" fullWidth value={job.exRate} disabled={!editable} onChange={(e) => apply({ exRate: Number(e.target.value) })} />
            </FormField>
            <FormField md={6}>
              <TextField
                label="Detention Rate/Day"
                type="number"
                fullWidth
                value={job.detentionRatePerDay}
                disabled={!editable}
                onChange={(e) => apply({ detentionRatePerDay: Number(e.target.value) })}
              />
            </FormField>
            <FormField md={6}>
              <TextField
                label="Total Detention Amount"
                type="number"
                fullWidth
                value={job.totalDetentionAmount}
                disabled={!editable}
                onChange={(e) => apply({ totalDetentionAmount: Number(e.target.value) })}
              />
            </FormField>
            <FormField md={12}>
              <TextField label="RO No." fullWidth value={job.roNo} disabled={!editable} onChange={(e) => apply({ roNo: e.target.value })} />
            </FormField>
          </Grid>
        </Grid>

        {/* RIGHT COLUMN — Attachment, Shipment Status, House B/L, Documents List */}
        <Grid item xs={12} md={4}>
          <Paper
            variant="outlined"
            sx={{ height: 160, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8fafc' }}
          >
            <ImageOutlinedIcon sx={{ fontSize: 56, color: '#cbd5e1' }} />
          </Paper>

          <SectionHeader>Shipment Status</SectionHeader>
          <Grid container spacing={1.5} sx={{ mb: 2 }}>
            <FormField md={12}>
              <TextField select label="Status" fullWidth value={job.jobStatus} disabled={!editable} onChange={(e) => apply({ jobStatus: e.target.value })}>
                <MenuItem value="">Select Job Status</MenuItem>
                {jobStatuses.map((s) => (
                  <MenuItem key={s.code} value={s.code}>
                    {s.code} — {s.description}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={12}>
              <TextField
                label="Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={job.jobStatusDate}
                disabled={!editable}
                onChange={(e) => apply({ jobStatusDate: e.target.value })}
              />
            </FormField>
            <FormField md={12}>
              <TextField label="Remarks" fullWidth value={job.jobStatusRemarks} disabled={!editable} onChange={(e) => apply({ jobStatusRemarks: e.target.value })} />
            </FormField>
            <FormField md={12}>
              <TextField select label="Shipping Term" fullWidth value={job.shippingTerm} disabled={!editable} onChange={(e) => apply({ shippingTerm: e.target.value as 'FOB' | 'CIF' })}>
                <MenuItem value="FOB">FOB</MenuItem>
                <MenuItem value="CIF">CIF</MenuItem>
              </TextField>
            </FormField>
            <FormField md={6}>
              <TextField select label="Int'l Invoice" fullWidth value={job.intlInvoice} disabled={!editable} onChange={(e) => apply({ intlInvoice: e.target.value as 'Y' | 'N' })}>
                <MenuItem value="N">N</MenuItem>
                <MenuItem value="Y">Y</MenuItem>
              </TextField>
            </FormField>
            <FormField md={6}>
              <TextField select label="Local" fullWidth value={job.localInvoice} disabled={!editable} onChange={(e) => apply({ localInvoice: e.target.value as 'Y' | 'N' })}>
                <MenuItem value="N">N</MenuItem>
                <MenuItem value="Y">Y</MenuItem>
              </TextField>
            </FormField>
          </Grid>

          <SectionHeader>House B/L</SectionHeader>
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 1 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>No.</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Job No.</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Containers</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {job.hblLines.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <Typography variant="caption" color="text.secondary">
                        No HBLs attached.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  job.hblLines.map((line) => (
                    <TableRow key={line.id}>
                      <TableCell sx={{ minWidth: 70 }}>
                        <TextField variant="standard" value={line.no} disabled={!editable} onChange={(e) => updateHblLine(line.id, { no: e.target.value })} />
                      </TableCell>
                      <TableCell sx={{ minWidth: 90 }}>
                        <TextField variant="standard" value={line.jobNo} disabled={!editable} onChange={(e) => updateHblLine(line.id, { jobNo: e.target.value })} />
                      </TableCell>
                      <TableCell sx={{ minWidth: 120 }}>
                        <TextField variant="standard" value={line.containers} disabled={!editable} onChange={(e) => updateHblLine(line.id, { containers: e.target.value })} />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" disabled={!editable} onClick={() => confirmDelete(() => removeHblLine(line.id))}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Button size="small" startIcon={<AddIcon />} disabled={!editable} onClick={addHblLine} sx={{ mb: 2 }}>
            Add HBL
          </Button>

          <SectionHeader>Documents List</SectionHeader>
          <Paper variant="outlined" sx={{ p: 1.5, minHeight: 60 }}>
            {job.documentsList.length === 0 ? (
              <Typography variant="caption" color="text.secondary">
                No documents recorded.
              </Typography>
            ) : (
              job.documentsList.map((d, i) => (
                <Typography key={i} variant="body2">
                  {d}
                </Typography>
              ))
            )}
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mt: 0.5 }}>
        <Grid item xs={12} md={4}>
          <SectionHeader>Foreign Agent's Shipper Name and Address</SectionHeader>
          <TextField
            fullWidth
            multiline
            minRows={5}
            value={job.foreignAgentShipperNameAddress}
            disabled={!editable}
            onChange={(e) => apply({ foreignAgentShipperNameAddress: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <SectionHeader>Consignee Name and Address</SectionHeader>
          <TextField
            fullWidth
            multiline
            minRows={5}
            value={job.consigneeNameAddress}
            disabled={!editable}
            onChange={(e) => apply({ consigneeNameAddress: e.target.value })}
          />
          <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
            <FormField md={6}>
              <TextField label="NTN No." fullWidth value={job.ntnNo} disabled={!editable} onChange={(e) => apply({ ntnNo: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField label="Passport No." fullWidth value={job.passportNo} disabled={!editable} onChange={(e) => apply({ passportNo: e.target.value })} />
            </FormField>
            <FormField md={12}>
              <TextField label="CNIC No." fullWidth value={job.cnicNo} disabled={!editable} onChange={(e) => apply({ cnicNo: e.target.value })} />
            </FormField>
          </Grid>
        </Grid>
        <Grid item xs={12} md={4}>
          <SectionHeader>Total Security Receivable</SectionHeader>
          <TextField fullWidth value={job.totalSecurityReceivable.toFixed(2)} disabled sx={{ mb: 1.5 }} />

          <SectionHeader>Container Security</SectionHeader>
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 1 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Instrument</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>No.</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {job.containerSecurityLines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell sx={{ minWidth: 90 }}>
                      <TextField variant="standard" value={line.instrument} disabled={!editable} onChange={(e) => updateSecurityLine(line.id, { instrument: e.target.value })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 70 }}>
                      <TextField variant="standard" value={line.no} disabled={!editable} onChange={(e) => updateSecurityLine(line.id, { no: e.target.value })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 120 }}>
                      <TextField
                        type="date"
                        variant="standard"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={line.date}
                        disabled={!editable}
                        onChange={(e) => updateSecurityLine(line.id, { date: e.target.value })}
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: 80 }}>
                      <TextField variant="standard" type="number" value={line.amount} disabled={!editable} onChange={(e) => updateSecurityLine(line.id, { amount: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" disabled={!editable} onClick={() => confirmDelete(() => removeSecurityLine(line.id))}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} sx={{ fontWeight: 700 }}>
                    Total
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{securityTotal.toFixed(2)}</TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          <Button size="small" startIcon={<AddIcon />} disabled={!editable} onClick={addSecurityLine} sx={{ mb: 2 }}>
            Add Security Line
          </Button>

          <SectionHeader>Balance Security Receivable</SectionHeader>
          <TextField fullWidth value={job.balanceSecurityReceivable.toFixed(2)} disabled />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mt: 0.5 }}>
        <Grid item xs={12} md={4}>
          <SectionHeader>Notify Name Address</SectionHeader>
          <TextField fullWidth multiline minRows={5} value={job.notifyNameAddress} disabled={!editable} onChange={(e) => apply({ notifyNameAddress: e.target.value })} />
        </Grid>
        <Grid item xs={12} md={8}>
          <SectionHeader>Console Job Containers</SectionHeader>
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 1 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Br.</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Job No.</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Containers</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {job.consoleJobContainers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <Typography variant="caption" color="text.secondary">
                        No records found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  job.consoleJobContainers.map((line) => (
                    <TableRow key={line.id}>
                      <TableCell sx={{ minWidth: 60 }}>
                        <TextField variant="standard" value={line.branch} disabled={!editable} onChange={(e) => updateConsoleContainerLine(line.id, { branch: e.target.value })} />
                      </TableCell>
                      <TableCell sx={{ minWidth: 90 }}>
                        <TextField variant="standard" value={line.jobNo} disabled={!editable} onChange={(e) => updateConsoleContainerLine(line.id, { jobNo: e.target.value })} />
                      </TableCell>
                      <TableCell sx={{ minWidth: 150 }}>
                        <TextField variant="standard" value={line.containers} disabled={!editable} onChange={(e) => updateConsoleContainerLine(line.id, { containers: e.target.value })} />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" disabled={!editable} onClick={() => confirmDelete(() => removeConsoleContainerLine(line.id))}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Button size="small" startIcon={<AddIcon />} disabled={!editable} onClick={addConsoleContainerLine}>
            Add Console Container
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
