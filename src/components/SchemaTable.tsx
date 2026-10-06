import { ReactNode, useState } from "react";
import {
  alpha,
  lighten,
  Box,
  Button,
  Checkbox,
  Chip,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined";
import SearchOffOutlinedIcon from "@mui/icons-material/SearchOffOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import { DateField } from "./DateField";
import { confirmDelete } from "./deleteConfirmation";

type CellValue = string | number | boolean | null | undefined;

/** Raw values drive filtering/sorting; render only controls the cell's appearance. */
export interface SchemaTableColumn<T> {
  key: string;
  label: string;
  value: (row: T) => CellValue;
  render?: (row: T) => ReactNode;
  type?: "text" | "number" | "date" | "boolean";
  width?: number;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  filterable?: boolean;
  filterOptions?: { value: string; label: string }[];
  searchValue?: (row: T) => string;
}

export interface SchemaTableAction<T> {
  key: string;
  label: string;
  icon: ReactNode;
  onClick: (row: T) => void;
  disabled?: (row: T) => boolean;
  color?: "primary" | "error" | "success" | "default";
  confirmDelete?: string | ((row: T) => string);
}

export interface SchemaTableProps<T> {
  title: string;
  subtitle?: string;
  rows: T[];
  columns: SchemaTableColumn<T>[];
  getRowId: (row: T) => string;
  getRowLabel?: (row: T) => string;
  actions?: SchemaTableAction<T>[];
  /** Open or edit a row when its non-interactive content is double-clicked. */
  onRowDoubleClick?: (row: T) => void;
  searchLabel?: string;
  emptyMessage?: string;
  selected?: string[];
  onSelect?: (ids: string[]) => void;
  selectionLabel?: string;
  initialPageSize?: number;
  columnGroups?: { label: string; keys: string[] }[];
  allowAllRows?: boolean;
}

const displayDate = (value: CellValue) =>
  typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? value.split("-").reverse().join("/")
    : String(value ?? "");
const rawText = (value: CellValue) =>
  typeof value === "boolean" ? (value ? "Yes" : "No") : String(value ?? "");

/** Shared client-side list table. Screens supply their schema and business actions. */
export function SchemaTable<T>({
  title,
  subtitle,
  rows,
  columns,
  getRowId,
  getRowLabel,
  actions = [],
  onRowDoubleClick,
  searchLabel = "Search records",
  emptyMessage = "No records yet.",
  selected = [],
  onSelect,
  selectionLabel = "records",
  initialPageSize = 10,
  columnGroups = [],
  allowAllRows = false,
}: SchemaTableProps<T>) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [sort, setSort] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const activeFilters = Object.values(filters).filter(Boolean).length;
  const active = !!search.trim() || activeFilters > 0;
  const filtered = rows.filter((row) => {
    const needle = search.trim().toLocaleLowerCase();
    const searchable = columns
      .map((column) =>
        [
          rawText(column.value(row)),
          column.type === "date" ? displayDate(column.value(row)) : "",
          column.searchValue?.(row) || "",
        ].join(" "),
      )
      .join(" ")
      .toLocaleLowerCase();
    return (
      (!needle || searchable.includes(needle)) &&
      columns.every((column) => {
        const filter = filters[column.key];
        if (!filter || column.filterable === false) return true;
        const value = rawText(column.value(row));
        return column.type === "date" ||
          column.type === "boolean" ||
          column.filterOptions
          ? value === filter
          : value
              .toLocaleLowerCase()
              .includes(filter.trim().toLocaleLowerCase());
      })
    );
  });
  const sorted = [...filtered];
  const sortColumn = columns.find((column) => column.key === sort?.key);
  if (sort && sortColumn)
    sorted.sort((a, b) => {
      const left = sortColumn.value(a),
        right = sortColumn.value(b);
      if (left === null || left === undefined || left === "")
        return right === null || right === undefined || right === "" ? 0 : 1;
      if (right === null || right === undefined || right === "") return -1;
      const order =
        typeof left === "number" && typeof right === "number"
          ? left - right
          : rawText(left).localeCompare(rawText(right), undefined, {
              numeric: true,
              sensitivity: "base",
            });
      return sort.direction === "asc" ? order : -order;
    });
  const currentPage = Math.min(
    page,
    pageSize === -1 ? 0 : Math.max(0, Math.ceil(sorted.length / pageSize) - 1),
  );
  const visible =
    pageSize === -1
      ? sorted
      : sorted.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
  const selectedSet = new Set(selected);
  const selectedCount = rows.filter((row) =>
    selectedSet.has(getRowId(row)),
  ).length;
  const allSelected =
    filtered.length > 0 &&
    filtered.every((row) => selectedSet.has(getRowId(row)));
  const someSelected = filtered.some((row) => selectedSet.has(getRowId(row)));
  const selectionWidth = onSelect ? 48 : 0;
  const actionWidth = actions.length
    ? Math.max(120, actions.length * 34 + 32)
    : 0;
  const dataWidth = columns.reduce(
    (sum, column) => sum + (column.width || 150),
    0,
  );
  const utilityWidth = selectionWidth + actionWidth;
  const columnCount =
    columns.length + (onSelect ? 1 : 0) + (actions.length ? 1 : 0);
  const reset = () => {
    setSearch("");
    setFilters({});
    setPage(0);
  };
  const filterChange = (key: string, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(0);
  };
  const sticky = (left: number, last: boolean) => ({
    position: "sticky" as const,
    left,
    zIndex: 2,
    bgcolor: "var(--schema-row-background)",
    ...(last ? { boxShadow: "3px 0 5px -4px rgba(0,0,0,.3)" } : {}),
  });
  const renderValue = (column: SchemaTableColumn<T>, row: T) => {
    if (column.render) return column.render(row);
    const value = column.value(row);
    if (value === null || value === undefined || value === "")
      return (
        <Box component="span" sx={{ color: "text.disabled" }}>
          —
        </Box>
      );
    if (column.type === "date") return displayDate(value);
    if (typeof value === "boolean")
      return (
        <Chip
          size="small"
          label={value ? "Yes" : "No"}
          color={value ? "success" : "default"}
          variant="outlined"
        />
      );
    if (column.type === "number" && typeof value === "number")
      return value.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    return String(value);
  };
  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: (theme) =>
          `0 4px 20px ${alpha(theme.palette.primary.main, 0.04)}`,
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        spacing={2}
        sx={{ p: 2.5 }}
      >
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography
              variant="subtitle1"
              component="h2"
              sx={{ fontWeight: 750, color: "primary.main" }}
            >
              {title}
            </Typography>
            <Chip
              label={rows.length}
              size="small"
              sx={{
                height: 23,
                fontWeight: 700,
                bgcolor: "action.selected",
                color: "primary.main",
              }}
            />
            {selectedCount > 0 && (
              <Chip
                size="small"
                variant="outlined"
                color="primary"
                label={`${selectedCount} selected`}
              />
            )}
          </Stack>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ flexWrap: { xs: "wrap", sm: "nowrap" }, gap: { xs: 1, sm: 0 } }}
        >
          <TextField
            size="small"
            label={searchLabel}
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(0);
            }}
            sx={{
              width: { xs: "100%", sm: 280 },
              "& .MuiOutlinedInput-root": { height: 40 },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlinedIcon
                    sx={{ fontSize: 19, color: "text.secondary" }}
                  />
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    aria-label="Clear search"
                    onClick={() => {
                      setSearch("");
                      setPage(0);
                    }}
                  >
                    <CloseOutlinedIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : undefined,
            }}
          />
          <Button
            variant={showFilters ? "contained" : "outlined"}
            size="small"
            startIcon={<FilterListOutlinedIcon />}
            aria-expanded={showFilters}
            onClick={() => setShowFilters(!showFilters)}
            sx={{ height: 40, px: 1.5 }}
          >
            Filters{activeFilters ? ` (${activeFilters})` : ""}
          </Button>
          {active && (
            <Button size="small" onClick={reset} sx={{ whiteSpace: "nowrap" }}>
              Clear filters
            </Button>
          )}
        </Stack>
      </Stack>
      <TableContainer
        sx={{
          borderTop: "1px solid",
          borderColor: "divider",
          "&::-webkit-scrollbar": { height: 8, width: 8 },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.2),
            borderRadius: 8,
          },
        }}
      >
        <Table
          size="small"
          aria-label={title}
          sx={{
            minWidth: utilityWidth + dataWidth,
            tableLayout: "fixed",
            "&& .MuiTableRow-root .MuiTableCell-root": {
              boxSizing: "border-box",
              minWidth: 0,
              borderColor: "divider",
              bgcolor: "var(--schema-row-background)",
              px: 1.75,
            },
            "&& .MuiTableRow-root .MuiTableCell-paddingCheckbox": {
              width: selectionWidth,
              px: 0,
              textAlign: "center",
            },
            "& .MuiTableHead-root .MuiTableCell-root": {
              py: 1.5,
              fontWeight: 700,
              fontSize: 12,
              color: "primary.main",
              bgcolor: "var(--schema-row-background)",
            },
            "& .MuiTableBody-root .MuiTableCell-root": {
              py: 1.4,
              fontSize: 13,
            },
          }}
        >
          {/* Keep sticky/schema widths fixed; the final data column fills extra space. */}
          <colgroup>
            {onSelect && <col style={{ width: selectionWidth }} />}
            {actions.length > 0 && <col style={{ width: actionWidth }} />}
            {columns.map((column, index) => (
              <col
                key={column.key}
                style={{
                  width:
                    index === columns.length - 1
                      ? undefined
                      : column.width || 150,
                }}
              />
            ))}
          </colgroup>
          <TableHead
            sx={{
              "--schema-row-background": (theme) =>
                lighten(theme.palette.primary.main, 0.955),
            }}
          >
            {columnGroups.length > 0 && (
              <TableRow>
                {onSelect && (
                  <TableCell
                    padding="checkbox"
                    sx={sticky(0, !actions.length)}
                  />
                )}
                {actions.length > 0 && (
                  <TableCell sx={sticky(selectionWidth, true)} />
                )}
                {columns.map((column) => {
                  const group = columnGroups.find((item) =>
                    item.keys.includes(column.key),
                  );
                  if (group && group.keys[0] !== column.key) return null;
                  return (
                    <TableCell
                      key={column.key}
                      colSpan={group?.keys.length || 1}
                      rowSpan={group ? 1 : 2}
                      align="center"
                      scope={group ? "colgroup" : "col"}
                    >
                      {group ? (
                        group.label
                      ) : column.sortable === false ? (
                        column.label
                      ) : (
                        <TableSortLabel
                          active={sort?.key === column.key}
                          direction={
                            sort?.key === column.key ? sort.direction : "asc"
                          }
                          onClick={() => {
                            setSort({
                              key: column.key,
                              direction:
                                sort?.key === column.key &&
                                sort.direction === "asc"
                                  ? "desc"
                                  : "asc",
                            });
                            setPage(0);
                          }}
                        >
                          {column.label}
                        </TableSortLabel>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            )}
            <TableRow>
              {onSelect && (
                <TableCell padding="checkbox" sx={sticky(0, !actions.length)}>
                  <Checkbox
                    size="small"
                    inputProps={{
                      "aria-label": `Select all filtered ${selectionLabel}`,
                    }}
                    checked={allSelected}
                    indeterminate={someSelected && !allSelected}
                    onChange={(event) => {
                      const ids = new Set(filtered.map(getRowId));
                      onSelect(
                        event.target.checked
                          ? Array.from(new Set([...selected, ...ids]))
                          : selected.filter((id) => !ids.has(id)),
                      );
                    }}
                  />
                </TableCell>
              )}
              {actions.length > 0 && (
                <TableCell sx={sticky(selectionWidth, true)}>Actions</TableCell>
              )}
              {columns
                .filter(
                  (column) =>
                    !columnGroups.length ||
                    columnGroups.some((group) =>
                      group.keys.includes(column.key),
                    ),
                )
                .map((column) => (
                  <TableCell
                    key={column.key}
                    align={
                      column.align ||
                      (column.type === "number" ? "right" : "left")
                    }
                    sortDirection={
                      sort?.key === column.key ? sort.direction : false
                    }
                    sx={{ whiteSpace: "nowrap" }}
                  >
                    {column.sortable === false ? (
                      column.label
                    ) : (
                      <TableSortLabel
                        active={sort?.key === column.key}
                        direction={
                          sort?.key === column.key ? sort.direction : "asc"
                        }
                        onClick={() => {
                          setSort({
                            key: column.key,
                            direction:
                              sort?.key === column.key &&
                              sort.direction === "asc"
                                ? "desc"
                                : "asc",
                          });
                          setPage(0);
                        }}
                      >
                        {column.label}
                      </TableSortLabel>
                    )}
                  </TableCell>
                ))}
            </TableRow>
            {showFilters && (
              <TableRow
                sx={{
                  "& .MuiTableCell-root": { py: "10px !important" },
                  "& .MuiInputBase-root": {
                    height: 36,
                    fontSize: 12,
                    bgcolor: "background.paper",
                  },
                  "& .MuiInputLabel-root": { fontSize: 12 },
                }}
              >
                {onSelect && (
                  <TableCell
                    padding="checkbox"
                    sx={sticky(0, !actions.length)}
                  />
                )}
                {actions.length > 0 && (
                  <TableCell sx={sticky(selectionWidth, true)} />
                )}
                {columns.map((column) => (
                  <TableCell key={column.key}>
                    {column.filterable !== false &&
                      (column.type === "date" ? (
                        <DateField
                          label={column.label}
                          value={filters[column.key] || ""}
                          onChange={(value) => filterChange(column.key, value)}
                        />
                      ) : column.filterOptions || column.type === "boolean" ? (
                        <TextField
                          select
                          fullWidth
                          size="small"
                          label={column.label}
                          value={filters[column.key] || ""}
                          onChange={(event) =>
                            filterChange(column.key, event.target.value)
                          }
                        >
                          <MenuItem value="">All</MenuItem>
                          {(
                            column.filterOptions || [
                              { value: "Yes", label: "Yes" },
                              { value: "No", label: "No" },
                            ]
                          ).map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      ) : (
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Filter…"
                          inputProps={{
                            "aria-label": `Filter ${column.label}`,
                          }}
                          value={filters[column.key] || ""}
                          onChange={(event) =>
                            filterChange(column.key, event.target.value)
                          }
                        />
                      ))}
                  </TableCell>
                ))}
              </TableRow>
            )}
          </TableHead>
          <TableBody>
            {visible.map((row) => (
              <TableRow
                key={getRowId(row)}
                selected={selectedSet.has(getRowId(row))}
                onDoubleClick={
                  onRowDoubleClick
                    ? (event) => {
                        if (
                          event.target instanceof Element &&
                          event.target.closest(
                            'button, a, input, select, textarea, [role="button"], [role="checkbox"], [role="switch"], [contenteditable="true"]',
                          )
                        )
                          return;
                        onRowDoubleClick(row);
                      }
                    : undefined
                }
                sx={{
                  cursor: onRowDoubleClick ? "pointer" : undefined,
                  "--schema-row-background": (theme) =>
                    selectedSet.has(getRowId(row))
                      ? lighten(theme.palette.primary.main, 0.93)
                      : theme.palette.background.paper,
                  "&:hover": {
                    "--schema-row-background": (theme) =>
                      lighten(
                        theme.palette.primary.main,
                        selectedSet.has(getRowId(row)) ? 0.9 : 0.965,
                      ),
                    bgcolor: "var(--schema-row-background)",
                  },
                  bgcolor: "var(--schema-row-background)",
                  "&:last-child td": { borderBottom: 0 },
                }}
              >
                {onSelect && (
                  <TableCell
                    padding="checkbox"
                    sx={sticky(0, !actions.length)}
                    onDoubleClick={(event) => event.stopPropagation()}
                  >
                    <Checkbox
                      size="small"
                      inputProps={{
                        "aria-label": `Select ${getRowLabel?.(row) || getRowId(row)}`,
                      }}
                      checked={selectedSet.has(getRowId(row))}
                      onChange={(event) =>
                        onSelect(
                          event.target.checked
                            ? [...new Set([...selected, getRowId(row)])]
                            : selected.filter((id) => id !== getRowId(row)),
                        )
                      }
                    />
                  </TableCell>
                )}
                {actions.length > 0 && (
                  <TableCell
                    sx={sticky(selectionWidth, true)}
                    onDoubleClick={(event) => event.stopPropagation()}
                  >
                    <Stack direction="row" spacing={0.4}>
                      {actions.map((action) => (
                        <Tooltip key={action.key} title={action.label}>
                          <Box
                            component="span"
                            sx={{
                              display: "inline-flex",
                              cursor: action.disabled?.(row)
                                ? "not-allowed"
                                : undefined,
                            }}
                          >
                            <IconButton
                              size="small"
                              aria-label={action.label}
                              color={action.color || "primary"}
                              disabled={action.disabled?.(row)}
                              sx={{
                                borderRadius: 1.5,
                                width: 30,
                                height: 30,
                                "& .MuiSvgIcon-root": { fontSize: 18 },
                                "&:hover": {
                                  bgcolor: (theme) =>
                                    alpha(
                                      action.color === "error"
                                        ? theme.palette.error.main
                                        : theme.palette.primary.main,
                                      0.08,
                                    ),
                                },
                              }}
                              onClick={() => {
                                if (action.disabled?.(row)) return;
                                if (action.confirmDelete)
                                  confirmDelete(
                                    () => action.onClick(row),
                                    typeof action.confirmDelete === "function"
                                      ? action.confirmDelete(row)
                                      : action.confirmDelete,
                                  );
                                else action.onClick(row);
                              }}
                            >
                              {action.icon}
                            </IconButton>
                          </Box>
                        </Tooltip>
                      ))}
                    </Stack>
                  </TableCell>
                )}
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    align={
                      column.align ||
                      (column.type === "number" ? "right" : "left")
                    }
                    sx={{
                      fontVariantNumeric: "tabular-nums",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {renderValue(column, row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {!visible.length && (
              <TableRow>
                <TableCell colSpan={columnCount} sx={{ py: "52px !important" }}>
                  <Stack
                    alignItems="center"
                    spacing={1}
                    sx={{
                      position: "sticky",
                      left: 0,
                      maxWidth: "min(80vw, 800px)",
                    }}
                  >
                    <SearchOffOutlinedIcon
                      sx={{ fontSize: 34, color: "text.disabled" }}
                    />
                    <Typography sx={{ fontWeight: 600 }}>
                      {active ? "No matching records" : emptyMessage}
                    </Typography>
                    {active && (
                      <>
                        <Typography variant="body2" color="text.secondary">
                          Try a different search or clear the filters.
                        </Typography>
                        <Button size="small" onClick={reset}>
                          Clear filters
                        </Button>
                      </>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid",
          borderColor: "divider",
          px: 2,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          {active
            ? `${filtered.length} of ${rows.length} records`
            : `${rows.length} ${rows.length === 1 ? "record" : "records"}`}
        </Typography>
        <TablePagination
          component="div"
          count={filtered.length}
          page={currentPage}
          rowsPerPage={pageSize}
          onPageChange={(_, value) => setPage(value)}
          onRowsPerPageChange={(event) => {
            setPageSize(Number(event.target.value));
            setPage(0);
          }}
          rowsPerPageOptions={
            allowAllRows
              ? [5, 10, 25, 50, { label: "All", value: -1 }]
              : [5, 10, 25, 50]
          }
          sx={{
            border: 0,
            "& .MuiTablePagination-toolbar": { pl: 0 },
            "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
              { fontSize: 12 },
          }}
        />
      </Box>
    </Paper>
  );
}
