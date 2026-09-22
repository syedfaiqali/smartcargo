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

/**
 * Pastel per-section tints — each SectionCard picks one of these so different
 * parts of a form read as distinct areas (Shipper=mint, Consignee=lavender, ...).
 */
export const sectionTints = {
  blue: { header: '#eaf2ff', text: '#1d4ed8', badge: '#2f6fed' },
  mint: { header: '#eafaf3', text: '#0f8a5f', badge: '#16a97a' },
  lavender: { header: '#f2eefc', text: '#6d3fc2', badge: '#8b5cf6' },
  cyan: { header: '#e9f8fb', text: '#0f7490', badge: '#14a8c9' },
  purple: { header: '#f6eefb', text: '#8324b5', badge: '#a855f7' },
  peach: { header: '#fdf3e7', text: '#b0631a', badge: '#e08a2b' },
  rose: { header: '#fdedef', text: '#c1274b', badge: '#f43f5e' },
  green: { header: '#eef9ec', text: '#3f7d1f', badge: '#65a30d' },
  slate: { header: '#eef1f5', text: '#44546b', badge: '#64748b' },
} as const;

export type SectionTint = keyof typeof sectionTints;

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

/** sx for the pill-style tab bar container — children are plain Box.pill-tab elements. */
export const navyTrustPillTabsSx = {
  display: 'flex',
  gap: 0.5,
  bgcolor: '#f1f3f6',
  borderRadius: '12px',
  p: 0.5,
  mb: 2.5,
  width: 'fit-content',
  flexWrap: 'wrap',
  '& .pill-tab': {
    fontFamily: navyTrustHeadingFontFamily,
    fontSize: 13,
    fontWeight: 700,
    color: navyTrustColors.textSecondary,
    px: 2,
    py: 0.75,
    borderRadius: '9px',
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'background-color 0.15s ease, color 0.15s ease',
    '&:hover': { color: navyTrustColors.textPrimary },
    '&.active': {
      bgcolor: navyTrustColors.accent,
      color: '#ffffff',
      boxShadow: '0 1px 3px rgba(47,111,237,0.35)',
    },
  },
} as const;

/**
 * sx applied to the outer Box wrapping a redesigned screen's content.
 *
 * Labels are pulled out of MUI's floating/notched-outline mechanism entirely —
 * they sit as plain static text above the field, and the border is a single
 * unbroken line (no legend cutout), matching the flat "label above box" look.
 */
export const navyTrustScreenSx = {
  fontFamily: navyTrustFontFamily,
  '& .MuiInputBase-root, & .MuiSelect-select, & .MuiMenuItem-root, & .MuiButton-root, & .MuiTableCell-root': {
    fontFamily: navyTrustFontFamily,
  },
  '& .MuiFormControl-root': { position: 'relative', marginTop: '20px', maxWidth: '100%' },
  '& .MuiInputBase-input, & .MuiSelect-select': { fontWeight: 500, color: navyTrustColors.textPrimary, fontSize: 14 },
  '& .MuiInputBase-input::placeholder': { color: '#94a3b8', opacity: 1 },
  '& .MuiInputLabel-root': {
    position: 'absolute',
    top: '-20px',
    left: '2px',
    right: '2px',
    fontWeight: 600,
    color: '#475569',
    fontSize: 12.5,
    transform: 'none',
    maxWidth: 'calc(100% - 4px)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
  },
  '& .MuiInputLabel-root.Mui-focused': { color: navyTrustColors.accent },
  '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: navyTrustColors.textSecondary, opacity: 1, fontWeight: 500 },
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    backgroundColor: '#f8fafc',
    '& .MuiOutlinedInput-notchedOutline': { borderColor: navyTrustColors.border },
    '& .MuiOutlinedInput-notchedOutline legend': { display: 'none' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: navyTrustColors.borderStrong },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: navyTrustColors.accent, borderWidth: 1.5 },
    '&.Mui-focused': { backgroundColor: navyTrustColors.surface },
  },
} as const;
