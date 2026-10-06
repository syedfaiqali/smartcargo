import { useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  Stack,
  TextField,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { WorkflowSection } from "../../components/WorkflowSection";
import { FormRow, FormField } from "../../components/FormGrid";
import { DateField } from "../../components/DateField";
import { NumberField } from "../../components/NumberField";
import { SearchField } from "../../components/SearchField";
import { SchemaTable, SchemaTableColumn } from "../../components/SchemaTable";
import { currencyRepo } from "../../data/masterDataService";
import { findReceivableSources } from "../../data/voucherService";
import {
  invoiceTotal,
  postDatedChequeRepo,
} from "../../data/postDatedChequeService";
import { VoucherClearingLine } from "../../domain/voucher";
import { ChequeFormProps } from "./PostDatedChequeEntry";

export function PostDatedChequeInvoices({
  draft,
  editable,
  onChange,
}: ChequeFormProps) {
  const [open, setOpen] = useState(true);
  const [dialog, setDialog] = useState(false);
  const [sourceKey, setSourceKey] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const total = invoiceTotal(draft),
    chequeAmount = Number(draft.amount) || 0;
  const editingLine = draft.invoices.find((line) => line.id === editingId);
  const otherTotal = total - (editingLine?.amountCleared || 0);
  const sources = draft.partyCode
    ? findReceivableSources(draft.partyCode).filter(
        (source) =>
          !draft.invoices.some(
            (line) =>
              line.id !== editingId &&
              line.sourceId === source.id &&
              line.sourceType === source.type,
          ),
      )
    : [];
  const key = (source: { type: string; id: string }) =>
    `${source.type}:${source.id}`;
  const savedLine = postDatedChequeRepo
    .get(draft.id)
    ?.invoices.find((line) => line.id === editingId);
  const selectedSource = sources.find((source) => key(source) === sourceKey);
  const allowedBalance = Math.max(
    selectedSource?.balance || 0,
    savedLine?.amountCleared || 0,
  );
  const columns: SchemaTableColumn<VoucherClearingLine>[] = [
    {
      key: "invoice",
      label: "Invoice No.",
      value: (line) => line.sourceDocNo,
      width: 200,
    },
    { key: "job", label: "Job No.", value: (line) => line.jobNo, width: 200 },
    {
      key: "type",
      label: "Invoice Type",
      value: (line) =>
        line.sourceType === "LOCAL_INVOICE"
          ? "Local Invoice"
          : "Foreign Agent Invoice",
      width: 210,
    },
    {
      key: "amount",
      label: "Applying Amount",
      type: "number",
      value: (line) => line.amountCleared,
      width: 180,
    },
  ];
  return (
    <WorkflowSection
      title="Invoices"
      subtitle="Link outstanding invoices and review the cheque allocation totals"
      open={open}
      onToggle={() => setOpen(!open)}
    >
      <FormRow>
        <FormField>
          <TextField
            label="Branch"
            value={draft.branch}
            fullWidth
            InputProps={{ readOnly: true }}
          />
        </FormField>
        <FormField>
          <TextField
            label="Receipt No."
            value={draft.receiptNo}
            fullWidth
            InputProps={{ readOnly: true }}
          />
        </FormField>
        <FormField>
          <DateField
            label="Receipt Date"
            value={draft.receiptDate}
            disabled
            onChange={() => {}}
          />
        </FormField>
      </FormRow>
      <FormRow>
        <FormField>
          <SearchField
            label="Currency"
            value={draft.currencyCode}
            disabled={!editable}
            options={currencyRepo.list().map((currency) => ({
              value: currency.code,
              label: `${currency.code} — ${currency.name}`,
            }))}
            onChange={(currencyCode) =>
              onChange({
                currencyCode,
                exchangeRate: String(
                  currencyRepo
                    .list()
                    .find((currency) => currency.code === currencyCode)
                    ?.defaultExchangeRate || 1,
                ),
              })
            }
          />
        </FormField>
        <FormField>
          <NumberField
            label="Exchange Rate"
            value={draft.exchangeRate}
            disabled={!editable}
            fullWidth
            onChange={(event) => onChange({ exchangeRate: event.target.value })}
          />
        </FormField>
        <FormField>
          <TextField
            label="Account Code"
            value={draft.partyCode}
            fullWidth
            InputProps={{ readOnly: true }}
          />
        </FormField>
        <FormField>
          <TextField
            label="Account Name"
            value={draft.partyName}
            fullWidth
            InputProps={{ readOnly: true }}
          />
        </FormField>
      </FormRow>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {[
          ["Transaction Total", chequeAmount],
          ["Detail Total", total],
          ["Difference Total", chequeAmount - total],
          [
            "Unallocated Amount (PKR)",
            (chequeAmount - total) * (Number(draft.exchangeRate) || 0),
          ],
        ].map(([label, value]) => (
          <Grid item xs={12} sm={6} lg={3} key={label}>
            <Paper variant="outlined" sx={{ p: 1.5 }}>
              <NumberField
                label={String(label)}
                value={Number(value).toFixed(2)}
                fullWidth
                InputProps={{ readOnly: true }}
              />
            </Paper>
          </Grid>
        ))}
      </Grid>
      {total > chequeAmount + 0.005 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Invoice allocations exceed the cheque amount. Edit or remove an
          allocation before saving.
        </Alert>
      )}
      {!draft.partyCode && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Select a Party Code in Entry to add outstanding invoices.
        </Alert>
      )}
      <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
        <Button
          variant="contained"
          disabled={!editable || !draft.partyCode || chequeAmount <= total}
          onClick={() => {
            setEditingId(null);
            setSourceKey("");
            setAmount("");
            setError("");
            setDialog(true);
          }}
        >
          Add Invoice
        </Button>
      </Stack>
      <SchemaTable
        title="Allocated Invoices"
        rows={draft.invoices}
        columns={columns}
        getRowId={(line) => line.id}
        searchLabel="Search allocated invoices"
        emptyMessage="No invoices allocated to this cheque."
        actions={
          editable
            ? [
                {
                  key: "edit",
                  label: "Edit invoice allocation",
                  icon: <EditOutlinedIcon />,
                  onClick: (line) => {
                    setEditingId(line.id);
                    setSourceKey(`${line.sourceType}:${line.sourceId}`);
                    setAmount(String(line.amountCleared));
                    setError("");
                    setDialog(true);
                  },
                },
                {
                  key: "remove",
                  label: "Remove invoice",
                  icon: <DeleteOutlineIcon />,
                  color: "error",
                  confirmDelete: "Remove this invoice allocation?",
                  onClick: (line) =>
                    onChange({
                      invoices: draft.invoices.filter(
                        (item) => item.id !== line.id,
                      ),
                    }),
                },
              ]
            : []
        }
      />
      <Dialog
        open={dialog}
        onClose={() => setDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editingLine ? "Edit Invoice Allocation" : "Add Invoice"}
        </DialogTitle>
        <DialogContent sx={{ pt: "16px !important", display: "grid", gap: 2 }}>
          {!sources.length && !editingLine && (
            <Alert severity="info">
              No unallocated outstanding invoices are available for this
              account.
            </Alert>
          )}
          <SearchField
            label="Outstanding Invoice"
            value={sourceKey}
            disabled={!!editingLine}
            options={sources
              .map((source) => ({
                value: key(source),
                label: `${source.docNo} — Balance ${source.balance.toFixed(2)}`,
              }))
              .concat(
                editingLine && !selectedSource
                  ? [{ value: sourceKey, label: editingLine.sourceDocNo }]
                  : [],
              )}
            onChange={(value) => {
              setSourceKey(value);
              const source = sources.find((item) => key(item) === value);
              setAmount(
                String(
                  Math.min(
                    source?.balance ?? 0,
                    Math.max(0, chequeAmount - otherTotal),
                  ),
                ),
              );
              setError("");
            }}
          />
          <NumberField
            label="Applying Amount"
            value={amount}
            fullWidth
            onChange={(event) => setAmount(event.target.value)}
            helperText={`Invoice limit: ${allowedBalance.toFixed(2)} · Available cheque amount: ${Math.max(0, chequeAmount - otherTotal).toFixed(2)}`}
          />
          {error && <Alert severity="error">{error}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!editable || !sourceKey}
            onClick={() => {
              const source = sources.find((item) => key(item) === sourceKey),
                value = Number(amount);
              if (
                (!source && !savedLine) ||
                !Number.isFinite(value) ||
                value <= 0 ||
                value > allowedBalance + 0.005 ||
                otherTotal + value > chequeAmount + 0.005
              ) {
                setError(
                  "Enter an amount within the invoice balance and remaining cheque amount.",
                );
                return;
              }
              onChange({
                invoices: editingLine
                  ? draft.invoices.map((line) =>
                      line.id === editingId
                        ? { ...line, amountCleared: value }
                        : line,
                    )
                  : source
                    ? [
                        ...draft.invoices,
                        {
                          id: crypto.randomUUID(),
                          sourceType: source.type,
                          sourceId: source.id,
                          sourceDocNo: source.docNo,
                          jobNo: source.jobNo,
                          amountCleared: value,
                        },
                      ]
                    : draft.invoices,
              });
              setDialog(false);
            }}
          >
            {editingLine ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </WorkflowSection>
  );
}
