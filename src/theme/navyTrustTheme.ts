/**
 * "Navy Trust" visual language — numbered card sections with Sora/Manrope type,
 * used by redesigned transaction screens (Job MAWB/HAWB, Local Invoices, ...).
 */
export const navyTrustColors = {
  navy: '#1e3a5f',
  navyDark: '#152a45',
  navyLight: '#2f5586',
  accent: '#2f6fed',
  page: '#f5f7fa',
  surface: '#ffffff',
  border: '#e1e6ed',
  borderStrong: '#c7cfdb',
  headerBg: '#e8edf5',
  textPrimary: '#16233d',
  textSecondary: '#64748b',
  success: '#1f8a4c',
  successBg: '#eaf7ef',
  successBorder: '#bfe6cd',
  warning: '#b45309',
  danger: '#c0362c',
  dangerBg: '#fdeeed',
  dangerBorder: '#f3c7c2',
  info: '#0f6fb8',
};

export const navyTrustFontFamily = "'Manrope', 'Segoe UI', sans-serif";
export const navyTrustHeadingFontFamily = "'Sora', 'Segoe UI', sans-serif";

/** Loads Sora + Manrope once, scoped to whichever screen calls this. */
export function loadNavyTrustFonts() {
  const id = 'navy-trust-fonts';
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap';
  document.head.appendChild(link);
}

/** sx applied to the outer Box wrapping a redesigned screen's content. */
export const navyTrustScreenSx = {
  fontFamily: navyTrustFontFamily,
  '& .MuiInputBase-root, & .MuiSelect-select, & .MuiMenuItem-root, & .MuiButton-root, & .MuiTableCell-root': {
    fontFamily: navyTrustFontFamily,
  },
  '& .MuiInputBase-input, & .MuiSelect-select': { fontWeight: 600, color: navyTrustColors.textPrimary, fontSize: 14 },
  '& .MuiInputLabel-root': {
    fontWeight: 700,
    color: '#000000',
    fontSize: 13,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  '& .MuiInputLabel-root.Mui-focused': { color: navyTrustColors.accent },
  '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: navyTrustColors.textPrimary, opacity: 1, fontWeight: 600 },
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    backgroundColor: navyTrustColors.surface,
    '& .MuiOutlinedInput-notchedOutline': { borderColor: navyTrustColors.border },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: navyTrustColors.borderStrong },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: navyTrustColors.accent, borderWidth: 1.5 },
  },
} as const;
