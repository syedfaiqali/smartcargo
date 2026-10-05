import { confirmDelete } from '../../components/deleteConfirmation';
import { useState } from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
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
import { DocumentReceipt } from '../../domain/documentReceipt';

interface DocumentReceiptGridProps {
  documents: DocumentReceipt[];
  onOpen: (document: DocumentReceipt) => void;
  onEdit: (document: DocumentReceipt) => void;
  onDelete: (document: DocumentReceipt) => void;
  onPrint: (document: DocumentReceipt) => void;
}

function HeaderCell({ children, sortable = true, ...props }: React.ComponentProps<typeof TableCell> & { sortable?: boolean }) {
  return (
    <TableCell {...props} sx={{ fontWeight: 700, whiteSpace: 'nowrap', ...props.sx }}>
      {sortable ? <TableSortLabel active={false}>{children}</TableSortLabel> : children}
    </TableCell>
  );
}

function GridFilter({ value, onChange, placeholder, type = 'text', options }: { value: string; onChange: (value: string) => void; placeholder: string; type?: 'text' | 'date' | 'number'; options?: string[] }) {
  if (options) {
    return (
      <TextField select size="small" value={value} onChange={(event) => onChange(event.target.value)} SelectProps={{ displayEmpty: true }} sx={{ minWidth: 84, '& .MuiSelect-select': { fontSize: 12, py: 0.55 } }}>
        <MenuItem value=""><em>All</em></MenuItem>
        {options.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
      </TextField>
    );
  }
  return <TextField size="small" type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} sx={{ minWidth: 78, '& .MuiInputBase-input': { fontSize: 12, py: 0.55 } }} />;
}

