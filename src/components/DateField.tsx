import { format, isValid, parseISO } from "date-fns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { themeColors } from "../theme/themeColors";

/** Shared themed date field. Values stay in the domain-friendly YYYY-MM-DD format. */
export function DateField({
  label,
  value,
  onChange,
  disabled = false,
  required = false,
  fullWidth = true,
  variant = "outlined",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  variant?: "outlined" | "standard" | "filled";
}) {
  const date = value ? parseISO(value) : null;
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        label={label}
        value={date && isValid(date) ? date : null}
        onChange={(nextDate) =>
          onChange(
            nextDate && isValid(nextDate) ? format(nextDate, "yyyy-MM-dd") : "",
          )
        }
        format="dd/MM/yyyy"
        disabled={disabled}
        slotProps={{
          textField: { fullWidth, required, variant },
          actionBar: { actions: ["clear", "today"] },
          popper: {
            sx: {
              "& .MuiPaper-root": {
                border: `1px solid ${themeColors.primaryLight}`,
                boxShadow: "0 12px 28px rgba(12, 24, 48, 0.2)",
              },
              "& .MuiPickersCalendarHeader-root, & .MuiPickersYear-yearButton.Mui-selected":
                { color: themeColors.primary },
              "& .MuiPickersDay-root.Mui-selected": {
                bgcolor: themeColors.primary,
                "&:hover, &:focus": { bgcolor: themeColors.primaryDark },
              },
              "& .MuiPickersDay-root.Mui-selected:focus": {
                bgcolor: themeColors.primaryDark,
              },
              "& .MuiPickersDay-root:hover": {
                bgcolor: `${themeColors.primary}14`,
              },
              "& .MuiButtonBase-root.MuiPickersDay-today": {
                borderColor: themeColors.secondary,
              },
              "& .MuiPickersDay-root.Mui-selected, & .MuiPickersDay-root.Mui-selected:hover":
                { color: "#fff" },
              "& .MuiPickersActionBar-root .MuiButton-root": {
                color: themeColors.primary,
                fontWeight: 700,
              },
            },
          },
        }}
      />
    </LocalizationProvider>
  );
}
