import TextField, { TextFieldProps } from "@mui/material/TextField";

/**
 * Shared numeric input for editable forms.
 *
 * A text input with a numeric keyboard avoids browser number spinners and keeps
 * partial values (for example "-" or "12.") stable while the parent rerenders.
 */
export function NumberField({
  className,
  inputProps,
  ...props
}: TextFieldProps) {
  return (
    <TextField
      {...props}
      className={`numeric-field ${className ?? ""}`}
      type="text"
      inputProps={{ inputMode: "decimal", ...inputProps }}
    />
  );
}
