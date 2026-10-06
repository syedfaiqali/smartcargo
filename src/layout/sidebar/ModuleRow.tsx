import { useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { NavLeaf, SidebarModule } from '../navConfig';
import { themeColors } from '../../theme/themeColors';
import { MODULE_ICONS } from './icons';
import { HOVER_INTENT_MS } from './constants';
import { PinButton } from './PinButton';

export function ModuleRow({
  mod,
  isActiveModule,
  isExpanded,
  isFlyoutOpen,
  openFlyoutGroupLabel,
  onToggleExpand,
  onSwitchFlyoutOnHover,
  onGroupClick,
  onGroupHover,
  isPinned,
  togglePin,
  activePath,
  onNavigateLeaf,
}: {
  mod: SidebarModule;
  isActiveModule: boolean;
  isExpanded: boolean;
  isFlyoutOpen: boolean;
  openFlyoutGroupLabel: string | null;
  onToggleExpand: () => void;
  /** Hover-intent: only switches to this module's flyout if some flyout is already open. */
  onSwitchFlyoutOnHover: () => void;
  onGroupClick: (groupLabel: string, anchorTop: number) => void;
  onGroupHover: (groupLabel: string, anchorTop: number) => void;
  isPinned: (path: string) => boolean;
  togglePin: (path: string) => void;
  activePath: string;
  onNavigateLeaf: (path: string) => void;
}) {
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHoverTimer = () => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  };

  const handleMouseEnter = () => {
    if (mod.disabled) return;
    hoverTimer.current = setTimeout(() => {
      onSwitchFlyoutOnHover();
    }, HOVER_INTENT_MS);
  };

  const iconColor = isActiveModule || isFlyoutOpen ? themeColors.sidebarAccent : '#8fa0c4';

  if (!mod.submenu) {
    const isActiveLeaf = !!mod.path && activePath === mod.path;
    return (
      <Box
        role="button"
        tabIndex={mod.disabled ? -1 : 0}
        aria-disabled={mod.disabled || undefined}
        aria-current={isActiveLeaf ? 'page' : undefined}
        onClick={() => !mod.disabled && mod.path && onNavigateLeaf(mod.path)}
        onKeyDown={(e) => {
          if (!mod.disabled && mod.path && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onNavigateLeaf(mod.path);
          }
        }}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          px: 1.25,
          py: 1,
          mb: 0.375,
          borderRadius: '8px',
          cursor: mod.disabled ? 'default' : 'pointer',
          opacity: mod.disabled ? 0.35 : 1,
          color: isActiveLeaf ? themeColors.sidebarSelectedText : themeColors.sidebarText,
          bgcolor: isActiveLeaf ? themeColors.sidebarSelectedBg : 'transparent',
          transition: 'background-color 150ms ease, color 150ms ease',
          '&:hover': !mod.disabled ? { bgcolor: isActiveLeaf ? themeColors.sidebarSelectedBg : themeColors.sidebarHover } : undefined,
        }}
      >
        <Box sx={{ display: 'flex', color: isActiveLeaf ? themeColors.sidebarAccent : '#8fa0c4' }}>{MODULE_ICONS[mod.icon]}</Box>
        <Typography sx={{ fontSize: 13.5, fontWeight: 600, flexGrow: 1 }}>{mod.label}</Typography>
      </Box>
    );
  }

  return (
    <Box
      onMouseEnter={handleMouseEnter}
      onMouseLeave={clearHoverTimer}
      sx={{
        borderLeft: isActiveModule ? `3px solid ${themeColors.sidebarAccent}` : '3px solid transparent',
        mb: 0.375,
      }}
    >
      <Box
        role="button"
        tabIndex={mod.disabled ? -1 : 0}
        aria-disabled={mod.disabled || undefined}
        aria-expanded={mod.disabled ? undefined : isExpanded}
        onClick={() => !mod.disabled && onToggleExpand()}
        onKeyDown={(e) => {
          if (!mod.disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onToggleExpand();
          }
        }}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          pl: 1.25,
          pr: 1,
          py: 1,
          ml: '-3px',
          borderRadius: '8px',
          cursor: mod.disabled ? 'default' : 'pointer',
          opacity: mod.disabled ? 0.35 : 1,
          color: isActiveModule ? themeColors.sidebarSelectedText : themeColors.sidebarText,
          transition: 'background-color 150ms ease, color 150ms ease',
          '&:hover': !mod.disabled ? { bgcolor: themeColors.sidebarHover } : undefined,
        }}
      >
        <Box sx={{ display: 'flex', color: iconColor, transition: 'color 150ms ease' }}>{MODULE_ICONS[mod.icon]}</Box>
        <Typography sx={{ fontSize: 13.5, fontWeight: 600, flexGrow: 1 }}>{mod.label}</Typography>
        {!mod.disabled &&
          (isExpanded ? (
            <ExpandMoreIcon sx={{ fontSize: 18, opacity: 0.7, transform: 'rotate(180deg)', transition: 'transform 150ms ease' }} />
          ) : (
            <ExpandMoreIcon sx={{ fontSize: 18, opacity: 0.7, transition: 'transform 150ms ease' }} />
          ))}
      </Box>

      {isExpanded && !mod.disabled && (
        <Box sx={{ mt: 0.375 }}>
          {mod.submenu!.map((entry) =>
            'items' in entry ? (
              <SubmenuGroupTrigger
                key={entry.label}
                label={entry.label}
                isOpen={isFlyoutOpen && openFlyoutGroupLabel === entry.label}
                onClick={(anchorTop) => onGroupClick(entry.label, anchorTop)}
                onHover={(anchorTop) => onGroupHover(entry.label, anchorTop)}
              />
            ) : (
              <SubmenuLeafRow
                key={entry.path}
                item={entry}
                isActive={activePath === entry.path}
                isPinned={isPinned(entry.path)}
                onTogglePin={() => togglePin(entry.path)}
                onNavigate={() => onNavigateLeaf(entry.path)}
              />
            )
          )}
        </Box>
      )}
    </Box>
  );
}

