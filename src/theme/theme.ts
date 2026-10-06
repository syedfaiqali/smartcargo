import { createTheme } from '@mui/material/styles';
import { themeColors } from './themeColors';

export const SIDEBAR_WIDTH = 248;

export const theme = createTheme({
  palette: {
    primary: {
      main: themeColors.primary,
      dark: themeColors.primaryDark,
      light: themeColors.primaryLight,
      contrastText: '#ffffff',
    },
    secondary: {
      main: themeColors.secondary,
      dark: themeColors.secondaryDark,
      light: themeColors.secondaryLight,
      contrastText: '#ffffff',
    },
    background: { default: themeColors.pageBackground, paper: themeColors.surface },
    text: { primary: themeColors.textPrimary, secondary: themeColors.textSecondary },
    divider: themeColors.border,
    success: { main: themeColors.success },
    warning: { main: themeColors.warning },
    error: { main: themeColors.error },
    info: { main: themeColors.info },
  },
  shape: { borderRadius: 8 },
  typography: {
    fontSize: 13,
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiTextField: {
      defaultProps: { size: 'small' },
    },
    MuiFormControl: {
      defaultProps: { size: 'small' },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          '&.Mui-disabled, &.Mui-disabled input, &.Mui-disabled textarea, &.Mui-disabled .MuiSelect-select, &.MuiInputBase-readOnly, &.Mui-readOnly, &:has(input[readonly]), &:has(textarea[readonly]), & input[readonly], & textarea[readonly]': {
            cursor: 'not-allowed',
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: themeColors.textSecondary,
          '&.Mui-focused': { color: themeColors.primary },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: themeColors.surface,
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: themeColors.border,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: themeColors.borderHover,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: themeColors.primary,
            borderWidth: 1.5,
          },
          '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
            borderColor: themeColors.border,
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        icon: { color: themeColors.textSecondary },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          margin: '2px 4px',
          '&:hover': { backgroundColor: `${themeColors.primary}14` },
          '&.Mui-selected': { backgroundColor: `${themeColors.primary}22` },
          '&.Mui-selected:hover': { backgroundColor: `${themeColors.primary}30` },
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          borderRadius: 10,
          border: `1px solid ${themeColors.border}`,
          boxShadow: '0 12px 28px rgba(16, 24, 40, 0.14), 0 2px 6px rgba(16, 24, 40, 0.08)',
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        paper: {
          borderRadius: 10,
          border: `1px solid ${themeColors.border}`,
          boxShadow: '0 12px 28px rgba(16, 24, 40, 0.14), 0 2px 6px rgba(16, 24, 40, 0.08)',
        },
        option: {
          borderRadius: 6,
          margin: '2px 4px',
          '&:hover': { backgroundColor: `${themeColors.primary}14` },
          '&[aria-selected="true"]': { backgroundColor: `${themeColors.primary}22 !important` },
        },
      },
    },
    MuiButton: {
      defaultProps: { size: 'small', disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 600, paddingInline: 16 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { padding: '4px 8px', borderColor: themeColors.border },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-root': {
            backgroundColor: themeColors.tableHeaderBg,
            fontWeight: 700,
            color: themeColors.textPrimary,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          '&.Mui-selected': { color: themeColors.primary },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: { backgroundColor: themeColors.primary },
      },
    },
  },
});
