import { Dispatch, SetStateAction, useState } from "react";
import {
  Box,
  Paper,
  Button,
  TextField,
  MenuItem,
  Stack,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
} from "@mui/material";
import { WorkflowSection } from "../../components/WorkflowSection";
import { FormRow, FormField, SectionHeader } from "../../components/FormGrid";
import { NumberField } from "../../components/NumberField";
import { SearchField } from "../../components/SearchField";
import { confirmDelete } from "../../components/deleteConfirmation";
import { Voucher, VoucherCostLine } from "../../domain/voucher";
import { controlCodeRepo } from "../../data/financeSetupService";
import { bankRepo, partyRepo } from "../../data/masterDataService";

interface Props {
  voucher: Voucher;
  editable: boolean;
  draft: VoucherCostLine | null;
  onDraftChange: (draft: VoucherCostLine | null) => void;
  onChange: Dispatch<SetStateAction<Voucher | null>>;
}

export function BankReceiptCostTab({
  voucher,
  editable,
  draft,
  onDraftChange,
  onChange,
}: Props) {
  const [openSection, setOpenSection] = useState(1);
  const [gridOpen, setGridOpen] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const baseYear = Number(voucher.voucherDate.slice(0, 4)) || 2026;
  const years = [
    ...new Set(
      [
        ...Array.from({ length: 11 }, (_, index) =>
          String(baseYear - 5 + index),
        ),
        ...(voucher.costLines ?? []).map((line) => line.jobYear),
        draft?.jobYear ?? "",
      ].filter(Boolean),
    ),
  ]
    .sort()
    .reverse();
  const stations = [
    ...new Set(
      [
        voucher.branch,
        ...(voucher.costLines ?? []).map((line) => line.station),
        draft?.station ?? "",
      ].filter(Boolean),
    ),
  ];
  const options = [
    ...controlCodeRepo.list().map((a) => ({
      value: a.code,
      label: `${a.code} — ${a.name}`,
      description: a.name,
    })),
    ...bankRepo.list().map((a) => ({
      value: a.code,
      label: `${a.code} — ${a.name}`,
      description: a.name,
    })),
    ...partyRepo.list().map((a) => ({
      value: a.code,
      label: `${a.code} — ${a.name}`,
      description: a.name,
    })),
    ...(voucher.receiptEntryLines ?? [])
      .filter((line) => line.accountCode)
      .map((line) => ({
        value: line.accountCode,
        label: `${line.accountCode} — ${line.accountDescription}`,
        description: line.accountDescription,
      })),
  ];
  const activeAccount = draft?.accountCode ?? "";
  const accountTotal = activeAccount
    ? voucher.journalLines
        .filter((line) => line.accountHead === activeAccount)
        .reduce((sum, line) => sum + line.debit + line.credit, 0)
    : voucher.amount * voucher.exchangeRate;
  const detailTotal = (voucher.costLines ?? [])
    .filter((line) => !activeAccount || line.accountCode === activeAccount)
    .reduce((sum, line) => sum + line.amount, 0);
  const rows = (voucher.costLines ?? []).filter((line) =>
    Object.values(line).join(" ").toLowerCase().includes(search.toLowerCase()),
  );
  const currentPage = Math.min(
    page,
    Math.max(0, Math.ceil(rows.length / pageSize) - 1),
  );
  const enabled = editable && !!draft;
  const set = <K extends keyof VoucherCostLine>(
    key: K,
    value: VoucherCostLine[K],
  ) => {
    if (draft) onDraftChange({ ...draft, [key]: value });
  };
  const add = () => {
    setOpenSection(1);
    setError("");
    onDraftChange({
      id: crypto.randomUUID(),
      accountCode: "",
      description: "",
      jobType: "",
      jobYear: "",
      station: voucher.branch,
      houseJobNo: "",
      masterJobPrefix: "",
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
  };
  const save = () => {
    if (!draft || !editable) return;
    if (
      !draft.accountCode ||
      !Number.isFinite(draft.amount) ||
      draft.amount <= 0 ||
      !Number.isFinite(draft.invoiceAmount) ||
      draft.invoiceAmount < 0
    ) {
      setError("Select an account and enter valid cost and invoice amounts.");
      setOpenSection(
        !draft.accountCode
          ? 1
          : !Number.isFinite(draft.amount) || draft.amount <= 0
            ? 2
            : 3,
      );
      return;
    }
    onChange((current) => {
      if (!current || current.id !== voucher.id) return current;
      const lines = current.costLines ?? [];
      return {
        ...current,
        costLines: lines.some((line) => line.id === draft.id)
          ? lines.map((line) => (line.id === draft.id ? draft : line))
          : [...lines, draft],
      };
    });
    onDraftChange(null);
    setError("");
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1.5,
        }}
      >
        <SectionHeader>Cost Sheet</SectionHeader>
        <Button
          variant="contained"
          disabled={!editable || !!draft}
          onClick={add}
        >
          Add Cost
        </Button>
      </Box>
      <WorkflowSection
        title="Voucher Details"
        subtitle="Select the voucher account for this cost row"
        open={openSection === 1}
        onToggle={() => setOpenSection(openSection === 1 ? 0 : 1)}
      >
        <FormRow>
          <FormField>
            <TextField
              label="Voucher No."
              fullWidth
              value={voucher.voucherNo}
              disabled
            />
          </FormField>
          <FormField>
            <TextField
              label="Voucher Type"
              fullWidth
              value={voucher.kind === "JOURNAL" ? "JVR" : "BRV"}
              disabled
            />
          </FormField>
          <FormField>
            <TextField
              label="Branch"
              fullWidth
              value={voucher.branch}
              disabled
            />
          </FormField>
        </FormRow>
        <FormRow>
          <FormField md={12} sm={12}>
            <SearchField
              label="Account Code"
              value={draft?.accountCode ?? ""}
              options={options}
              disabled={!enabled}
              onChange={(value) => {
                if (draft)
                  onDraftChange({
                    ...draft,
                    accountCode: value,
                    description:
                      options.find((option) => option.value === value)
                        ?.description ?? "",
                  });
              }}
            />
          </FormField>
        </FormRow>
      </WorkflowSection>
      <WorkflowSection
        title="Job & Totals"
        subtitle="Enter job references and the expense amount"
        open={openSection === 2}
        onToggle={() => setOpenSection(openSection === 2 ? 0 : 2)}
      >
        <FormRow>
          <FormField>
            <TextField
              select
              label="Type"
              fullWidth
              value={draft?.jobType ?? ""}
              disabled={!enabled}
              onChange={(event) => set("jobType", event.target.value)}
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
            <TextField
              select
              label="Job Year"
              fullWidth
              value={draft?.jobYear ?? ""}
              disabled={!enabled}
              onChange={(event) => set("jobYear", event.target.value)}
            >
              <MenuItem value="">Select Year</MenuItem>
              {years.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </TextField>
          </FormField>
          <FormField>
            <TextField
              select
              label="Station"
              fullWidth
              value={draft?.station ?? voucher.branch}
              disabled={!enabled}
              onChange={(event) => set("station", event.target.value)}
            >
              {stations.map((station) => (
                <MenuItem key={station} value={station}>
                  {station}
                </MenuItem>
              ))}
            </TextField>
          </FormField>
        </FormRow>
        <FormRow>
          <FormField>
            <TextField
              label="H/Job No."
              fullWidth
              value={draft?.houseJobNo ?? ""}
              disabled={!enabled}
              onChange={(event) => set("houseJobNo", event.target.value)}
            />
          </FormField>
          <FormField>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "minmax(65px, 1fr) minmax(0, 2fr)",
                gap: 1,
              }}
            >
              <TextField
                label="Prefix"
                value={draft?.masterJobPrefix ?? ""}
                disabled={!enabled}
                onChange={(event) => set("masterJobPrefix", event.target.value)}
              />
              <TextField
                label="M/Job/Run No."
                value={draft?.masterJobNo ?? ""}
                disabled={!enabled}
                onChange={(event) => set("masterJobNo", event.target.value)}
              />
            </Box>
          </FormField>
          <FormField>
            <TextField
              label="Courier C/N No."
              fullWidth
              value={draft?.courierNo ?? ""}
              disabled={!enabled}
              onChange={(event) => set("courierNo", event.target.value)}
            />
          </FormField>
        </FormRow>
        <FormRow>
          <FormField>
            <TextField
              label="HAWB/HBL No."
              fullWidth
              value={draft?.houseBlNo ?? ""}
              disabled={!enabled}
              onChange={(event) => set("houseBlNo", event.target.value)}
            />
          </FormField>
          <FormField>
            <TextField
              label="MAWB/MBL No."
              fullWidth
              value={draft?.masterBlNo ?? ""}
              disabled={!enabled}
              onChange={(event) => set("masterBlNo", event.target.value)}
            />
          </FormField>
          <FormField>
            <NumberField
              label="Amount"
              fullWidth
              value={draft?.amount ?? ""}
              disabled={!enabled}
              onChange={(event) => set("amount", Number(event.target.value))}
            />
          </FormField>
        </FormRow>
        <SectionHeader>Totals</SectionHeader>
        <FormRow>
          <FormField>
            <NumberField
              label="Account Total"
              fullWidth
              value={accountTotal.toFixed(2)}
              InputProps={{ readOnly: true }}
            />
          </FormField>
          <FormField>
            <NumberField
              label="Detail Total"
              fullWidth
              value={detailTotal.toFixed(2)}
              InputProps={{ readOnly: true }}
            />
          </FormField>
          <FormField>
            <NumberField
              label="Difference"
              fullWidth
              value={(accountTotal - detailTotal).toFixed(2)}
              InputProps={{ readOnly: true }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                },
              }}
            />
          </FormField>
        </FormRow>
      </WorkflowSection>
      <WorkflowSection
        title="Party & Invoice Details"
        subtitle="Enter the party and invoice references for this cost"
        open={openSection === 3}
        onToggle={() => setOpenSection(openSection === 3 ? 0 : 3)}
      >
        <FormRow>
          <FormField md={12} sm={12}>
            <TextField
              label="Party Name"
              fullWidth
              value={draft?.partyName ?? ""}
              disabled={!enabled}
              onChange={(event) => set("partyName", event.target.value)}
            />
          </FormField>
        </FormRow>
        <FormRow>
          <FormField>
            <TextField
              label="Invoice No."
              fullWidth
              value={draft?.invoiceNo ?? ""}
              disabled={!enabled}
              onChange={(event) => set("invoiceNo", event.target.value)}
            />
          </FormField>
          <FormField>
            <NumberField
              label="Year"
              fullWidth
              value={draft?.invoiceYear ?? ""}
              disabled={!enabled}
              onChange={(event) => set("invoiceYear", event.target.value)}
            />
          </FormField>
          <FormField>
            <NumberField
              label="Invoice Amount"
              fullWidth
              value={draft?.invoiceAmount ?? ""}
              disabled={!enabled}
              onChange={(event) =>
                set("invoiceAmount", Number(event.target.value))
              }
            />
          </FormField>
        </FormRow>
      </WorkflowSection>
      {error && (
        <Alert severity="error" sx={{ mb: 1.5 }}>
          {error}
        </Alert>
      )}
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Button variant="contained" disabled={!enabled} onClick={save}>
          Save Row
        </Button>
        <Button
          variant="outlined"
          disabled={!draft}
          onClick={() => {
            onDraftChange(null);
            setError("");
          }}
        >
          Cancel
        </Button>
      </Stack>
      <WorkflowSection
        title="Cost Grid"
        subtitle="Review, search and edit saved cost rows"
        open={gridOpen}
        onToggle={() => setGridOpen(!gridOpen)}
      >
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1.5 }}>
          <TextField
            label="Search cost rows"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(0);
            }}
          />
        </Box>
        <Paper variant="outlined" sx={{ overflowX: "auto" }}>
          <Table
            size="small"
            sx={{
              minWidth: 1050,
              "& .MuiTableCell-root": {
                borderRight: "1px solid",
                borderColor: "divider",
                whiteSpace: "nowrap",
              },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell rowSpan={2}>Action</TableCell>
                <TableCell colSpan={2} align="center">
                  Account
                </TableCell>
                <TableCell colSpan={4} align="center">
                  Job
                </TableCell>
                <TableCell colSpan={2} align="center">
                  AirWay Bill
                </TableCell>
                <TableCell rowSpan={2}>Expense Amount</TableCell>
              </TableRow>
              <TableRow>
                {[
                  "Code",
                  "Description",
                  "Branch",
                  "Type",
                  "Master",
                  "House",
                  "Master",
                  "House / C/N No.",
                ].map((label, index) => (
                  <TableCell key={index}>{label}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows
                .slice(currentPage * pageSize, (currentPage + 1) * pageSize)
                .map((line) => (
                  <TableRow key={line.id}>
                    <TableCell>
                      <Button
                        disabled={!editable || !!draft}
                        onClick={() => {
                          onDraftChange(line);
                          setOpenSection(1);
                          setError("");
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        color="error"
                        disabled={!editable}
                        onClick={() =>
                          confirmDelete(() => {
                            onChange((current) =>
                              current?.id === voucher.id
                                ? {
                                    ...current,
                                    costLines: current.costLines?.filter(
                                      (item) => item.id !== line.id,
                                    ),
                                  }
                                : current,
                            );
                            if (draft?.id === line.id) onDraftChange(null);
                          })
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
                      [line.masterJobPrefix, line.masterJobNo]
                        .filter(Boolean)
                        .join("-"),
                      line.houseJobNo,
                      line.masterBlNo,
                      line.houseBlNo || line.courierNo,
                      line.amount.toFixed(2),
                    ].map((value, index) => (
                      <TableCell key={index}>{value || "—"}</TableCell>
                    ))}
                  </TableRow>
                ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                    No cost rows found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
        <TablePagination
          component="div"
          count={rows.length}
          page={currentPage}
          rowsPerPage={pageSize}
          onPageChange={(_, value) => setPage(value)}
          onRowsPerPageChange={(event) => {
            setPageSize(Number(event.target.value));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </WorkflowSection>
    </>
  );
}
