import { confirmDelete } from '../../components/deleteConfirmation';
import { useState } from "react";
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Alert,
  Chip,
  Stack,
  Tabs,
  Tab,
  Checkbox,
  RadioGroup,
  Radio,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { jsPDF } from "jspdf";
import { PageShell } from "../../layout/PageShell";
import {
  TransactionToolbar,
  ToolbarAction,
} from "../../components/TransactionToolbar";
import { DateField } from "../../components/DateField";
import { NumberField } from "../../components/NumberField";
import { FormRow, FormField, SectionHeader } from "../../components/FormGrid";
import { BankReceiptEntryGrid } from "./BankReceiptEntryGrid";
import {
  getReceiptEntryLines,
  receiptLineComplete,
} from "../../domain/receiptEntry";
import { Voucher, VoucherCostLine } from "../../domain/voucher";
import { createEmptyVoucher } from "../../domain/voucherFactory";
import {
  voucherRepo,
  nextVoucherNo,
  findReceivableSources,
  finalizeVoucher,
  unfinalizeVoucher,
} from "../../data/voucherService";
import { partyRepo } from "../../data/masterDataService";
import { controlCodeRepo } from "../../data/financeSetupService";
import { BankReceiptHeader } from "./BankReceiptHeader";
import { BankReceiptGrid } from "./BankReceiptGrid";

const tabLabels = ["Entry", "Docs. Knock Off", "COST", "Printing", "Detail"];
const emptyCost = (): VoucherCostLine => ({
  id: crypto.randomUUID(),
  accountCode: "",
  description: "",
  jobType: "",
  jobYear: "",
  station: "KHI",
  houseJobNo: "",
  masterJobNo: "",
  courierNo: "",
  houseBlNo: "",
  masterBlNo: "",
  amount: 0,
  partyName: "",
  invoiceNo: "",
  invoiceYear: "",
  invoiceAmount: 0,
});

