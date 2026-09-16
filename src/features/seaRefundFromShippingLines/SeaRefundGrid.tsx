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
import { SeaRefundFromShippingLines } from '../../domain/seaRefundFromShippingLines';

interface SeaRefundGridProps {
  refunds: SeaRefundFromShippingLines[];
  onOpen: (refund: SeaRefundFromShippingLines) => void;
  onEdit: (refund: SeaRefundFromShippingLines) => void;
  onDelete: (refund: SeaRefundFromShippingLines) => void;
  onPrint: (refund: SeaRefundFromShippingLines) => void;
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

export function SeaRefundGrid({ refunds, onOpen, onEdit, onDelete, onPrint }: SeaRefundGridProps) {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const rows = [...refunds].sort((a, b) => b.date.localeCompare(a.date) || b.documentNo.localeCompare(a.documentNo));
  const uniqueValues = (values: string[]) => Array.from(new Set(values.filter(Boolean))).sort();
  const branches = uniqueValues(rows.map((refund) => refund.branch));
  const sLineAgents = uniqueValues(rows.map((refund) => refund.sLineAgent));
  const jobNos = uniqueValues(rows.map((refund) => refund.jobNo));
  const years = uniqueValues(rows.map((refund) => String(refund.jobYear || '')));
  const setFilter = (key: string, value: string) => { setFilters((current) => ({ ...current, [key]: value })); setPage(0); };
  const matches = (value: string | number, key: string) => String(value).toLowerCase().includes((filters[key] ?? '').toLowerCase());
  const filteredRows = rows.filter((refund) =>
    matches(refund.documentNo, 'documentNo') && matches(refund.date, 'date') && matches(refund.branch, 'branch') &&
    matches(refund.sLineAgent, 'sLineAgent') && matches(refund.jobNo, 'jobNo') && matches(refund.jobYear, 'jobYear') &&
    matches(refund.billNo, 'billNo') && matches(refund.billDate, 'billDate') && matches(refund.totalAmount, 'amount') && matches(refund.status.final ? 'Y' : 'N', 'final')
  );
  const paginatedRows = filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small" sx={{ minWidth: 1300, '& .MuiTableCell-root': { borderRight: '1px solid #d7dee8', py: 0.8, px: 1 }, '& .MuiTableCell-root:last-child': { borderRight: 0 }, '& .MuiTableHead-root .MuiTableCell-root': { bgcolor: '#f8fafc', borderColor: '#315a9a' }, '& .MuiTableBody-root .MuiTableRow-root:nth-of-type(odd)': { bgcolor: '#eef2ff' } }}>
        <TableHead>
          <TableRow>
            <HeaderCell rowSpan={2} align="center">Action</HeaderCell>
            <HeaderCell colSpan={3} align="center">DOCUMENT</HeaderCell>
            <HeaderCell rowSpan={2}>S/L Agent</HeaderCell>
            <HeaderCell colSpan={2} align="center">JOB</HeaderCell>
            <HeaderCell rowSpan={2}>Bill No</HeaderCell>
            <HeaderCell rowSpan={2}>Bill Date</HeaderCell>
            <HeaderCell rowSpan={2} align="right">PKR Amount</HeaderCell>
            <HeaderCell rowSpan={2} align="center">Final</HeaderCell>
          </TableRow>
          <TableRow>
            <HeaderCell>No.</HeaderCell><HeaderCell>Date</HeaderCell><HeaderCell>Branch</HeaderCell>
            <HeaderCell>No.</HeaderCell><HeaderCell>Year</HeaderCell>
          </TableRow>
          <TableRow>
            <TableCell />
            <TableCell><GridFilter value={filters.documentNo ?? ''} onChange={(value) => setFilter('documentNo', value)} placeholder="No." /></TableCell>
            <TableCell><GridFilter value={filters.date ?? ''} onChange={(value) => setFilter('date', value)} placeholder="Date" type="date" /></TableCell>
            <TableCell><GridFilter value={filters.branch ?? ''} onChange={(value) => setFilter('branch', value)} placeholder="Branch" options={branches} /></TableCell>
            <TableCell><GridFilter value={filters.sLineAgent ?? ''} onChange={(value) => setFilter('sLineAgent', value)} placeholder="Agent" options={sLineAgents} /></TableCell>
            <TableCell><GridFilter value={filters.jobNo ?? ''} onChange={(value) => setFilter('jobNo', value)} placeholder="Job No." options={jobNos} /></TableCell>
            <TableCell><GridFilter value={filters.jobYear ?? ''} onChange={(value) => setFilter('jobYear', value)} placeholder="Year" options={years} /></TableCell>
            <TableCell><GridFilter value={filters.billNo ?? ''} onChange={(value) => setFilter('billNo', value)} placeholder="Bill No." /></TableCell>
            <TableCell><GridFilter value={filters.billDate ?? ''} onChange={(value) => setFilter('billDate', value)} placeholder="Date" type="date" /></TableCell>
            <TableCell><GridFilter value={filters.amount ?? ''} onChange={(value) => setFilter('amount', value)} placeholder="PKR" type="number" /></TableCell>
            <TableCell><GridFilter value={filters.final ?? ''} onChange={(value) => setFilter('final', value)} placeholder="Final" options={['Y', 'N']} /></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredRows.length === 0 ? (
            <TableRow><TableCell colSpan={12} align="center" sx={{ py: 3 }}><Typography variant="body2" color="text.secondary">No refunds match the selected filters</Typography></TableCell></TableRow>
          ) : paginatedRows.map((refund) => (
            <TableRow key={refund.id} hover>
              <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                <Tooltip title="Open"><IconButton size="small" color="primary" onClick={() => onOpen(refund)}><VisibilityOutlinedIcon fontSize="small" /></IconButton></Tooltip>
                <Tooltip title="Edit"><span><IconButton size="small" color="primary" disabled={refund.status.final} onClick={() => onEdit(refund)}><EditOutlinedIcon fontSize="small" /></IconButton></span></Tooltip>
                <Tooltip title="Print"><IconButton size="small" color="primary" onClick={() => onPrint(refund)}><PrintOutlinedIcon fontSize="small" /></IconButton></Tooltip>
                <Tooltip title="Delete"><span><IconButton size="small" color="error" disabled={refund.status.final} onClick={() => onDelete(refund)}><DeleteOutlineIcon fontSize="small" /></IconButton></span></Tooltip>
              </TableCell>
              <TableCell>{refund.documentNo}</TableCell><TableCell>{refund.date}</TableCell><TableCell>{refund.branch}</TableCell>
              <TableCell>{refund.sLineAgent || '—'}</TableCell>
              <TableCell>{refund.jobNo || '—'}</TableCell><TableCell>{refund.jobYear || '—'}</TableCell>
              <TableCell>{refund.billNo || '—'}</TableCell><TableCell>{refund.billDate || '—'}</TableCell>
              <TableCell align="right">{refund.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
              <TableCell align="center">{refund.status.final ? 'Y' : 'N'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination component="div" count={filteredRows.length} page={page} onPageChange={(_, nextPage) => setPage(nextPage)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(event) => { setRowsPerPage(Number(event.target.value)); setPage(0); }} rowsPerPageOptions={[5, 10, 25, 50]} labelRowsPerPage="Rows per page" />
    </TableContainer>
  );
}
