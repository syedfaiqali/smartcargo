import { useRef, useState } from "react";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import ListSubheader from "@mui/material/ListSubheader";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";

export interface SearchFieldOption {
  value: string;
  label: string;
  description?: string;
}

/** Shared select with a search input inside its dropdown. Stores the selected code. */
export function SearchField({
  label,
  value,
  options,
  onChange,
  disabled = false,
  readOnly = false,
  required = false,
  fullWidth = true,
  placeholder = `Select ${label}`,
  searchPlaceholder = `Search ${label}`,
  noOptionsText = "No matching options",
  error = false,
  helperText,
}: {
  label: string;
  value: string;
  options: SearchFieldOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  noOptionsText?: string;
  error?: boolean;
  helperText?: string;
}) {
  const [query, setQuery] = useState("");
  const searchInput = useRef<HTMLInputElement>(null);
  const choices = options.filter(
    (option, index) =>
      options.findIndex((item) => item.value === option.value) === index,
  );
  const selected = choices.find((option) => option.value === value);
  const normalized = query.trim().toLowerCase();
  const filtered = choices.filter((option) =>
    `${option.value} ${option.label} ${option.description ?? ""}`
      .toLowerCase()
      .includes(normalized),
  );
  return (
    <TextField
      select
      label={label}
      value={value}
      fullWidth={fullWidth}
      required={required}
      disabled={disabled}
      error={error}
      helperText={helperText}
      onChange={(event) => onChange(event.target.value)}
      InputLabelProps={{ shrink: true }}
      SelectProps={{
        readOnly,
        displayEmpty: true,
        renderValue: () => selected?.label ?? (value || placeholder),
        onOpen: () => setQuery(""),
        MenuProps: {
          autoFocus: false,
          disableAutoFocusItem: true,
          PaperProps: { sx: { maxHeight: 320 } },
          TransitionProps: { onEntered: () => searchInput.current?.focus() },
        },
      }}
    >
      <ListSubheader
        sx={{ bgcolor: "background.paper", px: 1, py: 1, lineHeight: "normal" }}
        onClick={(event) => event.stopPropagation()}
      >
        <TextField
          inputRef={searchInput}
          fullWidth
          placeholder={searchPlaceholder}
          value={query}
          inputProps={{ "aria-label": searchPlaceholder }}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape" || event.key === "Tab") return;
            event.stopPropagation();
            if (event.key === "ArrowDown") {
              event.preventDefault();
              searchInput.current
                ?.closest('[role="listbox"]')
                ?.querySelector<HTMLElement>(
                  '[role="option"][tabindex]:not([aria-disabled="true"])',
                )
                ?.focus();
            }
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </ListSubheader>
      <MenuItem value="">{placeholder}</MenuItem>
      {filtered.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
      {value && !filtered.some((option) => option.value === value) && (
        <MenuItem value={value} sx={{ display: "none" }}>
          {selected?.label ?? value}
        </MenuItem>
      )}
      {filtered.length === 0 && <MenuItem disabled>{noOptionsText}</MenuItem>}
    </TextField>
  );
}