export function BankReceiptPage() {
  const [voucher, setVoucher] = useState<Voucher | null>(null);
  const [editable, setEditable] = useState(false);
  const [tab, setTab] = useState(0);
  const [revision, setRevision] = useState(0);
  const [message, setMessage] = useState<{
    severity: "success" | "error" | "warning";
    text: string;
  } | null>(null);
  const [cost, setCost] = useState<VoucherCostLine | null>(null);
  const [invoiceDialog, setInvoiceDialog] = useState(false);
  const [invoiceId, setInvoiceId] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState(0);
  const [printType, setPrintType] = useState("Voucher");
  const [selected, setSelected] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    branch: "KHI",
    start: "",
    end: "",
    account: "",
    analysis: "",
    status: "ALL",
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const all = voucherRepo.find((v) => v.kind === "RECEIPT");
  void revision;
  const parties = partyRepo.list();
  const accounts = controlCodeRepo.list();
  const refresh = () => setRevision((n) => n + 1);
  const update = <K extends keyof Voucher>(key: K, value: Voucher[K]) =>
    setVoucher((current) => (current ? { ...current, [key]: value } : current));
  const open = (v: Voucher, editing = false, nextTab = 0) => {
    setVoucher(v);
    setEditable(editing && !v.final && !v.void);
    setTab(nextTab);
    setCost(null);
  };
  const clearedTotal = (voucher?.clearingLines ?? []).reduce(
    (sum, line) => sum + line.amountCleared,
    0,
  );
  const costTotal = (voucher?.costLines ?? []).reduce(
    (sum, line) => sum + line.amount,
    0,
  );
  const sources = voucher
    ? findReceivableSources(voucher.partyCode || undefined)
    : [];
  const allocatedSources = voucher?.clearingLines ?? [];
  // Retain saved allocations even when finalization removes the invoice from the outstanding list.
  const invoiceRows = [
    ...sources,
    ...allocatedSources
      .filter((l) => !sources.some((s) => s.id === l.sourceId))
      .map((l) => ({
        id: l.sourceId,
        type: l.sourceType,
        docNo: l.sourceDocNo,
        jobNo: l.jobNo,
        balance: l.amountCleared,
        totalAmount: l.amountCleared,
        clearedAmount: 0,
      })),
  ];

  const save = () => {
    if (!voucher) return undefined;
    const entries = getReceiptEntryLines(voucher);
    if (!entries.length || !entries.every(receiptLineComplete)) {
      setMessage({
        severity: "error",
        text: "Complete Account Code, Amount and Exchange Rate in every account row before saving.",
      });
      return undefined;
    }
    if (!voucher.partyCode) {
      setMessage({ severity: "error", text: "Select a party before saving." });
      return undefined;
    }
    if (
      !Number.isFinite(voucher.amount) ||
      voucher.amount < 0 ||
      !Number.isFinite(voucher.exchangeRate) ||
      voucher.exchangeRate <= 0
    ) {
      setMessage({
        severity: "error",
        text: "Enter a valid amount and a positive exchange rate.",
      });
      return undefined;
    }
    if (clearedTotal > voucher.amount) {
      setMessage({
        severity: "error",
        text: "Cleared invoices total cannot exceed the receipt amount.",
      });
      return undefined;
    }
    for (const line of voucher.clearingLines) {
      const source = sources.find((s) => s.id === line.sourceId);
      if (
        !Number.isFinite(line.amountCleared) ||
        line.amountCleared <= 0 ||
        (!voucher.final && (!source || line.amountCleared > source.balance))
      ) {
        setMessage({
          severity: "error",
          text: `Check the clearing amount for ${line.sourceDocNo}.`,
        });
        return undefined;
      }
    }
    try {
      const saved = voucherRepo.save(voucher);
      setVoucher(saved);
      refresh();
      setMessage({
        severity: "success",
        text: `Voucher ${saved.voucherNo} saved.`,
      });
      return saved;
    } catch {
      setMessage({
        severity: "error",
        text: "Voucher could not be saved. Check available browser storage or use a smaller attachment.",
      });
      return undefined;
    }
  };
  const finalize = (v: Voucher) => {
    if (v.final || v.void) return;
    const entries = getReceiptEntryLines(v);
    if (!entries.length || !entries.every(receiptLineComplete))
      throw new Error("Complete every account row before finalizing.");
    const difference = v.journalLines.reduce(
      (sum, line) => sum + line.debit - line.credit,
      0,
    );
    if (Math.abs(difference) > 0.005)
      throw new Error(
        "Debit and Credit totals must balance before finalizing.",
      );
    if (
      !v.partyCode ||
      !Number.isFinite(v.amount) ||
      v.amount <= 0 ||
      !Number.isFinite(v.exchangeRate) ||
      v.exchangeRate <= 0 ||
      v.clearingLines.length === 0 ||
      v.clearingLines.reduce((s, l) => s + l.amountCleared, 0) > v.amount
    )
      throw new Error(
        `Voucher ${v.voucherNo} needs a party and valid invoice allocations.`,
      );
    const available = findReceivableSources(v.partyCode);
    if (
      v.clearingLines.some(
        (l) =>
          !Number.isFinite(l.amountCleared) ||
          l.amountCleared <= 0 ||
          l.amountCleared >
            (available.find((s) => s.id === l.sourceId)?.balance ?? 0),
      )
    )
      throw new Error(
        `Voucher ${v.voucherNo} has allocations above the outstanding balance.`,
      );
    return finalizeVoucher(v.id);
  };
  const remove = (v: Voucher) => {
    if (v.final || v.void) return;
    voucherRepo.remove(v.id);
    if (voucher?.id === v.id) setVoucher(null);
    refresh();
  };
  const action = (a: ToolbarAction) => {
    if (a === "new") {
      const draft = createEmptyVoucher("RECEIPT");
      draft.voucherNo = nextVoucherNo("RECEIPT", draft.branch);
      draft.entryDate = draft.voucherDate;
      open(draft, true);
      setMessage(null);
    } else if (a === "search") {
      setVoucher(null);
      setEditable(false);
      setTab(0);
    } else if (a === "save") save();
    else if (a === "edit" && voucher && !voucher.final && !voucher.void)
      setEditable(true);
    else if (a === "delete" && voucher) remove(voucher);
    else if (a === "final" && voucher) {
      try {
        const saved = editable ? save() : voucher;
        if (saved) {
          const final = finalize(saved);
          if (final) open(final);
          refresh();
        }
      } catch (error) {
        setMessage({ severity: "error", text: (error as Error).message });
      }
    } else if (a === "copy" && voucher) {
      const draft = {
        ...voucher,
        ...createEmptyVoucher("RECEIPT", voucher.branch),
        receiptEntryLines: [],
        costLines: [],
        void: false,
        posted: false,
        checked: false,
        receivedFrom: voucher.receivedFrom,
        accountCode: voucher.accountCode,
        bankCode: voucher.bankCode,
        partyCode: voucher.partyCode,
        partyName: voucher.partyName,
        currencyCode: voucher.currencyCode,
        exchangeRate: voucher.exchangeRate,
      };
      draft.voucherNo = nextVoucherNo("RECEIPT", draft.branch);
      open(draft, true);
    } else if (a === "void" && voucher && !voucher.final && !voucher.posted) {
      const saved = voucherRepo.save({ ...voucher, void: true });
      open(saved);
      refresh();
    } else if (["top", "bottom", "prev", "next"].includes(a) && all.length) {
      const index = all.findIndex((v) => v.id === voucher?.id);
      const target =
        a === "top"
          ? 0
          : a === "bottom"
            ? all.length - 1
            : a === "prev"
              ? Math.max(0, index - 1)
              : Math.min(all.length - 1, index + 1);
      open(all[target]);
    }
  };
  const detailRows = all.filter((v) => {
    const f = appliedFilters;
    if (
      (f.branch && v.branch !== f.branch) ||
      (f.start && v.voucherDate < f.start) ||
      (f.end && v.voucherDate > f.end) ||
      (f.account && !(v.accountCode ?? v.bankCode).includes(f.account)) ||
      (f.analysis && !(v.analysisCode ?? "").includes(f.analysis))
    )
      return false;
    const status: Record<string, boolean> = {
      Final: v.final,
      "Un-Final": !v.final,
      Posted: !!v.posted,
      "Un-Posted": !v.posted,
      Void: !!v.void,
      "Un-Void": !v.void,
      Check: !!v.checked,
      "Un-Check": !v.checked,
    };
    return f.status === "ALL" || status[f.status];
  });
  const batch = (makeFinal: boolean) => {
    let completed = 0;
    try {
      for (const v of detailRows.filter((row) => selected.includes(row.id))) {
        if (makeFinal) {
          if (finalize(v)) completed++;
        } else if (v.final && !v.posted) {
          unfinalizeVoucher(v.id);
          completed++;
        }
      }
      refresh();
      setMessage({
        severity: "success",
        text: `${completed} vouchers ${makeFinal ? "finalized" : "un-finalized"}.`,
      });
    } catch (error) {
      refresh();
      setMessage({
        severity: "error",
        text: `${completed} vouchers updated. ${(error as Error).message}`,
      });
    }
  };
  const exportDocument = (pdf: boolean) => {
    if (!voucher) return;
    const rows = [
      ["Document", printType],
      ["Voucher No.", voucher.voucherNo],
      ["Branch", voucher.branch],
      ["Date", voucher.voucherDate],
      ["Received From", voucher.receivedFrom ?? voucher.partyName],
      ["Account", voucher.accountCode ?? voucher.bankCode],
      ["Currency", voucher.currencyCode],
      ["Exchange Rate", String(voucher.exchangeRate)],
      ["Amount", voucher.amount.toFixed(2)],
      ["Cleared Invoices", clearedTotal.toFixed(2)],
      ["Cost Total", costTotal.toFixed(2)],
      ["Cheque No.", voucher.chequeNo ?? ""],
      ["Status", voucher.final ? "Final" : "Un-Final"],
      ...voucher.clearingLines.map((l) => [
        "Invoice",
        `${l.sourceDocNo}: ${l.amountCleared.toFixed(2)}`,
      ]),
      ...(voucher.costLines ?? []).map((l) => [
        "Cost",
        `${l.description}: ${l.amount.toFixed(2)}`,
      ]),
    ];
    if (pdf) {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text(`Bank Receipt ${printType}`, 15, 18);
      doc.setFontSize(10);
      let y = 30;
      rows.forEach(([label, value]) => {
        const lines = doc.splitTextToSize(`${label}: ${value}`, 180);
        if (y + lines.length * 6 > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(lines, 15, y);
        y += lines.length * 6 + 2;
      });
      doc.save(`${voucher.voucherNo}-${printType}.pdf`);
    } else {
      const escape = (value: string) =>
        `"${(/^[=+@-]/.test(value) ? "'" : "") + value.replace(/"/g, '""')}"`;
      const blob = new Blob(
        ["\uFEFF" + rows.map((row) => row.map(escape).join(",")).join("\r\n")],
        { type: "text/csv;charset=utf-8;" },
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${voucher.voucherNo}-${printType}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };
  const gridProps = {
    onOpen: (v: Voucher) => open(v),
    onEdit: (v: Voucher) => open(v, true),
    onDelete: remove,
    onPrint: (v: Voucher) => open(v, false, 3),
  };
  const disabled: ToolbarAction[] = [];
  if (!voucher)
    disabled.push("edit", "delete", "save", "final", "void", "copy");
  if (!editable || voucher?.final || voucher?.void) disabled.push("save");
  if (voucher?.final || voucher?.void)
    disabled.push("edit", "delete", "final", "void");

  return (
    <PageShell
      breadcrumbs={["Finance", "BRV - Bank Receipt Voucher"]}
      title="BRV - Bank Receipt Voucher"
      actions={
        voucher ? (
          <Button variant="outlined" onClick={() => action("search")}>
            Back to List
          </Button>
        ) : undefined
      }
    >
      {message && (
        <Alert
          severity={message.severity}
          sx={{ mb: 2 }}
          onClose={() => setMessage(null)}
        >
          {message.text}
        </Alert>
      )}
      <TransactionToolbar
        actions={
          voucher
            ? [
                "search",
                "top",
                "bottom",
                "prev",
                "next",
                "new",
                "save",
                "edit",
                "delete",
                "final",
                "void",
                "copy",
              ]
            : ["new"]
        }
        disabledActions={disabled}
        onAction={action}
      />
      {voucher && (
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Chip color="primary" label={voucher.voucherNo} />
          {voucher.final && <Chip color="success" label="FINAL" />}
          {voucher.void && <Chip color="error" label="VOID" />}
          {editable && <Chip color="info" variant="outlined" label="EDITING" />}
        </Stack>
      )}
      <Tabs
        value={tab}
        onChange={(_, value) => setTab(value)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}
      >
        {tabLabels.map((label, index) => (
          <Tab
            key={label}
            label={label}
            disabled={!voucher && index > 0 && index < 4}
          />
        ))}
      </Tabs>
      {tab === 0 &&
        (!voucher ? (
          <BankReceiptGrid vouchers={all} {...gridProps} />
        ) : (
          <>
            <BankReceiptHeader
              voucher={voucher}
              editable={editable}
              clearedTotal={clearedTotal * voucher.exchangeRate}
              onChange={setVoucher}
            />
            <BankReceiptEntryGrid
              voucher={voucher}
              editable={editable}
              onChange={setVoucher}
            />
          </>
        ))}
      {tab === 1 && voucher && (
        <>
          <FormRow>
            <FormField>
              <TextField
                select
                label="Party for Invoice Knock Off"
                fullWidth
                value={voucher.partyCode}
                disabled={!editable}
                onChange={(event) => {
                  const party = parties.find(
                    (item) => item.code === event.target.value,
                  );
                  setVoucher({
                    ...voucher,
                    partyCode: event.target.value,
                    partyName: party?.name ?? "",
                    clearingLines: [],
                  });
                }}
              >
                <MenuItem value="">Select Party</MenuItem>
                {parties.map((party) => (
                  <MenuItem key={party.code} value={party.code}>
                    {party.code} — {party.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
          </FormRow>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <SectionHeader>Voucher — Detail of Invoices</SectionHeader>
            <Button
              variant="contained"
              disabled={!editable || !voucher.partyCode}
              onClick={() => {
                setInvoiceId("");
                setInvoiceAmount(0);
                setInvoiceDialog(true);
              }}
            >
              Add Invoice
            </Button>
          </Box>
          <Dialog
            open={invoiceDialog}
            onClose={() => setInvoiceDialog(false)}
            fullWidth
            maxWidth="sm"
          >
            <DialogTitle>Add Invoice</DialogTitle>
            <DialogContent
              sx={{ pt: "12px !important", display: "grid", gap: 2 }}
            >
              <TextField
                select
                label="Outstanding Invoice"
                fullWidth
                value={invoiceId}
                onChange={(e) => {
                  setInvoiceId(e.target.value);
                  const source = sources.find((s) => s.id === e.target.value);
                  setInvoiceAmount(
                    Math.min(
                      source?.balance ?? 0,
                      Math.max(0, voucher.amount - clearedTotal),
                    ),
                  );
                }}
              >
                <MenuItem value="">Select Invoice</MenuItem>
                {sources
                  .filter(
                    (s) => !allocatedSources.some((l) => l.sourceId === s.id),
                  )
                  .map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.docNo} — Balance {s.balance.toFixed(2)}
                    </MenuItem>
                  ))}
              </TextField>
              <NumberField
                label="Applying Amount"
                fullWidth
                value={invoiceAmount}
                onChange={(e) => setInvoiceAmount(Number(e.target.value))}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setInvoiceDialog(false)}>Cancel</Button>
              <Button
                variant="contained"
                disabled={!editable || !invoiceId}
                onClick={() => {
                  const source = sources.find((s) => s.id === invoiceId);
                  if (
                    !source ||
                    !Number.isFinite(invoiceAmount) ||
                    invoiceAmount <= 0 ||
                    invoiceAmount > source.balance ||
                    clearedTotal + invoiceAmount > voucher.amount
                  ) {
                    setMessage({
                      severity: "error",
                      text: "Enter an amount within the invoice balance and remaining receipt amount.",
                    });
                    return;
                  }
                  update("clearingLines", [
                    ...allocatedSources,
                    {
                      id: crypto.randomUUID(),
                      sourceType: source.type,
                      sourceId: source.id,
                      sourceDocNo: source.docNo,
                      jobNo: source.jobNo,
                      amountCleared: invoiceAmount,
                    },
                  ]);
                  setInvoiceDialog(false);
                }}
              >
                Add
              </Button>
            </DialogActions>
          </Dialog>
          <FormRow>
            <FormField>
              <TextField
                label="Branch"
                fullWidth
                value={voucher.branch}
                disabled
              />
            </FormField>
            <FormField>
              <TextField
                label="Voucher No."
                fullWidth
                value={voucher.voucherNo}
                disabled
              />
            </FormField>
            <FormField>
              <DateField
                label="Voucher Date"
                value={voucher.voucherDate}
                disabled
                onChange={() => {}}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField>
              <TextField
                label="Currency"
                fullWidth
                value={voucher.currencyCode}
                disabled
              />
            </FormField>
            <FormField>
              <NumberField
                label="Exchange Rate"
                fullWidth
                value={voucher.exchangeRate}
                InputProps={{ readOnly: true }}
              />
            </FormField>
            <FormField>
              <TextField
                label="Account Code"
                fullWidth
                value={voucher.accountCode ?? voucher.bankCode}
                disabled
              />
            </FormField>
          </FormRow>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            {[
              ["Transaction Total", voucher.amount],
              ["Detail Total", clearedTotal],
              ["Difference Total", voucher.amount - clearedTotal],
              [
                "Exchange Difference (PKR)",
                (voucher.amount - clearedTotal) * voucher.exchangeRate,
              ],
            ].map(([label, amount]) => (
              <Grid item xs={12} sm={6} md={3} key={label}>
                <Paper variant="outlined" sx={{ p: 1.5 }}>
                  <NumberField
                    label={String(label)}
                    value={Number(amount).toFixed(2)}
                    fullWidth
                    InputProps={{ readOnly: true }}
                  />
                </Paper>
              </Grid>
            ))}
          </Grid>
          {!voucher.partyCode ? (
            <Alert severity="info">
              Select a party in Entry to add its outstanding invoices.
            </Alert>
          ) : (
            <Paper variant="outlined" sx={{ overflowX: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Select</TableCell>
                    {[
                      "Invoice No.",
                      "Job No.",
                      "Invoice Total",
                      "Already Cleared",
                      "Balance",
                      "Applying",
                    ].map((label) => (
                      <TableCell key={label}>{label}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoiceRows.map((s) => {
                    const allocation = allocatedSources.find(
                      (l) => l.sourceId === s.id,
                    );
                    return (
                      <TableRow key={s.id} selected={!!allocation}>
                        <TableCell>
                          <Checkbox
                            size="small"
                            disabled={!editable}
                            checked={!!allocation}
                            onChange={(e) =>
                              update(
                                "clearingLines",
                                e.target.checked
                                  ? [
                                      ...allocatedSources,
                                      {
                                        id: crypto.randomUUID(),
                                        sourceType: s.type,
                                        sourceId: s.id,
                                        sourceDocNo: s.docNo,
                                        jobNo: s.jobNo,
                                        amountCleared: Math.min(
                                          s.balance,
                                          Math.max(
                                            0,
                                            voucher.amount - clearedTotal,
                                          ),
                                        ),
                                      },
                                    ]
                                  : allocatedSources.filter(
                                      (l) => l.sourceId !== s.id,
                                    ),
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>{s.docNo}</TableCell>
                        <TableCell>{s.jobNo}</TableCell>
                        <TableCell>{s.totalAmount.toFixed(2)}</TableCell>
                        <TableCell>{s.clearedAmount.toFixed(2)}</TableCell>
                        <TableCell>{s.balance.toFixed(2)}</TableCell>
                        <TableCell>
                          {allocation && (
                            <NumberField
                              label="Applying"
                              value={allocation.amountCleared}
                              disabled={!editable}
                              onChange={(e) =>
                                update(
                                  "clearingLines",
                                  allocatedSources.map((l) =>
                                    l.sourceId === s.id
                                      ? {
                                          ...l,
                                          amountCleared: Number(e.target.value),
                                        }
                                      : l,
                                  ),
                                )
                              }
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {invoiceRows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                        No outstanding invoices for this party.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Paper>
          )}
        </>
      )}
      {tab === 2 && voucher && (
        <>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <SectionHeader>Cost Sheet</SectionHeader>
            <Button
              variant="contained"
              disabled={!editable}
              onClick={() => setCost(emptyCost())}
            >
              Add Cost
            </Button>
          </Box>
          <FormRow>
            {[
              ["Account Total", voucher.amount],
              ["Detail Total", costTotal],
              ["Difference", voucher.amount - costTotal],
            ].map(([label, value]) => (
              <FormField key={label}>
                <NumberField
                  label={String(label)}
                  fullWidth
                  value={Number(value).toFixed(2)}
                  InputProps={{ readOnly: true }}
                />
              </FormField>
            ))}
          </FormRow>
          {cost && (
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <SectionHeader>Voucher & Job</SectionHeader>
              <FormRow>
                <FormField>
                  <TextField
                    select
                    label="Account Code"
                    fullWidth
                    value={cost.accountCode}
                    onChange={(e) =>
                      setCost({
                        ...cost,
                        accountCode: e.target.value,
                        description:
                          accounts.find((a) => a.code === e.target.value)
                            ?.name ?? "",
                      })
                    }
                  >
                    <MenuItem value="">Select Account Code</MenuItem>
                    {accounts.map((a) => (
                      <MenuItem key={a.code} value={a.code}>
                        {a.code} — {a.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </FormField>
                <FormField>
                  <TextField
                    select
                    label="Job Type"
                    fullWidth
                    value={cost.jobType}
                    onChange={(e) =>
                      setCost({ ...cost, jobType: e.target.value })
                    }
                  >
                    <MenuItem value="">Select Type</MenuItem>
                    {[
                      "Air Export",
                      "Air Import",
                      "Sea Export",
                      "Sea Import",
                      "Courier",
                    ].map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </TextField>
                </FormField>
                <FormField>
                  <NumberField
                    label="Amount"
                    fullWidth
                    value={cost.amount}
                    onChange={(e) =>
                      setCost({ ...cost, amount: Number(e.target.value) })
                    }
                  />
                </FormField>
              </FormRow>
              <FormRow>
                {(
                  [
                    "description",
                    "jobYear",
                    "station",
                    "houseJobNo",
                    "masterJobNo",
                    "courierNo",
                    "houseBlNo",
                    "masterBlNo",
                    "partyName",
                    "invoiceNo",
                    "invoiceYear",
                  ] as const
                ).map((key, i) => (
                  <FormField key={key}>
                    <TextField
                      label={
                        [
                          "Account Description",
                          "Job Year",
                          "Station",
                          "H/Job No.",
                          "M/Job/Run No.",
                          "Courier C/N No.",
                          "HAWB/HBL No.",
                          "MAWB/MBL No.",
                          "Party Name",
                          "Invoice No.",
                          "Invoice Year",
                        ][i]
                      }
                      fullWidth
                      value={cost[key]}
                      onChange={(e) =>
                        setCost({ ...cost, [key]: e.target.value })
                      }
                    />
                  </FormField>
                ))}
                <FormField>
                  <NumberField
                    label="Invoice Amount"
                    fullWidth
                    value={cost.invoiceAmount}
                    onChange={(e) =>
                      setCost({
                        ...cost,
                        invoiceAmount: Number(e.target.value),
                      })
                    }
                  />
                </FormField>
              </FormRow>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  disabled={!editable}
                  onClick={() => {
                    if (
                      !cost.accountCode ||
                      !Number.isFinite(cost.amount) ||
                      cost.amount <= 0 ||
                      !Number.isFinite(cost.invoiceAmount) ||
                      cost.invoiceAmount < 0
                    ) {
                      setMessage({
                        severity: "error",
                        text: "Select an account and enter valid cost and invoice amounts.",
                      });
                      return;
                    }
                    update("costLines", [
                      ...(voucher.costLines ?? []).filter(
                        (l) => l.id !== cost.id,
                      ),
                      cost,
                    ]);
                    setCost(null);
                  }}
                >
                  Save Row
                </Button>
                <Button onClick={() => setCost(null)}>Cancel</Button>
              </Stack>
            </Paper>
          )}
          <Paper variant="outlined" sx={{ overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {[
                    "Action",
                    "Account Code",
                    "Description",
                    "Branch",
                    "Job Type",
                    "Master Job",
                    "House Job",
                    "Master AWB/BL",
                    "House AWB/BL / C/N",
                    "Expense Amount",
                  ].map((label) => (
                    <TableCell key={label}>{label}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {(voucher.costLines ?? []).map((line) => (
                  <TableRow key={line.id}>
                    <TableCell>
                      <Button
                        disabled={!editable}
                        onClick={() => setCost(line)}
                      >
                        Edit
                      </Button>
                      <Button
                        color="error"
                        disabled={!editable}
                        onClick={() =>
                          confirmDelete(() => update(
                            "costLines",
                            voucher.costLines?.filter((l) => l.id !== line.id),
                          ))
                        }
                      >
                        Delete
                      </Button>
                    </TableCell>
                    {[
                      line.accountCode,
                      line.description,
                      line.station,
                      line.jobType,
                      line.masterJobNo,
                      line.houseJobNo,
                      line.masterBlNo,
                      line.houseBlNo || line.courierNo,
                      line.amount.toFixed(2),
                    ].map((value, i) => (
                      <TableCell key={i}>{value}</TableCell>
                    ))}
                  </TableRow>
                ))}
                {!voucher.costLines?.length && (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                      No cost rows. Click Add Cost to add a row.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
        </>
      )}
      {tab === 3 && voucher && (
        <Paper variant="outlined" sx={{ p: 3, maxWidth: 750, mx: "auto" }}>
          <SectionHeader>Printing</SectionHeader>
          <FormRow>
            <FormField md={6}>
              <TextField
                label="Branch"
                fullWidth
                value={voucher.branch}
                disabled
              />
            </FormField>
            <FormField md={6}>
              <TextField
                label="Voucher No."
                fullWidth
                value={voucher.voucherNo}
                disabled
              />
            </FormField>
          </FormRow>
          <RadioGroup
            value={printType}
            onChange={(e) => setPrintType(e.target.value)}
          >
            {["Voucher", "Debit Note", "Credit Note", "Receipt"].map((type) => (
              <FormControlLabel
                key={type}
                value={type}
                control={<Radio />}
                label={type}
              />
            ))}
          </RadioGroup>
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button variant="contained" onClick={() => exportDocument(true)}>
              Download PDF
            </Button>
            <Button variant="outlined" onClick={() => exportDocument(false)}>
              Export CSV (Excel)
            </Button>
          </Stack>
        </Paper>
      )}
      {tab === 4 && (
        <>
          <SectionHeader>Voucher Detail</SectionHeader>
          <FormRow>
            <FormField>
              <TextField
                select
                label="Branch"
                fullWidth
                value={filters.branch}
                onChange={(e) =>
                  setFilters({ ...filters, branch: e.target.value })
                }
              >
                <MenuItem value="">All Branches</MenuItem>
                <MenuItem value="KHI">KHI</MenuItem>
              </TextField>
            </FormField>
            <FormField>
              <DateField
                label="Starting Voucher Date"
                value={filters.start}
                onChange={(start) => setFilters({ ...filters, start })}
              />
            </FormField>
            <FormField>
              <DateField
                label="Ending Voucher Date"
                value={filters.end}
                onChange={(end) => setFilters({ ...filters, end })}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField>
              <TextField
                label="Account Code"
                fullWidth
                value={filters.account}
                onChange={(e) =>
                  setFilters({ ...filters, account: e.target.value })
                }
              />
            </FormField>
            <FormField>
              <TextField
                label="Analysis Code"
                fullWidth
                value={filters.analysis}
                onChange={(e) =>
                  setFilters({ ...filters, analysis: e.target.value })
                }
              />
            </FormField>
            <FormField>
              <TextField
                select
                label="Show Voucher"
                fullWidth
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
              >
                {[
                  "ALL",
                  "Final",
                  "Un-Final",
                  "Posted",
                  "Un-Posted",
                  "Void",
                  "Un-Void",
                  "Check",
                  "Un-Check",
                ].map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
          </FormRow>
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Button
              variant="contained"
              onClick={() => {
                if (
                  filters.start &&
                  filters.end &&
                  filters.start > filters.end
                ) {
                  setMessage({
                    severity: "error",
                    text: "Starting date must be before the ending date.",
                  });
                  return;
                }
                setAppliedFilters(filters);
                setSelected([]);
              }}
            >
              Show Detail
            </Button>
            <Button
              color="success"
              variant="outlined"
              disabled={!selected.length}
              onClick={() => batch(true)}
            >
              Final Multiple Vouchers
            </Button>
            <Button
              color="error"
              variant="outlined"
              disabled={!selected.length}
              onClick={() => batch(false)}
            >
              Un-Final Multiple Vouchers
            </Button>
          </Stack>
          <BankReceiptGrid
            vouchers={detailRows}
            {...gridProps}
            selected={selected}
            onSelect={setSelected}
          />
        </>
      )}
    </PageShell>
  );
}
