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
import { SubAgentParty } from '../../domain/masterData';
import { subAgentPartyRepo } from '../../data/masterDataService';
import { themeColors } from '../../theme/themeColors';

interface SubAgentPartyGridProps {
  version: number;
  onChange: () => void;
  onEdit: (item: SubAgentParty) => void;
  onView: (item: SubAgentParty) => void;
}

export function SubAgentPartyGrid({ version, onChange, onEdit, onView }: SubAgentPartyGridProps) {
  const rows = subAgentPartyRepo.list();

  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredRows = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => row.code.toLowerCase().includes(q) || row.name.toLowerCase().includes(q));
  }, [rows, filter]);

  const paginatedRows = filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleDelete = (id: string) => {
    subAgentPartyRepo.remove(id);
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
          Sub-Agent Parties
        </Typography>
        <Typography variant="caption" color="text.secondary">{filteredRows.length} record(s)</Typography>
      </Box>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell align="center" sx={{ width: 90, fontWeight: 700 }}>Action</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Code</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Phone No.</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Contact Person</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
          </TableRow>
          <TableRow>
            <TableCell />
            <TableCell colSpan={2}>
              <TextField size="small" value={filter} onChange={(e) => { setFilter(e.target.value); setPage(0); }} placeholder="Filter Code / Name" fullWidth />
            </TableCell>
            <TableCell colSpan={3} />
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredRows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center">
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
                <TableCell>{row.code}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.phoneNo}</TableCell>
                <TableCell>{row.contactPerson}</TableCell>
                <TableCell>{row.email}</TableCell>
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
