import { useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';
import { FormRow, FormField, SectionHeader } from '../../../components/FormGrid';
import { SeaExportJob } from '../../../domain/seaExportJob';
import { SeaContainerRef } from '../../../domain/seaExportJob';
import { createEmptyContainer } from '../../../domain/seaExportJobFactory';

interface ContainerTabProps {
  job: SeaExportJob;
  editable: boolean;
  onChange: (job: SeaExportJob) => void;
}

export function ContainerTab({ job, editable, onChange }: ContainerTabProps) {
  const [draft, setDraft] = useState<SeaContainerRef | null>(null);

  const startNew = () => setDraft({ ...createEmptyContainer(), serialNo: job.containers.length + 1 });

  const saveDraft = () => {
    if (!draft) return;
    onChange({ ...job, containers: [...job.containers, draft] });
    setDraft(null);
  };

  const removeContainer = (id: string) => onChange({ ...job, containers: job.containers.filter((c) => c.id !== id) });

  const setDraftField = <K extends keyof SeaContainerRef>(key: K, value: SeaContainerRef[K]) => {
    if (!draft) return;
    setDraft({ ...draft, [key]: value });
  };

  return (
    <Box>
      <SectionHeader>New Container Entry</SectionHeader>
      {!draft ? (
        <Button variant="outlined" disabled={!editable} onClick={startNew} sx={{ mb: 2 }}>
          NEW
        </Button>
      ) : (
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormRow>
                <FormField md={4}>
                  <TextField label="Serial No." type="number" fullWidth value={draft.serialNo} disabled />
                </FormField>
                <FormField md={8}>
                  <TextField label="Container No." fullWidth value={draft.containerNo} onChange={(e) => setDraftField('containerNo', e.target.value)} />
                </FormField>
              </FormRow>
              <FormRow>
                <FormField md={4}>
                  <TextField label="Size" fullWidth value={draft.sizeType} onChange={(e) => setDraftField('sizeType', e.target.value)} />
                </FormField>
                <FormField md={4}>
                  <TextField label="ISO Code" fullWidth value={draft.isoCode} onChange={(e) => setDraftField('isoCode', e.target.value)} />
                </FormField>
                <FormField md={4}>
                  <TextField label="Container Types" fullWidth value={draft.containerTypes} onChange={(e) => setDraftField('containerTypes', e.target.value)} />
                </FormField>
              </FormRow>
              <FormRow>
                <FormField md={12}>
                  <TextField label="Seal No." fullWidth value={draft.sealNo} onChange={(e) => setDraftField('sealNo', e.target.value)} />
                </FormField>
              </FormRow>
              <FormRow>
                <FormField md={4}>
                  <TextField label="Vehicle Type" fullWidth value={draft.vehicleType} onChange={(e) => setDraftField('vehicleType', e.target.value)} />
                </FormField>
                <FormField md={4}>
                  <TextField label="Vehicle No." fullWidth value={draft.vehicleNo} onChange={(e) => setDraftField('vehicleNo', e.target.value)} />
                </FormField>
                <FormField md={4}>
                  <TextField
                    label="Vehicle Date"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={draft.vehicleDate}
                    onChange={(e) => setDraftField('vehicleDate', e.target.value)}
                  />
                </FormField>
              </FormRow>
              <FormRow>
                <FormField md={4}>
                  <TextField label="POL ETA" type="date" fullWidth InputLabelProps={{ shrink: true }} value={draft.polEta} onChange={(e) => setDraftField('polEta', e.target.value)} />
                </FormField>
                <FormField md={4}>
                  <TextField label="POL ATA" type="date" fullWidth InputLabelProps={{ shrink: true }} value={draft.polAta} onChange={(e) => setDraftField('polAta', e.target.value)} />
                </FormField>
                <FormField md={4}>
                  <TextField label="PCD" type="date" fullWidth InputLabelProps={{ shrink: true }} value={draft.pcd} onChange={(e) => setDraftField('pcd', e.target.value)} helperText="Confirm exact meaning" />
                </FormField>
              </FormRow>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormRow>
                <FormField md={6}>
                  <TextField label="Transporter Name" fullWidth value={draft.transporterName} onChange={(e) => setDraftField('transporterName', e.target.value)} />
                </FormField>
                <FormField md={6}>
                  <TextField label="Driver Name" fullWidth value={draft.driverName} onChange={(e) => setDraftField('driverName', e.target.value)} />
                </FormField>
              </FormRow>
              <FormRow>
                <FormField md={6}>
                  <TextField label="Mobile No." fullWidth value={draft.mobileNo} onChange={(e) => setDraftField('mobileNo', e.target.value)} />
                </FormField>
                <FormField md={6}>
                  <TextField label="Charges" type="number" fullWidth value={draft.charges} onChange={(e) => setDraftField('charges', Number(e.target.value))} />
                </FormField>
              </FormRow>
              <FormRow>
                <FormField md={6}>
                  <TextField label="From (POL)" fullWidth value={draft.fromPol} onChange={(e) => setDraftField('fromPol', e.target.value)} />
                </FormField>
                <FormField md={6}>
                  <TextField label="To (POD)" fullWidth value={draft.toPod} onChange={(e) => setDraftField('toPod', e.target.value)} />
                </FormField>
              </FormRow>
              <FormRow>
                <FormField md={3}>
                  <TextField label="No. of Pkgs" type="number" fullWidth value={draft.noOfPkgs} onChange={(e) => setDraftField('noOfPkgs', Number(e.target.value))} />
                </FormField>
                <FormField md={3}>
                  <TextField label="Unit" fullWidth value={draft.unit} onChange={(e) => setDraftField('unit', e.target.value)} />
                </FormField>
                <FormField md={3}>
                  <TextField label="CBM" type="number" fullWidth value={draft.cbm} onChange={(e) => setDraftField('cbm', Number(e.target.value))} />
                </FormField>
                <FormField md={3}>
                  <TextField label="Gross Weight" type="number" fullWidth value={draft.grossWeight} onChange={(e) => setDraftField('grossWeight', Number(e.target.value))} />
                </FormField>
              </FormRow>
              <FormRow>
                <FormField md={6}>
                  <TextField label="Net Weight" type="number" fullWidth value={draft.netWeight} onChange={(e) => setDraftField('netWeight', Number(e.target.value))} />
                </FormField>
              </FormRow>
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Button variant="contained" onClick={saveDraft}>
              Save Container
            </Button>
            <Button variant="text" onClick={() => setDraft(null)}>
              Cancel
            </Button>
          </Box>
        </Paper>
      )}

      <SectionHeader>Container Grid</SectionHeader>
      <Paper variant="outlined" sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Action</TableCell>
              <TableCell>Serial No.</TableCell>
              <TableCell>Container No.</TableCell>
              <TableCell>Size</TableCell>
              <TableCell>Container Types</TableCell>
              <TableCell>Seal No.</TableCell>
              <TableCell>PCD</TableCell>
              <TableCell>Vehicle No.</TableCell>
              <TableCell>Vehicle Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {job.containers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    No containers registered.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              job.containers.map((c) => (
                <TableRow key={c.id} hover>
                  <TableCell>
                    <IconButton size="small" disabled={!editable} onClick={() => removeContainer(c.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                  <TableCell>{c.serialNo}</TableCell>
                  <TableCell>{c.containerNo}</TableCell>
                  <TableCell>{c.sizeType}</TableCell>
                  <TableCell>{c.containerTypes}</TableCell>
                  <TableCell>{c.sealNo}</TableCell>
                  <TableCell>{c.pcd}</TableCell>
                  <TableCell>{c.vehicleNo}</TableCell>
                  <TableCell>{c.vehicleDate}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
