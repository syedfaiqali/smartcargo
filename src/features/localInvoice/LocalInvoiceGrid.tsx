import { useState } from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import TableSortLabel from '@mui/material/TableSortLabel';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import TablePagination from '@mui/material/TablePagination';
import MenuItem from '@mui/material/MenuItem';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { LocalInvoice } from '../../domain/localInvoice';
import { ownerRepo } from '../../data/masterDataService';

interface LocalInvoiceGridProps {
  invoices: LocalInvoice[];
  onOpenInvoice: (invoice: LocalInvoice) => void;
  onEditInvoice: (invoice: LocalInvoice) => void;
  onPrintInvoice: (invoice: LocalInvoice) => void;
  onDeleteInvoice: (invoice: LocalInvoice) => void;
}

function HeaderCell({ children, ...props }: React.ComponentProps<typeof TableCell>) {
  return (
    <TableCell {...props} sx={{ fontWeight: 700, whiteSpace: 'nowrap', ...props.sx }}>
      {children}
    </TableCell>
  );
}

function SortHeader({ children }: { children: React.ReactNode }) {
  return <TableSortLabel direction="asc">{children}</TableSortLabel>;
}

function GridFilter({
  value,
  onChange,
  placeholder,
  type = 'text',
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: 'text' | 'date' | 'number';
  options?: string[];
}) {
  if (options) {
    return (
      <TextField
        select
        size="small"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        SelectProps={{ displayEmpty: true }}
        inputProps={{ 'aria-label': `${placeholder} filter` }}
        sx={{ minWidth: 82, '& .MuiSelect-select': { fontSize: 12, py: 0.55 } }}
      >
        <MenuItem value=""><em>All</em></MenuItem>
        {options.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
      </TextField>
    );
  }

  return (
    <TextField
      size="small"
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      inputProps={{ 'aria-label': `${placeholder} filter` }}
      sx={{ minWidth: 72, '& .MuiInputBase-input': { fontSize: 12, py: 0.55 } }}
    />
  );
}

export function LocalInvoiceGrid({ invoices, onOpenInvoice, onEditInvoice, onPrintInvoice, onDeleteInvoice }: LocalInvoiceGridProps) {
  const owners = ownerRepo.list();
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const rows = [...invoices].sort((a, b) => b.invoiceDate.localeCompare(a.invoiceDate) || b.invoiceNo.localeCompare(a.invoiceNo));
  const uniqueValues = (values: string[]) => Array.from(new Set(values.filter(Boolean))).sort();
  const branches = uniqueValues(rows.map((invoice) => invoice.branch));
  const hawbNos = uniqueValues(rows.map((invoice) => invoice.house.awbNo));
  const hawbJobNos = uniqueValues(rows.map((invoice) => invoice.house.jobNo));
  const mawbNos = uniqueValues(rows.map((invoice) => invoice.master.awbNo));
  const mawbJobNos = uniqueValues(rows.map((invoice) => invoice.master.jobNo));
  const ownerNames = uniqueValues(rows.map((invoice) => owners.find((owner) => owner.code === invoice.ownerCode)?.name ?? invoice.ownerCode));
  const partyCodes = uniqueValues(rows.map((invoice) => invoice.partyCode));
  const partyNames = uniqueValues(rows.map((invoice) => invoice.partyName));
  const airports = uniqueValues(rows.map((invoice) => invoice.airportOfDeparture));
  const destinations = uniqueValues(rows.map((invoice) => invoice.destination));
  const setFilter = (key: string, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(0);
  };
  const matches = (value: string | number, key: string) => String(value).toLowerCase().includes((filters[key] ?? '').toLowerCase());
  const filteredRows = rows.filter((invoice) => {
    const ownerName = owners.find((owner) => owner.code === invoice.ownerCode)?.name ?? invoice.ownerCode;
    const chargeWeight = invoice.invoiceLines.reduce((total, line) => total + (line.chWeight || 0), 0);
    return (
      matches(invoice.invoiceNo, 'invoiceNo') && matches(invoice.invoiceDate, 'invoiceDate') && matches(invoice.branch, 'branch') &&
      matches(invoice.house.awbNo, 'hawbNo') && matches(invoice.house.jobNo, 'hawbJobNo') && matches(invoice.master.awbNo, 'mawbNo') &&
      matches(invoice.master.jobNo, 'mawbJobNo') && matches(ownerName, 'ownerName') && matches(invoice.consignee, 'consignee') &&
      matches(invoice.partyCode, 'partyCode') && matches(invoice.partyName, 'partyName') && matches(invoice.airportOfDeparture, 'airport') &&
      matches(invoice.destination, 'destination') && matches(chargeWeight, 'chargeWeight') && matches(invoice.invoiceTotal, 'invoiceTotal') &&
      matches(invoice.status.final ? 'Y' : 'N', 'final') && matches(invoice.status.posted ? 'Y' : 'N', 'post') && matches(invoice.status.void ? 'Y' : 'N', 'void')
    );
  });
  const paginatedRows = filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 'calc(100vh - 230px)' }}>
      <Table
        stickyHeader
        size="small"
        sx={{
          minWidth: 1650,
          '& .MuiTableCell-root': { borderRight: '1px solid #d7dee8', py: 0.75, px: 1 },
          '& .MuiTableCell-root:last-child': { borderRight: 0 },
          '& .MuiTableHead-root .MuiTableCell-root': { bgcolor: '#f8fafc', borderColor: '#315a9a' },
          '& .MuiTableBody-root .MuiTableRow-root:nth-of-type(odd)': { bgcolor: '#eef2ff' },
        }}
      >
        <TableHead>
          <TableRow>
            <HeaderCell rowSpan={2} align="center">Action</HeaderCell>
            <HeaderCell colSpan={3} align="center">INVOICE</HeaderCell>
            <HeaderCell colSpan={2} align="center">HAWB</HeaderCell>
            <HeaderCell colSpan={2} align="center">MAWB</HeaderCell>
            <HeaderCell rowSpan={2}>Owner Name</HeaderCell>
            <HeaderCell rowSpan={2}>Consignee</HeaderCell>
            <HeaderCell colSpan={2} align="center">PARTY</HeaderCell>
            <HeaderCell rowSpan={2}>Airport of<br />Departure</HeaderCell>
            <HeaderCell rowSpan={2}>Destination</HeaderCell>
            <HeaderCell rowSpan={2} align="right">Chg.<br />Wt.</HeaderCell>
            <HeaderCell rowSpan={2} align="right">Invoice Total PKR</HeaderCell>
            <HeaderCell colSpan={3} align="center">STATUS</HeaderCell>
          </TableRow>
          <TableRow>
            <HeaderCell><SortHeader>No.</SortHeader></HeaderCell>
            <HeaderCell><SortHeader>Date</SortHeader></HeaderCell>
            <HeaderCell><SortHeader>Branch</SortHeader></HeaderCell>
            <HeaderCell><SortHeader>No.</SortHeader></HeaderCell>
            <HeaderCell><SortHeader>Job No.</SortHeader></HeaderCell>
            <HeaderCell><SortHeader>No.</SortHeader></HeaderCell>
            <HeaderCell><SortHeader>Job No.</SortHeader></HeaderCell>
            <HeaderCell><SortHeader>Code</SortHeader></HeaderCell>
            <HeaderCell><SortHeader>Name</SortHeader></HeaderCell>
            <HeaderCell><SortHeader>Final</SortHeader></HeaderCell>
            <HeaderCell><SortHeader>Post</SortHeader></HeaderCell>
            <HeaderCell><SortHeader>Void</SortHeader></HeaderCell>
          </TableRow>
          <TableRow>
            <TableCell />
            <TableCell><GridFilter value={filters.invoiceNo ?? ''} onChange={(value) => setFilter('invoiceNo', value)} placeholder="No." /></TableCell>
            <TableCell><GridFilter value={filters.invoiceDate ?? ''} onChange={(value) => setFilter('invoiceDate', value)} placeholder="Date" type="date" /></TableCell>
            <TableCell><GridFilter value={filters.branch ?? ''} onChange={(value) => setFilter('branch', value)} placeholder="Branch" options={branches} /></TableCell>
            <TableCell><GridFilter value={filters.hawbNo ?? ''} onChange={(value) => setFilter('hawbNo', value)} placeholder="No." options={hawbNos} /></TableCell>
            <TableCell><GridFilter value={filters.hawbJobNo ?? ''} onChange={(value) => setFilter('hawbJobNo', value)} placeholder="Job No." options={hawbJobNos} /></TableCell>
            <TableCell><GridFilter value={filters.mawbNo ?? ''} onChange={(value) => setFilter('mawbNo', value)} placeholder="No." options={mawbNos} /></TableCell>
            <TableCell><GridFilter value={filters.mawbJobNo ?? ''} onChange={(value) => setFilter('mawbJobNo', value)} placeholder="Job No." options={mawbJobNos} /></TableCell>
            <TableCell><GridFilter value={filters.ownerName ?? ''} onChange={(value) => setFilter('ownerName', value)} placeholder="Owner" options={ownerNames} /></TableCell>
            <TableCell><GridFilter value={filters.consignee ?? ''} onChange={(value) => setFilter('consignee', value)} placeholder="Consignee" /></TableCell>
            <TableCell><GridFilter value={filters.partyCode ?? ''} onChange={(value) => setFilter('partyCode', value)} placeholder="Code" options={partyCodes} /></TableCell>
            <TableCell><GridFilter value={filters.partyName ?? ''} onChange={(value) => setFilter('partyName', value)} placeholder="Name" options={partyNames} /></TableCell>
            <TableCell><GridFilter value={filters.airport ?? ''} onChange={(value) => setFilter('airport', value)} placeholder="Airport" options={airports} /></TableCell>
            <TableCell><GridFilter value={filters.destination ?? ''} onChange={(value) => setFilter('destination', value)} placeholder="Destination" options={destinations} /></TableCell>
            <TableCell><GridFilter value={filters.chargeWeight ?? ''} onChange={(value) => setFilter('chargeWeight', value)} placeholder="Wt." type="number" /></TableCell>
            <TableCell><GridFilter value={filters.invoiceTotal ?? ''} onChange={(value) => setFilter('invoiceTotal', value)} placeholder="PKR" type="number" /></TableCell>
            <TableCell><GridFilter value={filters.final ?? ''} onChange={(value) => setFilter('final', value)} placeholder="Final" options={['Y', 'N']} /></TableCell>
            <TableCell><GridFilter value={filters.post ?? ''} onChange={(value) => setFilter('post', value)} placeholder="Post" options={['Y', 'N']} /></TableCell>
            <TableCell><GridFilter value={filters.void ?? ''} onChange={(value) => setFilter('void', value)} placeholder="Void" options={['Y', 'N']} /></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredRows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={19} align="center" sx={{ py: 4 }}>
                <Typography variant="body2" color="text.secondary">No invoices match the selected filters.</Typography>
              </TableCell>
            </TableRow>
          ) : paginatedRows.map((invoice) => {
            const ownerName = owners.find((owner) => owner.code === invoice.ownerCode)?.name ?? invoice.ownerCode;
            const chargeWeight = invoice.invoiceLines.reduce((total, line) => total + (line.chWeight || 0), 0);
            return (
              <TableRow key={invoice.id} hover>
                <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                  <Tooltip title="Open"><IconButton size="small" color="primary" onClick={() => onOpenInvoice(invoice)}><VisibilityOutlinedIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Edit"><span><IconButton size="small" color="primary" disabled={invoice.status.final} onClick={() => onEditInvoice(invoice)}><EditOutlinedIcon fontSize="small" /></IconButton></span></Tooltip>
                  <Tooltip title="Printing"><IconButton size="small" color="primary" onClick={() => onPrintInvoice(invoice)}><PrintOutlinedIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Delete"><span><IconButton size="small" color="error" disabled={invoice.status.final} onClick={() => onDeleteInvoice(invoice)}><DeleteOutlineIcon fontSize="small" /></IconButton></span></Tooltip>
                </TableCell>
                <TableCell>{invoice.invoiceNo}</TableCell>
                <TableCell>{invoice.invoiceDate}</TableCell>
                <TableCell>{invoice.branch}</TableCell>
                <TableCell>{invoice.house.awbNo || '—'}</TableCell>
                <TableCell>{invoice.house.jobNo || '—'}</TableCell>
                <TableCell>{invoice.master.awbNo || '—'}</TableCell>
                <TableCell>{invoice.master.jobNo || '—'}</TableCell>
                <TableCell>{ownerName || '—'}</TableCell>
                <TableCell>{invoice.consignee || '—'}</TableCell>
                <TableCell>{invoice.partyCode || '—'}</TableCell>
                <TableCell>{invoice.partyName || '—'}</TableCell>
                <TableCell>{invoice.airportOfDeparture || '—'}</TableCell>
                <TableCell>{invoice.destination || '—'}</TableCell>
                <TableCell align="right">{chargeWeight.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                <TableCell align="right">{invoice.invoiceTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                <TableCell align="center">{invoice.status.final ? 'Y' : 'N'}</TableCell>
                <TableCell align="center">{invoice.status.posted ? 'Y' : 'N'}</TableCell>
                <TableCell align="center">{invoice.status.void ? 'Y' : 'N'}</TableCell>
              </TableRow>
            );
          })}
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
