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
import { SeaImportRefundFromShippingLines } from '../../domain/seaImportRefundFromShippingLines';

interface SeaImportRefundGridProps {
  refunds: SeaImportRefundFromShippingLines[];
  onOpen: (refund: SeaImportRefundFromShippingLines) => void;
  onEdit: (refund: SeaImportRefundFromShippingLines) => void;
  onDelete: (refund: SeaImportRefundFromShippingLines) => void;
  onPrint: (refund: SeaImportRefundFromShippingLines) => void;
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

export function SeaImportRefundGrid({ refunds, onOpen, onEdit, onDelete, onPrint }: SeaImportRefundGridProps) {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const rows = [...refunds].sort((a, b) => b.date.localeCompare(a.date) || b.documentNo.localeCompare(a.documentNo));
  const uniqueValues = (values: string[]) => Array.from(new Set(values.filter(Boolean))).sort();
  const branches = uniqueValues(rows.map((r) => r.branch));
  const jobNos = uniqueValues(rows.map((r) => r.jobNo));
  const mblNos = uniqueValues(rows.map((r) => r.mblNo));
  const hblNos = uniqueValues(rows.map((r) => r.hblNo));
  const sLineAgents = uniqueValues(rows.map((r) => r.sLineAgent));
  const currencies = uniqueValues(rows.map((r) => r.currency));

  const setFilter = (key: string, value: string) => { setFilters((current) => ({ ...current, [key]: value })); setPage(0); };
  const matches = (value: string | number, key: string) => String(value).toLowerCase().includes((filters[key] ?? '').toLowerCase());
  const filteredRows = rows.filter((r) =>
    matches(r.documentNo, 'documentNo') && matches(r.date, 'date') && matches(r.branch, 'branch') &&
    matches(r.jobNo, 'jobNo') && matches(r.mblNo, 'mblNo') && matches(r.hblNo, 'hblNo') &&
    matches(r.sLineAgent, 'sLineAgent') && matches(r.currency, 'currency') &&
    matches(r.status.final ? 'Y' : 'N', 'final') && matches('N', 'posted')
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
            <HeaderCell colSpan={3} align="center" sortable={false}>DOCUMENT</HeaderCell>
            <HeaderCell rowSpan={2}>Job No.</HeaderCell>
            <HeaderCell rowSpan={2}>Mbl No.</HeaderCell>
            <HeaderCell rowSpan={2}>Hbl No.</HeaderCell>
            <HeaderCell rowSpan={2}>Shipping Line Agent</HeaderCell>
            <HeaderCell rowSpan={2}>Curr.</HeaderCell>
            <HeaderCell colSpan={2} align="center" sortable={false}>AMOUNTS</HeaderCell>
            <HeaderCell colSpan={2} align="center" sortable={false}>STATUS</HeaderCell>
          </TableRow>
          <TableRow>
            <HeaderCell>No.</HeaderCell>
            <HeaderCell>Date</HeaderCell>
            <HeaderCell>Branch</HeaderCell>
            <HeaderCell>Foreign</HeaderCell>
            <HeaderCell>PKR</HeaderCell>
            <HeaderCell>Final</HeaderCell>
            <HeaderCell>Posted</HeaderCell>
          </TableRow>
          <TableRow>
            <TableCell />
            <TableCell><GridFilter value={filters.documentNo ?? ''} onChange={(v) => setFilter('documentNo', v)} placeholder="No." /></TableCell>
            <TableCell><GridFilter value={filters.date ?? ''} onChange={(v) => setFilter('date', v)} placeholder="Date" type="date" /></TableCell>
            <TableCell><GridFilter value={filters.branch ?? ''} onChange={(v) => setFilter('branch', v)} placeholder="Branch" options={branches} /></TableCell>
            <TableCell><GridFilter value={filters.jobNo ?? ''} onChange={(v) => setFilter('jobNo', v)} placeholder="Job No." options={jobNos} /></TableCell>
            <TableCell><GridFilter value={filters.mblNo ?? ''} onChange={(v) => setFilter('mblNo', v)} placeholder="Mbl No." options={mblNos} /></TableCell>
            <TableCell><GridFilter value={filters.hblNo ?? ''} onChange={(v) => setFilter('hblNo', v)} placeholder="Hbl No." options={hblNos} /></TableCell>
            <TableCell><GridFilter value={filters.sLineAgent ?? ''} onChange={(v) => setFilter('sLineAgent', v)} placeholder="Agent" options={sLineAgents} /></TableCell>
            <TableCell><GridFilter value={filters.currency ?? ''} onChange={(v) => setFilter('currency', v)} placeholder="Curr." options={currencies} /></TableCell>
            <TableCell />
            <TableCell />
            <TableCell><GridFilter value={filters.final ?? ''} onChange={(v) => setFilter('final', v)} placeholder="Final" options={['Y', 'N']} /></TableCell>
            <TableCell><GridFilter value={filters.posted ?? ''} onChange={(v) => setFilter('posted', v)} placeholder="Posted" options={['Y', 'N']} /></TableCell>
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
            paginatedRows.map((refund) => (
              <TableRow key={refund.id} hover>
                <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                  <Tooltip title="Open"><IconButton size="small" color="primary" onClick={() => onOpen(refund)}><VisibilityOutlinedIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Edit"><span><IconButton size="small" color="primary" disabled={refund.status.final} onClick={() => onEdit(refund)}><EditOutlinedIcon fontSize="small" /></IconButton></span></Tooltip>
                  <Tooltip title="Delete"><span><IconButton size="small" color="error" disabled={refund.status.final} onClick={() => onDelete(refund)}><DeleteOutlineIcon fontSize="small" /></IconButton></span></Tooltip>
                  <Tooltip title="Print"><IconButton size="small" color="primary" onClick={() => onPrint(refund)}><PrintOutlinedIcon fontSize="small" /></IconButton></Tooltip>
                </TableCell>
                <TableCell>{refund.documentNo}</TableCell>
                <TableCell>{refund.date}</TableCell>
                <TableCell>{refund.branch}</TableCell>
                <TableCell>{refund.jobNo || '—'}</TableCell>
                <TableCell>{refund.mblNo || '—'}</TableCell>
                <TableCell>{refund.hblNo || '—'}</TableCell>
                <TableCell>{refund.sLineAgent || '—'}</TableCell>
                <TableCell>{refund.currency || '—'}</TableCell>
                <TableCell align="right">{refund.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                <TableCell align="right">{(refund.totalAmount * (refund.exRate || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                <TableCell align="center">{refund.status.final ? 'Y' : 'N'}</TableCell>
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
