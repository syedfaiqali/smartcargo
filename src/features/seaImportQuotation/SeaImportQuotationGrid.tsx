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
import { SeaImportQuotation } from '../../domain/seaImportQuotation';

interface SeaImportQuotationGridProps {
  quotations: SeaImportQuotation[];
  onOpen: (quotation: SeaImportQuotation) => void;
  onEdit: (quotation: SeaImportQuotation) => void;
  onDelete: (quotation: SeaImportQuotation) => void;
  onPrint: (quotation: SeaImportQuotation) => void;
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

export function SeaImportQuotationGrid({ quotations, onOpen, onEdit, onDelete, onPrint }: SeaImportQuotationGridProps) {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const rows = [...quotations].sort((a, b) => b.date.localeCompare(a.date) || b.quotationNo.localeCompare(a.quotationNo));
  const uniqueValues = (values: string[]) => Array.from(new Set(values.filter(Boolean))).sort();
  const branches = uniqueValues(rows.map((q) => q.branch));
  const transportModes = uniqueValues(rows.map((q) => q.transportMode));
  const origins = uniqueValues(rows.map((q) => q.origin));
  const destinations = uniqueValues(rows.map((q) => q.destination));

  const setFilter = (key: string, value: string) => { setFilters((current) => ({ ...current, [key]: value })); setPage(0); };
  const matches = (value: string | number, key: string) => String(value).toLowerCase().includes((filters[key] ?? '').toLowerCase());
  const filteredRows = rows.filter((q) =>
    matches(q.branch, 'branch') && matches(q.quotationNo, 'quotationNo') && matches(q.supplQuoteNo, 'supplQuoteNo') &&
    matches(q.transportMode, 'transportMode') && matches(q.jobInfo[0]?.jobNo ?? '', 'jobNo') && matches(q.date, 'date') &&
    matches(q.validity, 'validity') && matches(q.name || q.partyCode, 'customer') && matches(q.origin, 'origin') &&
    matches(q.destination, 'destination') && matches(q.noOfPkgs, 'quantity') && matches(q.uom, 'uom') &&
    matches(q.chWeight, 'chWeight') && matches(q.allIn, 'allIn') && matches(q.win, 'win')
  );
  const paginatedRows = filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table
        size="small"
        sx={{
          minWidth: 1600,
          '& .MuiTableCell-root': { borderRight: '1px solid #d7dee8', borderBottom: '1px solid #d7dee8', py: 0.8, px: 1 },
          '& .MuiTableCell-root:last-child': { borderRight: 0 },
          '& .MuiTableHead-root .MuiTableCell-root': { bgcolor: '#f8fafc', borderColor: '#315a9a' },
          '& .MuiTableBody-root .MuiTableRow-root:nth-of-type(odd)': { bgcolor: '#eef2ff' },
        }}
      >
        <TableHead>
          <TableRow>
            <HeaderCell sortable={false}>Action</HeaderCell>
            <HeaderCell>Branch</HeaderCell>
            <HeaderCell>Quote No.</HeaderCell>
            <HeaderCell>Suppl. Quote No.</HeaderCell>
            <HeaderCell>Transport Mode</HeaderCell>
            <HeaderCell>Job No.</HeaderCell>
            <HeaderCell>Date</HeaderCell>
            <HeaderCell>Validity</HeaderCell>
            <HeaderCell>Customer / Party</HeaderCell>
            <HeaderCell>Origin</HeaderCell>
            <HeaderCell>Destination</HeaderCell>
            <HeaderCell>Quantity</HeaderCell>
            <HeaderCell>Uom</HeaderCell>
            <HeaderCell>Ch. Weight</HeaderCell>
            <HeaderCell>All-In</HeaderCell>
            <HeaderCell>Win</HeaderCell>
            <HeaderCell>Reason</HeaderCell>
          </TableRow>
          <TableRow>
            <TableCell />
            <TableCell><GridFilter value={filters.branch ?? ''} onChange={(v) => setFilter('branch', v)} placeholder="Branch" options={branches} /></TableCell>
            <TableCell><GridFilter value={filters.quotationNo ?? ''} onChange={(v) => setFilter('quotationNo', v)} placeholder="Quote No." /></TableCell>
            <TableCell><GridFilter value={filters.supplQuoteNo ?? ''} onChange={(v) => setFilter('supplQuoteNo', v)} placeholder="Suppl. No." /></TableCell>
            <TableCell><GridFilter value={filters.transportMode ?? ''} onChange={(v) => setFilter('transportMode', v)} placeholder="Mode" options={transportModes} /></TableCell>
            <TableCell><GridFilter value={filters.jobNo ?? ''} onChange={(v) => setFilter('jobNo', v)} placeholder="Job No." /></TableCell>
            <TableCell><GridFilter value={filters.date ?? ''} onChange={(v) => setFilter('date', v)} placeholder="Date" type="date" /></TableCell>
            <TableCell><GridFilter value={filters.validity ?? ''} onChange={(v) => setFilter('validity', v)} placeholder="Validity" /></TableCell>
            <TableCell><GridFilter value={filters.customer ?? ''} onChange={(v) => setFilter('customer', v)} placeholder="Customer" /></TableCell>
            <TableCell><GridFilter value={filters.origin ?? ''} onChange={(v) => setFilter('origin', v)} placeholder="Origin" options={origins} /></TableCell>
            <TableCell><GridFilter value={filters.destination ?? ''} onChange={(v) => setFilter('destination', v)} placeholder="Destination" options={destinations} /></TableCell>
            <TableCell><GridFilter value={filters.quantity ?? ''} onChange={(v) => setFilter('quantity', v)} placeholder="Qty" type="number" /></TableCell>
            <TableCell />
            <TableCell><GridFilter value={filters.chWeight ?? ''} onChange={(v) => setFilter('chWeight', v)} placeholder="Weight" type="number" /></TableCell>
            <TableCell><GridFilter value={filters.allIn ?? ''} onChange={(v) => setFilter('allIn', v)} placeholder="All-In" options={['Y', 'N']} /></TableCell>
            <TableCell><GridFilter value={filters.win ?? ''} onChange={(v) => setFilter('win', v)} placeholder="Win" options={['Y', 'N']} /></TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredRows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={17} align="center" sx={{ py: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  No data available in table
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            paginatedRows.map((q) => (
              <TableRow key={q.id} hover>
                <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                  <Tooltip title="Open"><IconButton size="small" color="primary" onClick={() => onOpen(q)}><VisibilityOutlinedIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Edit"><span><IconButton size="small" color="primary" disabled={q.status.final} onClick={() => onEdit(q)}><EditOutlinedIcon fontSize="small" /></IconButton></span></Tooltip>
                  <Tooltip title="Delete"><span><IconButton size="small" color="error" disabled={q.status.final} onClick={() => onDelete(q)}><DeleteOutlineIcon fontSize="small" /></IconButton></span></Tooltip>
                  <Tooltip title="Print"><IconButton size="small" color="primary" onClick={() => onPrint(q)}><PrintOutlinedIcon fontSize="small" /></IconButton></Tooltip>
                </TableCell>
                <TableCell>{q.branch}</TableCell>
                <TableCell>{q.quotationNo}</TableCell>
                <TableCell>{q.supplQuoteNo || '—'}</TableCell>
                <TableCell>{q.transportMode || '—'}</TableCell>
                <TableCell>{q.jobInfo[0]?.jobNo || '—'}</TableCell>
                <TableCell>{q.date}</TableCell>
                <TableCell>{q.validity || '—'}</TableCell>
                <TableCell>{q.name || q.partyCode || '—'}</TableCell>
                <TableCell>{q.origin || '—'}</TableCell>
                <TableCell>{q.destination || '—'}</TableCell>
                <TableCell align="right">{q.noOfPkgs}</TableCell>
                <TableCell>{q.uom || '—'}</TableCell>
                <TableCell align="right">{q.chWeight}</TableCell>
                <TableCell align="center">{q.allIn}</TableCell>
                <TableCell align="center">{q.win}</TableCell>
                <TableCell>{q.reason || '—'}</TableCell>
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
