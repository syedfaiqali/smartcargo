import { useState } from "react";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { DateField } from "../../components/DateField";
import { NumberField } from "../../components/NumberField";
import { FormRow, FormField } from "../../components/FormGrid";
import { WorkflowSection } from "../../components/WorkflowSection";
import type { Voucher } from "../../domain/voucher";
import { bankRepo } from "../../data/masterDataService";
import {
  VoucherAttachment,
  VoucherDetailsTotals,
} from "./VoucherDetailsShared";
import type { VoucherDetailsProps } from "./VoucherDetailsShared";

export function ReceiptDetails({
  voucher,
  editable,
  clearedTotal,
  onChange,
}: VoucherDetailsProps) {
  const [open, setOpen] = useState(true);
  const isPayment = voucher.kind === "PAYMENT";
  const banks = bankRepo.list();
  const set = <K extends keyof Voucher>(key: K, value: Voucher[K]) =>
    onChange((current) =>
      current?.id === voucher.id ? { ...current, [key]: value } : current,
    );

  return (
    <WorkflowSection
      title={isPayment ? "Payment Details" : "Receipt Details"}
      subtitle={isPayment ? "Enter payment and cheque details, and attach a supporting document" : "Enter receipt and cheque details, and attach a supporting document"}
      open={open}
      onToggle={() => setOpen(!open)}
    >
      <Grid container spacing={2} alignItems="stretch">
        <Grid item xs={12} lg={5}>
          <FormRow>
            <FormField md={6}>
              <TextField
                select
                label="Branch"
                fullWidth
                value={voucher.branch}
                disabled={!editable}
                onChange={(event) => set("branch", event.target.value)}
              >
                <MenuItem value="KHI">KHI</MenuItem>
              </TextField>
            </FormField>
            <FormField md={6}>
              <DateField
                label="Entry Date"
                value={voucher.entryDate ?? voucher.createdAt.slice(0, 10)}
                disabled={!editable}
                onChange={(value) => set("entryDate", value)}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <NumberField
                label="Voucher No."
                fullWidth
                value={voucher.voucherNo}
                disabled={!editable}
                onChange={(event) => set("voucherNo", event.target.value)}
              />
            </FormField>
            <FormField md={6}>
              <DateField
                label="Voucher Date"
                value={voucher.voucherDate}
                disabled={!editable}
                onChange={(value) => set("voucherDate", value)}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField sm={12} md={12}>
              <TextField
                label={isPayment ? "Pay To" : "Received From"}
                fullWidth
                value={voucher.receivedFrom ?? voucher.partyName}
                disabled={!editable}
                onChange={(event) => set("receivedFrom", event.target.value)}
              />
            </FormField>
          </FormRow>
          {isPayment && (
            <FormRow>
              <FormField md={12}>
                <TextField select label="Bank Account" fullWidth value={voucher.bankCode} disabled={!editable} onChange={(event) => set("bankCode", event.target.value)}>
                  <MenuItem value="">Select Bank Account</MenuItem>
                  {banks.map((bank) => <MenuItem key={bank.code} value={bank.code}>{bank.code} â€” {bank.name}</MenuItem>)}
                </TextField>
              </FormField>
            </FormRow>
          )}
          <FormRow>
            <FormField md={6}>
              <TextField
                label="Cheque No."
                fullWidth
                value={voucher.chequeNo ?? ""}
                disabled={!editable}
                onChange={(event) => set("chequeNo", event.target.value)}
              />
            </FormField>
            <FormField md={6}>
              <DateField
                label="Cheque Date"
                value={voucher.chequeDate ?? ""}
                disabled={!editable}
                onChange={(value) => set("chequeDate", value)}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField
                select
                label="Cheque Status"
                fullWidth
                value={voucher.chequeStatus ?? "UNCLEARED"}
                disabled={!editable}
                onChange={(event) =>
                  set(
                    "chequeStatus",
                    event.target.value as Voucher["chequeStatus"],
                  )
                }
              >
                <MenuItem value="UNCLEARED">Un Cleared</MenuItem>
                <MenuItem value="CLEARED">Cleared</MenuItem>
                <MenuItem value="RETURNED">Returned</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
                <MenuItem value="BOUNCED">Bounced</MenuItem>
              </TextField>
            </FormField>
            <FormField md={6}>
              <DateField
                label="Clearing Date"
                value={voucher.clearingDate ?? ""}
                disabled={!editable}
                onChange={(value) => set("clearingDate", value)}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField
                select
                label="Cheque Type"
                fullWidth
                value={voucher.chequeType ?? "OPEN"}
                disabled={!editable}
                onChange={(event) =>
                  set("chequeType", event.target.value as Voucher["chequeType"])
                }
              >
                <MenuItem value="OPEN">Open</MenuItem>
                <MenuItem value="PAYEE_ACCOUNT_ONLY">Payee A/C Only</MenuItem>
                <MenuItem value="BANK_TRANSFER">Bank Transfer</MenuItem>
                <MenuItem value="ONLINE_TRANSFER">Online Transfer</MenuItem>
                <MenuItem value="CREDIT_CARD">Credit Card</MenuItem>
                <MenuItem value="PO">PO</MenuItem>
                <MenuItem value="TT">TT</MenuItem>
                <MenuItem value="CASH">Cash</MenuItem>
                <MenuItem value="PERSONAL_CHEQUE">Personal Cheque</MenuItem>
                <MenuItem value="ONLINE_PERSONAL">Online Personal</MenuItem>
                <MenuItem value="DIGITAL_WALLET">Digital Wallet</MenuItem>
                <MenuItem value="ATM_TRANSFER">ATM Transfer</MenuItem>
                <MenuItem value="RTGS">RTGS</MenuItem>
                <MenuItem value="IBFT">IBFT</MenuItem>
                <MenuItem value="CROSSED">Crossed</MenuItem>
              </TextField>
            </FormField>
          </FormRow>
        </Grid>
        <Grid item xs={12} sm={5} lg={3}>
          <VoucherDetailsTotals voucher={voucher} clearedTotal={clearedTotal} />
        </Grid>
        <Grid item xs={12} sm={7} lg={4}>
          <VoucherAttachment
            voucher={voucher}
            editable={editable}
            onChange={onChange}
            emptyMessage="Attach a cheque image or supporting document."
          />
        </Grid>
      </Grid>
    </WorkflowSection>
  );
}
