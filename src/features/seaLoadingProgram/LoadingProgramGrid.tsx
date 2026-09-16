import { useState } from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import TablePagination from '@mui/material/TablePagination';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import { SeaLoadingProgram } from '../../domain/seaLoadingProgram';

interface LoadingProgramGridProps {
  programs: SeaLoadingProgram[];
  onOpen: (program: SeaLoadingProgram) => void;
  onEdit: (program: SeaLoadingProgram) => void;
  onDelete: (program: SeaLoadingProgram) => void;
  onPrint: (program: SeaLoadingProgram) => void;
}

function HeaderCell({ children, ...props }: React.ComponentProps<typeof TableCell>) {
  return <TableCell {...props} sx={{ fontWeight: 700, whiteSpace: 'nowrap', ...props.sx }}>{children}</TableCell>;
}

function GridFilter({ value, onChange, placeholder, type = 'text', options }: { value: string; onChange: (value: string) => void; placeholder: string; type?: 'text' | 'date' | 'number'; options?: string[] }) {
  if (options) {
    return <TextField select size="small" value={value} onChange={(event) => onChange(event.target.value)} SelectProps={{ displayEmpty: true }} sx={{ minWidth: 84, '& .MuiSelect-select': { fontSize: 12, py: 0.55 } }}><MenuItem value=""><em>All</em></MenuItem>{options.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}</TextField>;
  }
  return <TextField size="small" type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} sx={{ minWidth: 78, '& .MuiInputBase-input': { fontSize: 12, py: 0.55 } }} />;
}

export function LoadingProgramGrid({ programs, onOpen, onEdit, onDelete, onPrint }: LoadingProgramGridProps) {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const rows = [...programs].sort((a, b) => b.date.localeCompare(a.date) || b.loadProgramNo.localeCompare(a.loadProgramNo));
  const uniqueValues = (values: string[]) => Array.from(new Set(values.filter(Boolean))).sort();
  const branches = uniqueValues(rows.map((program) => program.branch));
  const shippingLines = uniqueValues(rows.map((program) => program.shippingLine));
  const destinations = uniqueValues(rows.map((program) => program.destination));
  const setFilter = (key: string, value: string) => { setFilters((current) => ({ ...current, [key]: value })); setPage(0); };
  const matches = (value: string | number, key: string) => String(value).toLowerCase().includes((filters[key] ?? '').toLowerCase());
  const filteredRows = rows.filter((program) =>
    matches(program.loadProgramNo, 'loadProgramNo') && matches(program.date, 'date') && matches(program.branch, 'branch') &&
    matches(program.shippingLine, 'shippingLine') && matches(program.destination, 'destination') && matches(program.vessel, 'vessel') &&
    matches(program.status.final ? 'Y' : 'N', 'final')
  );
  const paginatedRows = filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small" sx={{ minWidth: 1200, '& .MuiTableCell-root': { borderRight: '1px solid #d7dee8', py: 0.8, px: 1 }, '& .MuiTableCell-root:last-child': { borderRight: 0 }, '& .MuiTableHead-root .MuiTableCell-root': { bgcolor: '#f8fafc', borderColor: '#315a9a' }, '& .MuiTableBody-root .MuiTableRow-root:nth-of-type(odd)': { bgcolor: '#eef2ff' } }}>
        <TableHead>
          <TableRow>
            <HeaderCell align="center">Action</HeaderCell>
            <HeaderCell>Load Program No.</HeaderCell>
            <HeaderCell>Date</HeaderCell>
            <HeaderCell>Branch</HeaderCell>
            <HeaderCell>Shipping Line</HeaderCell>
            <HeaderCell>Destination</HeaderCell>
            <HeaderCell>Vessel</HeaderCell>
            <HeaderCell align="center">Final</HeaderCell>
          </TableRow>
          <TableRow>
            <TableCell />
            <TableCell><GridFilter value={filters.loadProgramNo ?? ''} onChange={(value) => setFilter('loadProgramNo', value)} placeholder="No." /></TableCell>
            <TableCell><GridFilter value={filters.date ?? ''} onChange={(value) => setFilter('date', value)} placeholder="Date" type="date" /></TableCell>
            <TableCell><GridFilter value={filters.branch ?? ''} onChange={(value) => setFilter('branch', value)} placeholder="Branch" options={branches} /></TableCell>
            <TableCell><GridFilter value={filters.shippingLine ?? ''} onChange={(value) => setFilter('shippingLine', value)} placeholder="Line" options={shippingLines} /></TableCell>
            <TableCell><GridFilter value={filters.destination ?? ''} onChange={(value) => setFilter('destination', value)} placeholder="Destination" options={destinations} /></TableCell>
            <TableCell><GridFilter value={filters.vessel ?? ''} onChange={(value) => setFilter('vessel', value)} placeholder="Vessel" /></TableCell>
            <TableCell><GridFilter value={filters.final ?? ''} onChange={(value) => setFilter('final', value)} placeholder="Final" options={['Y', 'N']} /></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredRows.length === 0 ? (
            <TableRow><TableCell colSpan={8} align="center" sx={{ py: 3 }}><Typography variant="body2" color="text.secondary">No loading programs match the selected filters</Typography></TableCell></TableRow>
          ) : paginatedRows.map((program) => (
            <TableRow key={program.id} hover>
              <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                <Tooltip title="Open"><IconButton size="small" color="primary" onClick={() => onOpen(program)}><VisibilityOutlinedIcon fontSize="small" /></IconButton></Tooltip>
                <Tooltip title="Edit"><span><IconButton size="small" color="primary" disabled={program.status.final} onClick={() => onEdit(program)}><EditOutlinedIcon fontSize="small" /></IconButton></span></Tooltip>
                <Tooltip title="Print"><IconButton size="small" color="primary" onClick={() => onPrint(program)}><PrintOutlinedIcon fontSize="small" /></IconButton></Tooltip>
                <Tooltip title="Delete"><span><IconButton size="small" color="error" disabled={program.status.final} onClick={() => onDelete(program)}><DeleteOutlineIcon fontSize="small" /></IconButton></span></Tooltip>
              </TableCell>
              <TableCell>{program.loadProgramNo}</TableCell><TableCell>{program.date}</TableCell><TableCell>{program.branch}</TableCell>
              <TableCell>{program.shippingLine || '—'}</TableCell><TableCell>{program.destination || '—'}</TableCell><TableCell>{program.vessel || '—'}</TableCell>
              <TableCell align="center">{program.status.final ? 'Y' : 'N'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination component="div" count={filteredRows.length} page={page} onPageChange={(_, nextPage) => setPage(nextPage)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(event) => { setRowsPerPage(Number(event.target.value)); setPage(0); }} rowsPerPageOptions={[5, 10, 25, 50]} labelRowsPerPage="Rows per page" />
    </TableContainer>
  );
}
