import { confirmDelete } from '../../components/deleteConfirmation';
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
import { ForeignAgentInvoice } from '../../domain/foreignAgentInvoice';

interface ForeignAgentInvoiceGridProps {
  invoices: ForeignAgentInvoice[];
  onOpen: (invoice: ForeignAgentInvoice) => void;
  onEdit: (invoice: ForeignAgentInvoice) => void;
  onDelete: (invoice: ForeignAgentInvoice) => void;
  onPrint: (invoice: ForeignAgentInvoice) => void;
}

function HeaderCell({ children, ...props }: React.ComponentProps<typeof TableCell>) {
  return <TableCell {...props} sx={{ fontWeight: 700, whiteSpace: 'nowrap', ...props.sx }}>{children}</TableCell>;
}

function GridFilter({ value, onChange, type = 'text', options, placeholder }: { value: string; onChange: (value: string) => void; type?: 'text' | 'date' | 'number'; options?: string[]; placeholder: string }) {
  if (options) return <TextField select size="small" value={value} onChange={(event) => onChange(event.target.value)} SelectProps={{ displayEmpty: true }} sx={{ minWidth: 78, '& .MuiSelect-select': { fontSize: 12, py: 0.55 } }}><MenuItem value=""><em>All</em></MenuItem>{options.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}</TextField>;
  return <TextField size="small" type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} sx={{ minWidth: 72, '& .MuiInputBase-input': { fontSize: 12, py: 0.55 } }} />;
}

