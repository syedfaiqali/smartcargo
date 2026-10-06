import { useState } from "react";
import { Grid, MenuItem, TextField } from "@mui/material";
import { WorkflowSection } from "../../components/WorkflowSection";
import { DateField } from "../../components/DateField";
import { NumberField } from "../../components/NumberField";
import { SearchField } from "../../components/SearchField";
import { FormRow, FormField } from "../../components/FormGrid";
import { bankRepo } from "../../data/masterDataService";
import { chequePartyOptions } from "../../data/postDatedChequeService";
import {
  chequeStatuses,
  chequeTypes,
  PostDatedChequeDraft,
} from "../../domain/postDatedCheque";

export interface ChequeFormProps {
  draft: PostDatedChequeDraft;
  editable: boolean;
  onChange: (patch: Partial<PostDatedChequeDraft>) => void;
}
export function PostDatedChequeEntry({
  draft,
  editable,
  onChange,
}: ChequeFormProps) {
  const [chequeOpen, setChequeOpen] = useState(true);
  const [bankOpen, setBankOpen] = useState(true);
  const parties = chequePartyOptions();
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} lg={6}>
        <WorkflowSection
          title="Cheque Received"
          subtitle="Enter receipt, cheque and customer details"
          open={chequeOpen}
          onToggle={() => setChequeOpen(!chequeOpen)}
        >
          <FormRow>
            <FormField md={6}>
              <TextField
                select
                label="Branch"
                value={draft.branch}
                disabled={!editable}
                fullWidth
                onChange={(event) => onChange({ branch: event.target.value })}
              >
                <MenuItem value="KHI">KHI</MenuItem>
              </TextField>
            </FormField>
            <FormField md={6}>
              <TextField
                label="Receipt No."
                value={draft.receiptNo}
                fullWidth
                InputProps={{ readOnly: true }}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <DateField
                label="Receipt Date"
                value={draft.receiptDate}
                disabled={!editable}
                required
                onChange={(receiptDate) => onChange({ receiptDate })}
              />
            </FormField>
            <FormField md={6}>
              <DateField
                label="Cheque Date"
                value={draft.chequeDate}
                disabled={!editable}
                required
                onChange={(chequeDate) => onChange({ chequeDate })}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField
                label="Cheque No."
                value={draft.chequeNo}
                disabled={!editable}
                required
                fullWidth
                onChange={(event) => onChange({ chequeNo: event.target.value })}
              />
            </FormField>
            <FormField md={6}>
              <NumberField
                label="Cheque Amount"
                value={draft.amount}
                disabled={!editable}
                required
                fullWidth
                onChange={(event) => onChange({ amount: event.target.value })}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField sm={12} md={12}>
              <SearchField
                label="Party Code"
                value={draft.partyCode}
                disabled={!editable}
                required
                options={parties}
                onChange={(partyCode) =>
                  onChange({
                    partyCode,
                    partyName:
                      parties.find((party) => party.value === partyCode)
                        ?.name ?? "",
                    invoices: [],
                  })
                }
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField sm={12} md={12}>
              <TextField
                label="Party Name"
                value={draft.partyName}
                fullWidth
                InputProps={{ readOnly: true }}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField sm={12} md={12}>
              <TextField
                label="Remarks"
                value={draft.remarks}
                disabled={!editable}
                fullWidth
                multiline
                minRows={3}
                onChange={(event) => onChange({ remarks: event.target.value })}
              />
            </FormField>
          </FormRow>
        </WorkflowSection>
      </Grid>
      <Grid item xs={12} lg={6}>
        <WorkflowSection
          title="Bank"
          subtitle="Track deposit, clearing and the bank receipt reference"
          open={bankOpen}
          onToggle={() => setBankOpen(!bankOpen)}
        >
          <FormRow>
            <FormField sm={12} md={12}>
              <SearchField
                label="Bank Code"
                value={draft.bankCode}
                disabled={!editable}
                required
                options={bankRepo.list().map((bank) => ({
                  value: bank.code,
                  label: `${bank.code} — ${bank.name}`,
                }))}
                onChange={(bankCode) => onChange({ bankCode })}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <DateField
                label="Deposited Date"
                value={draft.depositedDate}
                disabled={!editable}
                onChange={(depositedDate) => onChange({ depositedDate })}
              />
            </FormField>
            <FormField md={6}>
              <TextField
                label="Slip No."
                value={draft.slipNo}
                disabled={!editable}
                fullWidth
                onChange={(event) => onChange({ slipNo: event.target.value })}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField
                select
                label="Cheque Type"
                value={draft.chequeType}
                disabled={!editable}
                fullWidth
                onChange={(event) =>
                  onChange({
                    chequeType: event.target
                      .value as PostDatedChequeDraft["chequeType"],
                  })
                }
              >
                {Object.entries(chequeTypes).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={6}>
              <TextField
                select
                label="Cheque Status"
                value={draft.chequeStatus}
                disabled={!editable}
                fullWidth
                onChange={(event) =>
                  onChange({
                    chequeStatus: event.target
                      .value as PostDatedChequeDraft["chequeStatus"],
                  })
                }
              >
                {Object.entries(chequeStatuses).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <DateField
                label="Cleared Date"
                value={draft.clearedDate}
                disabled={!editable}
                onChange={(clearedDate) => onChange({ clearedDate })}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField
                label="Bank Receipt No."
                value={draft.bankReceiptNo}
                disabled={!editable}
                fullWidth
                onChange={(event) =>
                  onChange({ bankReceiptNo: event.target.value })
                }
              />
            </FormField>
            <FormField md={6}>
              <NumberField
                label="BRV Year"
                value={draft.bankReceiptYear}
                disabled={!editable}
                fullWidth
                inputProps={{ maxLength: 4 }}
                onChange={(event) =>
                  onChange({ bankReceiptYear: event.target.value })
                }
              />
            </FormField>
          </FormRow>
        </WorkflowSection>
      </Grid>
    </Grid>
  );
}
