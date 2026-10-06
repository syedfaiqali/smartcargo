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
import { AirImportManifest } from '../../domain/airImportManifest';
import { airportRepo, commodityRepo, currencyRepo, foreignAgentRepo, jobTypeRepo } from '../../data/masterDataService';

interface ManifestEntryFormProps {
  manifest: AirImportManifest;
  editable: boolean;
  onChange: (manifest: AirImportManifest) => void;
  onSavedMawbEntered: (mawbNo: string) => void;
}

export function ManifestEntryForm({ manifest, editable, onChange, onSavedMawbEntered }: ManifestEntryFormProps) {
  const jobTypes = jobTypeRepo.list();
  const foreignAgents = foreignAgentRepo.list();
  const commodities = commodityRepo.list();
  const airports = airportRepo.list();
  const currencies = currencyRepo.list();

  const apply = (patch: Partial<AirImportManifest>) => onChange({ ...manifest, ...patch });

  const calculatedHawbTotals = manifest.hawbLines.reduce(
    (acc, l) => ({
      pcs: acc.pcs + l.pcs,
      cbm: acc.cbm + l.cbm,
      grossWeight: acc.grossWeight + l.grossWeight,
      chargeWeight: acc.chargeWeight + l.chargeWeight,
    }),
    { pcs: 0, cbm: 0, grossWeight: 0, chargeWeight: 0 }
  );
  // Before HAWB jobs are added, legacy behavior displays the entered MAWB totals here.
  const hawbTotals = manifest.hawbLines.length ? calculatedHawbTotals : {
    pcs: manifest.pcs,
    cbm: manifest.cbm,
    grossWeight: manifest.grossWeight,
    chargeWeight: manifest.chargeWeight,
  };

  const addHawbLine = () => {
    apply({
      hawbLines: [
        ...manifest.hawbLines,
        {
          id: uuid(),
          jobNo: '',
          partyCode: '',
          partyName: '',
          hawbNo: '',
          ppCc: 'PP',
          pcs: 0,
          uom: '',
          cbm: 0,
          grossWeight: 0,
          chargeWeight: 0,
          indexNo: '',
          subIndexNo: '',
        },
      ],
    });
  };
  const updateHawbLine = (id: string, patch: Partial<AirImportManifest['hawbLines'][number]>) => {
    apply({ hawbLines: manifest.hawbLines.map((l) => (l.id === id ? { ...l, ...patch } : l)) });
  };
  const removeHawbLine = (id: string) => apply({ hawbLines: manifest.hawbLines.filter((l) => l.id !== id) });

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
        <FormField md={3}>
          <TextField
            label="Job Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={manifest.jobDate}
            disabled={!editable}
            onChange={(e) => apply({ jobDate: e.target.value })}
          />
        </FormField>
        <FormField md={4}>
          <TextField select label="Job Type" fullWidth value={manifest.jobType} disabled={!editable} onChange={(e) => apply({ jobType: e.target.value })}>
            <MenuItem value="">Select Job Type</MenuItem>
            {jobTypes.map((t) => (
              <MenuItem key={t.code} value={t.code}>
                {t.code} — {t.description}
              </MenuItem>
            ))}
          </TextField>
        </FormField>
        <FormField md={3}>
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
                <TextField
                  label="MAWB No"
                  variant="standard"
                  fullWidth
                  value={manifest.mawbNo}
                  disabled={!editable}
                  onChange={(e) => apply({ mawbNo: e.target.value })}
                  onBlur={(e) => onSavedMawbEntered(e.target.value)}
                />
              </TableCell>
              <TableCell sx={{ minWidth: 130 }}>
                <TextField
                  type="date"
                  variant="standard"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={manifest.mawbDate}
                  disabled={!editable}
                  onChange={(e) => apply({ mawbDate: e.target.value })}
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
                <TextField variant="standard" type="number" value={manifest.chargeWeight} disabled={!editable} onChange={(e) => apply({ chargeWeight: Number(e.target.value) })} />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={3} align="right" sx={{ fontWeight: 700 }}>
                Total of HAWB:
              </TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: '#1e3a5f', color: 'white' }}>{hawbTotals.pcs}</TableCell>
              <TableCell />
              <TableCell sx={{ fontWeight: 700, bgcolor: '#1e3a5f', color: 'white' }}>{hawbTotals.cbm.toFixed(2)}</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: '#1e3a5f', color: 'white' }}>{hawbTotals.grossWeight.toFixed(2)}</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: '#1e3a5f', color: 'white' }}>{hawbTotals.chargeWeight.toFixed(2)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        <Grid item xs={12} md={4}>
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
              <TextField select label="Commodity" fullWidth value={manifest.commodity ?? ''} disabled={!editable} onChange={(e) => apply({ commodity: e.target.value })}>
                <MenuItem value="">(none)</MenuItem>
                {commodities.map((commodity) => (
                  <MenuItem key={commodity.code} value={commodity.code}>
                    {commodity.code} — {commodity.description}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={12}>
              <TextField select label="Origin" fullWidth value={manifest.origin} disabled={!editable} onChange={(e) => apply({ origin: e.target.value })}>
                <MenuItem value="">(none)</MenuItem>
                {airports.map((a) => (
                  <MenuItem key={a.code} value={a.code}>
                    {a.code} — {a.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={12}>
              <TextField select label="Destination" fullWidth value={manifest.destination} disabled={!editable} onChange={(e) => apply({ destination: e.target.value })}>
                <MenuItem value="">(none)</MenuItem>
                {airports.map((a) => (
                  <MenuItem key={a.code} value={a.code}>
                    {a.code} — {a.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
          </Grid>
        </Grid>

        <Grid item xs={12} md={8}>
          <Grid container spacing={1.5}>
            <FormField md={6}>
              <TextField label="Airline D/O No." fullWidth value={manifest.airlineDoNo} disabled={!editable} onChange={(e) => apply({ airlineDoNo: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField
                label="Airline D/O Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={manifest.airlineDoDate}
                disabled={!editable}
                onChange={(e) => apply({ airlineDoDate: e.target.value })}
              />
            </FormField>
            <FormField md={6}>
              <TextField
                label="E.T.D."
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={manifest.etd}
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
                value={manifest.eta}
                disabled={!editable}
                onChange={(e) => apply({ eta: e.target.value })}
              />
            </FormField>
            <FormField md={6}>
              <TextField label="Origin D/O No." fullWidth value={manifest.originDoNo} disabled={!editable} onChange={(e) => apply({ originDoNo: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField select label="Currency" fullWidth value={manifest.currency} disabled={!editable} onChange={(e) => apply({ currency: e.target.value })}>
                <MenuItem value="">(none)</MenuItem>
                {currencies.map((c) => (
                  <MenuItem key={c.code} value={c.code}>
                    {c.code}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={6}>
              <TextField label="Flight No." fullWidth value={manifest.flightNo} disabled={!editable} onChange={(e) => apply({ flightNo: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField
                label="Flight Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={manifest.flightDate}
                disabled={!editable}
                onChange={(e) => apply({ flightDate: e.target.value })}
              />
            </FormField>
          </Grid>
        </Grid>
      </Grid>

      <Button variant="contained" disabled={!editable} onClick={addHawbLine} sx={{ mb: 2 }}>
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
              <TableCell sx={{ fontWeight: 700 }}>HAWB No</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>PP/CC</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>PCS</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>UOM</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>CBM</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Gross Wt.</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Ch Wt.</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Index No.</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Sub Index No.</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {manifest.hawbLines.length === 0 ? (
              <TableRow>
                <TableCell colSpan={13} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    No entries — click Add Jobs to attach a HAWB shipment.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              manifest.hawbLines.map((line) => (
                <TableRow key={line.id}>
                  <TableCell>
                    <IconButton size="small" disabled={!editable} onClick={() => confirmDelete(() => removeHawbLine(line.id))}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                  <TableCell sx={{ minWidth: 100 }}>
                    <TextField variant="standard" value={line.jobNo} disabled={!editable} onChange={(e) => updateHawbLine(line.id, { jobNo: e.target.value })} />
                  </TableCell>
                  <TableCell sx={{ minWidth: 90 }}>
                    <TextField variant="standard" value={line.partyCode} disabled={!editable} onChange={(e) => updateHawbLine(line.id, { partyCode: e.target.value })} />
                  </TableCell>
                  <TableCell sx={{ minWidth: 130 }}>
                    <TextField variant="standard" value={line.partyName} disabled={!editable} onChange={(e) => updateHawbLine(line.id, { partyName: e.target.value })} />
                  </TableCell>
                  <TableCell sx={{ minWidth: 100 }}>
                    <TextField variant="standard" value={line.hawbNo} disabled={!editable} onChange={(e) => updateHawbLine(line.id, { hawbNo: e.target.value })} />
                  </TableCell>
                  <TableCell sx={{ minWidth: 70 }}>
                    <TextField select variant="standard" value={line.ppCc} disabled={!editable} onChange={(e) => updateHawbLine(line.id, { ppCc: e.target.value as 'PP' | 'CC' })}>
                      <MenuItem value="PP">PP</MenuItem>
                      <MenuItem value="CC">CC</MenuItem>
                    </TextField>
                  </TableCell>
                  <TableCell sx={{ minWidth: 55 }}>
                    <TextField variant="standard" type="number" value={line.pcs} disabled={!editable} onChange={(e) => updateHawbLine(line.id, { pcs: Number(e.target.value) })} />
                  </TableCell>
                  <TableCell sx={{ minWidth: 70 }}>
                    <TextField variant="standard" value={line.uom} disabled={!editable} onChange={(e) => updateHawbLine(line.id, { uom: e.target.value })} />
                  </TableCell>
                  <TableCell sx={{ minWidth: 70 }}>
                    <TextField variant="standard" type="number" value={line.cbm} disabled={!editable} onChange={(e) => updateHawbLine(line.id, { cbm: Number(e.target.value) })} />
                  </TableCell>
                  <TableCell sx={{ minWidth: 80 }}>
                    <TextField
                      variant="standard"
                      type="number"
                      value={line.grossWeight}
                      disabled={!editable}
                      onChange={(e) => updateHawbLine(line.id, { grossWeight: Number(e.target.value) })}
                    />
                  </TableCell>
                  <TableCell sx={{ minWidth: 80 }}>
                    <TextField
                      variant="standard"
                      type="number"
                      value={line.chargeWeight}
                      disabled={!editable}
                      onChange={(e) => updateHawbLine(line.id, { chargeWeight: Number(e.target.value) })}
                    />
                  </TableCell>
                  <TableCell sx={{ minWidth: 80 }}>
                    <TextField variant="standard" value={line.indexNo} disabled={!editable} onChange={(e) => updateHawbLine(line.id, { indexNo: e.target.value })} />
                  </TableCell>
                  <TableCell sx={{ minWidth: 90 }}>
                    <TextField variant="standard" value={line.subIndexNo} disabled={!editable} onChange={(e) => updateHawbLine(line.id, { subIndexNo: e.target.value })} />
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
