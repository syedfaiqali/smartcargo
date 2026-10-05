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
import { AirImportJob } from '../../domain/airImportJob';
import {
  agentRepo,
  airportRepo,
  commodityRepo,
  currencyRepo,
  foreignAgentRepo,
  jobStatusRepo,
  jobTypeRepo,
  partyRepo,
  spoRepo,
  subAgentPartyRepo,
} from '../../data/masterDataService';

interface JobEntryFormProps {
  job: AirImportJob;
  editable: boolean;
  onChange: (job: AirImportJob) => void;
}

export function JobEntryForm({ job, editable, onChange }: JobEntryFormProps) {
  const jobTypes = jobTypeRepo.list();
  const parties = partyRepo.list();
  const subAgentParties = subAgentPartyRepo.list();
  const foreignAgents = foreignAgentRepo.list();
  const spoCodes = spoRepo.list();
  const airports = airportRepo.list();
  const commodities = commodityRepo.list();
  const currencies = currencyRepo.list();
  const clearingAgents = agentRepo.find((a) => a.kind === 'CLEARING');
  const jobStatuses = jobStatusRepo.list();

  const apply = (patch: Partial<AirImportJob>) => onChange({ ...job, ...patch });

  const setPartyCode = (partyCode: string) => {
    const p = parties.find((x) => x.code === partyCode);
    apply({ partyCode, partyName: p?.name ?? '' });
  };

  const addHawbLine = () => {
    apply({ houseAirwayBills: [...job.houseAirwayBills, { id: uuid(), jobNo: '', hawbNo: '', pcs: 0, weight: 0 }] });
  };
  const updateHawbLine = (id: string, patch: Partial<AirImportJob['houseAirwayBills'][number]>) => {
    apply({ houseAirwayBills: job.houseAirwayBills.map((l) => (l.id === id ? { ...l, ...patch } : l)) });
  };
  const removeHawbLine = (id: string) => apply({ houseAirwayBills: job.houseAirwayBills.filter((l) => l.id !== id) });

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
        <FormField md={2}>
          <TextField select label="Nomination" fullWidth value={job.nomination} disabled={!editable} onChange={(e) => apply({ nomination: e.target.value as 'Y' | 'N' })}>
            <MenuItem value="N">N</MenuItem>
            <MenuItem value="Y">Y</MenuItem>
          </TextField>
        </FormField>
      </Grid>
      <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
        <FormField md={8}>
          <TextField select label="Commodity" fullWidth value={job.commodity} disabled={!editable} onChange={(e) => apply({ commodity: e.target.value })}>
            <MenuItem value="">(none)</MenuItem>
            {commodities.map((commodity) => (
              <MenuItem key={commodity.code} value={commodity.code}>
                {commodity.code} — {commodity.description}
              </MenuItem>
            ))}
          </TextField>
        </FormField>
        <FormField md={4}>
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

      {/* MAWB / HAWB grid */}
      <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>AWB No.</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>PP/CC</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Pcs</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>UOM</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>CBM</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Grs. Weight</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Ch. Weight</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell sx={{ minWidth: 130 }}>
                <TextField label="MAWB No" variant="standard" fullWidth value={job.mawbNo} disabled={!editable} onChange={(e) => apply({ mawbNo: e.target.value })} />
              </TableCell>
              <TableCell sx={{ minWidth: 130 }}>
                <TextField type="date" variant="standard" fullWidth InputLabelProps={{ shrink: true }} value={job.mawbDate} disabled={!editable} onChange={(e) => apply({ mawbDate: e.target.value })} />
              </TableCell>
              <TableCell sx={{ minWidth: 70 }}>
                <TextField select variant="standard" value={job.mawbPpCc} disabled={!editable} onChange={(e) => apply({ mawbPpCc: e.target.value as 'PP' | 'CC' })}>
                  <MenuItem value="PP">PP</MenuItem>
                  <MenuItem value="CC">CC</MenuItem>
                </TextField>
              </TableCell>
              <TableCell sx={{ minWidth: 60 }}>
                <TextField variant="standard" type="number" value={job.mawbPcs} disabled={!editable} onChange={(e) => apply({ mawbPcs: Number(e.target.value) })} />
              </TableCell>
              <TableCell sx={{ minWidth: 80 }}>
                <TextField variant="standard" value={job.mawbUom} disabled={!editable} onChange={(e) => apply({ mawbUom: e.target.value })} />
              </TableCell>
              <TableCell sx={{ minWidth: 80 }}>
                <TextField variant="standard" type="number" value={job.mawbCbm} disabled={!editable} onChange={(e) => apply({ mawbCbm: Number(e.target.value) })} />
              </TableCell>
              <TableCell sx={{ minWidth: 90 }}>
                <TextField variant="standard" type="number" value={job.mawbGrossWeight} disabled={!editable} onChange={(e) => apply({ mawbGrossWeight: Number(e.target.value) })} />
              </TableCell>
              <TableCell sx={{ minWidth: 90 }}>
                <TextField variant="standard" type="number" value={job.mawbChargeWeight} disabled={!editable} onChange={(e) => apply({ mawbChargeWeight: Number(e.target.value) })} />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ minWidth: 130 }}>
                <TextField label="HAWB No" variant="standard" fullWidth value={job.hawbNo} disabled={!editable} onChange={(e) => apply({ hawbNo: e.target.value })} />
              </TableCell>
              <TableCell sx={{ minWidth: 130 }}>
                <TextField type="date" variant="standard" fullWidth InputLabelProps={{ shrink: true }} value={job.hawbDate} disabled={!editable} onChange={(e) => apply({ hawbDate: e.target.value })} />
              </TableCell>
              <TableCell sx={{ minWidth: 70 }}>
                <TextField select variant="standard" value={job.hawbPpCc} disabled={!editable} onChange={(e) => apply({ hawbPpCc: e.target.value as 'PP' | 'CC' })}>
                  <MenuItem value="PP">PP</MenuItem>
                  <MenuItem value="CC">CC</MenuItem>
                </TextField>
              </TableCell>
              <TableCell sx={{ minWidth: 60 }}>
                <TextField variant="standard" type="number" value={job.hawbPcs} disabled={!editable} onChange={(e) => apply({ hawbPcs: Number(e.target.value) })} />
              </TableCell>
              <TableCell sx={{ minWidth: 80 }}>
                <TextField variant="standard" value={job.hawbUom} disabled={!editable} onChange={(e) => apply({ hawbUom: e.target.value })} />
              </TableCell>
              <TableCell sx={{ minWidth: 80 }}>
                <TextField variant="standard" type="number" value={job.hawbCbm} disabled={!editable} onChange={(e) => apply({ hawbCbm: Number(e.target.value) })} />
              </TableCell>
              <TableCell sx={{ minWidth: 90 }}>
                <TextField variant="standard" type="number" value={job.hawbGrossWeight} disabled={!editable} onChange={(e) => apply({ hawbGrossWeight: Number(e.target.value) })} />
              </TableCell>
              <TableCell sx={{ minWidth: 90 }}>
                <TextField variant="standard" type="number" value={job.hawbChargeWeight} disabled={!editable} onChange={(e) => apply({ hawbChargeWeight: Number(e.target.value) })} />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={3} align="right" sx={{ fontWeight: 700 }}>
                Total of HAWB:
              </TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: '#1e3a5f', color: 'white' }}>{job.hawbPcs}</TableCell>
              <TableCell />
              <TableCell sx={{ fontWeight: 700, bgcolor: '#1e3a5f', color: 'white' }}>{job.hawbCbm.toFixed(2)}</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: '#1e3a5f', color: 'white' }}>{job.hawbGrossWeight.toFixed(2)}</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: '#1e3a5f', color: 'white' }}>{job.hawbChargeWeight.toFixed(2)}</TableCell>
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
                {airports.map((a) => (
                  <MenuItem key={a.code} value={a.code}>
                    {a.code} — {a.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={12}>
              <TextField select label="Destination" fullWidth value={job.destination} disabled={!editable} onChange={(e) => apply({ destination: e.target.value })}>
                <MenuItem value="">(none)</MenuItem>
                {airports.map((a) => (
                  <MenuItem key={a.code} value={a.code}>
                    {a.code} — {a.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={6}>
              <TextField label="Flight No." fullWidth value={job.flightNo} disabled={!editable} onChange={(e) => apply({ flightNo: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField
                label="Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={job.flightDate}
                disabled={!editable}
                onChange={(e) => apply({ flightDate: e.target.value })}
              />
            </FormField>
            <FormField md={12}>
              <TextField label="Cust. Ref No." fullWidth value={job.custRefNo} disabled={!editable} onChange={(e) => apply({ custRefNo: e.target.value })} />
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
          </Grid>
        </Grid>

        {/* MIDDLE COLUMN */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={1.5}>
            <FormField md={12}>
              <TextField label="Airline D/O No." fullWidth value={job.airlineDoNo} disabled={!editable} onChange={(e) => apply({ airlineDoNo: e.target.value })} />
            </FormField>
            <FormField md={12}>
              <TextField
                label="Airline D/O Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={job.airlineDoDate}
                disabled={!editable}
                onChange={(e) => apply({ airlineDoDate: e.target.value })}
              />
            </FormField>
            <FormField md={12}>
              <TextField label="BE No." fullWidth value={job.beNo} disabled={!editable} onChange={(e) => apply({ beNo: e.target.value })} />
            </FormField>
            <FormField md={12}>
              <TextField
                label="BE Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={job.beDate}
                disabled={!editable}
                onChange={(e) => apply({ beDate: e.target.value })}
              />
            </FormField>
            <FormField md={12}>
              <TextField label="IGM No." fullWidth value={job.igmNo} disabled={!editable} onChange={(e) => apply({ igmNo: e.target.value })} />
            </FormField>
            <FormField md={12}>
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
              <TextField label="Index No." fullWidth value={job.indexNo} disabled={!editable} onChange={(e) => apply({ indexNo: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField label="Sub Index No." fullWidth value={job.subIndexNo} disabled={!editable} onChange={(e) => apply({ subIndexNo: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField
                label="E.T.D."
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={job.etd}
                disabled={!editable}
                onChange={(e) => apply({ etd: e.target.value })}
              />
            </FormField>
            <FormField md={6}>
              <TextField
                label="E.T.A."
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={job.eta}
                disabled={!editable}
                onChange={(e) => apply({ eta: e.target.value })}
              />
            </FormField>
            <FormField md={12}>
              <TextField label="L/C No." fullWidth value={job.lcNo} disabled={!editable} onChange={(e) => apply({ lcNo: e.target.value })} />
            </FormField>
            <FormField md={12}>
              <TextField label="Passport No." fullWidth value={job.passportNo} disabled={!editable} onChange={(e) => apply({ passportNo: e.target.value })} />
            </FormField>
            <FormField md={12}>
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
            <FormField md={12}>
              <TextField label="Origin D/O No." fullWidth value={job.originDoNo} disabled={!editable} onChange={(e) => apply({ originDoNo: e.target.value })} />
            </FormField>
            <FormField md={12}>
              <TextField select label="Currency" fullWidth value={job.currency} disabled={!editable} onChange={(e) => apply({ currency: e.target.value })}>
                <MenuItem value="">(none)</MenuItem>
                {currencies.map((c) => (
                  <MenuItem key={c.code} value={c.code}>
                    {c.code}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={12}>
              <TextField label="Vehicle No." fullWidth value={job.vehicleNo} disabled={!editable} onChange={(e) => apply({ vehicleNo: e.target.value })} />
            </FormField>
            <FormField md={12}>
              <TextField label="Transporter" fullWidth value={job.transporter} disabled={!editable} onChange={(e) => apply({ transporter: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField label="Driver" fullWidth value={job.driver} disabled={!editable} onChange={(e) => apply({ driver: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField label="Driver Cell#" fullWidth value={job.driverCell} disabled={!editable} onChange={(e) => apply({ driverCell: e.target.value })} />
            </FormField>
            <FormField md={12}>
              <TextField label="HS Code" fullWidth value={job.hsCode} disabled={!editable} onChange={(e) => apply({ hsCode: e.target.value })} />
            </FormField>
            <FormField md={12}>
              <TextField label="RO No." fullWidth value={job.roNo} disabled={!editable} onChange={(e) => apply({ roNo: e.target.value })} />
            </FormField>
          </Grid>
        </Grid>

        {/* RIGHT COLUMN — Attachment, House Airway Bill grid */}
        <Grid item xs={12} md={4}>
          <Paper
            variant="outlined"
            sx={{ height: 180, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8fafc' }}
          >
            <ImageOutlinedIcon sx={{ fontSize: 56, color: '#cbd5e1' }} />
          </Paper>

          <SectionHeader>LOCAL Invoices/International (Dr/Cr)</SectionHeader>

          <SectionHeader>House Airway Bill</SectionHeader>
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 1 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Job No</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>HAWB No</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Pcs</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Weight</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {job.houseAirwayBills.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Typography variant="caption" color="text.secondary">
                        No HAWBs attached.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  job.houseAirwayBills.map((line) => (
                    <TableRow key={line.id}>
                      <TableCell sx={{ minWidth: 80 }}>
                        <TextField variant="standard" value={line.jobNo} disabled={!editable} onChange={(e) => updateHawbLine(line.id, { jobNo: e.target.value })} />
                      </TableCell>
                      <TableCell sx={{ minWidth: 90 }}>
                        <TextField variant="standard" value={line.hawbNo} disabled={!editable} onChange={(e) => updateHawbLine(line.id, { hawbNo: e.target.value })} />
                      </TableCell>
                      <TableCell sx={{ minWidth: 55 }}>
                        <TextField variant="standard" type="number" value={line.pcs} disabled={!editable} onChange={(e) => updateHawbLine(line.id, { pcs: Number(e.target.value) })} />
                      </TableCell>
                      <TableCell sx={{ minWidth: 70 }}>
                        <TextField variant="standard" type="number" value={line.weight} disabled={!editable} onChange={(e) => updateHawbLine(line.id, { weight: Number(e.target.value) })} />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" disabled={!editable} onClick={() => confirmDelete(() => removeHawbLine(line.id))}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Button size="small" startIcon={<AddIcon />} disabled={!editable} onClick={addHawbLine}>
            Add HAWB
          </Button>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mt: 0.5 }}>
        <Grid item xs={12} md={4}>
          <SectionHeader>Foreign Agent's Shipper Name and Address</SectionHeader>
          <TextField
            fullWidth
            multiline
            minRows={6}
            value={job.foreignAgentShipperNameAddress}
            disabled={!editable}
            onChange={(e) => apply({ foreignAgentShipperNameAddress: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <SectionHeader>Notify Name Address</SectionHeader>
          <TextField fullWidth multiline minRows={6} value={job.notifyNameAddress} disabled={!editable} onChange={(e) => apply({ notifyNameAddress: e.target.value })} />
        </Grid>
        <Grid item xs={12} md={4}>
          <SectionHeader>Remarks</SectionHeader>
          <TextField fullWidth multiline minRows={6} value={job.remarks} disabled={!editable} onChange={(e) => apply({ remarks: e.target.value })} />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mt: 0.5 }}>
        <Grid item xs={12} md={4}>
          <SectionHeader>Consignee Name and Address</SectionHeader>
          <TextField
            fullWidth
            multiline
            minRows={6}
            value={job.consigneeNameAddress}
            disabled={!editable}
            onChange={(e) => apply({ consigneeNameAddress: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <SectionHeader>Shipment Status</SectionHeader>
          <Grid container spacing={1.5}>
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
          </Grid>
        </Grid>
        <Grid item xs={12} md={4}>
          <SectionHeader>Invoice Required</SectionHeader>
          <Grid container spacing={1.5}>
            <FormField md={12}>
              <TextField select label="Int'l Invoice" fullWidth value={job.intlInvoice} disabled={!editable} onChange={(e) => apply({ intlInvoice: e.target.value as 'Y' | 'N' })}>
                <MenuItem value="N">N</MenuItem>
                <MenuItem value="Y">Y</MenuItem>
              </TextField>
            </FormField>
            <FormField md={12}>
              <TextField select label="Local Invoice" fullWidth value={job.localInvoice} disabled={!editable} onChange={(e) => apply({ localInvoice: e.target.value as 'Y' | 'N' })}>
                <MenuItem value="N">N</MenuItem>
                <MenuItem value="Y">Y</MenuItem>
              </TextField>
            </FormField>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
