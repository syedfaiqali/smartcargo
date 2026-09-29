import { forwardRef } from 'react';
import Box from '@mui/material/Box';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { themeColors } from '../../theme/themeColors';

export const SearchBox = forwardRef<HTMLInputElement, { value: string; onChange: (value: string) => void; onClear: () => void }>(
  function SearchBox({ value, onChange, onClear }, ref) {
    return (
      <Box sx={{ px: 2.5, pb: 1.5 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            bgcolor: 'rgba(255,255,255,0.05)',
            border: `1px solid ${themeColors.sidebarDivider}`,
            borderRadius: '8px',
            px: 1.25,
            py: 0.75,
          }}
        >
          <SearchIcon sx={{ fontSize: 16, color: themeColors.sidebarMuted }} />
          <InputBase
            inputRef={ref}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Search menu"
            aria-label="Search menu"
            sx={{
              fontSize: 13.5,
              color: themeColors.sidebarText,
              flexGrow: 1,
              '& input::placeholder': { color: themeColors.sidebarMuted, opacity: 1 },
            }}
          />
          {value ? (
            <IconButton aria-label="Clear search" size="small" onClick={onClear} sx={{ p: 0.4 }}>
              <CloseIcon sx={{ fontSize: 14, color: themeColors.sidebarMuted }} />
            </IconButton>
          ) : (
            <Box
              sx={{
                fontSize: 10.5,
                fontWeight: 600,
                color: themeColors.sidebarMuted,
                border: `1px solid ${themeColors.sidebarDivider}`,
                borderRadius: '5px',
                px: 0.6,
                py: 0.1,
                whiteSpace: 'nowrap',
              }}
            >
              Ctrl K
            </Box>
          )}
        </Box>
      </Box>
    );
  }
);
