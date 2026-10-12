import { useEffect, useMemo, useState } from 'react';
import { confirmDelete } from '../../../components/deleteConfirmation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
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
import { agentRepo, containerTypeRepo, shippingLineRepo } from '../../../data/masterDataService';
import { SeaContainerRef, SeaExportJob } from '../../../domain/seaExportJob';
import { createEmptyContainer } from '../../../domain/seaExportJobFactory';

interface ContainerTabProps {
  job: SeaExportJob;
  editable: boolean;
  onChange: (job: SeaExportJob) => void;
}

const vehicleTypes = ['Truck', 'Trailer', 'Pickup', 'Other'];

export function ContainerTab({ job, editable, onChange }: ContainerTabProps) {
  const [draft, setDraft] = useState<SeaContainerRef | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [gridOpen, setGridOpen] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const containerTypes = containerTypeRepo.list();
  const transporters = [
    ...shippingLineRepo.list().map((item) => item.name),
    ...agentRepo.list().map((item) => item.name),
  ].filter((name, index, all) => name && all.indexOf(name) === index);

  useEffect(() => {
    setDraft(editable ? { ...createEmptyContainer(), serialNo: Math.max(0, ...job.containers.map((item) => item.serialNo)) + 1 } : null);
  }, [editable, job.id]);

  const filteredContainers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return job.containers;
    return job.containers.filter((container) =>
      [container.serialNo, container.containerNo, container.sizeType, container.containerTypes,
        container.sealNo, container.pcd, container.vehicleNo, container.vehicleDate]
        .join(' ').toLowerCase().includes(query),
    );
  }, [job.containers, search]);
  const currentPage = Math.min(page, Math.max(0, Math.ceil(filteredContainers.length / rowsPerPage) - 1));

  const setDraftField = <K extends keyof SeaContainerRef>(key: K, value: SeaContainerRef[K]) => {
    if (draft) setDraft({ ...draft, [key]: value });
  };
  const startNew = () => setDraft({ ...createEmptyContainer(), serialNo: Math.max(0, ...job.containers.map((item) => item.serialNo)) + 1 });
  const saveDraft = () => {
    if (!draft || !editable) return;
    const exists = job.containers.some((container) => container.id === draft.id);
    onChange({
      ...job,
      containers: exists
        ? job.containers.map((container) => container.id === draft.id ? draft : container)
        : [...job.containers, draft],
    });
    setDraft(null);
  };
  const editContainer = (container: SeaContainerRef) => {
    setDraft({ ...container });
    setDetailsOpen(true);
  };
  const removeContainer = (id: string) => onChange({ ...job, containers: job.containers.filter((container) => container.id !== id) });

  const field = (label: string, key: keyof SeaContainerRef, type: string = 'text') => (
    <TextField
      label={label}
      type={type}
      fullWidth
      value={draft?.[key] ?? ''}
      disabled={!editable || !draft}
      onChange={(event) => setDraftField(key, (type === 'number' ? Number(event.target.value) : event.target.value) as SeaContainerRef[typeof key])}
      InputLabelProps={type === 'date' ? { shrink: true } : undefined}
    />
  );
  const selectField = (label: string, key: keyof SeaContainerRef, options: string[]) => {
    const value = String(draft?.[key] ?? '');
    return (
      <TextField select label={label} fullWidth value={value} disabled={!editable || !draft} onChange={(event) => setDraftField(key, event.target.value as SeaContainerRef[typeof key])}>
        <MenuItem value="">Select {label}</MenuItem>
        {value && !options.includes(value) && <MenuItem value={value}>{value}</MenuItem>}
        {options.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
      </TextField>
    );
  };

  return (
    <Box>
      <WorkflowSection
        title="Container Details"
        subtitle="Enter container, transport, pickup and cargo measurements"
        open={detailsOpen}
        onToggle={() => setDetailsOpen(!detailsOpen)}
      >
        {draft ? <>
        <FormRow>
          <FormField><TextField label="Serial No." type="number" fullWidth value={draft?.serialNo ?? ''} disabled /></FormField>
          <FormField><>{field('Container No.', 'containerNo')}</></FormField>
          <FormField>{selectField('Size', 'sizeType', containerTypes.map((item) => item.size).filter(Boolean))}</FormField>
        </FormRow>
        <FormRow>
          <FormField>{field('ISO Code', 'isoCode')}</FormField>
          <FormField>{field('Container Types', 'containerTypes')}</FormField>
          <FormField>{field('Seal No.', 'sealNo')}</FormField>
        </FormRow>
        <FormRow>
          <FormField>{selectField('Vehicle Type', 'vehicleType', vehicleTypes)}</FormField>
          <FormField>{field('Vehicle No.', 'vehicleNo')}</FormField>
          <FormField>{field('Vehicle Date', 'vehicleDate', 'date')}</FormField>
        </FormRow>
        <FormRow>
          <FormField>{field('POL ETA', 'polEta', 'date')}</FormField>
          <FormField>{field('POL ATA', 'polAta', 'date')}</FormField>
          <FormField>{field('PCD', 'pcd', 'date')}</FormField>
        </FormRow>
        <FormRow>
          <FormField>{selectField('Transporter Name', 'transporterName', transporters)}</FormField>
          <FormField>{field('Driver Name', 'driverName')}</FormField>
          <FormField>{field('Mobile No.', 'mobileNo')}</FormField>
        </FormRow>
        <FormRow>
          <FormField>{field('Charges', 'charges', 'number')}</FormField>
          <FormField>{field('From (POL)', 'fromPol')}</FormField>
          <FormField>{field('To (POD)', 'toPod')}</FormField>
        </FormRow>
        <FormRow>
          <FormField>{field('No. of Pkgs', 'noOfPkgs', 'number')}</FormField>
          <FormField>{field('Unit', 'unit')}</FormField>
          <FormField>{field('CBM', 'cbm', 'number')}</FormField>
        </FormRow>
        <FormRow>
          <FormField>{field('Gross Weight (kg)', 'grossWeight', 'number')}</FormField>
          <FormField>{field('Net Weight (kg)', 'netWeight', 'number')}</FormField>
        </FormRow>
        <Stack direction="row" spacing={1}>
          <Button variant="contained" disabled={!editable || !draft} onClick={saveDraft}>Save Container</Button>
          <Button variant="outlined" disabled={!draft} onClick={() => setDraft(null)}>Cancel</Button>
        </Stack>
        </> : <Button variant="outlined" disabled={!editable} onClick={startNew}>New Container</Button>}
      </WorkflowSection>

      <WorkflowSection
        title="Container Grid"
        subtitle="Search, review, edit or remove saved container rows"
        open={gridOpen}
        onToggle={() => setGridOpen(!gridOpen)}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1.5 }}>
          <TextField label="Search containers" value={search} onChange={(event) => { setSearch(event.target.value); setPage(0); }} />
        </Box>
        <Paper variant="outlined" sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 1050, '& .MuiTableCell-root': { whiteSpace: 'nowrap' } }}>
            <TableHead>
              <TableRow>
                {['Action', 'Serial No.', 'Container No.', 'Size', 'Container Types', 'Seal No.', 'PCD', 'Vehicle No.', 'Vehicle Date'].map((label) => <TableCell key={label}>{label}</TableCell>)}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredContainers.length === 0 ? (
                <TableRow><TableCell colSpan={9} align="center" sx={{ py: 3 }}><Typography variant="body2" color="text.secondary">No containers found.</Typography></TableCell></TableRow>
              ) : filteredContainers.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage).map((container) => (
                <TableRow key={container.id} hover>
                  <TableCell>
                    <Button size="small" disabled={!editable} onClick={() => editContainer(container)}>Edit</Button>
                    <Button size="small" color="error" disabled={!editable} onClick={() => confirmDelete(() => removeContainer(container.id))}>Delete</Button>
                  </TableCell>
                  <TableCell>{container.serialNo}</TableCell>
                  <TableCell>{container.containerNo}</TableCell>
                  <TableCell>{container.sizeType}</TableCell>
                  <TableCell>{container.containerTypes}</TableCell>
                  <TableCell>{container.sealNo}</TableCell>
                  <TableCell>{container.pcd}</TableCell>
                  <TableCell>{container.vehicleNo}</TableCell>
                  <TableCell>{container.vehicleDate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
        <TablePagination
          component="div"
          count={filteredContainers.length}
          page={currentPage}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, nextPage) => setPage(nextPage)}
          onRowsPerPageChange={(event) => { setRowsPerPage(Number(event.target.value)); setPage(0); }}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Rows per page"
        />
      </WorkflowSection>
    </Box>
  );
}
