import { confirmDelete } from '../../components/deleteConfirmation';
import { useMemo, useState } from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TablePagination from '@mui/material/TablePagination';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { ContainerType } from '../../domain/masterData';
import { containerTypeRepo } from '../../data/masterDataService';
import { themeColors } from '../../theme/themeColors';

interface ContainerTypeGridProps {
  version: number;
  onChange: () => void;
  onEdit: (item: ContainerType) => void;
  onView: (item: ContainerType) => void;
}

export function ContainerTypeGrid({ version, onChange, onEdit, onView }: ContainerTypeGridProps) {
  const rows = containerTypeRepo.list();

  const [sizeFilter, setSizeFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredRows = useMemo(() => {
    const q = sizeFilter.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => row.size.toLowerCase().includes(q) || row.containerType.toLowerCase().includes(q));
  }, [rows, sizeFilter]);

  const paginatedRows = filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleDelete = (id: string) => {
    containerTypeRepo.remove(id);
    onChange();
  };

  return (
    <Paper variant="outlined" sx={{ overflow: 'hidden' }} key={version}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 1.5,
          py: 1,
          borderBottom: `1px solid ${themeColors.border}`,
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          Container Types
        </Typography>
        <Typography variant="caption" color="text.secondary">{filteredRows.length} record(s)</Typography>
      </Box>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell align="center" rowSpan={2} sx={{ width: 90, fontWeight: 700 }}>Action</TableCell>
            <TableCell align="center" colSpan={2} sx={{ fontWeight: 700, borderLeft: `1px solid ${themeColors.border}` }}>Container</TableCell>
            <TableCell align="center" rowSpan={2} sx={{ fontWeight: 700, borderLeft: `1px solid ${themeColors.border}` }}>No. of Teus</TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, borderLeft: `1px solid ${themeColors.border}` }}>Size</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
          </TableRow>
          <TableRow>
            <TableCell />
            <TableCell sx={{ borderLeft: `1px solid ${themeColors.border}` }}>
              <TextField size="small" value={sizeFilter} onChange={(e) => { setSizeFilter(e.target.value); setPage(0); }} placeholder="Filter Size / Type" fullWidth />
            </TableCell>
            <TableCell />
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredRows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} align="center">
                <Typography variant="body2" sx={{ color: themeColors.textSecondary, py: 2 }}>
                  No records yet — use New to create one.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            paginatedRows.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell align="center">
                  <Stack direction="row" spacing={0.25} justifyContent="center">
                    <IconButton size="small" onClick={() => onView(row)}>
                      <VisibilityOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => onEdit(row)}>
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => confirmDelete(() => handleDelete(row.id))}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </TableCell>
                <TableCell sx={{ borderLeft: `1px solid ${themeColors.border}` }}>{row.size}</TableCell>
                <TableCell>{row.containerType}</TableCell>
                <TableCell sx={{ borderLeft: `1px solid ${themeColors.border}` }}>{row.teus}</TableCell>
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
        rowsPerPageOptions={[10, 25, 50, 100]}
        labelRowsPerPage="Rows per page"
      />
    </Paper>
  );
}
