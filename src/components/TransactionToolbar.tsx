import { ReactElement } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import SearchIcon from '@mui/icons-material/Search';
import VerticalAlignTopIcon from '@mui/icons-material/VerticalAlignTop';
import VerticalAlignBottomIcon from '@mui/icons-material/VerticalAlignBottom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import BlockIcon from '@mui/icons-material/Block';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import { themeColors } from '../theme/themeColors';
import { confirmDelete } from './deleteConfirmation';

export type ToolbarAction =
  | 'search'
  | 'top'
  | 'bottom'
  | 'prev'
  | 'next'
  | 'new'
  | 'save'
  | 'edit'
  | 'delete'
  | 'final'
  | 'unfinal'
  | 'void'
  | 'copy'
  | 'check'
  | 'close'
  | 'cancel';

interface ToolbarButtonDef {
  action: ToolbarAction;
  label: string;
  icon: ReactElement;
  color?: 'primary' | 'error';
}

const ALL_BUTTONS: ToolbarButtonDef[] = [
  { action: 'search', label: 'Search', icon: <SearchIcon fontSize="small" /> },
  { action: 'top', label: 'Top', icon: <VerticalAlignTopIcon fontSize="small" /> },
  { action: 'bottom', label: 'Bottom', icon: <VerticalAlignBottomIcon fontSize="small" /> },
  { action: 'prev', label: 'Prev', icon: <ArrowBackIcon fontSize="small" /> },
  { action: 'next', label: 'Next', icon: <ArrowForwardIcon fontSize="small" /> },
  { action: 'new', label: 'New', icon: <NoteAddIcon fontSize="small" /> },
  { action: 'save', label: 'Save', icon: <SaveIcon fontSize="small" /> },
  { action: 'edit', label: 'Edit', icon: <EditIcon fontSize="small" /> },
  { action: 'delete', label: 'Delete', icon: <DeleteIcon fontSize="small" />, color: 'error' },
  { action: 'final', label: 'Final', icon: <LockIcon fontSize="small" /> },
  { action: 'unfinal', label: 'Unfinal', icon: <LockOpenIcon fontSize="small" /> },
  { action: 'check', label: 'Check', icon: <TaskAltIcon fontSize="small" /> },
  { action: 'close', label: 'Close', icon: <TaskAltIcon fontSize="small" /> },
  { action: 'void', label: 'Void', icon: <BlockIcon fontSize="small" /> },
  { action: 'copy', label: 'Copy', icon: <ContentCopyIcon fontSize="small" /> },
  { action: 'cancel', label: 'Cancel', icon: <CancelIcon fontSize="small" /> },
];

interface TransactionToolbarProps {
  /** Which actions to render, in order. Defaults to the standard full set. */
  actions?: ToolbarAction[];
  /** Actions to render disabled (e.g. no record loaded, or record already final). */
  disabledActions?: ToolbarAction[];
  onAction: (action: ToolbarAction) => void;
}

const DEFAULT_ACTIONS: ToolbarAction[] = [
  'search',
  'top',
  'bottom',
  'prev',
  'next',
  'new',
  'edit',
  'delete',
  'final',
  'void',
  'copy',
];

const ACTION_COLORS: Partial<Record<ToolbarAction, { color: string; borderColor: string; hover: string }>> = {
  new: { color: '#1d4ed8', borderColor: '#93c5fd', hover: '#eff6ff' },
  save: { color: '#15803d', borderColor: '#86efac', hover: '#f0fdf4' },
  final: { color: '#b45309', borderColor: '#fcd34d', hover: '#fffbeb' },
  unfinal: { color: '#0f766e', borderColor: '#99f6e4', hover: '#f0fdfa' },
  void: { color: '#b91c1c', borderColor: '#fca5a5', hover: '#fef2f2' },
  copy: { color: '#6d28d9', borderColor: '#c4b5fd', hover: '#f5f3ff' },
};

export function TransactionToolbar({ actions = DEFAULT_ACTIONS, disabledActions = [], onAction }: TransactionToolbarProps) {
  const buttons = ALL_BUTTONS.filter((b) => actions.includes(b.action));
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
      {buttons.map((b) => (
        <Button
          key={b.action}
          variant="outlined"
          color={b.color ?? 'inherit'}
          startIcon={b.icon}
          disabled={disabledActions.includes(b.action)}
          onClick={() => b.action === 'delete' ? confirmDelete(() => onAction(b.action)) : onAction(b.action)}
          sx={
            b.color === 'error'
              ? undefined
              : {
                  color: ACTION_COLORS[b.action]?.color ?? themeColors.textPrimary,
                  borderColor: ACTION_COLORS[b.action]?.borderColor ?? themeColors.border,
                  '&:hover': {
                    borderColor: ACTION_COLORS[b.action]?.borderColor ?? themeColors.borderHover,
                    bgcolor: ACTION_COLORS[b.action]?.hover ?? themeColors.pageBackground,
                  },
                }
          }
        >
          {b.label}
        </Button>
      ))}
    </Box>
  );
}
