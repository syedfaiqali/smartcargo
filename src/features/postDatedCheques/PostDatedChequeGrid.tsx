import { Chip } from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import { SchemaTable, SchemaTableColumn } from "../../components/SchemaTable";
import { chequeStatuses, PostDatedCheque } from "../../domain/postDatedCheque";
import { invoiceTotal } from "../../data/postDatedChequeService";

const columns: SchemaTableColumn<PostDatedCheque>[] = [
  { key: "branch", label: "Branch", value: (row) => row.branch, width: 95 },
  {
    key: "receiptNo",
    label: "Receipt No.",
    value: (row) => row.receiptNo,
    width: 175,
  },
  {
    key: "receiptDate",
    label: "Receipt Date",
    type: "date",
    value: (row) => row.receiptDate,
    width: 155,
  },
  {
    key: "partyCode",
    label: "Code",
    value: (row) => row.partyCode,
    width: 120,
  },
  {
    key: "partyName",
    label: "Name",
    value: (row) => row.partyName,
    width: 230,
  },
  {
    key: "chequeNo",
    label: "Cheque No.",
    value: (row) => row.chequeNo,
    width: 155,
  },
  {
    key: "chequeDate",
    label: "Cheque Date",
    type: "date",
    value: (row) => row.chequeDate,
    width: 155,
  },
  {
    key: "amount",
    label: "Cheque Amount",
    type: "number",
    value: (row) => row.amount,
    width: 165,
  },
  {
    key: "invoiceAmount",
    label: "Invoice Amount",
    type: "number",
    value: invoiceTotal,
    width: 165,
  },
  {
    key: "status",
    label: "Cheque Status",
    value: (row) => chequeStatuses[row.chequeStatus],
    width: 155,
    filterOptions: Object.values(chequeStatuses).map((label) => ({
      value: label,
      label,
    })),
    render: (row) => (
      <Chip
        size="small"
        variant="outlined"
        label={chequeStatuses[row.chequeStatus]}
        color={
          row.chequeStatus === "CLEARED"
            ? "success"
            : ["RETURNED", "CANCELLED"].includes(row.chequeStatus)
              ? "error"
              : "default"
        }
      />
    ),
  },
  {
    key: "bankReceipt",
    label: "Bank Receipt",
    value: (row) => row.bankReceiptNo,
    width: 175,
  },
  {
    key: "bankReceiptYear",
    label: "Year",
    value: (row) => row.bankReceiptYear,
    width: 100,
  },
];
export function PostDatedChequeGrid({
  rows,
  selected,
  onSelect,
  onOpen,
  onEdit,
  onDelete,
  onPrint,
}: {
  rows: PostDatedCheque[];
  selected: string[];
  onSelect: (ids: string[]) => void;
  onOpen: (row: PostDatedCheque) => void;
  onEdit: (row: PostDatedCheque) => void;
  onDelete: (row: PostDatedCheque) => void;
  onPrint: (row: PostDatedCheque) => void;
}) {
  return (
    <SchemaTable
      title="Post Dated Cheques Received"
      subtitle="View, manage and print cheque receipts"
      rows={rows}
      columns={columns}
      columnGroups={[
        { label: "DOCUMENT", keys: ["receiptNo", "receiptDate"] },
        { label: "PARTY", keys: ["partyCode", "partyName"] },
        { label: "CHEQUE", keys: ["chequeNo", "chequeDate", "amount"] },
        { label: "BRV", keys: ["bankReceipt", "bankReceiptYear"] },
      ]}
      allowAllRows
      initialPageSize={-1}
      getRowId={(row) => row.id}
      getRowLabel={(row) => row.receiptNo}
      selected={selected}
      onSelect={onSelect}
      selectionLabel="cheques"
      searchLabel="Search cheques"
      emptyMessage="No post dated cheques received yet."
      onRowDoubleClick={onEdit}
      actions={[
        {
          key: "open",
          label: "Open cheque receipt",
          icon: <VisibilityOutlinedIcon />,
          onClick: onOpen,
        },
        {
          key: "edit",
          label: "Edit cheque receipt",
          icon: <EditOutlinedIcon />,
          onClick: onEdit,
        },
        {
          key: "delete",
          label: "Delete cheque receipt",
          icon: <DeleteOutlineIcon />,
          onClick: onDelete,
          color: "error",
          confirmDelete: (row) => `Delete receipt ${row.receiptNo}?`,
        },
        {
          key: "print",
          label: "Print cheque receipt",
          icon: <PrintOutlinedIcon />,
          onClick: onPrint,
        },
      ]}
    />
  );
}