export function ForeignAgentInvoiceGrid({ invoices, onOpen, onEdit, onDelete, onPrint }: ForeignAgentInvoiceGridProps) {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const rows = [...invoices].sort((a, b) => b.documentDate.localeCompare(a.documentDate) || b.documentNo.localeCompare(a.documentNo));
  const uniqueValues = (values: string[]) => Array.from(new Set(values.filter(Boolean))).sort();
  const setFilter = (key: string, value: string) => { setFilters((current) => ({ ...current, [key]: value })); setPage(0); };
  const matches = (value: string | number, key: string) => String(value).toLowerCase().includes((filters[key] ?? '').toLowerCase());
  const filteredRows = rows.filter((invoice) => matches(invoice.documentNo, 'documentNo') && matches(invoice.documentDate, 'documentDate') && matches(invoice.branch, 'branch') && matches(invoice.mawbJobNo, 'job') && matches(invoice.mawbNo, 'mawb') && matches(invoice.fAgentCode, 'agentCode') && matches(invoice.fAgentName, 'agentName') && matches(invoice.origin, 'origin') && matches(invoice.destination, 'destination') && matches(invoice.currencyCode, 'currency') && matches(invoice.totalSelling, 'foreign') && matches(invoice.totalInvoiceAmount, 'pkr') && matches(invoice.status.final ? 'Y' : 'N', 'final') && matches(invoice.status.posted ? 'Y' : 'N', 'post') && matches(invoice.status.void ? 'Y' : 'N', 'void'));
  const paginatedRows = filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  return <TableContainer component={Paper} variant="outlined"><Table size="small" sx={{ minWidth: 1650, '& .MuiTableCell-root': { borderRight: '1px solid #d7dee8', py: 0.75, px: 1 }, '& .MuiTableCell-root:last-child': { borderRight: 0 }, '& .MuiTableHead-root .MuiTableCell-root': { bgcolor: '#f8fafc', borderColor: '#315a9a' }, '& .MuiTableBody-root .MuiTableRow-root:nth-of-type(odd)': { bgcolor: '#eef2ff' } }}>
    <TableHead><TableRow>
      <HeaderCell rowSpan={2} align="center">Action</HeaderCell><HeaderCell colSpan={3} align="center">INVOICE</HeaderCell><HeaderCell colSpan={2} align="center">MASTER AIR</HeaderCell><HeaderCell colSpan={2} align="center">FOREIGN AGENT</HeaderCell><HeaderCell rowSpan={2}>Origin</HeaderCell><HeaderCell rowSpan={2}>Destination</HeaderCell><HeaderCell rowSpan={2}>Curr.</HeaderCell><HeaderCell colSpan={2} align="center">AMOUNTS</HeaderCell><HeaderCell colSpan={3} align="center">STATUS</HeaderCell>
    </TableRow><TableRow>
      <HeaderCell>No.</HeaderCell><HeaderCell>Date</HeaderCell><HeaderCell>Branch</HeaderCell><HeaderCell>Job</HeaderCell><HeaderCell>Air Waybill No.</HeaderCell><HeaderCell>Code</HeaderCell><HeaderCell>Description</HeaderCell><HeaderCell align="right">Foreign</HeaderCell><HeaderCell align="right">PKR</HeaderCell><HeaderCell>Final</HeaderCell><HeaderCell>Post</HeaderCell><HeaderCell>Void</HeaderCell>
    </TableRow><TableRow>
      <TableCell /><TableCell><GridFilter value={filters.documentNo ?? ''} onChange={(v) => setFilter('documentNo', v)} placeholder="No." /></TableCell><TableCell><GridFilter type="date" value={filters.documentDate ?? ''} onChange={(v) => setFilter('documentDate', v)} placeholder="Date" /></TableCell><TableCell><GridFilter value={filters.branch ?? ''} onChange={(v) => setFilter('branch', v)} placeholder="Branch" options={uniqueValues(rows.map((i) => i.branch))} /></TableCell><TableCell><GridFilter value={filters.job ?? ''} onChange={(v) => setFilter('job', v)} placeholder="Job" options={uniqueValues(rows.map((i) => i.mawbJobNo))} /></TableCell><TableCell><GridFilter value={filters.mawb ?? ''} onChange={(v) => setFilter('mawb', v)} placeholder="MAWB" options={uniqueValues(rows.map((i) => i.mawbNo))} /></TableCell><TableCell><GridFilter value={filters.agentCode ?? ''} onChange={(v) => setFilter('agentCode', v)} placeholder="Code" options={uniqueValues(rows.map((i) => i.fAgentCode))} /></TableCell><TableCell><GridFilter value={filters.agentName ?? ''} onChange={(v) => setFilter('agentName', v)} placeholder="Description" /></TableCell><TableCell><GridFilter value={filters.origin ?? ''} onChange={(v) => setFilter('origin', v)} placeholder="Origin" options={uniqueValues(rows.map((i) => i.origin))} /></TableCell><TableCell><GridFilter value={filters.destination ?? ''} onChange={(v) => setFilter('destination', v)} placeholder="Destination" options={uniqueValues(rows.map((i) => i.destination))} /></TableCell><TableCell><GridFilter value={filters.currency ?? ''} onChange={(v) => setFilter('currency', v)} placeholder="Curr." options={uniqueValues(rows.map((i) => i.currencyCode))} /></TableCell><TableCell><GridFilter type="number" value={filters.foreign ?? ''} onChange={(v) => setFilter('foreign', v)} placeholder="Foreign" /></TableCell><TableCell><GridFilter type="number" value={filters.pkr ?? ''} onChange={(v) => setFilter('pkr', v)} placeholder="PKR" /></TableCell><TableCell><GridFilter value={filters.final ?? ''} onChange={(v) => setFilter('final', v)} placeholder="Final" options={['Y', 'N']} /></TableCell><TableCell><GridFilter value={filters.post ?? ''} onChange={(v) => setFilter('post', v)} placeholder="Post" options={['Y', 'N']} /></TableCell><TableCell><GridFilter value={filters.void ?? ''} onChange={(v) => setFilter('void', v)} placeholder="Void" options={['Y', 'N']} /></TableCell>
    </TableRow></TableHead>
    <TableBody>{filteredRows.length === 0 ? <TableRow><TableCell colSpan={16} align="center" sx={{ py: 3 }}><Typography variant="body2" color="text.secondary">No invoices match the selected filters</Typography></TableCell></TableRow> : paginatedRows.map((invoice) => <TableRow key={invoice.id} hover>
      <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}><Tooltip title="Open"><IconButton size="small" color="primary" onClick={() => onOpen(invoice)}><VisibilityOutlinedIcon fontSize="small" /></IconButton></Tooltip><Tooltip title="Edit"><span><IconButton size="small" color="primary" disabled={invoice.status.final} onClick={() => onEdit(invoice)}><EditOutlinedIcon fontSize="small" /></IconButton></span></Tooltip><Tooltip title="Print"><IconButton size="small" color="primary" onClick={() => onPrint(invoice)}><PrintOutlinedIcon fontSize="small" /></IconButton></Tooltip><Tooltip title="Delete"><span><IconButton size="small" color="error" disabled={invoice.status.final} onClick={() => confirmDelete(() => onDelete(invoice))}><DeleteOutlineIcon fontSize="small" /></IconButton></span></Tooltip></TableCell>
      <TableCell>{invoice.documentNo}</TableCell><TableCell>{invoice.documentDate}</TableCell><TableCell>{invoice.branch}</TableCell><TableCell>{invoice.mawbJobNo || '—'}</TableCell><TableCell>{invoice.mawbNo || '—'}</TableCell><TableCell>{invoice.fAgentCode || '—'}</TableCell><TableCell>{invoice.fAgentName || '—'}</TableCell><TableCell>{invoice.origin || '—'}</TableCell><TableCell>{invoice.destination || '—'}</TableCell><TableCell>{invoice.currencyCode || '—'}</TableCell><TableCell align="right">{invoice.totalSelling.toFixed(2)}</TableCell><TableCell align="right">{invoice.totalInvoiceAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell><TableCell align="center">{invoice.status.final ? 'Y' : 'N'}</TableCell><TableCell align="center">{invoice.status.posted ? 'Y' : 'N'}</TableCell><TableCell align="center">{invoice.status.void ? 'Y' : 'N'}</TableCell>
    </TableRow>)}</TableBody>
  </Table><TablePagination component="div" count={filteredRows.length} page={page} onPageChange={(_, nextPage) => setPage(nextPage)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(event) => { setRowsPerPage(Number(event.target.value)); setPage(0); }} rowsPerPageOptions={[5, 10, 25, 50]} labelRowsPerPage="Rows per page" /></TableContainer>;
}
