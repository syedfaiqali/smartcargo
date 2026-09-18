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

function jobNosOf(payable: SeaImportOtherChargesPayable) {
  return Array.from(new Set(payable.costLines.map((l) => l.jobNo).filter(Boolean))).join(', ');
}

function hblNosOf(payable: SeaImportOtherChargesPayable) {
  return Array.from(new Set(payable.costLines.map((l) => l.hblNo).filter(Boolean))).join(', ');
}

export function SeaImportPayableGrid({ payables, onOpen, onEdit, onDelete, onPrint }: SeaImportPayableGridProps) {
  const rows = [...payables].sort((a, b) => b.date.localeCompare(a.date) || b.creditNoteNo.localeCompare(a.creditNoteNo));

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
        </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={13} align="center" sx={{ py: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  No data available in table
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            rows.map((payable) => (
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
    </TableContainer>
  );
}
