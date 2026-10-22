import { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  Avatar,
  IconButton,
  Chip,
  Stack,
  Button,
  Tabs,
  Tab,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  Message as MessageIcon,
  PersonOutline as PersonOutlineIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationOnIcon,
  PersonAddAlt as PersonAddAltIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  ToggleOn as ToggleOnIcon,
} from '@mui/icons-material';
import { IconUser, IconTrash } from '@tabler/icons-react';
import PropTypes from 'prop-types';
import ViewWardsContent from './ViewWardsContent';
import ParentWalletContent from './ParentWalletContent';
import CommunicationLogContent from './CommunicationLogContent';
import RecentActivityContent from './RecentActivityContent';

const relationshipLabel = (rel) => (rel ? rel.charAt(0).toUpperCase() + rel.slice(1) : '—');

/** One of the 4 colorful Quick Actions buttons. */
const QuickActionButton = ({ icon: Icon, color, label, onClick, disabled }) => (
  <Stack
    component="button"
    type="button"
    onClick={onClick}
    disabled={disabled}
    alignItems="center"
    spacing={0.5}
    sx={{ border: 'none', bgcolor: 'transparent', cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.4 : 1, p: 0.5, flex: 1 }}
  >
    <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: `${color}1A`, color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon fontSize="small" />
    </Box>
    <Typography variant="caption" fontWeight={600} sx={{ textAlign: 'center' }}>
      {label}
    </Typography>
  </Stack>
);

const QUICK_ACTION_COLOR = { message: '#2563EB', linkWard: '#16A34A', wallet: '#9333EA', toggle: '#D97706' };

/** Inline side panel (not an overlay drawer) — sits beside the Parent
 * Manager table, which shrinks to make room for it, so both are visible
 * and the table stays interactive while a parent's details are open. */
