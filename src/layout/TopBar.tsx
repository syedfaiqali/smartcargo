import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import EventIcon from '@mui/icons-material/Event';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

export function TopBar({ title }: { title: string }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 3,
        py: 2,
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button variant="outlined" size="small" startIcon={<MailOutlineIcon fontSize="small" />} sx={{ color: 'text.secondary', borderColor: 'divider' }}>
          Email
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<EventIcon fontSize="small" />}
          endIcon={<KeyboardArrowDownIcon fontSize="small" />}
          sx={{ color: 'text.secondary', borderColor: 'divider' }}
        >
          2026-2027
        </Button>
      </Box>
    </Box>
  );
}
