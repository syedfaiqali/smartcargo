import { confirmDelete } from '../../components/deleteConfirmation';
import { useMemo, useState } from 'react';
import Paper from '@mui/material/Paper';
import { IconButton, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField } from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import { SeaForeignAgentInvoice } from '../../domain/seaForeignAgentInvoice';

type Props = {
  items: SeaForeignAgentInvoice[];
  onOpen: (item: SeaForeignAgentInvoice) => void;
  onEdit: (item: SeaForeignAgentInvoice) => void;
  onDelete: (item: SeaForeignAgentInvoice) => void;
  onPrint: (item: SeaForeignAgentInvoice) => void;
};

const columns = ['No.', 'Date', 'Branch', 'Job', 'BL', 'Code', 'Description', 'Origin', 'Destination', 'Curr.', 'Foreign', 'PKR', 'Final', 'Post', 'Void'];

export function SeaAgentGrid({ items, onOpen, onEdit, onDelete, onPrint }: Props) {
  const [filters, setFilters] = useState<Record<number, string>>({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const values = (item: SeaForeignAgentInvoice) => [
    item.documentNo, item.documentDate, item.branch, item.jobNo, item.mblNo,
    item.fAgentCode, item.fAgentName, item.origin, item.destination, item.currencyCode,
    item.totalSelling, item.totalInvoiceAmount, item.status.final ? 'Y' : 'N',
    item.status.posted ? 'Y' : 'N', item.status.void ? 'Y' : 'N',
  ].map((value) => String(value ?? ''));
  const filteredRows = useMemo(
    () => items.filter((item) => values(item).every((value, index) => value.toLowerCase().includes((filters[index] ?? '').toLowerCase()))),
    [items, filters],
  );
  const visibleRows = filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const updateFilter = (index: number, value: string) => {
    setFilters((current) => ({ ...current, [index]: value }));
    setPage(0);
  };

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small" sx={{ minWidth: 1720 }}>
        <TableHead>
          <TableRow>
            <TableCell rowSpan={2}>Action</TableCell>
            <TableCell colSpan={2} align="center">INVOICE</TableCell>
            <TableCell rowSpan={2}>Branch</TableCell>
            <TableCell colSpan={2} align="center">MASTER NO.</TableCell>
            <TableCell colSpan={2} align="center">FOREIGN AGENT</TableCell>
            <TableCell rowSpan={2}>Origin</TableCell>
            <TableCell rowSpan={2}>Destination</TableCell>
            <TableCell rowSpan={2}>Curr.</TableCell>
            <TableCell colSpan={2} align="center">AMOUNTS</TableCell>
            <TableCell colSpan={3} align="center">STATUS</TableCell>
          </TableRow>
          <TableRow>{columns.filter((_, index) => ![2, 7, 8, 9].includes(index)).map((column) => <TableCell key={column}>{column}</TableCell>)}</TableRow>
          <TableRow>
            <TableCell />
            {columns.map((column, index) => (
              <TableCell key={column}>
                <TextField
                  size="small"
                  fullWidth
                  select={index >= 12}
                  type={column === 'Date' ? 'date' : 'text'}
                  placeholder={column}
                  value={filters[index] ?? ''}
                  onChange={(event) => updateFilter(index, event.target.value)}
                  inputProps={{ 'aria-label': `Filter ${column}` }}
                >
                  {index >= 12 && [
                    <MenuItem key="all" value="">All</MenuItem>,
                    <MenuItem key="yes" value="Y">Y</MenuItem>,
                    <MenuItem key="no" value="N">N</MenuItem>,
                  ]}
                </TextField>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {visibleRows.length === 0 ? (
            <TableRow><TableCell colSpan={16} align="center">No data available in table</TableCell></TableRow>
          ) : visibleRows.map((item) => (
            <TableRow key={item.id} hover>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>
                <IconButton size="small" aria-label="View invoice" onClick={() => onOpen(item)}><VisibilityOutlinedIcon fontSize="small" /></IconButton>
                <IconButton size="small" aria-label="Edit invoice" onClick={() => onEdit(item)}><EditOutlinedIcon fontSize="small" /></IconButton>
                <IconButton size="small" aria-label="Delete invoice" color="error" onClick={() => confirmDelete(() => onDelete(item))}><DeleteOutlineIcon fontSize="small" /></IconButton>
                <IconButton size="small" aria-label="Print invoice" onClick={() => onPrint(item)}><PrintOutlinedIcon fontSize="small" /></IconButton>
              </TableCell>
              {values(item).map((value, index) => <TableCell key={`${item.id}-${columns[index]}`}>{value || '—'}</TableCell>)}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={filteredRows.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(_, nextPage) => setPage(nextPage)}
        onRowsPerPageChange={(event) => { setRowsPerPage(Number(event.target.value)); setPage(0); }}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    </TableContainer>
  );
}
