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
import { SeaImportOtherChargesPayable } from '../../domain/seaImportOtherChargesPayable';

interface SeaImportPayableGridProps {
  payables: SeaImportOtherChargesPayable[];
  onOpen: (payable: SeaImportOtherChargesPayable) => void;
  onEdit: (payable: SeaImportOtherChargesPayable) => void;
  onDelete: (payable: SeaImportOtherChargesPayable) => void;
  onPrint: (payable: SeaImportOtherChargesPayable) => void;
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

function jobNosOf(payable: SeaImportOtherChargesPayable) {
  return Array.from(new Set(payable.costLines.map((l) => l.jobNo).filter(Boolean))).join(', ');
}

function hblNosOf(payable: SeaImportOtherChargesPayable) {
  return Array.from(new Set(payable.costLines.map((l) => l.hblNo).filter(Boolean))).join(', ');
}

export function SeaImportPayableGrid({ payables, onOpen, onEdit, onDelete, onPrint }: SeaImportPayableGridProps) {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const rows = [...payables].sort((a, b) => b.date.localeCompare(a.date) || b.creditNoteNo.localeCompare(a.creditNoteNo));
  const uniqueValues = (values: string[]) => Array.from(new Set(values.filter(Boolean))).sort();
  const branches = uniqueValues(rows.map((p) => p.branch));
  const payableTypes = uniqueValues(rows.map((p) => p.payableType));
  const partyCodes = uniqueValues(rows.map((p) => p.partyCode));
  const currencies = uniqueValues(rows.map((p) => p.currencies[0]?.currencyCode ?? ''));

  const setFilter = (key: string, value: string) => { setFilters((current) => ({ ...current, [key]: value })); setPage(0); };
  const matches = (value: string | number, key: string) => String(value).toLowerCase().includes((filters[key] ?? '').toLowerCase());
  const filteredRows = rows.filter((p) =>
    matches(p.creditNoteNo, 'creditNoteNo') && matches(p.date, 'date') && matches(p.branch, 'branch') &&
    matches(p.payableType, 'payableType') && matches(jobNosOf(p), 'jobNos') && matches(hblNosOf(p), 'hblNos') &&
    matches(p.partyCode, 'partyCode') && matches(p.currencies[0]?.currencyCode ?? '', 'currency') &&
    matches(p.billNo, 'billNo') && matches(p.billDate, 'billDate') &&
    matches(p.status.final ? 'Y' : 'N', 'final') && matches('N', 'post')
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
            <HeaderCell rowSpan={2} align="center" sortable={false}>Action</HeaderCell>
            <HeaderCell colSpan={3} align="center" sortable={false}>CREDIT NOTE</HeaderCell>
            <HeaderCell rowSpan={2}>Payable Type</HeaderCell>
            <HeaderCell rowSpan={2}>Job Nos.</HeaderCell>
            <HeaderCell rowSpan={2}>HBL Nos.</HeaderCell>
            <HeaderCell rowSpan={2}>Party Code</HeaderCell>
            <HeaderCell rowSpan={2}>Currency</HeaderCell>
            <HeaderCell rowSpan={2}>Bill No</HeaderCell>
            <HeaderCell rowSpan={2}>Bill Date</HeaderCell>
            <HeaderCell rowSpan={2}>Total Amount (PKR)</HeaderCell>
            <HeaderCell colSpan={2} align="center" sortable={false}>STATUS</HeaderCell>
          </TableRow>
          <TableRow>
            <HeaderCell>No.</HeaderCell>
            <HeaderCell>Date</HeaderCell>
            <HeaderCell>Branch</HeaderCell>
            <HeaderCell>Final</HeaderCell>
            <HeaderCell>Post</HeaderCell>
          </TableRow>
          <TableRow>
            <TableCell />
            <TableCell><GridFilter value={filters.creditNoteNo ?? ''} onChange={(v) => setFilter('creditNoteNo', v)} placeholder="No." /></TableCell>
            <TableCell><GridFilter value={filters.date ?? ''} onChange={(v) => setFilter('date', v)} placeholder="Date" type="date" /></TableCell>
            <TableCell><GridFilter value={filters.branch ?? ''} onChange={(v) => setFilter('branch', v)} placeholder="Branch" options={branches} /></TableCell>
            <TableCell><GridFilter value={filters.payableType ?? ''} onChange={(v) => setFilter('payableType', v)} placeholder="Type" options={payableTypes} /></TableCell>
            <TableCell><GridFilter value={filters.jobNos ?? ''} onChange={(v) => setFilter('jobNos', v)} placeholder="Job No." /></TableCell>
            <TableCell><GridFilter value={filters.hblNos ?? ''} onChange={(v) => setFilter('hblNos', v)} placeholder="HBL No." /></TableCell>
            <TableCell><GridFilter value={filters.partyCode ?? ''} onChange={(v) => setFilter('partyCode', v)} placeholder="Code" options={partyCodes} /></TableCell>
            <TableCell><GridFilter value={filters.currency ?? ''} onChange={(v) => setFilter('currency', v)} placeholder="Curr." options={currencies} /></TableCell>
            <TableCell><GridFilter value={filters.billNo ?? ''} onChange={(v) => setFilter('billNo', v)} placeholder="Bill No." /></TableCell>
            <TableCell><GridFilter value={filters.billDate ?? ''} onChange={(v) => setFilter('billDate', v)} placeholder="Date" type="date" /></TableCell>
            <TableCell />
            <TableCell><GridFilter value={filters.final ?? ''} onChange={(v) => setFilter('final', v)} placeholder="Final" options={['Y', 'N']} /></TableCell>
            <TableCell><GridFilter value={filters.post ?? ''} onChange={(v) => setFilter('post', v)} placeholder="Post" options={['Y', 'N']} /></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredRows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={13} align="center" sx={{ py: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  No data available in table
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            paginatedRows.map((payable) => (
              <TableRow key={payable.id} hover>
                <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                  <Tooltip title="Open"><IconButton size="small" color="primary" onClick={() => onOpen(payable)}><VisibilityOutlinedIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Edit"><span><IconButton size="small" color="primary" disabled={payable.status.final} onClick={() => onEdit(payable)}><EditOutlinedIcon fontSize="small" /></IconButton></span></Tooltip>
                  <Tooltip title="Delete"><span><IconButton size="small" color="error" disabled={payable.status.final} onClick={() => onDelete(payable)}><DeleteOutlineIcon fontSize="small" /></IconButton></span></Tooltip>
                  <Tooltip title="Print"><IconButton size="small" color="primary" onClick={() => onPrint(payable)}><PrintOutlinedIcon fontSize="small" /></IconButton></Tooltip>
                </TableCell>
                <TableCell>{payable.creditNoteNo}</TableCell>
                <TableCell>{payable.date}</TableCell>
                <TableCell>{payable.branch}</TableCell>
                <TableCell>{payable.payableType || '—'}</TableCell>
                <TableCell>{jobNosOf(payable) || '—'}</TableCell>
                <TableCell>{hblNosOf(payable) || '—'}</TableCell>
                <TableCell>{payable.partyCode || '—'}</TableCell>
                <TableCell>{payable.currencies[0]?.currencyCode || '—'}</TableCell>
                <TableCell>{payable.billNo || '—'}</TableCell>
                <TableCell>{payable.billDate || '—'}</TableCell>
                <TableCell align="right">{payable.totalCharges.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                <TableCell align="center">{payable.status.final ? 'Y' : 'N'}</TableCell>
                <TableCell align="center">N</TableCell>
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
