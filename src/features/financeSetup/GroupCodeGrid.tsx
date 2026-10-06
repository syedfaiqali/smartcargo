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
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TablePagination from '@mui/material/TablePagination';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { GroupCode } from '../../domain/finance';
import { groupCodeRepo } from '../../data/financeSetupService';
import { themeColors } from '../../theme/themeColors';

export const GROUP_TYPE_OPTIONS = [
  { value: 'ASSET', label: 'Asset' },
  { value: 'LIABILITY', label: 'Liability' },
  { value: 'INCOME', label: 'Income' },
  { value: 'EXPENSE', label: 'Expense' },
  { value: 'EQUITY', label: 'Equity' },
];

const typeLabel = (value: string) => GROUP_TYPE_OPTIONS.find((o) => o.value === value)?.label ?? value;

interface GroupCodeGridProps {
  version: number;
  onChange: () => void;
  onEdit: (item: GroupCode) => void;
  onView: (item: GroupCode) => void;
}

export function GroupCodeGrid({ version, onChange, onEdit, onView }: GroupCodeGridProps) {
  const rows = groupCodeRepo.list();

  const [codeFilter, setCodeFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredRows = useMemo(() => {
    const code = codeFilter.trim().toLowerCase();
    const name = nameFilter.trim().toLowerCase();
    return rows.filter(
      (row) =>
        (!code || row.code.toLowerCase().includes(code)) &&
        (!name || row.name.toLowerCase().includes(name)) &&
        (!typeFilter || row.type === typeFilter)
    );
  }, [rows, codeFilter, nameFilter, typeFilter]);

  const paginatedRows = filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleDelete = (id: string) => {
    groupCodeRepo.remove(id);
    onChange();
  };

  const resetPage = () => setPage(0);

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
          Group Codes
        </Typography>
        <Typography variant="caption" color="text.secondary">{filteredRows.length} record(s)</Typography>
      </Box>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>Code</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
            <TableCell align="right" sx={{ width: 90, fontWeight: 700 }}>Action</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <TextField size="small" value={codeFilter} onChange={(e) => { setCodeFilter(e.target.value); resetPage(); }} placeholder="Filter Code" fullWidth />
            </TableCell>
            <TableCell>
              <TextField size="small" value={nameFilter} onChange={(e) => { setNameFilter(e.target.value); resetPage(); }} placeholder="Filter Name" fullWidth />
            </TableCell>
            <TableCell>
              <TextField select size="small" value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); resetPage(); }} fullWidth SelectProps={{ displayEmpty: true }}>
                <MenuItem value="">All</MenuItem>
                {GROUP_TYPE_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </TextField>
            </TableCell>
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
                <TableCell>{row.code}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{typeLabel(row.type)}</TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={0.25} justifyContent="flex-end">
                    <IconButton size="small" onClick={() => onView(row)}>
                      <VisibilityOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => onEdit(row)}>
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(row.id)}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </TableCell>
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
