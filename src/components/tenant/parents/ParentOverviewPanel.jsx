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
} from '@mui/icons-material';
import { IconUser, IconLink, IconSquareToggle, IconTrash } from '@tabler/icons-react';
import PropTypes from 'prop-types';
import ViewWardsContent from './ViewWardsContent';
import ParentWalletContent from './ParentWalletContent';
import CommunicationLogContent from './CommunicationLogContent';
import RecentActivityContent from './RecentActivityContent';

const relationshipLabel = (rel) => (rel ? rel.charAt(0).toUpperCase() + rel.slice(1) : '—');

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
  const isActive = guardian.status === 'active';

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
        height: '100%',
        minHeight: 500,
        borderRadius: 2,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={700}>
          Parent Overview
        </Typography>
        <IconButton size="small" color="error" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Stack>

      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
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
            label={guardian.status}
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

      <Stack spacing={0.5} sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <PhoneIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
          <Typography variant="body2">{user?.phone || '—'}</Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <EmailIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
          <Typography variant="body2">{user?.email || '—'}</Typography>
        </Stack>
        {user?.address && (
          <Stack direction="row" spacing={1} alignItems="center">
            <LocationOnIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
            <Typography variant="body2">{user.address}</Typography>
          </Stack>
        )}
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Button
          size="small"
          variant="contained"
          startIcon={<MessageIcon fontSize="small" />}
          onClick={() => onSendMessage(guardian)}
          sx={{ flex: 1 }}
        >
          Message
        </Button>
        <Button
          size="small"
          variant="contained"
          startIcon={<EditIcon fontSize="small" />}
          onClick={() => onEdit(guardian)}
          sx={{ flex: 1 }}
        >
          Edit
        </Button>
        <IconButton size="small" onClick={(e) => setMoreAnchorEl(e.currentTarget)}>
          <MoreVertIcon fontSize="small" />
        </IconButton>
        <Menu anchorEl={moreAnchorEl} open={Boolean(moreAnchorEl)} onClose={() => setMoreAnchorEl(null)}>
          <MenuItem onClick={() => handleMoreAction(onImpersonate)}>
            <IconUser size={18} style={{ marginRight: 8 }} />
            Login As Parent
          </MenuItem>
          <MenuItem onClick={() => handleMoreAction(onLinkWard)}>
            <IconLink size={18} style={{ marginRight: 8 }} />
            Link Ward
          </MenuItem>
          <MenuItem onClick={() => handleMoreAction(onToggleStatus)}>
            <IconSquareToggle size={18} style={{ marginRight: 8 }} />
            {isActive ? 'Deactivate' : 'Activate'}
          </MenuItem>
          <MenuItem onClick={() => handleMoreAction(onDelete)} sx={{ color: 'error.main' }}>
            <IconTrash size={18} style={{ marginRight: 8 }} />
            Delete
          </MenuItem>
        </Menu>
      </Stack>

      <Divider />

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{
          mb: 1.5,
          minHeight: 36,
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
            <ViewWardsContent guardian={guardian} onClose={() => {}} />
            <Button fullWidth size="small" variant="contained" sx={{ mt: 1 }} onClick={() => onLinkWard(guardian)}>
              + Link Another Ward
            </Button>
          </Box>
        )}
        {tab === 1 && <ParentWalletContent guardian={guardian} onClose={() => {}} />}
        {tab === 2 && <CommunicationLogContent guardian={guardian} />}
        {tab === 3 && <RecentActivityContent guardian={guardian} />}
      </Box>

      {/* Always-visible preview, regardless of which tab is active — the
          Activity tab above is the full, scrollable history. */}
      <Divider sx={{ my: 1.5 }} />
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="subtitle2" fontWeight={700}>
          Recent Activity
        </Typography>
        <Button size="small" onClick={() => setTab(3)}>
          View All
        </Button>
      </Stack>
      <RecentActivityContent guardian={guardian} limit={4} />
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
