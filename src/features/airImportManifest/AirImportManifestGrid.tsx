import { useMemo, useState } from 'react';
import Paper from '@mui/material/Paper';
import { IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField } from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import { AirImportManifest } from '../../domain/airImportManifest';

type Props = {
  manifests: AirImportManifest[];
  onOpen: (manifest: AirImportManifest) => void;
  onEdit: (manifest: AirImportManifest) => void;
  onDelete: (manifest: AirImportManifest) => void;
  onPrint: (manifest: AirImportManifest) => void;
};

const columns = ['Branch', 'No.', 'Date', 'HAWB No.', 'PCS', 'CBM', 'Gross Weight', 'Charge Weight', 'Destination', 'Origin'];

export function AirImportManifestGrid({ manifests, onOpen, onEdit, onDelete, onPrint }: Props) {
  const [filters, setFilters] = useState<Record<number, string>>({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const values = (manifest: AirImportManifest) => {
    const job = manifest.hawbLines[0];
    return [manifest.branch, job?.jobNo ?? '', manifest.jobDate, job?.hawbNo ?? manifest.mawbNo,
      manifest.pcs, manifest.cbm, manifest.grossWeight, manifest.chargeWeight, manifest.destination, manifest.origin]
      .map((value) => String(value ?? ''));
  };
  const filtered = useMemo(() => manifests.filter((manifest) => values(manifest).every((value, index) => value.toLowerCase().includes((filters[index] ?? '').toLowerCase()))), [manifests, filters]);
  const rows = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const updateFilter = (index: number, value: string) => { setFilters((current) => ({ ...current, [index]: value })); setPage(0); };

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small" sx={{ minWidth: 1450 }}>
        <TableHead>
          <TableRow>
            <TableCell rowSpan={2}>Action</TableCell>
            <TableCell colSpan={3} align="center">Job</TableCell>
            <TableCell rowSpan={2}>HAWB No.</TableCell>
            <TableCell colSpan={4} align="center">Total</TableCell>
            <TableCell rowSpan={2}>Destination</TableCell>
            <TableCell rowSpan={2}>Origin</TableCell>
          </TableRow>
          <TableRow>{['Branch', 'No.', 'Date', 'PCS', 'CBM', 'Gross Weight', 'Charge Weight'].map((column) => <TableCell key={column}>{column}</TableCell>)}</TableRow>
          <TableRow>
            <TableCell />
            {columns.map((column, index) => (
              <TableCell key={column}><TextField size="small" fullWidth type={column === 'Date' ? 'date' : 'text'} placeholder={column} value={filters[index] ?? ''} onChange={(event) => updateFilter(index, event.target.value)} /></TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 ? <TableRow><TableCell colSpan={11} align="center">No data available in table</TableCell></TableRow> : rows.map((manifest) => (
            <TableRow key={manifest.id} hover>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>
                <IconButton size="small" aria-label="View manifest" onClick={() => onOpen(manifest)}><VisibilityOutlinedIcon fontSize="small" /></IconButton>
                <IconButton size="small" aria-label="Edit manifest" onClick={() => onEdit(manifest)}><EditOutlinedIcon fontSize="small" /></IconButton>
                <IconButton size="small" color="error" aria-label="Delete manifest" onClick={() => onDelete(manifest)}><DeleteOutlineIcon fontSize="small" /></IconButton>
                <IconButton size="small" aria-label="Print manifest" onClick={() => onPrint(manifest)}><PrintOutlinedIcon fontSize="small" /></IconButton>
              </TableCell>
              {values(manifest).map((value, index) => <TableCell key={`${manifest.id}-${columns[index]}`}>{value || '—'}</TableCell>)}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination component="div" count={filtered.length} page={page} rowsPerPage={rowsPerPage} onPageChange={(_, nextPage) => setPage(nextPage)} onRowsPerPageChange={(event) => { setRowsPerPage(Number(event.target.value)); setPage(0); }} rowsPerPageOptions={[5, 10, 25, 50]} />
    </TableContainer>
  );
}
