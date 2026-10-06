import { useState } from "react";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { DateField } from "../../components/DateField";
import { NumberField } from "../../components/NumberField";
import { FormRow, FormField } from "../../components/FormGrid";
import { WorkflowSection } from "../../components/WorkflowSection";
import type { Voucher } from "../../domain/voucher";
import {
  VoucherAttachment,
  VoucherDetailsTotals,
} from "./VoucherDetailsShared";
import type { VoucherDetailsProps } from "./VoucherDetailsShared";

export function JournalDetails({
  voucher,
  editable,
  clearedTotal,
  onChange,
}: VoucherDetailsProps) {
  const [open, setOpen] = useState(true);
  const set = <K extends keyof Voucher>(key: K, value: Voucher[K]) =>
    onChange((current) =>
      current?.id === voucher.id ? { ...current, [key]: value } : current,
    );

  return (
    <WorkflowSection
      title="Journal Details"
      subtitle="Enter voucher dates and attach a supporting document"
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
        </Grid>
        <Grid item xs={12} sm={5} lg={3}>
          <VoucherDetailsTotals voucher={voucher} clearedTotal={clearedTotal} />
        </Grid>
        <Grid item xs={12} sm={7} lg={4}>
          <VoucherAttachment
            voucher={voucher}
            editable={editable}
            onChange={onChange}
            emptyMessage="Attach a supporting document."
          />
        </Grid>
      </Grid>
    </WorkflowSection>
  );
}
