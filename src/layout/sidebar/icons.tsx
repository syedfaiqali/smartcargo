import { ReactElement } from 'react';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import TwoWheelerOutlinedIcon from '@mui/icons-material/TwoWheelerOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { SidebarModule } from '../navConfig';

/**
 * Semantic mapping per spec (layout-dashboard, building-bank, truck, users, motorbike,
 * receipt, archive, file-text) using the project's existing icon library (@mui/icons-material) —
 * no Tabler/Lucide dependency was installed, so these are the closest MUI equivalents.
 */
export const MODULE_ICONS: Record<SidebarModule['icon'], ReactElement> = {
  home: <DashboardOutlinedIcon sx={{ fontSize: 18 }} />,
  hr: <GroupOutlinedIcon sx={{ fontSize: 18 }} />,
  finance: <AccountBalanceOutlinedIcon sx={{ fontSize: 18 }} />,
  freight: <LocalShippingOutlinedIcon sx={{ fontSize: 18 }} />,
  courier: <TwoWheelerOutlinedIcon sx={{ fontSize: 18 }} />,
  sales: <ReceiptLongOutlinedIcon sx={{ fontSize: 18 }} />,
  inventory: <Inventory2OutlinedIcon sx={{ fontSize: 18 }} />,
  logs: <DescriptionOutlinedIcon sx={{ fontSize: 18 }} />,
};
