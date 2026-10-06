import { useState } from "react";
import {
  Box,
  Button,
  Chip,
  Grid,
  MenuItem,
  TextField,
  Stack,
} from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { PageShell } from "../../layout/PageShell";
import { TransactionToolbar, ToolbarAction } from "../../components/TransactionToolbar";
import { WorkflowSection } from "../../components/WorkflowSection";
import { FormField, FormRow } from "../../components/FormGrid";
import { bankRepo } from "../../data/masterDataService";
import { SchemaTable, SchemaTableAction, SchemaTableColumn } from "../../components/SchemaTable";

type ChequeBookRow = {
  id: number;
  bankCode: string;
  bankName: string;
  chequeNo: string;
  createdDate: string;
  void: "Y" | "N";
  status: string;
  statusDate: string;
  voucherNo: string;
  voucherType: string;
  particulars: string;
  amount: number;
};

const sampleRows: ChequeBookRow[] = [
  { id: 1, bankCode: "108020002", bankName: "Habib Bank Ltd. F.T.C Branch", chequeNo: "145", createdDate: "2025-07-01", void: "N", status: "UnCleared", statusDate: "", voucherNo: "10", voucherType: "BPV", particulars: "Paid to IATA F/N 16-30/6/2025", amount: 155588 },
  { id: 2, bankCode: "108020002", bankName: "Habib Bank Ltd. F.T.C Branch", chequeNo: "146", createdDate: "2025-07-01", void: "N", status: "UnCleared", statusDate: "", voucherNo: "11", voucherType: "BPV", particulars: "Paid to PTCL 34300299", amount: 1050 },
  { id: 3, bankCode: "108020002", bankName: "Habib Bank Ltd. F.T.C Branch", chequeNo: "147", createdDate: "2025-07-01", void: "N", status: "UnCleared", statusDate: "", voucherNo: "12", voucherType: "BPV", particulars: "Paid to Excise & Taxation annual tax A/S 945", amount: 4000 },
  { id: 4, bankCode: "108020002", bankName: "Habib Bank Ltd. F.T.C Branch", chequeNo: "148", createdDate: "2025-07-01", void: "N", status: "UnCleared", statusDate: "", voucherNo: "13", voucherType: "BPV", particulars: "Paid to M&S Aviators F/N 16-30 June 2025", amount: 473085 },
  { id: 5, bankCode: "108020002", bankName: "Habib Bank Ltd. F.T.C Branch", chequeNo: "149", createdDate: "2025-07-01", void: "N", status: "UnCleared", statusDate: "", voucherNo: "14", voucherType: "BPV", particulars: "Paid to Mr. Shiran Ali for personal Expense", amount: 70000 },
];

const emptyDraft = () => ({ branch: "KHI", bankCode: "", creationDate: new Date().toISOString().slice(0, 10), startingChequeNo: "", endingChequeNo: "" });

const columns: SchemaTableColumn<ChequeBookRow>[] = [
  { key: "bankCode", label: "Code", value: (row) => row.bankCode, width: 135 },
  { key: "bankName", label: "Name", value: (row) => row.bankName, width: 260 },
  { key: "chequeNo", label: "No", value: (row) => row.chequeNo, width: 120 },
  { key: "createdDate", label: "Creat. Date", type: "date", value: (row) => row.createdDate, width: 145 },
  { key: "void", label: "Void", value: (row) => row.void, width: 90, align: "center", filterOptions: [{ value: "Y", label: "Yes" }, { value: "N", label: "No" }] },
  { key: "status", label: "Status", value: (row) => row.status, width: 135, filterOptions: ["UnCleared", "Cleared", "Returned"].map((value) => ({ value, label: value })) },
  { key: "statusDate", label: "Date", type: "date", value: (row) => row.statusDate, width: 140 },
  { key: "voucherNo", label: "No", value: (row) => row.voucherNo, width: 110 },
  { key: "voucherType", label: "Type", value: (row) => row.voucherType, width: 100 },
  { key: "particulars", label: "Particulars", value: (row) => row.particulars, width: 280 },
  { key: "amount", label: "Amount", type: "number", value: (row) => row.amount, width: 150 },
];

const columnGroups = [
  { label: "Bank", keys: ["bankCode", "bankName"] },
  { label: "Cheque", keys: ["chequeNo", "createdDate"] },
  { label: "Cheque Status", keys: ["status", "statusDate"] },
  { label: "Voucher", keys: ["voucherNo", "voucherType"] },
];

