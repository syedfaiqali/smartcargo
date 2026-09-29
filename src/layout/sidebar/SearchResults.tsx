import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import StarIcon from '@mui/icons-material/Star';
import { themeColors } from '../../theme/themeColors';
import { SearchIndexEntry } from './types';

export interface SearchResultEntry extends SearchIndexEntry {
  favorite: boolean;
}

/** Inline flat results list shown in place of Quick Access + Operations while the sidebar search box has text. */
export function SearchResults({
  results,
  activeIndex,
  onActiveIndexChange,
  onSelect,
}: {
  results: SearchResultEntry[];
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  onSelect: (entry: SearchIndexEntry) => void;
}) {
  return (
    <Box sx={{ px: 1.75 }}>
      {results.length === 0 && (
        <Typography sx={{ fontSize: 13, color: themeColors.sidebarMuted, py: 3, textAlign: 'center' }}>No matches</Typography>
      )}
      {results.map((entry, idx) => (
        <Box
          key={entry.path}
          role="option"
          aria-selected={idx === activeIndex}
          onMouseEnter={() => onActiveIndexChange(idx)}
          onClick={() => onSelect(entry)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            px: 1.25,
            py: 0.85,
            mb: 0.25,
            borderRadius: '8px',
            cursor: 'pointer',
            bgcolor: idx === activeIndex ? themeColors.sidebarHover : 'transparent',
          }}
        >
          {entry.favorite && <StarIcon sx={{ fontSize: 13, color: themeColors.sidebarStarGold, flexShrink: 0 }} />}
          <Typography sx={{ fontSize: 13, color: themeColors.sidebarText, flexGrow: 1, minWidth: 0 }} noWrap>
            {entry.label}
          </Typography>
          <Typography sx={{ fontSize: 10.5, color: themeColors.sidebarMuted, flexShrink: 0, ml: 0.5 }} noWrap>
            {entry.parentPathLabel}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
