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
  sidebarBg: '#0c1830',
  sidebarText: '#a9b4c9',
  sidebarMuted: '#7f8caa',
  sidebarSectionLabel: '#57648099',
  sidebarHover: 'rgba(255,255,255,0.06)',
  sidebarSelectedBg: '#1f3a63',
  sidebarSelectedText: '#ffffff',
  sidebarDivider: 'rgba(255,255,255,0.08)',
  sidebarAvatarBg: '#3b6fd4',
  sidebarScrollbarThumb: 'rgba(255,255,255,0.16)',
  sidebarScrollbarThumbHover: 'rgba(255,255,255,0.28)',

  // Sidebar flyout panel (click-to-open submenu overlay).
  sidebarFlyoutBg: '#101f3d',
  sidebarFlyoutBorder: 'rgba(255,255,255,0.10)',
  sidebarFlyoutShadow: '0 16px 40px rgba(0,0,0,0.35)',

  // Favorite star control.
  sidebarStarGold: '#d4a017',
  sidebarStarGoldMuted: 'rgba(212,160,23,0.4)',

  // Accent — active borders, focus rings, highlighted search matches.
  sidebarAccent: '#4f8cff',

  // Quick access (pinned items) section.
  sidebarQuickAccessBg: 'rgba(255,255,255,0.04)',
  sidebarQuickAccessHover: 'rgba(255,255,255,0.08)',

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
