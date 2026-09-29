import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { themeColors } from '../../theme/themeColors';

export function BrandBlock() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2.5, py: 2.5 }}>
      <Avatar
        sx={{ bgcolor: themeColors.sidebarAvatarBg, width: 36, height: 36, fontSize: 14, fontWeight: 700, borderRadius: '10px' }}
        variant="rounded"
      >
        SC
      </Avatar>
      <Box>
        <Typography variant="body2" sx={{ color: themeColors.sidebarSelectedText, fontWeight: 700, lineHeight: 1.25, fontSize: 15.5 }}>
          SmartCargo
        </Typography>
        <Typography variant="caption" sx={{ color: themeColors.sidebarMuted, fontSize: 10.5, letterSpacing: 0.5 }}>
          OPERATIONS V4.2
        </Typography>
      </Box>
    </Box>
  );
}
