import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { themeColors } from '../../theme/themeColors';

export function UserBlock() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
        px: 2.5,
        py: 1.75,
        borderTop: `1px solid ${themeColors.sidebarDivider}`,
        flexShrink: 0,
      }}
    >
      <Avatar sx={{ bgcolor: themeColors.sidebarAvatarBg, width: 32, height: 32, fontSize: 12.5, fontWeight: 700 }}>OP</Avatar>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" noWrap sx={{ color: themeColors.sidebarSelectedText, fontWeight: 700, lineHeight: 1.25, fontSize: 13 }}>
          Operational User
        </Typography>
        <Typography variant="caption" sx={{ color: themeColors.sidebarMuted, fontSize: 11 }}>
          KHI · Terminal 1
        </Typography>
      </Box>
    </Box>
  );
}
