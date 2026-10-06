import { useState } from "react";
import {
  Button,
  MenuItem,
  Radio,
  RadioGroup,
  FormControlLabel,
  Stack,
  TextField,
} from "@mui/material";
import { DateField } from "../../components/DateField";
import { SearchField } from "../../components/SearchField";
import { WorkflowSection } from "../../components/WorkflowSection";
import { FormRow, FormField } from "../../components/FormGrid";
import { chequePartyOptions } from "../../data/postDatedChequeService";
import {
  ChequeDetailFilters,
  chequeStatuses,
} from "../../domain/postDatedCheque";

export function PostDatedChequeFilters({
  filters,
  onChange,
  onApply,
  onClear,
}: {
  filters: ChequeDetailFilters;
  onChange: (filters: ChequeDetailFilters) => void;
  onApply: () => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(true);
  const change = (patch: Partial<ChequeDetailFilters>) =>
    onChange({ ...filters, ...patch });
  return (
    <WorkflowSection
      title="Detail Filters"
      subtitle="Find cheques by account, date range and status"
      open={open}
      onToggle={() => setOpen(!open)}
    >
      <FormRow>
        <FormField>
          <TextField
            select
            label="Branch"
            fullWidth
            value={filters.branch}
            onChange={(event) => change({ branch: event.target.value })}
          >
            <MenuItem value="">All branches</MenuItem>
            <MenuItem value="KHI">KHI</MenuItem>
          </TextField>
        </FormField>
        <FormField>
          <SearchField
            label="Account Code"
            value={filters.partyCode}
            options={[
              { value: "", label: "All accounts" },
              ...chequePartyOptions(),
            ]}
            onChange={(partyCode) => change({ partyCode })}
          />
        </FormField>
        <FormField>
          <TextField
            label="Cheque No."
            fullWidth
            value={filters.chequeNo}
            onChange={(event) => change({ chequeNo: event.target.value })}
          />
        </FormField>
      </FormRow>
      <RadioGroup
        row
        aria-label="Filter date by"
        value={filters.dateField}
        onChange={(event) =>
          change({
            dateField: event.target.value as ChequeDetailFilters["dateField"],
          })
        }
        sx={{ mb: 1.5 }}
      >
        <FormControlLabel
          value="chequeDate"
          control={<Radio size="small" />}
          label="Cheque Date"
        />
        <FormControlLabel
          value="receiptDate"
          control={<Radio size="small" />}
          label="Cheque Received Date"
        />
      </RadioGroup>
      <FormRow>
        <FormField>
          <DateField
            label="Starting Date"
            value={filters.startDate}
            onChange={(startDate) => change({ startDate })}
          />
        </FormField>
        <FormField>
          <DateField
            label="Ending Date"
            value={filters.endDate}
            onChange={(endDate) => change({ endDate })}
          />
        </FormField>
        <FormField>
          <TextField
            select
            label="Cheque Status"
            fullWidth
            value={filters.status}
            onChange={(event) =>
              change({
                status: event.target.value as ChequeDetailFilters["status"],
              })
            }
          >
            <MenuItem value="ALL">All</MenuItem>
            {Object.entries(chequeStatuses).map(([value, label]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </TextField>
        </FormField>
      </FormRow>
      <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
        <Button variant="contained" onClick={onApply}>
          Show Detail
        </Button>
        <Button onClick={onClear}>Clear Detail Filters</Button>
      </Stack>
    </WorkflowSection>
  );
}
