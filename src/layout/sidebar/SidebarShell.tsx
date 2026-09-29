import { KeyboardEvent as ReactKeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import useMediaQuery from '@mui/material/useMediaQuery';
import { SIDEBAR_WIDTH } from '../../theme/theme';
import { themeColors } from '../../theme/themeColors';
import { sidebarModules } from '../navConfig';
import { BrandBlock } from './BrandBlock';
import { UserBlock } from './UserBlock';
import { SearchBox } from './SearchBox';
import { SearchResults } from './SearchResults';
import { QuickAccessSection } from './QuickAccessSection';
import { ModuleAccordionList } from './ModuleAccordionList';
import { FlyoutPanel } from './FlyoutPanel';
import { useMenuSearchIndex } from './useMenuSearchIndex';
import { useMenuPreferences } from './useMenuPreferences';
import { OpenFlyoutState, SearchIndexEntry } from './types';
import { MOBILE_BREAKPOINT } from './constants';

function findActiveModuleKey(pathname: string): string | null {
  for (const mod of sidebarModules) {
    if (mod.path && pathname === mod.path) return mod.key;
    if (mod.submenu) {
      const prefix = `/${mod.key}`;
      if (pathname.startsWith(prefix)) return mod.key;
    }
  }
  return null;
}

export function SidebarShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(`(max-width:${MOBILE_BREAKPOINT - 0.05}px)`);

  const searchIndex = useMenuSearchIndex();
  const prefs = useMenuPreferences();

  const activeModuleKey = useMemo(() => findActiveModuleKey(location.pathname), [location.pathname]);
  const [expandedModuleKey, setExpandedModuleKey] = useState<string | null>(activeModuleKey ?? 'freight');
  const [openFlyout, setOpenFlyout] = useState<OpenFlyoutState | null>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeResultIndex, setActiveResultIndex] = useState(0);
  const isSearching = query.trim().length > 0;

  const openFlyoutModule = openFlyout ? sidebarModules.find((m) => m.key === openFlyout.moduleKey) : undefined;
  const openFlyoutGroup = openFlyoutModule?.submenu?.find(
    (entry) => 'items' in entry && entry.label === openFlyout?.groupLabel
  ) as { label: string; items: import('../navConfig').NavLeaf[] } | undefined;

  const searchInputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const flyoutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape') {
        if (document.activeElement === searchInputRef.current && query) {
          setQuery('');
          searchInputRef.current?.blur();
        } else if (openFlyout) {
          setOpenFlyout(null);
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [openFlyout, query]);

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (!openFlyout) return;
      const target = e.target as Node;
      const insideRoot = rootRef.current?.contains(target);
      const insideFlyout = flyoutRef.current?.contains(target);
      if (!insideRoot && !insideFlyout) {
        setOpenFlyout(null);
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [openFlyout]);

  const handleNavigate = useCallback(
    (path: string) => {
      navigate(path);
      setOpenFlyout(null);
      if (isMobile) setMobileDrawerOpen(false);
    },
    [navigate, isMobile]
  );

  const handleSearchSelect = useCallback((entry: SearchIndexEntry) => {
    setExpandedModuleKey(entry.moduleKey);
    if (entry.groupLabel) {
      setOpenFlyout({ moduleKey: entry.moduleKey, groupLabel: entry.groupLabel });
    } else {
      setOpenFlyout(null);
    }
    navigate(entry.path);
    setQuery('');
    if (isMobile) setMobileDrawerOpen(false);
  }, [navigate, isMobile]);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return searchIndex
      .filter((entry) => !entry.disabled)
      .filter((entry) => entry.label.toLowerCase().includes(q) || entry.parentPathLabel.toLowerCase().includes(q))
      .map((entry) => ({ ...entry, favorite: prefs.isFavorite(entry.path) }))
      .sort((a, b) => (a.favorite === b.favorite ? 0 : a.favorite ? -1 : 1));
  }, [searchIndex, query, prefs]);

  useEffect(() => {
    setActiveResultIndex(0);
  }, [query]);

  const handleSearchKeyDown = useCallback(
    (e: ReactKeyboardEvent) => {
      if (!isSearching) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveResultIndex((i) => Math.min(i + 1, searchResults.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveResultIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const entry = searchResults[activeResultIndex];
        if (entry) handleSearchSelect(entry);
      }
    },
    [isSearching, searchResults, activeResultIndex, handleSearchSelect]
  );

  const content = (
    <Box
      ref={rootRef}
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        height: '100vh',
        ...(isMobile ? {} : { position: 'sticky', top: 0 }),
        bgcolor: themeColors.sidebarBg,
        color: themeColors.sidebarText,
        display: 'flex',
        flexDirection: 'column',
        fontSize: 13.5,
      }}
    >
      <BrandBlock />
      <Box onKeyDown={handleSearchKeyDown}>
        <SearchBox ref={searchInputRef} value={query} onChange={setQuery} onClear={() => setQuery('')} />
      </Box>
      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: `${themeColors.sidebarScrollbarThumb} transparent`,
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': { backgroundColor: themeColors.sidebarScrollbarThumb, borderRadius: 3 },
          '&::-webkit-scrollbar-thumb:hover': { backgroundColor: themeColors.sidebarScrollbarThumbHover },
        }}
      >
        {isSearching ? (
          <SearchResults
            results={searchResults}
            activeIndex={activeResultIndex}
            onActiveIndexChange={setActiveResultIndex}
            onSelect={handleSearchSelect}
          />
        ) : (
          <>
            <QuickAccessSection
              pins={prefs.pins}
              searchIndex={searchIndex}
              activePath={location.pathname}
              onNavigate={handleNavigate}
              onUnpin={prefs.togglePin}
              onReorder={prefs.reorderPins}
              limitToastOpen={prefs.limitToastOpen}
              onDismissLimitToast={prefs.dismissLimitToast}
            />
            <ModuleAccordionList
              activePath={location.pathname}
              activeModuleKey={activeModuleKey}
              expandedModuleKey={expandedModuleKey}
              onSetExpandedModuleKey={setExpandedModuleKey}
              openFlyout={openFlyout}
              onSetOpenFlyout={setOpenFlyout}
              isPinned={prefs.isPinned}
              togglePin={prefs.togglePin}
              onNavigate={handleNavigate}
            />
          </>
        )}
      </Box>
      <UserBlock />
    </Box>
  );

  const flyout =
    openFlyout && openFlyoutGroup ? (
      <Box
        ref={flyoutRef}
        sx={{
          position: 'fixed',
          top: 8,
          left: isMobile ? 0 : SIDEBAR_WIDTH,
          right: isMobile ? 0 : undefined,
          bottom: isMobile ? 0 : undefined,
          height: isMobile ? '100%' : '100vh',
          ml: isMobile ? 0 : 1,
          zIndex: 1300,
          p: isMobile ? 2 : 1.5,
          display: 'flex',
          alignItems: 'flex-start',
          bgcolor: isMobile ? 'rgba(0,0,0,0.5)' : 'transparent',
          pointerEvents: isMobile ? 'auto' : 'none',
        }}
      >
        <Box sx={{ pointerEvents: 'auto', width: isMobile ? '100%' : 'auto' }}>
          <FlyoutPanel
            title={openFlyoutGroup.label}
            groups={[{ label: null, items: openFlyoutGroup.items }]}
            activePath={location.pathname}
            isFavorite={prefs.isFavorite}
            toggleFavorite={prefs.toggleFavorite}
            isPinned={prefs.isPinned}
            togglePin={prefs.togglePin}
            onNavigate={(path) => {
              handleNavigate(path);
              setOpenFlyout(null);
            }}
            isMobile={isMobile}
          />
        </Box>
      </Box>
    ) : null;

  if (isMobile) {
    return (
      <>
        <IconButton
          aria-label="Open menu"
          onClick={() => setMobileDrawerOpen(true)}
          sx={{ position: 'fixed', top: 8, left: 8, zIndex: 1200, bgcolor: themeColors.sidebarBg, color: themeColors.sidebarText, '&:hover': { bgcolor: themeColors.sidebarHover } }}
        >
          <MenuIcon />
        </IconButton>
        <Drawer
          variant="temporary"
          open={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          ModalProps={{ keepMounted: true }}
          PaperProps={{ sx: { bgcolor: themeColors.sidebarBg, border: 'none' } }}
        >
          {content}
        </Drawer>
        {flyout}
      </>
    );
  }

  return (
    <>
      {content}
      {flyout}
    </>
  );
}
