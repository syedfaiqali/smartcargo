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
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { FormRow, FormField } from '../../components/FormGrid';
import { SeaLoadingProgram } from '../../domain/seaLoadingProgram';
import { partyRepo, agentRepo, shippingLineRepo, seaPortRepo } from '../../data/masterDataService';

interface LoadingProgramEntryFormProps {
  program: SeaLoadingProgram;
  editable: boolean;
  onChange: (program: SeaLoadingProgram) => void;
}

export function LoadingProgramEntryForm({ program, editable, onChange }: LoadingProgramEntryFormProps) {
  const parties = partyRepo.list();
  const clearingAgents = agentRepo.find((a) => a.kind === 'CLEARING');
  const shippingLines = shippingLineRepo.list();
  const seaPorts = seaPortRepo.list();

  const apply = (patch: Partial<SeaLoadingProgram>) => onChange({ ...program, ...patch });

  const setPartyCode = (partyCode: string) => {
    const p = parties.find((x) => x.code === partyCode);
    apply({ partyCode, partyName: p?.name ?? '' });
  };

  // --- Container Grid ---
  const addContainerLine = () => {
    apply({ containers: [...program.containers, { id: uuid(), containerNo: '', size: '', cyCfs: 'CY', sealNo: '', vehicleNo: '' }] });
  };
  const updateContainerLine = (id: string, patch: Partial<SeaLoadingProgram['containers'][number]>) => {
    apply({ containers: program.containers.map((c) => (c.id === id ? { ...c, ...patch } : c)) });
  };
  const removeContainerLine = (id: string) => apply({ containers: program.containers.filter((c) => c.id !== id) });

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
      <Grid container spacing={2}>
        {/* LEFT COLUMN — Header Fields */}
        <Grid item xs={12} md={5}>
          <FormRow>
            <FormField md={4}>
              <TextField label="Branch" fullWidth value={program.branch} disabled={!editable} onChange={(e) => apply({ branch: e.target.value })} />
            </FormField>
            <FormField md={4}>
              <TextField label="Load Program No" fullWidth value={program.loadProgramNo} disabled />
            </FormField>
            <FormField md={4}>
              <TextField
                label="Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={program.date}
                disabled={!editable}
                onChange={(e) => apply({ date: e.target.value })}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField select label="Party Code" fullWidth value={program.partyCode} disabled={!editable} onChange={(e) => setPartyCode(e.target.value)}>
                <MenuItem value="">(none)</MenuItem>
                {parties.map((p) => (
                  <MenuItem key={p.code} value={p.code}>
                    {p.code} — {p.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Agent Party" fullWidth value={program.agentParty} disabled={!editable} onChange={(e) => apply({ agentParty: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField select label="Shipping Line" fullWidth value={program.shippingLine} disabled={!editable} onChange={(e) => apply({ shippingLine: e.target.value })}>
                <MenuItem value="">(none)</MenuItem>
                {shippingLines.map((s) => (
                  <MenuItem key={s.code} value={s.code}>
                    {s.code} — {s.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField select label="Clear Agent" fullWidth value={program.clearAgent} disabled={!editable} onChange={(e) => apply({ clearAgent: e.target.value })}>
                <MenuItem value="">(none)</MenuItem>
                {clearingAgents.map((a) => (
                  <MenuItem key={a.code} value={a.code}>
                    {a.code} — {a.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Commodity" fullWidth value={program.commodity} disabled={!editable} onChange={(e) => apply({ commodity: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Wharf" fullWidth value={program.wharf} disabled={!editable} onChange={(e) => apply({ wharf: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField select label="Port" fullWidth value={program.port} disabled={!editable} onChange={(e) => apply({ port: e.target.value })}>
                <MenuItem value="">(none)</MenuItem>
                {seaPorts.map((p) => (
                  <MenuItem key={p.code} value={p.code}>
                    {p.code} — {p.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField select label="Destination" fullWidth value={program.destination} disabled={!editable} onChange={(e) => apply({ destination: e.target.value })}>
                <MenuItem value="">(none)</MenuItem>
                {seaPorts.map((p) => (
                  <MenuItem key={p.code} value={p.code}>
                    {p.code} — {p.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField select label="T/Ship Point 1" fullWidth value={program.tShipPoint1} disabled={!editable} onChange={(e) => apply({ tShipPoint1: e.target.value })}>
                <MenuItem value="">(none)</MenuItem>
                {seaPorts.map((p) => (
                  <MenuItem key={p.code} value={p.code}>
                    {p.code} — {p.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField select label="T/Ship Point 2" fullWidth value={program.tShipPoint2} disabled={!editable} onChange={(e) => apply({ tShipPoint2: e.target.value })}>
                <MenuItem value="">(none)</MenuItem>
                {seaPorts.map((p) => (
                  <MenuItem key={p.code} value={p.code}>
                    {p.code} — {p.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Co Loader" fullWidth value={program.coLoader} disabled={!editable} onChange={(e) => apply({ coLoader: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Vessel" fullWidth value={program.vessel} disabled={!editable} onChange={(e) => apply({ vessel: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Voyage" fullWidth value={program.voyage} disabled={!editable} onChange={(e) => apply({ voyage: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Terminal" fullWidth value={program.terminal} disabled={!editable} onChange={(e) => apply({ terminal: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="CFS Yard" fullWidth value={program.cfsYard} disabled={!editable} onChange={(e) => apply({ cfsYard: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Weboc" fullWidth value={program.weboc} disabled={!editable} onChange={(e) => apply({ weboc: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField
                label="ETA"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={program.eta}
                disabled={!editable}
                onChange={(e) => apply({ eta: e.target.value })}
              />
            </FormField>
            <FormField md={6}>
              <TextField
                label="EtD"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={program.etd}
                disabled={!editable}
                onChange={(e) => apply({ etd: e.target.value })}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField label="EGM/VIR" fullWidth value={program.egmVir} disabled={!editable} onChange={(e) => apply({ egmVir: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField
                label="Date Required"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={program.dateRequired}
                disabled={!editable}
                onChange={(e) => apply({ dateRequired: e.target.value })}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField
                label="Cutt of Dt"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={program.cutOffDate}
                disabled={!editable}
                onChange={(e) => apply({ cutOffDate: e.target.value })}
              />
            </FormField>
            <FormField md={6}>
              <TextField label="No Of Pkgs" type="number" fullWidth value={program.noOfPkgs} disabled={!editable} onChange={(e) => apply({ noOfPkgs: Number(e.target.value) })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField label="Units" fullWidth value={program.units} disabled={!editable} onChange={(e) => apply({ units: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField select label="LCL/FCL" fullWidth value={program.lclFcl} disabled={!editable} onChange={(e) => apply({ lclFcl: e.target.value as 'LCL' | 'FCL' })}>
                <MenuItem value="LCL">LCL</MenuItem>
                <MenuItem value="FCL">FCL</MenuItem>
              </TextField>
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Remarks" fullWidth multiline minRows={2} value={program.remarks} disabled={!editable} onChange={(e) => apply({ remarks: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Routing" fullWidth value={program.routing} disabled={!editable} onChange={(e) => apply({ routing: e.target.value })} />
            </FormField>
          </FormRow>
        </Grid>

        {/* RIGHT COLUMN — Container Grid */}
        <Grid item xs={12} md={7}>
          <Paper variant="outlined" sx={{ overflowX: 'auto', mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: '#dcfce7', fontWeight: 700 }} colSpan={6}>
                    CONTAINER
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Container No</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell>CY/CFS</TableCell>
                  <TableCell>Seal No</TableCell>
                  <TableCell>Vehical No</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {program.containers.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell sx={{ minWidth: 110 }}>
                      <TextField variant="standard" value={c.containerNo} disabled={!editable} onChange={(e) => updateContainerLine(c.id, { containerNo: e.target.value })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 80 }}>
                      <TextField variant="standard" value={c.size} disabled={!editable} onChange={(e) => updateContainerLine(c.id, { size: e.target.value })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 80 }}>
                      <TextField
                        select
                        variant="standard"
                        value={c.cyCfs}
                        disabled={!editable}
                        onChange={(e) => updateContainerLine(c.id, { cyCfs: e.target.value as 'CY' | 'CFS' })}
                      >
                        <MenuItem value="CY">CY</MenuItem>
                        <MenuItem value="CFS">CFS</MenuItem>
                      </TextField>
                    </TableCell>
                    <TableCell sx={{ minWidth: 90 }}>
                      <TextField variant="standard" value={c.sealNo} disabled={!editable} onChange={(e) => updateContainerLine(c.id, { sealNo: e.target.value })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 100 }}>
                      <TextField variant="standard" value={c.vehicleNo} disabled={!editable} onChange={(e) => updateContainerLine(c.id, { vehicleNo: e.target.value })} />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" disabled={!editable} onClick={() => confirmDelete(() => removeContainerLine(c.id))}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={4} sx={{ fontWeight: 700 }}>
                    Vehicle Date
                  </TableCell>
                  <TableCell colSpan={2}>
                    <TextField
                      type="date"
                      variant="standard"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      value={program.vehicleDate}
                      disabled={!editable}
                      onChange={(e) => apply({ vehicleDate: e.target.value })}
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <Button size="small" startIcon={<AddIcon />} disabled={!editable} onClick={addContainerLine} sx={{ m: 1 }}>
              Add Container
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
