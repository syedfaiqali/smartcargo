import { Button, Chip } from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import {
  SchemaTable,
  SchemaTableColumn,
  SchemaTableAction,
} from "../../components/SchemaTable";
import { Voucher } from "../../domain/voucher";
import { getReceiptEntryLines } from "../../domain/receiptEntry";

const chequeStatuses: Record<string, string> = {
  UNCLEARED: "Un Cleared",
  CLEARED: "Cleared",
  RETURNED: "Returned",
  CANCELLED: "Cancelled",
  BOUNCED: "Bounced",
};
const status = (
  label: string,
  color: "success" | "error" | "primary" | "default" = "default",
) => (
  <Chip
    size="small"
    label={label}
    color={color}
    variant="outlined"
    sx={{ height: 24, fontSize: 11, fontWeight: 600, borderRadius: 1.5 }}
  />
);
const analysis = (voucher: Voucher) =>
  [
    ...new Set(
      [
        voucher.analysisCode,
        ...(voucher.receiptEntryLines || []).map((line) => line.analysisCode),
      ].filter(Boolean),
    ),
  ].join(", ");
const chequeStatus = (voucher: Voucher) =>
  chequeStatuses[voucher.chequeStatus || "UNCLEARED"] ||
  voucher.chequeStatus ||
  "Un Cleared";
const columns: SchemaTableColumn<Voucher>[] = [
  {
    key: "voucherNo",
    label: "Voucher No.",
    value: (v) => v.voucherNo,
    width: 150,
  },
  {
    key: "branch",
    label: "Branch",
    value: (v) => v.branch,
    width: 110,
    render: (v) => status(v.branch, "primary"),
  },
  {
    key: "voucherDate",
    label: "Voucher Date",
    type: "date",
    value: (v) => v.voucherDate,
    width: 160,
  },
  {
    key: "account",
    label: "Account",
    value: (v) => v.accountCode || v.bankCode,
    width: 145,
  },
  {
    key: "receivedFrom",
    label: "Received From",
    value: (v) => v.receivedFrom || v.partyName,
    width: 220,
  },
  { key: "analysis", label: "Analysis Code", value: analysis, width: 155 },
  {
    key: "chequeNo",
    label: "Cheque No.",
    value: (v) => v.chequeNo,
    width: 150,
  },
  {
    key: "chequeDate",
    label: "Cheque Date",
    type: "date",
    value: (v) => v.chequeDate,
    width: 160,
  },
  {
    key: "chequeStatus",
    label: "Cheque Status",
    value: chequeStatus,
    width: 165,
    filterOptions: Object.values(chequeStatuses).map((label) => ({
      value: label,
      label,
    })),
    render: (v) =>
      status(
        chequeStatus(v),
        v.chequeStatus === "CLEARED"
          ? "success"
          : ["BOUNCED", "RETURNED", "CANCELLED"].includes(v.chequeStatus || "")
            ? "error"
            : "default",
      ),
  },
  {
    key: "currency",
    label: "Currency",
    value: (v) => v.currencyCode,
    width: 120,
  },
  {
    key: "exchangeRate",
    label: "Ex. Rate",
    type: "number",
    value: (v) => v.exchangeRate,
    width: 130,
    render: (v) =>
      v.exchangeRate.toLocaleString("en-US", {
        minimumFractionDigits: 4,
        maximumFractionDigits: 8,
      }),
  },
  {
    key: "fcAmount",
    label: "FC Amount",
    type: "number",
    value: (v) => v.amount,
    width: 145,
  },
  {
    key: "pkrAmount",
    label: "PKR Amount",
    type: "number",
    value: (v) => v.amount * v.exchangeRate,
    width: 145,
  },
  {
    key: "invoiceAmount",
    label: "Invoice Amount",
    type: "number",
    value: (v) =>
      v.clearingLines.reduce((sum, line) => sum + line.amountCleared, 0),
    width: 155,
  },
  {
    key: "costAmount",
    label: "Cost Amount",
    type: "number",
    value: (v) =>
      (v.costLines || []).reduce((sum, line) => sum + line.amount, 0),
    width: 145,
  },
  {
    key: "final",
    label: "Final",
    type: "boolean",
    value: (v) => v.final,
    width: 115,
    searchValue: (v) => (v.final ? "Final" : "Draft"),
    render: (v) =>
      status(v.final ? "Final" : "Draft", v.final ? "success" : "default"),
  },
  {
    key: "posted",
    label: "Posted",
    type: "boolean",
    value: (v) => !!v.posted,
    width: 120,
    render: (v) =>
      status(
        v.posted ? "Posted" : "Unposted",
        v.posted ? "success" : "default",
      ),
  },
  {
    key: "void",
    label: "Void",
    type: "boolean",
    value: (v) => !!v.void,
    width: 110,
    render: (v) => status(v.void ? "Void" : "No", v.void ? "error" : "default"),
  },
  {
    key: "checked",
    label: "Check",
    type: "boolean",
    value: (v) => !!v.checked,
    width: 115,
    render: (v) =>
      status(v.checked ? "Checked" : "No", v.checked ? "success" : "default"),
  },
];