function SubmenuGroupTrigger({
  label,
  isOpen,
  onClick,
  onHover,
}: {
  label: string;
  isOpen: boolean;
  onClick: (anchorTop: number) => void;
  onHover: (anchorTop: number) => void;
}) {
  return (
    <Box
      role="button"
      tabIndex={0}
      aria-expanded={isOpen}
      onClick={(event) => onClick(event.currentTarget.getBoundingClientRect().top)}
      onMouseEnter={(event) => onHover(event.currentTarget.getBoundingClientRect().top)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(e.currentTarget.getBoundingClientRect().top);
        }
      }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.75,
        ml: 1.75,
        pl: 1.25,
        py: 0.7,
        borderLeft: `1px solid ${themeColors.sidebarDivider}`,
        cursor: 'pointer',
        borderRadius: '6px',
        color: themeColors.sidebarText,
        transition: 'background-color 150ms ease',
        '&:hover': { bgcolor: themeColors.sidebarHover },
      }}
    >
      <Typography sx={{ fontSize: 12.5, fontWeight: 600, flexGrow: 1, whiteSpace: 'normal' }}>{label}</Typography>
      <ChevronRightIcon sx={{ fontSize: 16, opacity: 0.6 }} />
    </Box>
  );
}

function SubmenuLeafRow({
  item,
  isActive,
  isPinned,
  onTogglePin,
  onNavigate,
}: {
  item: NavLeaf;
  isActive: boolean;
  isPinned: boolean;
  onTogglePin: () => void;
  onNavigate: () => void;
}) {
  return (
    <Box
      role="button"
      tabIndex={0}
      aria-current={isActive ? 'page' : undefined}
      onClick={onNavigate}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onNavigate();
        }
      }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        ml: 1.75,
        pl: 1.25,
        pr: 0.5,
        py: 0.7,
        borderLeft: `1px solid ${themeColors.sidebarDivider}`,
        borderRadius: '6px',
        cursor: 'pointer',
        color: isActive ? themeColors.sidebarSelectedText : themeColors.sidebarText,
        bgcolor: isActive ? themeColors.sidebarSelectedBg : 'transparent',
        transition: 'background-color 150ms ease, color 150ms ease',
        '&:hover': { bgcolor: isActive ? themeColors.sidebarSelectedBg : themeColors.sidebarHover },
        '&:hover .row-pin': { opacity: 1 },
      }}
    >
      <Typography sx={{ fontSize: 12.5, fontWeight: 600, flexGrow: 1, whiteSpace: 'normal' }}>{item.label}</Typography>
      <Box className="row-pin" sx={{ opacity: 0, transition: 'opacity 150ms ease' }}>
        <PinButton pinned={isPinned} onToggle={onTogglePin} label={item.label} />
      </Box>
    </Box>
  );
}
