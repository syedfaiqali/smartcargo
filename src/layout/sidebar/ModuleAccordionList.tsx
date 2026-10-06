import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { sidebarModules } from '../navConfig';
import { themeColors } from '../../theme/themeColors';
import { ModuleRow } from './ModuleRow';
import { OpenFlyoutState } from './types';

export function ModuleAccordionList({
  activePath,
  activeModuleKey,
  expandedModuleKey,
  onSetExpandedModuleKey,
  openFlyout,
  onSetOpenFlyout,
  isPinned,
  togglePin,
  onNavigate,
}: {
  activePath: string;
  activeModuleKey: string | null;
  expandedModuleKey: string | null;
  onSetExpandedModuleKey: (key: string | null) => void;
  openFlyout: OpenFlyoutState | null;
  onSetOpenFlyout: (state: OpenFlyoutState | null) => void;
  isPinned: (path: string) => boolean;
  togglePin: (path: string) => void;
  onNavigate: (path: string) => void;
}) {
  return (
    <Box>
      <Box sx={{ px: 2.5, pt: 2, pb: 1 }}>
        <Typography sx={{ color: themeColors.sidebarSectionLabel, fontWeight: 700, letterSpacing: 1.2, fontSize: 11, textTransform: 'uppercase' }}>
          Operations
        </Typography>
      </Box>
      <Box sx={{ px: 1.75 }}>
        {sidebarModules.map((mod) => (
          <ModuleRow
            key={mod.key}
            mod={mod}
            isActiveModule={activeModuleKey === mod.key}
            isExpanded={expandedModuleKey === mod.key}
            isFlyoutOpen={openFlyout?.moduleKey === mod.key}
            openFlyoutGroupLabel={openFlyout?.moduleKey === mod.key ? openFlyout.groupLabel : null}
            onToggleExpand={() => {
              const willOpen = expandedModuleKey !== mod.key;
              onSetExpandedModuleKey(willOpen ? mod.key : null);
              if (!willOpen) onSetOpenFlyout(null);
            }}
            onSwitchFlyoutOnHover={() => {
              if (!mod.submenu || !openFlyout || openFlyout.moduleKey === mod.key) return;
              const firstGroup = mod.submenu.find((entry) => 'items' in entry) as { label: string } | undefined;
              if (!firstGroup) return;
              onSetExpandedModuleKey(mod.key);
              onSetOpenFlyout({ moduleKey: mod.key, groupLabel: firstGroup.label });
            }}
            onGroupClick={(groupLabel, anchorTop) => {
              onSetOpenFlyout(
                openFlyout?.moduleKey === mod.key && openFlyout.groupLabel === groupLabel
                  ? null
                  : { moduleKey: mod.key, groupLabel, anchorTop }
              );
            }}
            onGroupHover={(groupLabel, anchorTop) => {
              if (openFlyout?.moduleKey !== mod.key || openFlyout.groupLabel !== groupLabel) {
                onSetOpenFlyout({ moduleKey: mod.key, groupLabel, anchorTop });
              }
            }}
            isPinned={isPinned}
            togglePin={togglePin}
            activePath={activePath}
            onNavigateLeaf={onNavigate}
          />
        ))}
      </Box>
    </Box>
  );
}