export function BankReceiptGrid({
  vouchers,
  onOpen,
  onEdit,
  onDelete,
  onPrint,
  selected,
  onSelect,
  kind = "RECEIPT",
}: {
  vouchers: Voucher[];
  onOpen: (v: Voucher) => void;
  onEdit: (v: Voucher) => void;
  onDelete: (v: Voucher) => void;
  onPrint: (v: Voucher) => void;
  selected?: string[];
  onSelect?: (ids: string[]) => void;
  kind?: "RECEIPT" | "JOURNAL";
}) {
  const actions: SchemaTableAction<Voucher>[] = [
    {
      key: "open",
      label: "Open voucher",
      icon: <VisibilityOutlinedIcon />,
      onClick: onOpen,
    },
    {
      key: "edit",
      label: "Edit voucher",
      icon: <EditOutlinedIcon />,
      onClick: onEdit,
      disabled: (v) => v.final || !!v.void,
    },
    {
      key: "delete",
      label: "Delete voucher",
      icon: <DeleteOutlineIcon />,
      onClick: onDelete,
      disabled: (v) => v.final || !!v.void,
      color: "error",
      confirmDelete: (v) =>
        "Are you sure you want to delete voucher " + v.voucherNo + "?",
    },
    {
      key: "print",
      label: "Print voucher",
      icon: <PrintOutlinedIcon />,
      onClick: onPrint,
    },
  ];
  const journalColumns: SchemaTableColumn<Voucher>[] = [
    ...columns.filter((column) =>
      ["voucherNo", "branch", "voucherDate"].includes(column.key),
    ),
    {
      key: "accountDescription",
      label: "Account Description",
      width: 220,
      value: (v) =>
        getReceiptEntryLines(v)
          .map((line) => line.accountDescription || line.accountCode)
          .join(", "),
    },
    {
      key: "dc",
      label: "D/C",
      width: 140,
      value: (v) =>
        [
          ...new Set(
            getReceiptEntryLines(v).map((line) =>
              line.dc === "DEBIT" ? "Debit" : "Credit",
            ),
          ),
        ].join(" / "),
    },
    {
      key: "particulars",
      label: "Particulars",
      width: 240,
      value: (v) =>
        [
          ...new Set(
            getReceiptEntryLines(v)
              .map((line) => line.particulars)
              .filter(Boolean),
          ),
        ].join("; "),
    },
    ...columns.filter((column) =>
      [
        "analysis",
        "currency",
        "exchangeRate",
        "fcAmount",
        "pkrAmount",
        "invoiceAmount",
        "costAmount",
        "final",
        "posted",
        "void",
        "checked",
      ].includes(column.key),
    ),
  ];
  const schema = (kind === "JOURNAL" ? journalColumns : columns).map(
    (column) =>
      column.key === "voucherNo"
        ? {
            ...column,
            render: (voucher: Voucher) => (
              <Button
                variant="text"
                size="small"
                onClick={() => onOpen(voucher)}
                sx={{
                  p: 0,
                  minWidth: 0,
                  fontWeight: 700,
                  textTransform: "none",
                  whiteSpace: "nowrap",
                  "&:hover": {
                    bgcolor: "transparent",
                    textDecoration: "underline",
                  },
                }}
              >
                {voucher.voucherNo}
              </Button>
            ),
          }
        : column,
  );
  return (
    <SchemaTable
      title={kind === "JOURNAL" ? "Journal Vouchers" : "Bank Receipts"}
      subtitle={
        kind === "JOURNAL"
          ? "View, manage and print your journal vouchers"
          : "View, manage and print your receipt vouchers"
      }
      rows={vouchers}
      columns={schema}
      getRowId={(v) => v.id}
      getRowLabel={(v) => v.voucherNo}
      actions={actions}
      onRowDoubleClick={(voucher) =>
        voucher.final || voucher.void ? onOpen(voucher) : onEdit(voucher)
      }
      searchLabel="Search vouchers"
      emptyMessage={
        kind === "JOURNAL"
          ? "No journal vouchers found."
          : "No bank receipt vouchers found."
      }
      selected={selected}
      onSelect={onSelect}
      selectionLabel="vouchers"
    />
  );
}
