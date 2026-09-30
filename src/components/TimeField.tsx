import { format, isValid, parse } from "date-fns";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { renderTimeViewClock } from "@mui/x-date-pickers/timeViewRenderers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { themeColors } from "../theme/themeColors";

/** Shared themed time picker. Stored values use the stable 24-hour HH:mm format. */
export function TimeField({
  label,
  value,
  onChange,
  disabled = false,
  required = false,
  fullWidth = true,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  fullWidth?: boolean;
}) {
  const time = value ? parse(value, "HH:mm", new Date()) : null;
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <TimePicker
        label={label}
        value={time && isValid(time) ? time : null}
        onChange={(nextTime) =>
          onChange(
            nextTime && isValid(nextTime) ? format(nextTime, "HH:mm") : "",
          )
        }
        format="hh:mm aa"
        ampm
        views={["hours", "minutes"]}
        viewRenderers={{
          hours: renderTimeViewClock,
          minutes: renderTimeViewClock,
        }}
        disabled={disabled}
        slotProps={{
          textField: { fullWidth, required },
          actionBar: { actions: ["cancel", "accept"] },
          popper: {
            sx: {
              "& .MuiPaper-root": {
                border: `1px solid ${themeColors.primaryLight}`,
                boxShadow: "0 12px 28px rgba(12, 24, 48, 0.2)",
              },
              "& .MuiClock-pin, & .MuiClockPointer-root": {
                bgcolor: themeColors.primary,
              },
              "& .MuiClockPointer-thumb": { borderColor: themeColors.primary },
              "& .MuiClockNumber-root.Mui-selected": {
                bgcolor: themeColors.primary,
                color: "#fff",
              },
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
