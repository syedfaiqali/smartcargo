import IconButton from '@mui/material/IconButton';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { themeColors } from '../../theme/themeColors';

export function FavoriteStar({
  active,
  onToggle,
  label,
}: {
  active: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <IconButton
      size="small"
      aria-label={active ? `Remove ${label} from favorites` : `Add ${label} to favorites`}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      sx={{ p: 0.5 }}
    >
      {active ? (
        <StarIcon sx={{ fontSize: 18, color: themeColors.sidebarStarGold }} />
      ) : (
        <StarBorderIcon sx={{ fontSize: 18, color: themeColors.sidebarStarGoldMuted }} />
      )}
    </IconButton>
  );
}
