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

export function SeaImportRefundGrid({ refunds, onOpen, onEdit, onDelete, onPrint }: SeaImportRefundGridProps) {
  const rows = [...refunds].sort((a, b) => b.date.localeCompare(a.date) || b.documentNo.localeCompare(a.documentNo));

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
            rows.map((refund) => (
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
    </TableContainer>
  );
}