export function DocumentReceiptGrid({ documents, onOpen, onEdit, onDelete, onPrint }: DocumentReceiptGridProps) {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const rows = [...documents].sort((a, b) => b.date.localeCompare(a.date) || b.recordNo.localeCompare(a.recordNo));
  const uniqueValues = (values: string[]) => Array.from(new Set(values.filter(Boolean))).sort();
  const origins = uniqueValues(rows.map((r) => r.origin));
  const destinations = uniqueValues(rows.map((r) => r.destination));

  const setFilter = (key: string, value: string) => { setFilters((current) => ({ ...current, [key]: value })); setPage(0); };
  const matches = (value: string | number, key: string) => String(value).toLowerCase().includes((filters[key] ?? '').toLowerCase());
  const filteredRows = rows.filter((r) =>
    matches(r.recordNo, 'recordNo') && matches(r.date, 'recordDate') &&
    matches(r.partyCode, 'code') && matches(r.partyName, 'name') &&
    matches(r.jobNo, 'jobNo') && matches(r.noOfPkgs, 'noOfPkgs') &&
    matches(r.origin, 'origin') && matches(r.destination, 'destination') &&
    matches(r.lines.find((l) => l.label.startsWith('MBL'))?.documentNo ?? '', 'mbl') &&
    matches(r.lines.find((l) => l.label.startsWith('HBL'))?.documentNo ?? '', 'hbl') &&
    matches(r.lines.find((l) => l.label.includes('Invoice'))?.documentNo ?? '', 'invoice')
  );
  const paginatedRows = filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table
        size="small"
        sx={{
          minWidth: 1300,
          '& .MuiTableCell-root': { borderRight: '1px solid #d7dee8', borderBottom: '1px solid #d7dee8', py: 0.8, px: 1 },
          '& .MuiTableCell-root:last-child': { borderRight: 0 },
          '& .MuiTableHead-root .MuiTableCell-root': { bgcolor: '#f8fafc', borderColor: '#315a9a' },
          '& .MuiTableBody-root .MuiTableRow-root:nth-of-type(odd)': { bgcolor: '#eef2ff' },
        }}
      >
        <TableHead>
          <TableRow>
            <HeaderCell sortable={false} rowSpan={2}>Action</HeaderCell>
            <HeaderCell rowSpan={2}>Record No.</HeaderCell>
            <HeaderCell rowSpan={2}>Record Date</HeaderCell>
            <HeaderCell colSpan={2} align="center">Party</HeaderCell>
            <HeaderCell rowSpan={2}>Job No.</HeaderCell>
            <HeaderCell rowSpan={2}>No. Of Pkgs</HeaderCell>
            <HeaderCell rowSpan={2}>Origin</HeaderCell>
            <HeaderCell rowSpan={2}>Destination</HeaderCell>
            <HeaderCell rowSpan={2}>HBL/MAWB No.</HeaderCell>
            <HeaderCell rowSpan={2}>HBL/HAWB No.</HeaderCell>
            <HeaderCell rowSpan={2}>Invoice No.</HeaderCell>
          </TableRow>
          <TableRow>
            <HeaderCell>Code</HeaderCell>
            <HeaderCell>Name</HeaderCell>
          </TableRow>
          <TableRow>
            <TableCell />
            <TableCell><GridFilter value={filters.recordNo ?? ''} onChange={(v) => setFilter('recordNo', v)} placeholder="Record No." /></TableCell>
            <TableCell><GridFilter value={filters.recordDate ?? ''} onChange={(v) => setFilter('recordDate', v)} placeholder="Date" type="date" /></TableCell>
            <TableCell><GridFilter value={filters.code ?? ''} onChange={(v) => setFilter('code', v)} placeholder="Code" /></TableCell>
            <TableCell><GridFilter value={filters.name ?? ''} onChange={(v) => setFilter('name', v)} placeholder="Name" /></TableCell>
            <TableCell><GridFilter value={filters.jobNo ?? ''} onChange={(v) => setFilter('jobNo', v)} placeholder="Job No." /></TableCell>
            <TableCell><GridFilter value={filters.noOfPkgs ?? ''} onChange={(v) => setFilter('noOfPkgs', v)} placeholder="Pkgs" type="number" /></TableCell>
            <TableCell><GridFilter value={filters.origin ?? ''} onChange={(v) => setFilter('origin', v)} placeholder="Origin" options={origins} /></TableCell>
            <TableCell><GridFilter value={filters.destination ?? ''} onChange={(v) => setFilter('destination', v)} placeholder="Destination" options={destinations} /></TableCell>
            <TableCell><GridFilter value={filters.mbl ?? ''} onChange={(v) => setFilter('mbl', v)} placeholder="MAWB No." /></TableCell>
            <TableCell><GridFilter value={filters.hbl ?? ''} onChange={(v) => setFilter('hbl', v)} placeholder="HAWB No." /></TableCell>
            <TableCell><GridFilter value={filters.invoice ?? ''} onChange={(v) => setFilter('invoice', v)} placeholder="Invoice No." /></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredRows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={12} align="center" sx={{ py: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  No data available in table
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            paginatedRows.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                  <Tooltip title="Open"><IconButton size="small" color="primary" onClick={() => onOpen(r)}><VisibilityOutlinedIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Edit"><span><IconButton size="small" color="primary" disabled={r.status.final} onClick={() => onEdit(r)}><EditOutlinedIcon fontSize="small" /></IconButton></span></Tooltip>
                  <Tooltip title="Delete"><span><IconButton size="small" color="error" disabled={r.status.final} onClick={() => confirmDelete(() => onDelete(r))}><DeleteOutlineIcon fontSize="small" /></IconButton></span></Tooltip>
                  <Tooltip title="Print"><IconButton size="small" color="primary" onClick={() => onPrint(r)}><PrintOutlinedIcon fontSize="small" /></IconButton></Tooltip>
                </TableCell>
                <TableCell>{r.recordNo}</TableCell>
                <TableCell>{r.date}</TableCell>
                <TableCell>{r.partyCode || '—'}</TableCell>
                <TableCell>{r.partyName || '—'}</TableCell>
                <TableCell>{r.jobNo || '—'}</TableCell>
                <TableCell align="right">{r.noOfPkgs}</TableCell>
                <TableCell>{r.origin || '—'}</TableCell>
                <TableCell>{r.destination || '—'}</TableCell>
                <TableCell>{r.lines.find((l) => l.label.startsWith('MBL'))?.documentNo || '—'}</TableCell>
                <TableCell>{r.lines.find((l) => l.label.startsWith('HBL'))?.documentNo || '—'}</TableCell>
                <TableCell>{r.lines.find((l) => l.label.includes('Invoice'))?.documentNo || '—'}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={filteredRows.length}
        page={page}
        onPageChange={(_, nextPage) => setPage(nextPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(event) => { setRowsPerPage(Number(event.target.value)); setPage(0); }}
        rowsPerPageOptions={[5, 10, 25, 50]}
        labelRowsPerPage="Rows per page"
      />
    </TableContainer>
  );
}