const ParentOverviewPanel = ({
  onClose,
  guardian,
  onEdit,
  onLinkWard,
  onToggleStatus,
  onDelete,
  onImpersonate,
  onSendMessage,
}) => {
  const [tab, setTab] = useState(0);
  const [moreAnchorEl, setMoreAnchorEl] = useState(null);

  if (!guardian) return null;

  const user = guardian.user;
  const fullName = user
    ? `${guardian.title ? guardian.title + ' ' : ''}${user.fname} ${user.lname}`
    : 'Guardian';
  const initials = user ? `${user.fname?.[0] || ''}${user.lname?.[0] || ''}`.toUpperCase() : '?';
  const isActive = (guardian.user?.status ?? 'active') === 'active';

  const handleMoreAction = (action) => {
    setMoreAnchorEl(null);
    action(guardian);
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        height: 'fit-content',
        maxHeight: 'calc(100vh - 200px)',
        overflow: 'hidden',
        borderRadius: 2,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2, flexShrink: 0 }}>
        <Typography variant="h6" fontWeight={700}>
          Parent Overview
        </Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: 'error.main' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Stack>

      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5, flexShrink: 0 }}>
        <Avatar src={user?.avatar} sx={{ width: 56, height: 56 }}>
          {initials || <PersonOutlineIcon />}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight={700} noWrap>
            {fullName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {relationshipLabel(guardian.relationship)}
          </Typography>
          <Chip
            label={guardian.user?.status ?? 'active'}
            size="small"
            sx={{
              ml: 1,
              height: 18,
              fontSize: '0.65rem',
              textTransform: 'capitalize',
              bgcolor: isActive ? 'success.light' : 'error.light',
              color: isActive ? 'success.dark' : 'error.dark',
            }}
          />
        </Box>
      </Stack>

      <Stack spacing={0.5} sx={{ mb: 2, flexShrink: 0 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <PhoneIcon sx={{ fontSize: 16, color: '#2563EB' }} />
          <Typography variant="body2">{user?.phone || '—'}</Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <EmailIcon sx={{ fontSize: 16, color: '#16A34A' }} />
          <Typography variant="body2">{user?.email || '—'}</Typography>
        </Stack>
        {user?.address && (
          <Stack direction="row" spacing={1} alignItems="center">
            <LocationOnIcon sx={{ fontSize: 16, color: '#64748B' }} />
            <Typography variant="body2">{user.address}</Typography>
          </Stack>
        )}
      </Stack>

      <Stack direction="row" spacing={0.75} sx={{ mb: 2, flexShrink: 0 }}>
        <Button
          size="small"
          variant="contained"
          startIcon={<MessageIcon sx={{ fontSize: 14 }} />}
          onClick={() => onSendMessage(guardian)}
          sx={{ flex: 1, fontSize: '0.7rem', py: 0.4, px: 1, minWidth: 0 }}
        >
          Message
        </Button>
        <Button
          size="small"
          variant="contained"
          startIcon={<EditIcon sx={{ fontSize: 14 }} />}
          onClick={() => onEdit(guardian)}
          sx={{ flex: 1, fontSize: '0.7rem', py: 0.4, px: 1, minWidth: 0 }}
        >
          Edit
        </Button>
        <Button
          size="small"
          variant="outlined"
          endIcon={<MoreVertIcon sx={{ fontSize: 14 }} />}
          onClick={(e) => setMoreAnchorEl(e.currentTarget)}
          sx={{ fontSize: '0.7rem', py: 0.4, px: 1, minWidth: 0 }}
        >
          More
        </Button>
        <Menu anchorEl={moreAnchorEl} open={Boolean(moreAnchorEl)} onClose={() => setMoreAnchorEl(null)}>
          <MenuItem onClick={() => handleMoreAction(onImpersonate)}>
            <IconUser size={18} style={{ marginRight: 8 }} />
            Login As Parent
          </MenuItem>
          <MenuItem
            onClick={() => handleMoreAction(onToggleStatus)}
            sx={{ color: isActive ? 'warning.main' : 'success.main' }}
          >
            <ToggleOnIcon fontSize="small" style={{ marginRight: 8 }} />
            {isActive ? 'Deactivate' : 'Activate'}
          </MenuItem>
          <MenuItem onClick={() => handleMoreAction(onDelete)} sx={{ color: 'error.main' }}>
            <IconTrash size={18} style={{ marginRight: 8 }} />
            Delete
          </MenuItem>
        </Menu>
      </Stack>

      <Divider sx={{ flexShrink: 0 }} />

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{
          mb: 1.5,
          minHeight: 36,
          flexShrink: 0,
          '& .MuiTab-root': { minHeight: 36, minWidth: 'auto', px: 1.25, fontSize: '0.78rem', whiteSpace: 'nowrap' },
        }}
      >
        <Tab label={`Wards (${guardian.wards_count ?? 0})`} />
        <Tab label="Transactions" />
        <Tab label="Communication" />
        <Tab label="Activity" />
      </Tabs>

      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {tab === 0 && (
          <Box>
            <ViewWardsContent guardian={guardian} onClose={() => {}} variant="list" />
            <Button fullWidth size="small" variant="contained" sx={{ mt: 1, mb: 2 }} onClick={() => onLinkWard(guardian)}>
              + Link Another Ward
            </Button>

            <Divider sx={{ mb: 1.5 }} />
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
              Quick Actions
            </Typography>
            <Stack direction="row" spacing={1}>
              <QuickActionButton icon={MessageIcon} color={QUICK_ACTION_COLOR.message} label="Message" onClick={() => onSendMessage(guardian)} />
              <QuickActionButton icon={PersonAddAltIcon} color={QUICK_ACTION_COLOR.linkWard} label="Link Ward" onClick={() => onLinkWard(guardian)} />
              <QuickActionButton icon={AccountBalanceWalletIcon} color={QUICK_ACTION_COLOR.wallet} label="View Wallet" onClick={() => setTab(1)} />
              <QuickActionButton icon={ToggleOnIcon} color={QUICK_ACTION_COLOR.toggle} label={isActive ? 'Deactivate' : 'Activate'} onClick={() => onToggleStatus(guardian)} />
            </Stack>
          </Box>
        )}
        {tab === 1 && <ParentWalletContent guardian={guardian} onClose={() => {}} />}
        {tab === 2 && <CommunicationLogContent guardian={guardian} />}
        {tab === 3 && <RecentActivityContent person={guardian} />}
      </Box>
    </Paper>
  );
};

ParentOverviewPanel.propTypes = {
  onClose: PropTypes.func.isRequired,
  guardian: PropTypes.object,
  onEdit: PropTypes.func.isRequired,
  onLinkWard: PropTypes.func.isRequired,
  onToggleStatus: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onImpersonate: PropTypes.func.isRequired,
  onSendMessage: PropTypes.func.isRequired,
};

export default ParentOverviewPanel;
