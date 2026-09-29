import { useMemo, useState } from 'react';
import { v4 as uuid } from 'uuid';
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
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TablePagination from '@mui/material/TablePagination';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import { AuditFields } from '../../domain/common';
import { Repository } from '../../data/repository';
import { themeColors } from '../../theme/themeColors';

export interface CodeField<T> {
  key: keyof T;
  label: string;
  group?: string;
  placeholder?: string;
  type?: 'text' | 'number' | 'select';
  options?: { value: string; label: string }[];
  width?: number;
}

interface EditableCodeTableProps<T extends AuditFields> {
  title: string;
  addLabel?: string;
  newEntryMode?: 'inline' | 'dialog';
  showAddButton?: boolean;
  showFilters?: boolean;
  globalSearch?: boolean;
  addFields?: CodeField<T>[];
  onEditRecord?: (item: T) => void;
  fields: CodeField<T>[];
  repo: Repository<T>;
  emptyItem: Omit<T, 'id' | 'createdAt' | 'updatedAt'>;
  version: number;
  onChange: () => void;
}

export function EditableCodeTable<T extends AuditFields>({
  title,
  addLabel = 'Add',
  newEntryMode = 'inline',
  showAddButton = true,
  showFilters = true,
  globalSearch = false,
  addFields,
  onEditRecord,
  fields,
  repo,
  emptyItem,
  version,
  onChange,
}: EditableCodeTableProps<T>) {
  const rows = repo.list();
  const fieldGroups = [...new Set(fields.map((field) => field.group).filter((group): group is string => Boolean(group)))];
  const hasFieldGroups = fieldGroups.length > 0;

  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredRows = useMemo(() => rows.filter((row) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || fields.some((field) => String(row[field.key] ?? '').toLowerCase().includes(query));
    return matchesSearch && fields.every((field) => {
      const fieldQuery = filters[String(field.key)]?.trim().toLowerCase();
      return !fieldQuery || String(row[field.key] ?? '').toLowerCase().includes(fieldQuery);
    });
  }), [fields, filters, rows, search]);
  const paginatedRows = filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const setFilter = (key: string, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(0);
  };

  const clearFilters = () => {
    setFilters({});
    setSearch('');
    setPage(0);
  };

  const toRecord = (item: T) => {
    const rec: Record<string, string> = {};
    fields.forEach((f) => {
      rec[String(f.key)] = String(item[f.key] ?? '');
    });
    return rec;
  };

  const startAdd = () => {
    const rec: Record<string, string> = {};
    fields.forEach((f) => {
      rec[String(f.key)] = String((emptyItem as Record<string, unknown>)[String(f.key)] ?? '');
    });
    setDraft(rec);
    setAdding(true);
    setError(null);
  };

  const cancelAdd = () => {
    setAdding(false);
    setError(null);
  };

  const buildItemFromRecord = (rec: Record<string, string>): Omit<T, 'id' | 'createdAt' | 'updatedAt'> => {
    const item: Record<string, unknown> = { ...emptyItem };
    fields.forEach((f) => {
      const raw = rec[String(f.key)] ?? '';
      item[String(f.key)] = f.type === 'number' ? Number(raw) || 0 : raw;
    });
    return item as Omit<T, 'id' | 'createdAt' | 'updatedAt'>;
  };

  const validate = (rec: Record<string, string>) => {
    const codeField = fields[0];
    const codeValue = (rec[String(codeField.key)] ?? '').trim();
    if (!codeValue) return `${codeField.label} is required.`;
    return null;
  };

  const saveAdd = () => {
    const validationError = validate(draft);
    if (validationError) {
      setError(validationError);
      return;
    }
    const now = new Date().toISOString();
    repo.save({
      ...buildItemFromRecord(draft),
      id: uuid(),
      createdAt: now,
      updatedAt: now,
    } as T);
    setAdding(false);
    setError(null);
    onChange();
  };

  const startEdit = (item: T) => {
    setEditingId(item.id);
    setEditDraft(toRecord(item));
    setError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setError(null);
  };

  const saveEdit = (item: T) => {
    const validationError = validate(editDraft);
    if (validationError) {
      setError(validationError);
      return;
    }
    repo.save({
      ...item,
      ...buildItemFromRecord(editDraft),
    } as T);
    setEditingId(null);
    setError(null);
    onChange();
  };

  const handleDelete = (id: string) => {
    repo.remove(id);
    onChange();
  };

  return (
    <>
      <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
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
            {title}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="caption" color="text.secondary">{filteredRows.length} record(s)</Typography>
            {globalSearch && <TextField size="small" placeholder="Search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(0); }} sx={{ minWidth: 200 }} />}
            {(Object.values(filters).some(Boolean) || search) && <Button size="small" onClick={clearFilters}>Clear filters</Button>}
            {showAddButton && !adding && <Button size="small" variant="contained" startIcon={<AddIcon fontSize="small" />} onClick={startAdd}>{addLabel}</Button>}
          </Stack>
        </Box>

        {error && (
          <Typography variant="caption" sx={{ display: 'block', color: themeColors.error, px: 1.5, pt: 1 }}>
            {error}
          </Typography>
        )}

        <Table size="small" key={version}>
          <TableHead>
            <TableRow>
              {hasFieldGroups ? fields.filter((field) => !field.group).map((field) => (
                <TableCell key={String(field.key)} rowSpan={2}>{field.label}</TableCell>
              )) : fields.map((field) => (
                <TableCell key={String(field.key)}>{field.label}</TableCell>
              ))}
              {fieldGroups.map((group) => (
                <TableCell key={group} colSpan={fields.filter((field) => field.group === group).length} align="center">
                  {group}
                </TableCell>
              ))}
              <TableCell align="right" sx={{ width: 90 }} rowSpan={hasFieldGroups ? 2 : undefined}>
                Action
              </TableCell>
            </TableRow>
            {hasFieldGroups && (
              <TableRow>
                {fields.filter((field) => field.group).map((field) => (
                  <TableCell key={String(field.key)}>{field.label}</TableCell>
                ))}
              </TableRow>
            )}
            {showFilters && <TableRow>
              {fields.map((field) => (
                <TableCell key={`${String(field.key)}-filter`}>
                  {field.type === 'select' ? (
                    <TextField select size="small" value={filters[String(field.key)] ?? ''} onChange={(e) => setFilter(String(field.key), e.target.value)} fullWidth SelectProps={{ displayEmpty: true }}>
                      <MenuItem value="">All</MenuItem>
                      {(field.options ?? []).map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
                    </TextField>
                  ) : (
                    <TextField size="small" value={filters[String(field.key)] ?? ''} onChange={(e) => setFilter(String(field.key), e.target.value)} placeholder={`Filter ${field.label}`} fullWidth />
                  )}
                </TableCell>
              ))}
              <TableCell />
            </TableRow>}
          </TableHead>
          <TableBody>
            {adding && newEntryMode === 'inline' && (
              <TableRow>
                {fields.map((f) => (
                  <TableCell key={String(f.key)}>
                    {f.type === 'select' ? (
                      <TextField
                        select
                        size="small"
                        value={draft[String(f.key)] ?? ''}
                        onChange={(e) => setDraft({ ...draft, [String(f.key)]: e.target.value })}
                        fullWidth
                      >
                        {(f.options ?? []).map((opt) => (
                          <MenuItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    ) : (
                      <TextField
                        size="small"
                        type={f.type === 'number' ? 'number' : 'text'}
                        value={draft[String(f.key)] ?? ''}
                        onChange={(e) => setDraft({ ...draft, [String(f.key)]: e.target.value })}
                        placeholder={f.label}
                        fullWidth
                      />
                    )}
                  </TableCell>
                ))}
                <TableCell align="right">
                  <Stack direction="row" spacing={0.25} justifyContent="flex-end">
                    <IconButton size="small" color="primary" onClick={saveAdd}>
                      <CheckIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={cancelAdd}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            )}
            {filteredRows.length === 0 && !adding ? (
              <TableRow>
                <TableCell colSpan={fields.length + 1} align="center">
                  <Typography variant="body2" sx={{ color: themeColors.textSecondary, py: 2 }}>
                    No records yet — use Add to create one.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedRows.map((row) => {
                const isEditing = editingId === row.id;
                return (
                  <TableRow key={row.id} hover>
                    {fields.map((f) => (
                      <TableCell key={String(f.key)}>
                        {isEditing ? (
                          f.type === 'select' ? (
                            <TextField
                              select
                              size="small"
                              value={editDraft[String(f.key)] ?? ''}
                              onChange={(e) => setEditDraft({ ...editDraft, [String(f.key)]: e.target.value })}
                              fullWidth
                            >
                              {(f.options ?? []).map((opt) => (
                                <MenuItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </MenuItem>
                              ))}
                            </TextField>
                          ) : (
                            <TextField
                              size="small"
                              type={f.type === 'number' ? 'number' : 'text'}
                              value={editDraft[String(f.key)] ?? ''}
                              onChange={(e) => setEditDraft({ ...editDraft, [String(f.key)]: e.target.value })}
                              fullWidth
                            />
                          )
                        ) : f.type === 'select' ? (
                          f.options?.find((opt) => opt.value === String(row[f.key]))?.label ?? String(row[f.key] ?? '')
                        ) : (
                          String(row[f.key] ?? '')
                        )}
                      </TableCell>
                    ))}
                    <TableCell align="right">
                      {isEditing ? (
                        <Stack direction="row" spacing={0.25} justifyContent="flex-end">
                          <IconButton size="small" color="primary" onClick={() => saveEdit(row)}>
                            <CheckIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={cancelEdit}>
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      ) : (
                        <Stack direction="row" spacing={0.25} justifyContent="flex-end">
                          <IconButton size="small" onClick={() => onEditRecord ? onEditRecord(row) : startEdit(row)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => handleDelete(row.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
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

      <Dialog open={adding && newEntryMode === 'dialog'} onClose={cancelAdd} maxWidth="md" fullWidth>
        <DialogTitle>{addLabel} {title.slice(0, -1)}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, pt: 0.5 }}>
            {(addFields ?? fields).map((field) => (
              field.type === 'select' ? (
                <TextField key={String(field.key)} select label={field.label} value={draft[String(field.key)] ?? ''} onChange={(e) => setDraft({ ...draft, [String(field.key)]: e.target.value })} fullWidth>
                  {(field.options ?? []).map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
                </TextField>
              ) : (
                <TextField key={String(field.key)} label={field.label} placeholder={field.placeholder} type={field.type === 'number' ? 'number' : 'text'} value={draft[String(field.key)] ?? ''} onChange={(e) => setDraft({ ...draft, [String(field.key)]: e.target.value })} fullWidth />
              )
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelAdd}>Cancel</Button>
          <Button variant="contained" onClick={saveAdd}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
