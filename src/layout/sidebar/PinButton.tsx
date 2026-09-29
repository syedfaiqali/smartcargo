import IconButton from '@mui/material/IconButton';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import { themeColors } from '../../theme/themeColors';

export function PinButton({
  pinned,
  onToggle,
  label,
}: {
  pinned: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <IconButton
      size="small"
      aria-label={pinned ? `Unpin ${label} from quick access` : `Pin ${label} to quick access`}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      sx={{ p: 0.5 }}
    >
      {pinned ? (
        <PushPinIcon sx={{ fontSize: 16, color: themeColors.sidebarAccent }} />
      ) : (
        <PushPinOutlinedIcon sx={{ fontSize: 16, color: themeColors.sidebarMuted }} />
      )}
    </IconButton>
  );
}
