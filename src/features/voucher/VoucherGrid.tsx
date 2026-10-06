import { useMemo, useState } from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import { Voucher } from '../../domain/voucher';

interface VoucherGridProps {
  vouchers: Voucher[];
  onOpen: (voucher: Voucher) => void;
  onEdit: (voucher: Voucher) => void;
  onDelete: (voucher: Voucher) => void;
  onPrint: (voucher: Voucher) => void;
}

const columns = ['Voc. Date', 'Account Desc.', 'D/C', 'Particulars', 'Analysis Code', 'Cheque No.', 'Cheque Date', 'Cheque Status', 'Curr.', 'Ex. Rate.', 'FC Amount', 'PKR Amount', 'Inv. Amount', 'COST Amount', 'Final', 'Posted', 'Void', 'Check'];

export function VoucherGrid({ vouchers, onOpen, onEdit, onDelete, onPrint }: VoucherGridProps) {
  const [filters, setFilters] = useState<Record<number, string>>({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [globalSearch, setGlobalSearch] = useState('');
  const values = (voucher: Voucher) => {
    // Older persisted vouchers can predate these line collections. Treat a
    // missing collection as empty so the listing remains usable.
    const accountLines = Array.isArray(voucher.accountLines) ? voucher.accountLines : [];
    const clearingLines = Array.isArray(voucher.clearingLines) ? voucher.clearingLines : [];
    const line = accountLines[0];
    const invoiceAmount = clearingLines.reduce((total, item) => total + item.amountCleared, 0);
    const costAmount = accountLines.reduce((total, item) => total + item.amount, 0);
    return [voucher.voucherDate, line?.accountCode || voucher.accountCode || voucher.bankCode || '—', line?.debitCredit || '—', line?.particulars || voucher.remarks || '—', line?.analysis || '—', voucher.chequeNo || '—', voucher.chequeDate || '—', voucher.chequeStatus || '—', voucher.currencyCode, String(voucher.exchangeRate), voucher.amount.toFixed(2), (voucher.amount * voucher.exchangeRate).toFixed(2), invoiceAmount.toFixed(2), costAmount.toFixed(2), voucher.final ? 'Y' : 'N', 'N', 'N', voucher.chequeStatus === 'Cleared' ? 'Y' : 'N'];
  };
  const filtered = useMemo(
    () => [...vouchers]
      .sort((a, b) => b.voucherDate.localeCompare(a.voucherDate) || b.voucherNo.localeCompare(a.voucherNo))
      .filter((voucher) => {
        const row = values(voucher);
        return row.every((value, index) => value.toLowerCase().includes((filters[index] ?? '').toLowerCase()))
          && row.some((value) => value.toLowerCase().includes(globalSearch.toLowerCase()));
      }),
    [vouchers, filters, globalSearch],
  );
  const rows = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const setFilter = (index: number, value: string) => {
    setFilters((current) => ({ ...current, [index]: value }));
    setPage(0);
  };

  return (
    <TableContainer component={Paper} variant="outlined">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, bgcolor: '#f3f4f6', borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="body2" fontWeight={700}>Show All entries</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Typography variant="body2" fontWeight={700}>Search:</Typography><TextField size="small" value={globalSearch} onChange={(event) => { setGlobalSearch(event.target.value); setPage(0); }} sx={{ width: 200 }} /></Box>
      </Box>
      <Table size="small" sx={{ minWidth: 2050, '& .MuiTableCell-root': { borderRight: '1px solid #d7dee8', py: 0.8, px: 1, whiteSpace: 'nowrap' }, '& .MuiTableCell-root:last-child': { borderRight: 0 }, '& .MuiTableHead-root .MuiTableCell-root': { bgcolor: '#f8fafc', borderColor: '#315a9a', fontWeight: 700 }, '& .MuiTableBody-root .MuiTableRow-root:nth-of-type(odd)': { bgcolor: '#eef2ff' } }}>
        <TableHead>
          <TableRow>
            <TableCell align="center" rowSpan={2}>Action</TableCell><TableCell rowSpan={2}>Voc.<br />Date</TableCell><TableCell rowSpan={2}>Account Desc.</TableCell><TableCell rowSpan={2}>D/C</TableCell><TableCell rowSpan={2}>Particulars</TableCell><TableCell rowSpan={2}>Analysis Code</TableCell><TableCell align="center" colSpan={3}>CHEQUE</TableCell><TableCell rowSpan={2}>Curr.</TableCell><TableCell rowSpan={2}>Ex. Rate.</TableCell><TableCell align="center" colSpan={2}>VOUCHER</TableCell><TableCell rowSpan={2}>Inv. Amount</TableCell><TableCell rowSpan={2}>COST Amount</TableCell><TableCell align="center" colSpan={4}>STATUS</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>No.</TableCell><TableCell>Date</TableCell><TableCell>Status</TableCell><TableCell>FC Amount</TableCell><TableCell>PKR Amount</TableCell><TableCell>Final</TableCell><TableCell>Posted</TableCell><TableCell>Void</TableCell><TableCell>Check</TableCell>
          </TableRow>
          <TableRow>
            <TableCell />
            {columns.map((column, index) => (
              <TableCell key={column}>
                <TextField size="small" type={column === 'Voc. Date' || column === 'Cheque Date' ? 'date' : 'text'} value={filters[index] ?? ''} onChange={(event) => setFilter(index, event.target.value)} placeholder={`Search ${column}`} sx={{ minWidth: 76, '& .MuiInputBase-input': { fontSize: 12, py: 0.55 } }} />
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow><TableCell colSpan={19} align="center" sx={{ py: 3 }}><Typography variant="body2" color="text.secondary">No vouchers match the selected filters</Typography></TableCell></TableRow>
          ) : rows.map((voucher) => (
            <TableRow key={voucher.id} hover>
              <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                <Tooltip title="Open"><IconButton size="small" color="primary" onClick={() => onOpen(voucher)}><VisibilityOutlinedIcon fontSize="small" /></IconButton></Tooltip>
                <Tooltip title="Edit"><span><IconButton size="small" color="primary" disabled={voucher.final} onClick={() => onEdit(voucher)}><EditOutlinedIcon fontSize="small" /></IconButton></span></Tooltip>
                <Tooltip title="Print"><IconButton size="small" color="primary" onClick={() => onPrint(voucher)}><PrintOutlinedIcon fontSize="small" /></IconButton></Tooltip>
                <Tooltip title="Delete"><span><IconButton size="small" color="error" disabled={voucher.final} onClick={() => onDelete(voucher)}><DeleteOutlineIcon fontSize="small" /></IconButton></span></Tooltip>
              </TableCell>
              {values(voucher).map((value, index) => <TableCell key={`${voucher.id}-${index}`} align={index === 7 ? 'right' : undefined}>{value || '—'}</TableCell>)}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination component="div" count={filtered.length} page={page} rowsPerPage={rowsPerPage} onPageChange={(_, nextPage) => setPage(nextPage)} onRowsPerPageChange={(event) => { setRowsPerPage(Number(event.target.value)); setPage(0); }} rowsPerPageOptions={[5, 10, 25, 50]} />
    </TableContainer>
  );
}