export function ChequeBookPage() {
  const banks = bankRepo.list();
  const [rows, setRows] = useState(sampleRows);
  const [isEntry, setIsEntry] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isViewing, setIsViewing] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);

  const action = (value: ToolbarAction) => {
    if (value === "new") {
      setDraft(emptyDraft());
      setEditingId(null);
      setIsViewing(false);
      setIsEntry(true);
    }
  };
  const save = () => {
    const bank = banks.find((item) => item.code === draft.bankCode);
    if (!bank || !draft.startingChequeNo || !draft.endingChequeNo) return;
    if (editingId !== null) {
      setRows((current) => current.map((row) => row.id === editingId ? {
        ...row,
        bankCode: bank.code,
        bankName: bank.name,
        chequeNo: draft.startingChequeNo,
        createdDate: draft.creationDate,
      } : row));
    }
    setIsEntry(false);
  };
  const actions: SchemaTableAction<ChequeBookRow>[] = [
    { key: "view", label: "View cheque", icon: <VisibilityOutlinedIcon />, onClick: (row) => {
      setDraft({ branch: "KHI", bankCode: row.bankCode, creationDate: row.createdDate, startingChequeNo: row.chequeNo, endingChequeNo: row.chequeNo });
      setEditingId(row.id);
      setIsViewing(true);
      setIsEntry(true);
    } },
    { key: "edit", label: "Edit cheque", icon: <EditOutlinedIcon />, onClick: (row) => {
      setDraft({ branch: "KHI", bankCode: row.bankCode, creationDate: row.createdDate, startingChequeNo: row.chequeNo, endingChequeNo: row.chequeNo });
      setEditingId(row.id);
      setIsViewing(false);
      setIsEntry(true);
    } },
    { key: "delete", label: "Delete cheque", icon: <DeleteOutlineIcon />, color: "error", onClick: (row) => setRows((current) => current.filter((item) => item.id !== row.id)), confirmDelete: (row) => `Delete cheque ${row.chequeNo}?` },
  ];
  const start = Number(draft.startingChequeNo);
  const end = Number(draft.endingChequeNo);
  const totalCheques = Number.isSafeInteger(start) && Number.isSafeInteger(end) && end >= start ? end - start + 1 : 0;

  if (isEntry) return (
    <PageShell breadcrumbs={["Finance", "Cheque Book", isViewing ? "View Cheque Book" : editingId === null ? "Data Entry of Cheque Book" : "Edit Cheque Book"]} title={isViewing ? "View Cheque Book" : editingId === null ? "Data Entry of Cheque Book" : "Edit Cheque Book"} actions={<Button variant="outlined" onClick={() => setIsEntry(false)}>Back to List</Button>}>
      {!isViewing && <TransactionToolbar actions={["save"]} onAction={(value) => { if (value === "save") save(); }} />}
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Chip color="primary" label={isViewing ? "View Cheque Book" : editingId === null ? "New Cheque Book" : "Edit Cheque Book"} />
        <Chip color={isViewing ? "default" : "info"} variant="outlined" label={isViewing ? "VIEW ONLY" : "EDITING"} />
      </Stack>
      <WorkflowSection title={isViewing ? "View Cheque Book" : editingId === null ? "Data Entry of Cheque Book" : "Edit Cheque Book"} subtitle="Enter the bank and cheque-number range" open onToggle={() => undefined}>
        <Grid container spacing={2} sx={{ maxWidth: 780 }}>
          <Grid item xs={12} md={6}><TextField select label="Branch" fullWidth disabled={isViewing} value={draft.branch} onChange={(event) => setDraft({ ...draft, branch: event.target.value })}><MenuItem value="KHI">KHI</MenuItem></TextField></Grid>
          <Grid item xs={12} md={6}><TextField select required label="Give Bank Code" fullWidth disabled={isViewing} value={draft.bankCode} onChange={(event) => setDraft({ ...draft, bankCode: event.target.value })}><MenuItem value="">Select Bank Code</MenuItem>{banks.map((bank) => <MenuItem key={bank.code} value={bank.code}>{bank.code} â€” {bank.name}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={6}><TextField label="Cheque Creation Date" type="date" fullWidth disabled={isViewing} InputLabelProps={{ shrink: true }} value={draft.creationDate} onChange={(event) => setDraft({ ...draft, creationDate: event.target.value })} /></Grid>
          <Grid item xs={12} md={6}><TextField required label="Give Starting Cheque No" fullWidth disabled={isViewing} inputProps={{ inputMode: "numeric" }} value={draft.startingChequeNo} onChange={(event) => setDraft({ ...draft, startingChequeNo: event.target.value })} /></Grid>
          <Grid item xs={12} md={6}><TextField required label="Give Ending Cheque No" fullWidth disabled={isViewing} inputProps={{ inputMode: "numeric" }} value={draft.endingChequeNo} onChange={(event) => setDraft({ ...draft, endingChequeNo: event.target.value })} /></Grid>
        </Grid>
        <Box sx={{ mt: 3, maxWidth: 780, p: 1.5, border: 1, borderColor: "divider", bgcolor: "action.hover" }}>
          <Grid container spacing={1}><Grid item xs={9}><strong>Total No of Cheques Nos Given</strong></Grid><Grid item xs={3}>{totalCheques}</Grid><Grid item xs={9}><strong>Total No of Cheques Nos found Duplicate</strong></Grid><Grid item xs={3}>0</Grid><Grid item xs={9}><strong>Total No of Cheques Nos to be Written</strong></Grid><Grid item xs={3}>{totalCheques}</Grid></Grid>
        </Box>
      </WorkflowSection>
    </PageShell>
  );

  return (
    <PageShell breadcrumbs={["Finance", "Cheque Book"]} title="Cheque Book">
      <TransactionToolbar actions={["new"]} onAction={action} />
      {false && (
        <WorkflowSection title="Cheque Book Details" subtitle="Enter cheque details before adding the record" open onToggle={() => setEditing(false)}>
          <FormRow>
            <FormField md={4}><TextField select required label="Bank" fullWidth value={draft.bankCode} onChange={(event) => setDraft({ ...draft, bankCode: event.target.value })}><MenuItem value="">Select Bank</MenuItem>{banks.map((bank) => <MenuItem key={bank.code} value={bank.code}>{bank.code} — {bank.name}</MenuItem>)}</TextField></FormField>
            <FormField md={4}><TextField required label="Cheque No." fullWidth value={draft.chequeNo} onChange={(event) => setDraft({ ...draft, chequeNo: event.target.value })} /></FormField>
            <FormField md={4}><TextField label="Created Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={draft.createdDate} onChange={(event) => setDraft({ ...draft, createdDate: event.target.value })} /></FormField>
          </FormRow>
          <FormRow>
            <FormField md={3}><TextField select label="Cheque Status" fullWidth value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value })}><MenuItem value="UnCleared">UnCleared</MenuItem><MenuItem value="Cleared">Cleared</MenuItem><MenuItem value="Returned">Returned</MenuItem></TextField></FormField>
            <FormField md={3}><TextField label="Status Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={draft.statusDate} onChange={(event) => setDraft({ ...draft, statusDate: event.target.value })} /></FormField>
            <FormField md={2}><TextField label="Voucher No." fullWidth value={draft.voucherNo} onChange={(event) => setDraft({ ...draft, voucherNo: event.target.value })} /></FormField>
            <FormField md={2}><TextField select label="Voucher Type" fullWidth value={draft.voucherType} onChange={(event) => setDraft({ ...draft, voucherType: event.target.value })}><MenuItem value="BPV">BPV</MenuItem><MenuItem value="CPV">CPV</MenuItem><MenuItem value="BRV">BRV</MenuItem><MenuItem value="CRV">CRV</MenuItem></TextField></FormField>
            <FormField md={2}><TextField required label="Amount" type="number" fullWidth value={draft.amount} onChange={(event) => setDraft({ ...draft, amount: event.target.value })} /></FormField>
          </FormRow>
          <FormRow><FormField md={12}><TextField label="Particulars" fullWidth value={draft.particulars} onChange={(event) => setDraft({ ...draft, particulars: event.target.value })} /></FormField></FormRow>
          <Box sx={{ display: "flex", gap: 1, mt: 2 }}><Button variant="contained" onClick={save}>Save</Button><Button variant="outlined" onClick={() => setEditing(false)}>Cancel</Button></Box>
        </WorkflowSection>
      )}
      <SchemaTable
        title="Cheque Book"
        subtitle="View and manage issued cheques"
        rows={rows}
        columns={columns}
        columnGroups={columnGroups}
        actions={actions}
        getRowId={(row) => String(row.id)}
        getRowLabel={(row) => row.chequeNo}
        searchLabel="Search cheques"
        emptyMessage="No cheque records found."
      />
    </PageShell>
  );
}
