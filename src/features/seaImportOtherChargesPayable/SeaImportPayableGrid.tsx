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
import { SeaImportOtherChargesPayable } from '../../domain/seaImportOtherChargesPayable';

interface SeaImportPayableGridProps {
  payables: SeaImportOtherChargesPayable[];
  onOpen: (payable: SeaImportOtherChargesPayable) => void;
  onEdit: (payable: SeaImportOtherChargesPayable) => void;
  onDelete: (payable: SeaImportOtherChargesPayable) => void;
  onPrint: (payable: SeaImportOtherChargesPayable) => void;
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

export function SeaImportPayableGrid({ payables, onOpen, onEdit, onDelete, onPrint }: SeaImportPayableGridProps) {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const rows = [...payables].sort((a, b) => b.date.localeCompare(a.date) || b.creditNoteNo.localeCompare(a.creditNoteNo));
  const uniqueValues = (values: string[]) => Array.from(new Set(values.filter(Boolean))).sort();
  const branches = uniqueValues(rows.map((payable) => payable.branch));
  const payableTypes = uniqueValues(rows.map((payable) => payable.payableType));
  const partyCodes = uniqueValues(rows.map((payable) => payable.partyCode));
  const partyNames = uniqueValues(rows.map((payable) => payable.partyName));
  const jobNos = uniqueValues(rows.map((payable) => payable.consoleJobNo));
  const years = uniqueValues(rows.map((payable) => String(payable.jobYear || '')));
  const setFilter = (key: string, value: string) => { setFilters((current) => ({ ...current, [key]: value })); setPage(0); };
  const matches = (value: string | number, key: string) => String(value).toLowerCase().includes((filters[key] ?? '').toLowerCase());
  const filteredRows = rows.filter((payable) =>
    matches(payable.creditNoteNo, 'creditNoteNo') && matches(payable.date, 'date') && matches(payable.branch, 'branch') && matches(payable.payableType, 'payableType') &&
    matches(payable.partyCode, 'partyCode') && matches(payable.partyName, 'partyName') && matches(payable.consoleJobNo, 'jobNo') && matches(payable.jobYear, 'jobYear') &&
    matches(payable.billNo, 'billNo') && matches(payable.billDate, 'billDate') && matches(payable.totalCharges, 'amount') && matches(payable.status.final ? 'Y' : 'N', 'final') && matches('N', 'post')
  );
  const paginatedRows = filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small" sx={{ minWidth: 1300, '& .MuiTableCell-root': { borderRight: '1px solid #d7dee8', py: 0.8, px: 1 }, '& .MuiTableCell-root:last-child': { borderRight: 0 }, '& .MuiTableHead-root .MuiTableCell-root': { bgcolor: '#f8fafc', borderColor: '#315a9a' }, '& .MuiTableBody-root .MuiTableRow-root:nth-of-type(odd)': { bgcolor: '#eef2ff' } }}>
        <TableHead>
          <TableRow>
            <HeaderCell rowSpan={2} align="center">Action</HeaderCell>
            <HeaderCell colSpan={3} align="center">CREDIT NOTE</HeaderCell>
            <HeaderCell rowSpan={2}>Payable Type</HeaderCell>
            <HeaderCell colSpan={2} align="center">PARTY CODE</HeaderCell>
            <HeaderCell colSpan={2} align="center">JOB</HeaderCell>
            <HeaderCell rowSpan={2}>Bill No</HeaderCell>
            <HeaderCell rowSpan={2}>Bill Date</HeaderCell>
            <HeaderCell rowSpan={2} align="right">PKR Amount</HeaderCell>
            <HeaderCell colSpan={2} align="center">STATUS</HeaderCell>
          </TableRow>
          <TableRow>
            <HeaderCell>No.</HeaderCell><HeaderCell>Date</HeaderCell><HeaderCell>Branch</HeaderCell>
            <HeaderCell>Code</HeaderCell><HeaderCell>Description</HeaderCell>
            <HeaderCell>No.</HeaderCell><HeaderCell>Year</HeaderCell>
            <HeaderCell>Final</HeaderCell><HeaderCell>Post</HeaderCell>
          </TableRow>
          <TableRow>
            <TableCell />
            <TableCell><GridFilter value={filters.creditNoteNo ?? ''} onChange={(value) => setFilter('creditNoteNo', value)} placeholder="No." /></TableCell>
            <TableCell><GridFilter value={filters.date ?? ''} onChange={(value) => setFilter('date', value)} placeholder="Date" type="date" /></TableCell>
            <TableCell><GridFilter value={filters.branch ?? ''} onChange={(value) => setFilter('branch', value)} placeholder="Branch" options={branches} /></TableCell>
            <TableCell><GridFilter value={filters.payableType ?? ''} onChange={(value) => setFilter('payableType', value)} placeholder="Type" options={payableTypes} /></TableCell>
            <TableCell><GridFilter value={filters.partyCode ?? ''} onChange={(value) => setFilter('partyCode', value)} placeholder="Code" options={partyCodes} /></TableCell>
            <TableCell><GridFilter value={filters.partyName ?? ''} onChange={(value) => setFilter('partyName', value)} placeholder="Description" options={partyNames} /></TableCell>
            <TableCell><GridFilter value={filters.jobNo ?? ''} onChange={(value) => setFilter('jobNo', value)} placeholder="Job No." options={jobNos} /></TableCell>
            <TableCell><GridFilter value={filters.jobYear ?? ''} onChange={(value) => setFilter('jobYear', value)} placeholder="Year" options={years} /></TableCell>
            <TableCell><GridFilter value={filters.billNo ?? ''} onChange={(value) => setFilter('billNo', value)} placeholder="Bill No." /></TableCell>
            <TableCell><GridFilter value={filters.billDate ?? ''} onChange={(value) => setFilter('billDate', value)} placeholder="Date" type="date" /></TableCell>
            <TableCell><GridFilter value={filters.amount ?? ''} onChange={(value) => setFilter('amount', value)} placeholder="PKR" type="number" /></TableCell>
            <TableCell><GridFilter value={filters.final ?? ''} onChange={(value) => setFilter('final', value)} placeholder="Final" options={['Y', 'N']} /></TableCell>
            <TableCell><GridFilter value={filters.post ?? ''} onChange={(value) => setFilter('post', value)} placeholder="Post" options={['Y', 'N']} /></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredRows.length === 0 ? (
            <TableRow><TableCell colSpan={14} align="center" sx={{ py: 3 }}><Typography variant="body2" color="text.secondary">No payables match the selected filters</Typography></TableCell></TableRow>
          ) : paginatedRows.map((payable) => (
            <TableRow key={payable.id} hover>
              <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                <Tooltip title="Open"><IconButton size="small" color="primary" onClick={() => onOpen(payable)}><VisibilityOutlinedIcon fontSize="small" /></IconButton></Tooltip>
                <Tooltip title="Edit"><span><IconButton size="small" color="primary" disabled={payable.status.final} onClick={() => onEdit(payable)}><EditOutlinedIcon fontSize="small" /></IconButton></span></Tooltip>
                <Tooltip title="Print"><IconButton size="small" color="primary" onClick={() => onPrint(payable)}><PrintOutlinedIcon fontSize="small" /></IconButton></Tooltip>
                <Tooltip title="Delete"><span><IconButton size="small" color="error" disabled={payable.status.final} onClick={() => onDelete(payable)}><DeleteOutlineIcon fontSize="small" /></IconButton></span></Tooltip>
              </TableCell>
              <TableCell>{payable.creditNoteNo}</TableCell><TableCell>{payable.date}</TableCell><TableCell>{payable.branch}</TableCell>
              <TableCell>{payable.payableType || '—'}</TableCell><TableCell>{payable.partyCode || '—'}</TableCell><TableCell>{payable.partyName || '—'}</TableCell>
              <TableCell>{payable.consoleJobNo || '—'}</TableCell><TableCell>{payable.jobYear || '—'}</TableCell>
              <TableCell>{payable.billNo || '—'}</TableCell><TableCell>{payable.billDate || '—'}</TableCell>
              <TableCell align="right">{payable.totalCharges.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
              <TableCell align="center">{payable.status.final ? 'Y' : 'N'}</TableCell><TableCell align="center">N</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination component="div" count={filteredRows.length} page={page} onPageChange={(_, nextPage) => setPage(nextPage)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(event) => { setRowsPerPage(Number(event.target.value)); setPage(0); }} rowsPerPageOptions={[5, 10, 25, 50]} labelRowsPerPage="Rows per page" />
    </TableContainer>
  );
}
