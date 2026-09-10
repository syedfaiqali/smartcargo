/**
 * SINGLE SOURCE OF TRUTH FOR APP COLORS.
 *
 * Change any value below and the whole application (buttons, inputs,
 * dropdowns, tables, sidebar, chips, etc.) updates automatically —
 * no need to touch any other file.
 */
export const themeColors = {
  // Primary brand color — main buttons, active states, headings, links.
  primary: '#1e3a5f',
  primaryDark: '#142a45',
  primaryLight: '#2f527f',

  // Secondary/accent color — used for success actions, focus rings, highlights.
  secondary: '#5c8a2e',
  secondaryDark: '#476b23',
  secondaryLight: '#7ba648',

  // Sidebar (left navigation) colors.
  sidebarBg: '#152238',
  sidebarText: '#aab4c4',
  sidebarMuted: '#7c8aa0',
  sidebarSectionLabel: '#5b6b83',
  sidebarHover: 'rgba(255,255,255,0.05)',
  sidebarSelectedBg: '#2f527f',
  sidebarSelectedText: '#ffffff',
  sidebarDivider: 'rgba(255,255,255,0.08)',
  sidebarAvatarBg: '#2f527f',
  sidebarScrollbarThumb: 'rgba(255,255,255,0.16)',
  sidebarScrollbarThumbHover: 'rgba(255,255,255,0.28)',

  // Page background & surfaces.
  pageBackground: '#f4f6f9',
  surface: '#ffffff',

  // Text colors.
  textPrimary: '#1a2233',
  textSecondary: '#6b7280',

  // Borders / dividers used across inputs, tables, cards.
  border: '#d8dde3',
  borderHover: '#b9c2cc',

  // Table header / zebra stripe.
  tableHeaderBg: '#f0f4f8',

  // Status colors (kept aligned to MUI defaults but overridable here).
  success: '#2e7d32',
  warning: '#ed6c02',
  error: '#d32f2f',
  info: '#0288d1',
};
