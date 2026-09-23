import { ReactElement, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import TwoWheelerOutlinedIcon from '@mui/icons-material/TwoWheelerOutlined';
import PointOfSaleOutlinedIcon from '@mui/icons-material/PointOfSaleOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { SIDEBAR_WIDTH } from '../theme/theme';
import { themeColors } from '../theme/themeColors';
import { sidebarModules, SidebarModule } from './navConfig';

const ICONS: Record<SidebarModule['icon'], ReactElement> = {
  home: <DashboardOutlinedIcon fontSize="small" />,
  hr: <GroupOutlinedIcon fontSize="small" />,
  finance: <AccountBalanceOutlinedIcon fontSize="small" />,
  freight: <LocalShippingOutlinedIcon fontSize="small" />,
  courier: <TwoWheelerOutlinedIcon fontSize="small" />,
  sales: <PointOfSaleOutlinedIcon fontSize="small" />,
  inventory: <Inventory2OutlinedIcon fontSize="small" />,
  logs: <ReceiptLongOutlinedIcon fontSize="small" />,
};

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState<string | null>('freight');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({ 'freight:Initial Setup': true });

  const isFreightActive = location.pathname.startsWith('/freight');

  return (
    <Box
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        height: '100vh',
        position: 'sticky',
        top: 0,
        bgcolor: themeColors.sidebarBg,
        color: themeColors.sidebarText,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2.5, py: 2.5 }}>
        <Avatar sx={{ bgcolor: themeColors.sidebarAvatarBg, width: 36, height: 36, fontSize: 14, fontWeight: 700, borderRadius: '10px' }} variant="rounded">SC</Avatar>
        <Box>
          <Typography variant="body2" sx={{ color: themeColors.sidebarSelectedText, fontWeight: 700, lineHeight: 1.25, fontSize: 15.5 }}>
            SmartCargo
          </Typography>
          <Typography variant="caption" sx={{ color: themeColors.sidebarMuted, fontSize: 10.5, letterSpacing: 0.5 }}>
            OPERATIONS V4.2
          </Typography>
        </Box>
      </Box>

      <Box sx={{ px: 2.5, pt: 1.5, pb: 1 }}>
        <Typography variant="caption" sx={{ color: themeColors.sidebarSectionLabel, fontWeight: 700, letterSpacing: 1.2, fontSize: 10 }}>
          WORKSPACE
        </Typography>
      </Box>
      <List dense sx={{ px: 1.75 }}>
        <ListItemButton
          selected={location.pathname === '/'}
          onClick={() => navigate('/')}
          sx={navItemSx}
        >
          <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>{ICONS.home}</ListItemIcon>
          <ListItemText primary="Company Home" primaryTypographyProps={{ fontSize: 13.5, fontWeight: 600 }} />
        </ListItemButton>
      </List>

      <Box sx={{ px: 2.5, pt: 2, pb: 1 }}>
        <Typography variant="caption" sx={{ color: themeColors.sidebarSectionLabel, fontWeight: 700, letterSpacing: 1.2, fontSize: 10 }}>
          OPERATIONS
        </Typography>
      </Box>
      <List
        dense
        sx={{
          px: 1.75,
          flexGrow: 1,
          overflowY: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: `${themeColors.sidebarScrollbarThumb} transparent`,
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: themeColors.sidebarScrollbarThumb,
            borderRadius: 3,
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: themeColors.sidebarScrollbarThumbHover,
          },
        }}
      >
        {sidebarModules.map((mod) => {
          if (mod.submenu) {
            const isOpen = expanded === mod.key;
            return (
              <Box key={mod.key}>
                <ListItemButton
                  disabled={mod.disabled}
                  selected={isFreightActive}
                  onClick={() => setExpanded(isOpen ? null : mod.key)}
                  sx={navItemSx}
                >
                  <ListItemIcon sx={{ minWidth: 30, color: 'inherit' }}>{ICONS[mod.icon]}</ListItemIcon>
                  <ListItemText primary={mod.label} primaryTypographyProps={{ fontSize: 13, fontWeight: isFreightActive ? 700 : 500 }} />
                  {isOpen ? (
                    <ExpandLessIcon sx={{ fontSize: 18, opacity: 0.7 }} />
                  ) : (
                    <ExpandMoreIcon sx={{ fontSize: 18, opacity: 0.7 }} />
                  )}
                </ListItemButton>
                <Collapse in={isOpen} timeout="auto" unmountOnExit>
                  <List dense disablePadding sx={{ mt: 0.5 }}>
                    {mod.submenu.map((group) => {
                      if (!('items' in group)) {
                        return (
                          <ListItemButton
                            key={group.path}
                            selected={location.pathname === group.path}
                            onClick={() => navigate(group.path)}
                            sx={{ ...navItemSx, ml: 1.25, py: 0.65, pl: 2.5, borderRadius: 2 }}
                          >
                            <ListItemText
                              primary={group.label}
                              primaryTypographyProps={{ fontSize: 12.5, fontWeight: 600, sx: { whiteSpace: 'normal' } }}
                            />
                          </ListItemButton>
                        );
                      }
                      const groupKey = `${mod.key}:${group.label}`;
                      const containsActiveScreen = group.items.some((item) => item.path === location.pathname);
                      const isGroupOpen = expandedGroups[groupKey] ?? containsActiveScreen;
                      return (
                        <Box key={group.label} sx={{ mb: 0.5 }}>
                          <ListItemButton
                            onClick={() => setExpandedGroups((current) => ({ ...current, [groupKey]: !isGroupOpen }))}
                            sx={{ ...navItemSx, ml: 1.25, py: 0.65, color: themeColors.sidebarMuted }}
                          >
                            <ListItemText
                              primary={group.label}
                              primaryTypographyProps={{ fontSize: 12, fontWeight: 700 }}
                            />
                            {isGroupOpen ? <ExpandLessIcon sx={{ fontSize: 16 }} /> : <ExpandMoreIcon sx={{ fontSize: 16 }} />}
                          </ListItemButton>
                          <Collapse in={isGroupOpen} timeout="auto" unmountOnExit>
                            {group.items.map((item) => (
                              <ListItemButton
                                key={item.path}
                                selected={location.pathname === item.path}
                                onClick={() => navigate(item.path)}
                                sx={{ ...navItemSx, py: 0.65, pl: 4.5, borderRadius: 2 }}
                              >
                                <ListItemText
                                  primary={item.label}
                                  primaryTypographyProps={{ fontSize: 12.5, fontWeight: 600, sx: { whiteSpace: 'normal' } }}
                                />
                              </ListItemButton>
                            ))}
                          </Collapse>
                        </Box>
                      );
                    })}
                  </List>
                </Collapse>
              </Box>
            );
          }
          return (
            <ListItemButton
              key={mod.key}
              disabled={mod.disabled}
              selected={!!mod.path && location.pathname === mod.path}
              onClick={() => mod.path && navigate(mod.path)}
              sx={navItemSx}
            >
              <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>{ICONS[mod.icon]}</ListItemIcon>
              <ListItemText primary={mod.label} primaryTypographyProps={{ fontSize: 13.5, fontWeight: 600 }} />
            </ListItemButton>
          );
        })}
      </List>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          px: 2.5,
          py: 1.75,
          borderTop: `1px solid ${themeColors.sidebarDivider}`,
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
    </Box>
  );
}

const navItemSx = {
  borderRadius: 2,
  mb: 0.375,
  color: themeColors.sidebarText,
  transition: 'background-color 0.15s ease, color 0.15s ease',
  '&:hover': { bgcolor: themeColors.sidebarHover },
  '&.Mui-selected': { bgcolor: themeColors.sidebarSelectedBg, color: themeColors.sidebarSelectedText },
  '&.Mui-selected:hover': { bgcolor: themeColors.sidebarSelectedBg },
  '&.Mui-disabled': { opacity: 0.35, color: themeColors.sidebarText },
};
