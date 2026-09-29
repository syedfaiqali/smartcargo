import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import PushPinIcon from '@mui/icons-material/PushPin';
import CloseIcon from '@mui/icons-material/Close';
import { themeColors } from '../../theme/themeColors';
import { SearchIndexEntry } from './types';

export function QuickAccessSection({
  pins,
  searchIndex,
  activePath,
  onNavigate,
  onUnpin,
  onReorder,
  limitToastOpen,
  onDismissLimitToast,
}: {
  pins: string[];
  searchIndex: SearchIndexEntry[];
  activePath: string;
  onNavigate: (path: string) => void;
  onUnpin: (path: string) => void;
  onReorder: (orderedPaths: string[]) => void;
  limitToastOpen: boolean;
  onDismissLimitToast: () => void;
}) {
  const [draggedPath, setDraggedPath] = useState<string | null>(null);

  const entries = pins
    .map((path) => searchIndex.find((e) => e.path === path))
    .filter((e): e is SearchIndexEntry => !!e && !e.disabled);

  const handleDrop = (targetPath: string) => {
    if (!draggedPath || draggedPath === targetPath) return;
    const current = entries.map((e) => e.path);
    const from = current.indexOf(draggedPath);
    const to = current.indexOf(targetPath);
    if (from === -1 || to === -1) return;
    const reordered = [...current];
    reordered.splice(from, 1);
    reordered.splice(to, 0, draggedPath);
    onReorder(reordered);
    setDraggedPath(null);
  };

  return (
    <Box sx={{ px: 2.5, pb: 1 }}>
      <Typography sx={{ color: themeColors.sidebarSectionLabel, fontWeight: 700, letterSpacing: 1.2, fontSize: 11, textTransform: 'uppercase', mb: 0.75 }}>
        Quick Access
      </Typography>

      {entries.length === 0 && (
        <Typography sx={{ fontSize: 12.5, color: themeColors.sidebarMuted, py: 0.5 }}>Pin pages you use often.</Typography>
      )}

      {entries.map((entry) => {
        const isActive = entry.path === activePath;
        return (
          <Box
            key={entry.path}
            draggable
            onDragStart={() => setDraggedPath(entry.path)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(entry.path)}
            role="button"
            tabIndex={0}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onNavigate(entry.path)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onNavigate(entry.path);
              }
            }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              px: 1.25,
              py: 0.7,
              mb: 0.375,
              borderRadius: '8px',
              cursor: 'pointer',
              color: isActive ? themeColors.sidebarSelectedText : themeColors.sidebarText,
              bgcolor: isActive ? themeColors.sidebarSelectedBg : themeColors.sidebarQuickAccessBg,
              transition: 'background-color 150ms ease',
              '&:hover': { bgcolor: isActive ? themeColors.sidebarSelectedBg : themeColors.sidebarQuickAccessHover },
              '&:hover .row-unpin': { opacity: 1 },
            }}
          >
            <PushPinIcon sx={{ fontSize: 15, color: themeColors.sidebarAccent }} />
            <Typography sx={{ fontSize: 13, fontWeight: 600, flexGrow: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {entry.label}
            </Typography>
            <IconButton
              className="row-unpin"
              size="small"
              aria-label={`Unpin ${entry.label} from quick access`}
              onClick={(e) => {
                e.stopPropagation();
                onUnpin(entry.path);
              }}
              sx={{ p: 0.4, opacity: 0, transition: 'opacity 150ms ease' }}
            >
              <CloseIcon sx={{ fontSize: 14, color: themeColors.sidebarMuted }} />
            </IconButton>
          </Box>
        );
      })}

      <Snackbar
        open={limitToastOpen}
        autoHideDuration={3000}
        onClose={onDismissLimitToast}
        message="Quick access is full. Unpin one first."
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      />
    </Box>
  );
}
