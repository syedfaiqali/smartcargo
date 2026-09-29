import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import { NavLeaf } from '../navConfig';
import { themeColors } from '../../theme/themeColors';
import { FavoriteStar } from './FavoriteStar';
import { PinButton } from './PinButton';

export interface FlyoutGroup {
  label: string | null;
  items: NavLeaf[];
}

export function FlyoutPanel({
  title,
  groups,
  activePath,
  isFavorite,
  toggleFavorite,
  isPinned,
  togglePin,
  onNavigate,
  isMobile,
}: {
  title: string;
  groups: FlyoutGroup[];
  activePath: string;
  isFavorite: (path: string) => boolean;
  toggleFavorite: (path: string) => void;
  isPinned: (path: string) => boolean;
  togglePin: (path: string) => void;
  onNavigate: (path: string) => void;
  isMobile?: boolean;
}) {
  const [filter, setFilter] = useState('');

  const allItems = useMemo(() => groups.flatMap((g) => g.items), [groups]);

  const favoriteItems = useMemo(
    () => (filter.trim() ? [] : allItems.filter((item) => isFavorite(item.path))),
    [allItems, filter, isFavorite]
  );

  const filteredGroups = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((g) => ({ ...g, items: g.items.filter((item) => item.label.toLowerCase().includes(q)) }))
      .filter((g) => g.items.length > 0);
  }, [groups, filter]);

  const renderItem = (item: NavLeaf) => (
    <Box
      key={item.path}
      role="button"
      tabIndex={0}
      aria-current={item.path === activePath ? 'page' : undefined}
      onClick={() => onNavigate(item.path)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onNavigate(item.path);
        }
      }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.75,
        px: 1,
        py: 0.75,
        borderRadius: '8px',
        cursor: 'pointer',
        bgcolor: item.path === activePath ? themeColors.sidebarSelectedBg : 'transparent',
        transition: 'background-color 150ms ease',
        '&:hover': { bgcolor: item.path === activePath ? themeColors.sidebarSelectedBg : themeColors.sidebarHover },
        '&:hover .row-pin': { opacity: 1 },
      }}
    >
      <FavoriteStar active={isFavorite(item.path)} onToggle={() => toggleFavorite(item.path)} label={item.label} />
      <Typography
        variant="body2"
        sx={{
          flexGrow: 1,
          fontSize: 13,
          color: item.path === activePath ? themeColors.sidebarSelectedText : themeColors.sidebarText,
          fontWeight: item.path === activePath ? 700 : 500,
        }}
      >
        {item.label}
      </Typography>
      <Box className="row-pin" sx={{ opacity: 0, transition: 'opacity 150ms ease' }}>
        <PinButton pinned={isPinned(item.path)} onToggle={() => togglePin(item.path)} label={item.label} />
      </Box>
    </Box>
  );

  return (
    <Box
      role="dialog"
      aria-label={title}
      sx={{
        width: isMobile ? '100%' : 'auto',
        minWidth: isMobile ? undefined : 290,
        maxWidth: isMobile ? undefined : 520,
        bgcolor: themeColors.sidebarFlyoutBg,
        border: `0.5px solid ${themeColors.sidebarFlyoutBorder}`,
        borderRadius: '12px',
        boxShadow: themeColors.sidebarFlyoutShadow,
        p: 1.75,
        maxHeight: isMobile ? '100%' : '80vh',
        overflowY: 'auto',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: 1.25 }}>
        <Typography sx={{ fontSize: 15, fontWeight: 700, color: themeColors.sidebarSelectedText }}>{title}</Typography>
        <Typography sx={{ fontSize: 11, color: themeColors.sidebarMuted }}>Star to favorite</Typography>
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          bgcolor: 'rgba(255,255,255,0.05)',
          border: `1px solid ${themeColors.sidebarFlyoutBorder}`,
          borderRadius: '8px',
          px: 1.25,
          py: 0.5,
          mb: 1.5,
        }}
      >
        <SearchIcon sx={{ fontSize: 16, color: themeColors.sidebarMuted }} />
        <InputBase
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder={`Search in ${title.toLowerCase()}`}
          aria-label={`Search in ${title}`}
          sx={{ fontSize: 13, color: themeColors.sidebarText, flexGrow: 1, '& input::placeholder': { color: themeColors.sidebarMuted, opacity: 1 } }}
        />
      </Box>

      {favoriteItems.length > 0 && (
        <Box sx={{ mb: 1.5 }}>
          <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: themeColors.sidebarSectionLabel, mb: 0.5, textTransform: 'uppercase' }}>
            Favorites
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 0.5 }}>
            {favoriteItems.map(renderItem)}
          </Box>
        </Box>
      )}

      {filteredGroups.length === 0 && (
        <Typography sx={{ fontSize: 13, color: themeColors.sidebarMuted, py: 2, textAlign: 'center' }}>No matches</Typography>
      )}

      {filteredGroups.map((group, idx) => (
        <Box key={group.label ?? `group-${idx}`} sx={{ mb: 1.5 }}>
          {group.label && (
            <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: themeColors.sidebarSectionLabel, mb: 0.5, textTransform: 'uppercase' }}>
              {group.label}
            </Typography>
          )}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 0.5 }}>
            {group.items.map(renderItem)}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
