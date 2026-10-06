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
import { FormField } from '../../components/FormGrid';
import { SeaImportManifest } from '../../domain/seaImportManifest';
import { foreignAgentRepo, jobTypeRepo, seaPortRepo, shippingLineRepo } from '../../data/masterDataService';

interface ManifestEntryFormProps {
  manifest: SeaImportManifest;
  editable: boolean;
  onChange: (manifest: SeaImportManifest) => void;
}

export function ManifestEntryForm({ manifest, editable, onChange }: ManifestEntryFormProps) {
  const jobTypes = jobTypeRepo.list();
  const foreignAgents = foreignAgentRepo.list();
  const shippingLines = shippingLineRepo.list();
  const seaPorts = seaPortRepo.list();

  const apply = (patch: Partial<SeaImportManifest>) => onChange({ ...manifest, ...patch });

  const hblTotals = manifest.hblLines.reduce(
    (acc, l) => ({
      pcs: acc.pcs + l.pcs,
      cbm: acc.cbm + l.cbm,
      grossWeight: acc.grossWeight + l.grossWeight,
      netWeight: acc.netWeight + l.netWeight,
    }),
    { pcs: 0, cbm: 0, grossWeight: 0, netWeight: 0 }
  );

  const addHblLine = () => {
    apply({
      hblLines: [
        ...manifest.hblLines,
        {
          id: uuid(),
          jobNo: '',
          partyCode: '',
          partyName: '',
          hblNo: '',
          containerNos: '',
          ppCc: 'PP',
          pcs: 0,
          uom: '',
          cbm: 0,
          grossWeight: 0,
          netWeight: 0,
          indexNo: '',
          subIndexNo: '',
        },
      ],
    });
  };
  const updateHblLine = (id: string, patch: Partial<SeaImportManifest['hblLines'][number]>) => {
    apply({ hblLines: manifest.hblLines.map((l) => (l.id === id ? { ...l, ...patch } : l)) });
  };
  const removeHblLine = (id: string) => apply({ hblLines: manifest.hblLines.filter((l) => l.id !== id) });

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
          <TextField label="Branch" fullWidth value={manifest.branch} disabled={!editable} onChange={(e) => apply({ branch: e.target.value })} />
        </FormField>
        <FormField md={2}>
          <TextField label="Console Job" fullWidth value={manifest.consoleJobNo} disabled={!editable} onChange={(e) => apply({ consoleJobNo: e.target.value })} />
        </FormField>
        <FormField md={2}>
          <TextField
            label="Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={manifest.jobDate}
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
            value={manifest.finalDate}
            disabled={!editable}
            onChange={(e) => apply({ finalDate: e.target.value })}
          />
        </FormField>
        <FormField md={2}>
          <TextField select label="Job Type" fullWidth value={manifest.jobType} disabled={!editable} onChange={(e) => apply({ jobType: e.target.value })}>
            <MenuItem value="">Select Job Type</MenuItem>
            {jobTypes.map((t) => (
              <MenuItem key={t.code} value={t.code}>
                {t.code} — {t.description}
              </MenuItem>
            ))}
          </TextField>
        </FormField>
        <FormField md={2}>
          <TextField select label="Nomination" fullWidth value={manifest.nomination} disabled={!editable} onChange={(e) => apply({ nomination: e.target.value as 'Y' | 'N' })}>
            <MenuItem value="N">N</MenuItem>
            <MenuItem value="Y">Y</MenuItem>
          </TextField>
        </FormField>
      </Grid>

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
                <TextField label="MBL No" variant="standard" fullWidth value={manifest.mblNo} disabled={!editable} onChange={(e) => apply({ mblNo: e.target.value })} />
              </TableCell>
              <TableCell sx={{ minWidth: 130 }}>
                <TextField
                  type="date"
                  variant="standard"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={manifest.mblDate}
                  disabled={!editable}
                  onChange={(e) => apply({ mblDate: e.target.value })}
                />
              </TableCell>
              <TableCell sx={{ minWidth: 70 }}>
                <TextField select variant="standard" value={manifest.ppCc} disabled={!editable} onChange={(e) => apply({ ppCc: e.target.value as 'PP' | 'CC' })}>
                  <MenuItem value="PP">PP</MenuItem>
                  <MenuItem value="CC">CC</MenuItem>
                </TextField>
              </TableCell>
              <TableCell sx={{ minWidth: 60 }}>
                <TextField variant="standard" type="number" value={manifest.pcs} disabled={!editable} onChange={(e) => apply({ pcs: Number(e.target.value) })} />
              </TableCell>
              <TableCell sx={{ minWidth: 80 }}>
                <TextField variant="standard" value={manifest.uom} disabled={!editable} onChange={(e) => apply({ uom: e.target.value })} />
              </TableCell>
              <TableCell sx={{ minWidth: 80 }}>
                <TextField variant="standard" type="number" value={manifest.cbm} disabled={!editable} onChange={(e) => apply({ cbm: Number(e.target.value) })} />
              </TableCell>
              <TableCell sx={{ minWidth: 90 }}>
                <TextField variant="standard" type="number" value={manifest.grossWeight} disabled={!editable} onChange={(e) => apply({ grossWeight: Number(e.target.value) })} />
              </TableCell>
              <TableCell sx={{ minWidth: 90 }}>
                <TextField variant="standard" type="number" value={manifest.netWeight} disabled={!editable} onChange={(e) => apply({ netWeight: Number(e.target.value) })} />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={1} sx={{ fontWeight: 700 }}>
                Total of HBL:
              </TableCell>
              <TableCell />
              <TableCell />
              <TableCell sx={{ fontWeight: 700, bgcolor: '#1e3a5f', color: 'white' }}>{hblTotals.pcs}</TableCell>
              <TableCell />
              <TableCell sx={{ fontWeight: 700, bgcolor: '#1e3a5f', color: 'white' }}>{hblTotals.cbm.toFixed(2)}</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: '#1e3a5f', color: 'white' }}>{hblTotals.grossWeight.toFixed(2)}</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: '#1e3a5f', color: 'white' }}>{hblTotals.netWeight.toFixed(2)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <Grid container spacing={1.5}>
            <FormField md={12}>
              <TextField select label="Foreign Agent" fullWidth value={manifest.foreignAgent} disabled={!editable} onChange={(e) => apply({ foreignAgent: e.target.value })}>
                <MenuItem value="">(none)</MenuItem>
                {foreignAgents.map((a) => (
                  <MenuItem key={a.code} value={a.code}>
                    {a.code} — {a.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={12}>
              <TextField select label="Shipping Line" fullWidth value={manifest.shippingLine} disabled={!editable} onChange={(e) => apply({ shippingLine: e.target.value })}>
                <MenuItem value="">(none)</MenuItem>
                {shippingLines.map((s) => (
                  <MenuItem key={s.code} value={s.code}>
                    {s.code} — {s.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={12}>
              <TextField label="S/Line Agent" fullWidth value={manifest.sLineAgent} disabled={!editable} onChange={(e) => apply({ sLineAgent: e.target.value })} />
            </FormField>
            <FormField md={12}>
              <TextField select label="Destination" fullWidth value={manifest.destination} disabled={!editable} onChange={(e) => apply({ destination: e.target.value })}>
                <MenuItem value="">(none)</MenuItem>
                {seaPorts.map((p) => (
                  <MenuItem key={p.code} value={p.code}>
                    {p.code} — {p.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={12}>
              <TextField select label="Port of Loading" fullWidth value={manifest.portOfLoading} disabled={!editable} onChange={(e) => apply({ portOfLoading: e.target.value })}>
                <MenuItem value="">(none)</MenuItem>
                {seaPorts.map((p) => (
                  <MenuItem key={p.code} value={p.code}>
                    {p.code} — {p.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={12}>
              <TextField select label="Port of Discharge" fullWidth value={manifest.portOfDischarge} disabled={!editable} onChange={(e) => apply({ portOfDischarge: e.target.value })}>
                <MenuItem value="">(none)</MenuItem>
                {seaPorts.map((p) => (
                  <MenuItem key={p.code} value={p.code}>
                    {p.code} — {p.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={12}>
              <TextField select label="Port of Shipment" fullWidth value={manifest.portOfShipment} disabled={!editable} onChange={(e) => apply({ portOfShipment: e.target.value })}>
                <MenuItem value="">(none)</MenuItem>
                {seaPorts.map((p) => (
                  <MenuItem key={p.code} value={p.code}>
                    {p.code} — {p.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={12}>
              <TextField select label="Via Port" fullWidth value={manifest.viaPort} disabled={!editable} onChange={(e) => apply({ viaPort: e.target.value })}>
                <MenuItem value="">(none)</MenuItem>
                {seaPorts.map((p) => (
                  <MenuItem key={p.code} value={p.code}>
                    {p.code} — {p.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={12}>
              <TextField label="Shed" fullWidth value={manifest.shed} disabled={!editable} onChange={(e) => apply({ shed: e.target.value })} />
            </FormField>
          </Grid>
        </Grid>

        <Grid item xs={12} md={6}>
          <Grid container spacing={1.5}>
            <FormField md={6}>
              <TextField label="Vessel" fullWidth value={manifest.vessel} disabled={!editable} onChange={(e) => apply({ vessel: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField label="Voyage" fullWidth value={manifest.voyage} disabled={!editable} onChange={(e) => apply({ voyage: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField label="Rotation No." fullWidth value={manifest.rotationNo} disabled={!editable} onChange={(e) => apply({ rotationNo: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField
                label="E.T.A"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={manifest.eta}
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
                value={manifest.etd}
                disabled={!editable}
                onChange={(e) => apply({ etd: e.target.value })}
              />
            </FormField>
            <FormField md={6}>
              <TextField label="B/E No." fullWidth value={manifest.beNo} disabled={!editable} onChange={(e) => apply({ beNo: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField
                label="B/E Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={manifest.beDate}
                disabled={!editable}
                onChange={(e) => apply({ beDate: e.target.value })}
              />
            </FormField>
            <FormField md={6}>
              <TextField label="IGM No." fullWidth value={manifest.igmNo} disabled={!editable} onChange={(e) => apply({ igmNo: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField
                label="IGM Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={manifest.igmDate}
                disabled={!editable}
                onChange={(e) => apply({ igmDate: e.target.value })}
              />
            </FormField>
            <FormField md={6}>
              <TextField select label="LCL/FCL" fullWidth value={manifest.lclFcl} disabled={!editable} onChange={(e) => apply({ lclFcl: e.target.value as 'LCL' | 'FCL' })}>
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
                value={manifest.arrivedDate}
                disabled={!editable}
                onChange={(e) => apply({ arrivedDate: e.target.value })}
              />
            </FormField>
            <FormField md={6}>
              <TextField
                select
                label="CY/CFS"
                fullWidth
                value={manifest.cyCfs}
                disabled={!editable}
                onChange={(e) => apply({ cyCfs: e.target.value as SeaImportManifest['cyCfs'] })}
              >
                <MenuItem value="CY/CY">CY/CY</MenuItem>
                <MenuItem value="CY/CFS">CY/CFS</MenuItem>
                <MenuItem value="CFS/CY">CFS/CY</MenuItem>
                <MenuItem value="CFS/CFS">CFS/CFS</MenuItem>
              </TextField>
            </FormField>
            <FormField md={6}>
              <TextField label="VIR Number" fullWidth value={manifest.virNumber} disabled={!editable} onChange={(e) => apply({ virNumber: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField label="Berth No." fullWidth value={manifest.berthNo} disabled={!editable} onChange={(e) => apply({ berthNo: e.target.value })} />
            </FormField>
            <FormField md={12}>
              <TextField label="Stevedoring" fullWidth value={manifest.stevedoring} disabled={!editable} onChange={(e) => apply({ stevedoring: e.target.value })} />
            </FormField>
          </Grid>
        </Grid>
      </Grid>

      <Button variant="contained" disabled={!editable} onClick={addHblLine} sx={{ mb: 2 }}>
        Add Jobs
      </Button>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Job No.</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Party Code</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Party Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>HB/L No</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Container No.(s)</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>PP/CC</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>PCS</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>UOM</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>CBM</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Gross Wt.</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Net Wt.</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Index No.</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Sub Index No.</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {manifest.hblLines.length === 0 ? (
              <TableRow>
                <TableCell colSpan={14} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    No entries — click Add Jobs to attach an HBL shipment.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              manifest.hblLines.map((line) => (
                <TableRow key={line.id}>
                  <TableCell>
                    <IconButton size="small" disabled={!editable} onClick={() => confirmDelete(() => removeHblLine(line.id))}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                  <TableCell sx={{ minWidth: 100 }}>
                    <TextField variant="standard" value={line.jobNo} disabled={!editable} onChange={(e) => updateHblLine(line.id, { jobNo: e.target.value })} />
                  </TableCell>
                  <TableCell sx={{ minWidth: 90 }}>
                    <TextField variant="standard" value={line.partyCode} disabled={!editable} onChange={(e) => updateHblLine(line.id, { partyCode: e.target.value })} />
                  </TableCell>
                  <TableCell sx={{ minWidth: 130 }}>
                    <TextField variant="standard" value={line.partyName} disabled={!editable} onChange={(e) => updateHblLine(line.id, { partyName: e.target.value })} />
                  </TableCell>
                  <TableCell sx={{ minWidth: 100 }}>
                    <TextField variant="standard" value={line.hblNo} disabled={!editable} onChange={(e) => updateHblLine(line.id, { hblNo: e.target.value })} />
                  </TableCell>
                  <TableCell sx={{ minWidth: 130 }}>
                    <TextField variant="standard" value={line.containerNos} disabled={!editable} onChange={(e) => updateHblLine(line.id, { containerNos: e.target.value })} />
                  </TableCell>
                  <TableCell sx={{ minWidth: 70 }}>
                    <TextField select variant="standard" value={line.ppCc} disabled={!editable} onChange={(e) => updateHblLine(line.id, { ppCc: e.target.value as 'PP' | 'CC' })}>
                      <MenuItem value="PP">PP</MenuItem>
                      <MenuItem value="CC">CC</MenuItem>
                    </TextField>
                  </TableCell>
                  <TableCell sx={{ minWidth: 55 }}>
                    <TextField variant="standard" type="number" value={line.pcs} disabled={!editable} onChange={(e) => updateHblLine(line.id, { pcs: Number(e.target.value) })} />
                  </TableCell>
                  <TableCell sx={{ minWidth: 70 }}>
                    <TextField variant="standard" value={line.uom} disabled={!editable} onChange={(e) => updateHblLine(line.id, { uom: e.target.value })} />
                  </TableCell>
                  <TableCell sx={{ minWidth: 70 }}>
                    <TextField variant="standard" type="number" value={line.cbm} disabled={!editable} onChange={(e) => updateHblLine(line.id, { cbm: Number(e.target.value) })} />
                  </TableCell>
                  <TableCell sx={{ minWidth: 80 }}>
                    <TextField
                      variant="standard"
                      type="number"
                      value={line.grossWeight}
                      disabled={!editable}
                      onChange={(e) => updateHblLine(line.id, { grossWeight: Number(e.target.value) })}
                    />
                  </TableCell>
                  <TableCell sx={{ minWidth: 80 }}>
                    <TextField
                      variant="standard"
                      type="number"
                      value={line.netWeight}
                      disabled={!editable}
                      onChange={(e) => updateHblLine(line.id, { netWeight: Number(e.target.value) })}
                    />
                  </TableCell>
                  <TableCell sx={{ minWidth: 80 }}>
                    <TextField variant="standard" value={line.indexNo} disabled={!editable} onChange={(e) => updateHblLine(line.id, { indexNo: e.target.value })} />
                  </TableCell>
                  <TableCell sx={{ minWidth: 90 }}>
                    <TextField variant="standard" value={line.subIndexNo} disabled={!editable} onChange={(e) => updateHblLine(line.id, { subIndexNo: e.target.value })} />
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
