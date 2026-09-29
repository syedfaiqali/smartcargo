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
import { AgentCode } from '../../domain/masterData';
import { agentRepo, countryRepo } from '../../data/masterDataService';
import { themeColors } from '../../theme/themeColors';

interface AgentCodeGridProps {
  version: number;
  onChange: () => void;
  onEdit: (item: AgentCode) => void;
  onView: (item: AgentCode) => void;
}

export function AgentCodeGrid({ version, onChange, onEdit, onView }: AgentCodeGridProps) {
  const rows = agentRepo.list();
  const countries = countryRepo.list();
  const countryName = (code: string) => countries.find((c) => c.code === code)?.name ?? code;

  const [filter, setFilter] = useState('');
  const [kindFilter, setKindFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredRows = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesQuery = !q || row.code.toLowerCase().includes(q) || row.name.toLowerCase().includes(q);
      const matchesKind = !kindFilter || row.kind === kindFilter;
      return matchesQuery && matchesKind;
    });
  }, [rows, filter, kindFilter]);

  const paginatedRows = filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleDelete = (id: string) => {
    agentRepo.remove(id);
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
          Clearing / Delivery Agent Codes
        </Typography>
        <Typography variant="caption" color="text.secondary">{filteredRows.length} record(s)</Typography>
      </Box>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell align="center" sx={{ width: 90, fontWeight: 700 }}>Action</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Code</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Kind</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Country</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Address</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Phone No.</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Contact Person</TableCell>
          </TableRow>
          <TableRow>
            <TableCell />
            <TableCell colSpan={2}>
              <TextField size="small" value={filter} onChange={(e) => { setFilter(e.target.value); setPage(0); }} placeholder="Filter Code / Name" fullWidth />
            </TableCell>
            <TableCell>
              <TextField select size="small" value={kindFilter} onChange={(e) => { setKindFilter(e.target.value); setPage(0); }} fullWidth SelectProps={{ displayEmpty: true }}>
                <MenuItem value="">All</MenuItem>
                <MenuItem value="CLEARING">Clearing</MenuItem>
                <MenuItem value="DELIVERY">Delivery</MenuItem>
              </TextField>
            </TableCell>
            <TableCell colSpan={5} />
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredRows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} align="center">
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
                    <IconButton size="small" color="error" onClick={() => handleDelete(row.id)}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </TableCell>
                <TableCell>{row.code}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.kind === 'CLEARING' ? 'Clearing' : 'Delivery'}</TableCell>
                <TableCell>{row.countryCode ? countryName(row.countryCode) : ''}</TableCell>
                <TableCell>{row.address}</TableCell>
                <TableCell>{row.phoneNo}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>{row.contactPerson}</TableCell>
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
