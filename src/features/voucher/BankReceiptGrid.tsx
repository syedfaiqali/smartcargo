import { confirmDelete } from '../../components/deleteConfirmation';
import { useState } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  IconButton,
  Checkbox,
} from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import { Voucher } from "../../domain/voucher";
import { DateField } from "../../components/DateField";

const columns = [
  "Voucher No.",
  "Branch",
  "Voucher Date",
  "Account",
  "Received From",
  "Analysis Code",
  "Cheque No.",
  "Cheque Date",
  "Cheque Status",
  "Currency",
  "Ex. Rate",
  "FC Amount",
  "PKR Amount",
  "Invoice Amount",
  "Cost Amount",
  "Final",
  "Posted",
  "Void",
  "Check",
];
function values(v: Voucher) {
  return [
    v.voucherNo,
    v.branch,
    v.voucherDate,
    v.accountCode ?? v.bankCode,
    v.receivedFrom ?? v.partyName,
    v.analysisCode,
    v.chequeNo,
    v.chequeDate,
    ({ UNCLEARED: 'Un Cleared', CLEARED: 'Cleared', RETURNED: 'Returned', CANCELLED: 'Cancelled', BOUNCED: 'Bounced' })[v.chequeStatus ?? 'UNCLEARED'],
    v.currencyCode,
    v.exchangeRate,
    v.amount.toFixed(2),
    (v.amount * v.exchangeRate).toFixed(2),
    v.clearingLines.reduce((s, l) => s + l.amountCleared, 0).toFixed(2),
    (v.costLines ?? []).reduce((s, l) => s + l.amount, 0).toFixed(2),
    v.final ? "Yes" : "No",
    v.posted ? "Yes" : "No",
    v.void ? "Yes" : "No",
    v.checked ? "Yes" : "No",
  ].map((value) => String(value ?? ""));
}

export function BankReceiptGrid({
  vouchers,
  onOpen,
  onEdit,
  onDelete,
  onPrint,
  selected,
  onSelect,
}: {
  vouchers: Voucher[];
  onOpen: (v: Voucher) => void;
  onEdit: (v: Voucher) => void;
  onDelete: (v: Voucher) => void;
  onPrint: (v: Voucher) => void;
  selected?: string[];
  onSelect?: (ids: string[]) => void;
}) {
  const [filters, setFilters] = useState<Record<number, string>>({});
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const filtered = vouchers.filter((v) => {
    const row = values(v);
    return (
      row.join(" ").toLowerCase().includes(search.toLowerCase()) &&
      row.every((value, index) =>
        value.toLowerCase().includes((filters[index] ?? "").toLowerCase()),
      )
    );
  });
  const currentPage = Math.min(
    page,
    Math.max(0, Math.ceil(filtered.length / pageSize) - 1),
  );
  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1.5 }}>
        <TextField
          label="Search vouchers"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
        />
      </Box>
      <TableContainer component={Paper} variant="outlined">
        <Table
          size="small"
          sx={{
            minWidth: 2300,
            "& .MuiTableCell-root": {
              borderRight: "1px solid",
              borderColor: "divider",
              whiteSpace: "nowrap",
            },
            "& .MuiTableHead-root": { bgcolor: "background.default" },
          }}
        >
          <TableHead>
            <TableRow>
              {onSelect && (
                <TableCell padding="checkbox">
                  <Checkbox
                    size="small"
                    aria-label="Select all filtered vouchers"
                    checked={
                      filtered.length > 0 &&
                      filtered.every((v) => selected?.includes(v.id))
                    }
                    indeterminate={
                      filtered.some((v) => selected?.includes(v.id)) &&
                      !filtered.every((v) => selected?.includes(v.id))
                    }
                    onChange={(e) =>
                      onSelect(
                        e.target.checked
                          ? Array.from(
                              new Set([
                                ...(selected ?? []),
                                ...filtered.map((v) => v.id),
                              ]),
                            )
                          : (selected ?? []).filter(
                              (id) => !filtered.some((v) => v.id === id),
                            ),
                      )
                    }
                  />
                </TableCell>
              )}
              <TableCell>Action</TableCell>
              {columns.map((c) => (
                <TableCell key={c} sx={{ fontWeight: 700 }}>
                  {c}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              {onSelect && <TableCell />}
              <TableCell />
              {columns.map((c, i) => (
                <TableCell key={c}>
                  {c === "Voucher Date" || c === "Cheque Date" ? (
                    <Box sx={{ minWidth: 165 }}>
                      <DateField
                        label={c}
                        value={filters[i] ?? ""}
                        onChange={(value) => {
                          setFilters({ ...filters, [i]: value });
                          setPage(0);
                        }}
                      />
                    </Box>
                  ) : (
                    <TextField
                      size="small"
                      placeholder={c}
                      inputProps={{ "aria-label": `Filter ${c}` }}
                      value={filters[i] ?? ""}
                      onChange={(e) => {
                        setFilters({ ...filters, [i]: e.target.value });
                        setPage(0);
                      }}
                      sx={{ minWidth: 100 }}
                    />
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered
              .slice(currentPage * pageSize, (currentPage + 1) * pageSize)
              .map((v) => (
                <TableRow key={v.id} hover selected={selected?.includes(v.id)}>
                  {onSelect && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        size="small"
                        aria-label={`Select ${v.voucherNo}`}
                        checked={selected?.includes(v.id) ?? false}
                        onChange={(e) =>
                          onSelect(
                            e.target.checked
                              ? [...(selected ?? []), v.id]
                              : (selected ?? []).filter((id) => id !== v.id),
                          )
                        }
                      />
                    </TableCell>
                  )}
                  <TableCell>
                    <IconButton
                      size="small"
                      aria-label="Open voucher"
                      onClick={() => onOpen(v)}
                    >
                      <VisibilityOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      aria-label="Edit voucher"
                      disabled={v.final || v.void}
                      onClick={() => onEdit(v)}
                    >
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      aria-label="Delete voucher"
                      color="error"
                      disabled={v.final || v.void}
                      onClick={() => confirmDelete(() => onDelete(v))}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      aria-label="Print voucher"
                      onClick={() => onPrint(v)}
                    >
                      <PrintOutlinedIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                  {values(v).map((value, i) => (
                    <TableCell key={i}>{value || "—"}</TableCell>
                  ))}
                </TableRow>
              ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (onSelect ? 2 : 1)}
                  align="center"
                  sx={{ py: 3 }}
                >
                  No bank receipt vouchers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={filtered.length}
        page={currentPage}
        rowsPerPage={pageSize}
        onPageChange={(_, p) => setPage(p)}
        onRowsPerPageChange={(e) => {
          setPageSize(Number(e.target.value));
          setPage(0);
        }}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    </Box>
  );
}
