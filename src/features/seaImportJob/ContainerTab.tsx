import { v4 as uuid } from 'uuid';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { SeaImportJob } from '../../domain/seaImportJob';

interface ContainerTabProps {
  job: SeaImportJob;
  editable: boolean;
  onChange: (job: SeaImportJob) => void;
}

export function ContainerTab({ job, editable, onChange }: ContainerTabProps) {
  const apply = (patch: Partial<SeaImportJob>) => onChange({ ...job, ...patch });

  const addContainerLine = () => {
    apply({
      containers: [
        ...job.containers,
        {
          id: uuid(),
          containerNo: '',
          size: '',
          sealNo: '',
          isoCode: '',
          pkgs: 0,
          weight: 0,
          netWeight: 0,
          croFreeDate: '',
          detentionDays: 0,
          detentionAmount: 0,
          emptyLocation: '',
        },
      ],
    });
  };
  const updateContainerLine = (id: string, patch: Partial<SeaImportJob['containers'][number]>) => {
    apply({ containers: job.containers.map((c) => (c.id === id ? { ...c, ...patch } : c)) });
  };
  const removeContainerLine = (id: string) => apply({ containers: job.containers.filter((c) => c.id !== id) });

  return (
    <Box>
      <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Container No.</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Size</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Seal No.</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>ISO Code</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Pkgs</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Weight</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Net Wt.</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>CRO (Free) Date</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Detention Days</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Detention Amount</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Empty Location</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {job.containers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    No containers registered.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              job.containers.map((c) => (
                <TableRow key={c.id}>
                  <TableCell sx={{ minWidth: 110 }}>
                    <TextField variant="standard" value={c.containerNo} disabled={!editable} onChange={(e) => updateContainerLine(c.id, { containerNo: e.target.value })} />
                  </TableCell>
                  <TableCell sx={{ minWidth: 70 }}>
                    <TextField variant="standard" value={c.size} disabled={!editable} onChange={(e) => updateContainerLine(c.id, { size: e.target.value })} />
                  </TableCell>
                  <TableCell sx={{ minWidth: 90 }}>
                    <TextField variant="standard" value={c.sealNo} disabled={!editable} onChange={(e) => updateContainerLine(c.id, { sealNo: e.target.value })} />
                  </TableCell>
                  <TableCell sx={{ minWidth: 80 }}>
                    <TextField variant="standard" value={c.isoCode} disabled={!editable} onChange={(e) => updateContainerLine(c.id, { isoCode: e.target.value })} />
                  </TableCell>
                  <TableCell sx={{ minWidth: 60 }}>
                    <TextField variant="standard" type="number" value={c.pkgs} disabled={!editable} onChange={(e) => updateContainerLine(c.id, { pkgs: Number(e.target.value) })} />
                  </TableCell>
                  <TableCell sx={{ minWidth: 80 }}>
                    <TextField variant="standard" type="number" value={c.weight} disabled={!editable} onChange={(e) => updateContainerLine(c.id, { weight: Number(e.target.value) })} />
                  </TableCell>
                  <TableCell sx={{ minWidth: 80 }}>
                    <TextField variant="standard" type="number" value={c.netWeight} disabled={!editable} onChange={(e) => updateContainerLine(c.id, { netWeight: Number(e.target.value) })} />
                  </TableCell>
                  <TableCell sx={{ minWidth: 130 }}>
                    <TextField
                      type="date"
                      variant="standard"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      value={c.croFreeDate}
                      disabled={!editable}
                      onChange={(e) => updateContainerLine(c.id, { croFreeDate: e.target.value })}
                    />
                  </TableCell>
                  <TableCell sx={{ minWidth: 90 }}>
                    <TextField
                      variant="standard"
                      type="number"
                      value={c.detentionDays}
                      disabled={!editable}
                      onChange={(e) => updateContainerLine(c.id, { detentionDays: Number(e.target.value) })}
                    />
                  </TableCell>
                  <TableCell sx={{ minWidth: 100 }}>
                    <TextField
                      variant="standard"
                      type="number"
                      value={c.detentionAmount}
                      disabled={!editable}
                      onChange={(e) => updateContainerLine(c.id, { detentionAmount: Number(e.target.value) })}
                    />
                  </TableCell>
                  <TableCell sx={{ minWidth: 100 }}>
                    <TextField variant="standard" value={c.emptyLocation} disabled={!editable} onChange={(e) => updateContainerLine(c.id, { emptyLocation: e.target.value })} />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" disabled={!editable} onClick={() => removeContainerLine(c.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Button size="small" startIcon={<AddIcon />} disabled={!editable} onClick={addContainerLine}>
        Add Container
      </Button>
    </Box>
  );
}
