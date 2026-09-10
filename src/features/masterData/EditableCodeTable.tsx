import { useState } from 'react';
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
  type?: 'text' | 'number' | 'select';
  options?: { value: string; label: string }[];
  width?: number;
}

interface EditableCodeTableProps<T extends AuditFields> {
  title: string;
  fields: CodeField<T>[];
  repo: Repository<T>;
  emptyItem: Omit<T, 'id' | 'createdAt' | 'updatedAt'>;
  version: number;
  onChange: () => void;
}

export function EditableCodeTable<T extends AuditFields>({
  title,
  fields,
  repo,
  emptyItem,
  version,
  onChange,
}: EditableCodeTableProps<T>) {
  const rows = repo.list();

  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

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
          {!adding && (
            <Button size="small" startIcon={<AddIcon fontSize="small" />} onClick={startAdd}>
              Add
            </Button>
          )}
        </Box>

        {error && (
          <Typography variant="caption" sx={{ display: 'block', color: themeColors.error, px: 1.5, pt: 1 }}>
            {error}
          </Typography>
        )}

        <Table size="small" key={version}>
          <TableHead>
            <TableRow>
              {fields.map((f) => (
                <TableCell key={String(f.key)}>{f.label}</TableCell>
              ))}
              <TableCell align="right" sx={{ width: 90 }}>
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {adding && (
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
            {rows.length === 0 && !adding ? (
              <TableRow>
                <TableCell colSpan={fields.length + 1} align="center">
                  <Typography variant="body2" sx={{ color: themeColors.textSecondary, py: 2 }}>
                    No records yet — use Add to create one.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => {
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
                          <IconButton size="small" onClick={() => startEdit(row)}>
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
      </Paper>
    </>
  );
}
