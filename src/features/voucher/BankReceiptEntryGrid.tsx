import { confirmDelete } from '../../components/deleteConfirmation';
import { Dispatch, SetStateAction, useState } from "react";
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { WorkflowSection } from "../../components/WorkflowSection";
import { NumberField } from "../../components/NumberField";
import { DateField } from "../../components/DateField";
import { ReceiptEntryLine, Voucher } from "../../domain/voucher";
import {
  getReceiptEntryLines,
  receiptLineComplete,
  withReceiptEntryLines,
} from "../../domain/receiptEntry";
import {
  bankRepo,
  currencyRepo,
  partyRepo,
} from "../../data/masterDataService";
import { controlCodeRepo } from "../../data/financeSetupService";

export function BankReceiptEntryGrid({
  voucher,
  editable,
  onChange,
}: {
  voucher: Voucher;
  editable: boolean;
  onChange: Dispatch<SetStateAction<Voucher | null>>;
}) {
  const [open, setOpen] = useState(true);
  const lines = getReceiptEntryLines(voucher);
  const banks = bankRepo.list();
  const parties = partyRepo.list();
  const options = [
    ...banks.map((bank) => ({
      code: bank.code,
      name: bank.name,
      kind: "Bank",
    })),
    ...parties.map((party) => ({
      code: party.code,
      name: party.name,
      kind: "Party",
    })),
    ...controlCodeRepo
      .list()
      .map((account) => ({
        code: account.code,
        name: account.name,
        kind: "Account",
      })),
  ].filter(
    (option, index, all) =>
      all.findIndex((item) => item.code === option.code) === index,
  );
  const currencies = currencyRepo.list();
  const changeLine = (id: string, patch: Partial<ReceiptEntryLine>) => {
    onChange((current) => {
      if (!current || current.id !== voucher.id) return current;
      const next = getReceiptEntryLines(current).map((line) =>
        line.id === id ? { ...line, ...patch } : line,
      );
      const updated = withReceiptEntryLines(current, next);
      const changed = next.find((line) => line.id === id);
      if (patch.accountCode && changed) {
        if (
          changed.dc === "DEBIT" &&
          banks.some((bank) => bank.code === patch.accountCode)
        )
          updated.bankCode = patch.accountCode;
        const party = parties.find((item) => item.code === patch.accountCode);
        if (
          changed.dc === "CREDIT" &&
          party &&
          current.partyCode !== party.code
        ) {
          updated.partyCode = party.code;
          updated.partyName = party.name;
          updated.clearingLines = [];
        }
      }
      return updated;
    });
  };
  const canAdd = editable && lines.every(receiptLineComplete);
  const add = () => {
    onChange((current) => {
      if (!current || current.id !== voucher.id || !editable) return current;
      const existing = getReceiptEntryLines(current);
      if (!existing.every(receiptLineComplete)) return current;
      const line: ReceiptEntryLine = {
        id: crypto.randomUUID(),
        dc: existing.length ? "CREDIT" : "DEBIT",
        accountCode: "",
        accountDescription: "",
        particulars: current.receivedFrom
          ? `Received from ${current.receivedFrom}`
          : "",
        analysisCode: "",
        billNo: "",
        billDate: "",
        currencyCode: current.currencyCode || "PKR",
        exchangeRate: String(current.exchangeRate || 1),
        amount: "",
      };
      return withReceiptEntryLines(current, [...existing, line]);
    });
  };
  return (
    <WorkflowSection
      title="Account & Receipt Amount"
      subtitle="Add account entries. Complete Account Code and Amount before adding another row."
      open={open}
      onToggle={() => setOpen(!open)}
    >
      <Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          disabled={!canAdd}
          onClick={add}
        >
          Add Row
        </Button>
        {editable && !canAdd && (
          <Typography variant="caption" sx={{ ml: 1.5 }} color="text.secondary">
            Complete Account Code, Amount and Exchange Rate in the current row.
          </Typography>
        )}
      </Box>
      <Paper variant="outlined" sx={{ overflowX: "auto" }}>
        <Table
          size="small"
          sx={{
            minWidth: 1450,
            "& .MuiTableCell-root": { verticalAlign: "top", p: 1.25 },
            "& .MuiTableHead-root .MuiTableCell-root": { whiteSpace: "nowrap" },
          }}
        >
          <TableHead>
            <TableRow>
              {[
                "Action",
                "D/C",
                "Account Code",
                "Particulars",
                "Analysis",
                "Bill",
                "Currency",
                "Ex. Rate",
                "FC/PKR Amount",
              ].map((label) => (
                <TableCell key={label}>{label}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {lines.map((line, index) => {
              const invalid = editable && !receiptLineComplete(line);
              const pkr = Number(line.amount) * Number(line.exchangeRate);
              return (
                <TableRow
                  key={line.id}
                  sx={{
                    bgcolor:
                      index % 2 === 0 ? "action.hover" : "background.paper",
                  }}
                >
                  <TableCell>
                    <IconButton
                      aria-label={`Delete row ${index + 1}`}
                      size="small"
                      color="error"
                      disabled={!editable}
                      onClick={() =>
                        confirmDelete(() => onChange((current) =>
                          current
                            ? withReceiptEntryLines(
                                current,
                                getReceiptEntryLines(current).filter(
                                  (item) => item.id !== line.id,
                                ),
                              )
                            : current,
                        ))
                      }
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell sx={{ minWidth: 105 }}>
                    <TextField
                      select
                      fullWidth
                      label="D/C"
                      value={line.dc}
                      disabled={!editable}
                      onChange={(event) =>
                        changeLine(line.id, {
                          dc: event.target.value as ReceiptEntryLine["dc"],
                        })
                      }
                    >
                      <MenuItem value="DEBIT">Debit</MenuItem>
                      <MenuItem value="CREDIT">Credit</MenuItem>
                    </TextField>
                  </TableCell>
                  <TableCell sx={{ minWidth: 250 }}>
                    <TextField
                      select
                      fullWidth
                      required
                      label="Account Code"
                      value={line.accountCode}
                      disabled={!editable}
                      onChange={(event) =>
                        changeLine(line.id, {
                          accountCode: event.target.value,
                          accountDescription:
                            options.find(
                              (option) => option.code === event.target.value,
                            )?.name ?? "",
                        })
                      }
                    >
                      <MenuItem value="">Select Account Code</MenuItem>
                      {line.accountCode &&
                        !options.some(
                          (option) => option.code === line.accountCode,
                        ) && (
                          <MenuItem value={line.accountCode}>
                            {line.accountCode}
                          </MenuItem>
                        )}
                      {options.map((option) => (
                        <MenuItem key={option.code} value={option.code}>
                          {option.code} — {option.name} ({option.kind})
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      label="Account Description"
                      fullWidth
                      multiline
                      minRows={2}
                      value={
                        line.accountDescription ||
                        options.find(
                          (option) => option.code === line.accountCode,
                        )?.name ||
                        ""
                      }
                      InputProps={{ readOnly: true }}
                      sx={{ mt: 1 }}
                    />
                  </TableCell>
                  <TableCell sx={{ minWidth: 200 }}>
                    <TextField
                      label="Particulars"
                      fullWidth
                      multiline
                      minRows={3}
                      value={line.particulars}
                      disabled={!editable}
                      onChange={(event) =>
                        changeLine(line.id, { particulars: event.target.value })
                      }
                    />
                  </TableCell>
                  <TableCell sx={{ minWidth: 140 }}>
                    <TextField
                      label="Analysis Code"
                      fullWidth
                      value={line.analysisCode}
                      disabled={!editable}
                      onChange={(event) =>
                        changeLine(line.id, {
                          analysisCode: event.target.value,
                        })
                      }
                    />
                  </TableCell>
                  <TableCell sx={{ minWidth: 175 }}>
                    <TextField
                      label="Bill No."
                      fullWidth
                      value={line.billNo}
                      disabled={!editable}
                      onChange={(event) =>
                        changeLine(line.id, { billNo: event.target.value })
                      }
                    />
                    <Box sx={{ mt: 1 }}>
                      <DateField
                        label="Bill Date"
                        value={line.billDate}
                        disabled={!editable}
                        onChange={(value) =>
                          changeLine(line.id, { billDate: value })
                        }
                      />
                    </Box>
                  </TableCell>
                  <TableCell sx={{ minWidth: 100 }}>
                    <TextField
                      select
                      label="Currency"
                      fullWidth
                      value={line.currencyCode}
                      disabled={!editable}
                      onChange={(event) =>
                        changeLine(line.id, {
                          currencyCode: event.target.value,
                        })
                      }
                    >
                      {!currencies.some(
                        (currency) => currency.code === line.currencyCode,
                      ) && (
                        <MenuItem value={line.currencyCode}>
                          {line.currencyCode}
                        </MenuItem>
                      )}
                      {currencies.map((currency) => (
                        <MenuItem key={currency.code} value={currency.code}>
                          {currency.code}
                        </MenuItem>
                      ))}
                    </TextField>
                  </TableCell>
                  <TableCell sx={{ minWidth: 115 }}>
                    <NumberField
                      label="Ex. Rate"
                      fullWidth
                      required
                      value={line.exchangeRate}
                      disabled={!editable}
                      error={
                        invalid &&
                        (!Number.isFinite(Number(line.exchangeRate)) ||
                          Number(line.exchangeRate) <= 0)
                      }
                      onChange={(event) =>
                        changeLine(line.id, {
                          exchangeRate: event.target.value,
                        })
                      }
                    />
                  </TableCell>
                  <TableCell sx={{ minWidth: 165 }}>
                    <NumberField
                      label="FC Amount"
                      fullWidth
                      required
                      value={line.amount}
                      disabled={!editable}
                      error={
                        !!line.amount &&
                        (!Number.isFinite(Number(line.amount)) ||
                          Number(line.amount) <= 0)
                      }
                      onChange={(event) =>
                        changeLine(line.id, { amount: event.target.value })
                      }
                    />
                    <NumberField
                      label="PKR Amount"
                      fullWidth
                      value={Number.isFinite(pkr) ? pkr.toFixed(2) : "0.00"}
                      InputProps={{ readOnly: true }}
                      sx={{ mt: 1 }}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
            {lines.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                  No account entries. Click Add Row to begin.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mt: 1.5 }}
      >
        {lines.length} {lines.length === 1 ? "entry" : "entries"}
      </Typography>
    </WorkflowSection>
  );
}
