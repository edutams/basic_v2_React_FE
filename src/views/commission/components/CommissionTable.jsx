import React from 'react';
import {
  Avatar,
  Typography,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import { IconDotsVertical, IconEdit, IconExchange, IconEye } from '@tabler/icons-react';

const CommissionTable = ({ data, activeTab, onEditCommission, onChangeType, onViewDetails }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [selectedItem, setSelectedItem] = React.useState(null);

  const handleViewDetails = onViewDetails || (() => {});

  const handleClick = (event, item) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  // 🔹 TAB FLAGS
  const isOverview = String(activeTab) === '1';
  const isActive = String(activeTab) === '2';
  const isOther = String(activeTab) === '3' || String(activeTab) === '4';

  const showActions = !isOverview;
  const showCommissionType = !isOther;
  const showSchools = isOverview || isOther;
  const showPayoutDate = isOverview;
  const showCommission = isActive || isOther;
  const showStatus = isActive || isOther;
  const showEarnings = isOverview || isOther;

  const getCommissionTypeColor = (type) =>
    type === 'Subscription'
      ? isDarkMode
        ? 'rgba(250, 204, 21, 0.2)'
        : '#FEF3C7'
      : isDarkMode
      ? 'rgba(236, 72, 153, 0.2)'
      : '#FCE7F3';

  const getCommissionTypeTextColor = (type) =>
    type === 'Subscription'
      ? isDarkMode
        ? '#fde047'
        : '#B45309'
      : isDarkMode
      ? '#f472b6'
      : '#BE185D';

  return (
    <Box sx={{ width: '100%' }}>
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          {/* HEADER */}
          <TableHead>
            <TableRow>
              <TableCell>Agent</TableCell>
              {showCommissionType && <TableCell>Commission Type</TableCell>}
              {showSchools && <TableCell>Schools</TableCell>}
              {showPayoutDate && <TableCell>Payout Date</TableCell>}
              {showCommission && <TableCell>Commission %</TableCell>}
              {showStatus && <TableCell>Status</TableCell>}
              {showEarnings && <TableCell>Earnings</TableCell>}
              {showActions && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>

          {/* BODY */}
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index} hover sx={{ '&:hover': { bgcolor: '#fafafa' } }}>
                {/* AGENT */}
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Avatar
                      sx={{
                        width: 50,
                        height: 50,
                        bgcolor: '#E7E9EB',
                        color: '#000',
                        fontWeight: 500,
                      }}
                    >
                      {row.agentName
                        ?.split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </Avatar>

                    <Box>
                      <Typography variant="subtitle2" fontWeight={700}>
                        {row.agentName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {row.email}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>

                {/* COMMISSION TYPE */}
                {showCommissionType && (
                  <TableCell>
                    <Chip
                      label={row.commissionType}
                      size="small"
                      sx={{
                        bgcolor: getCommissionTypeColor(row.commissionType),
                        color: getCommissionTypeTextColor(row.commissionType),
                        fontWeight: 600,
                        borderRadius: '8px',
                      }}
                    />
                  </TableCell>
                )}

                {/* SCHOOLS */}
                {showSchools && <TableCell>{row.schools}</TableCell>}

                {/* PAYOUT DATE */}
                {showPayoutDate && <TableCell>{row.payoutDate}</TableCell>}

                {/* COMMISSION % */}
                {showCommission && (
                  <TableCell>
                    <Typography fontWeight={700}>{row.commissionPercentage}</Typography>
                  </TableCell>
                )}

                {/* STATUS */}
                {showStatus && (
                  <TableCell>
                    <Chip
                      label={row.status}
                      size="small"
                      sx={{
                        bgcolor:
                          row.status === 'active'
                            ? isDarkMode
                              ? 'rgba(34, 197, 94, 0.2)'
                              : '#DCFCE7'
                            : isDarkMode
                            ? theme.palette.action.hover
                            : '#F3F4F6',
                        color:
                          row.status === 'active'
                            ? isDarkMode
                              ? '#4ade80'
                              : '#166534'
                            : theme.palette.text.secondary,
                        fontWeight: 600,
                        borderRadius: '8px',
                      }}
                    />
                  </TableCell>
                )}

                {/* EARNINGS */}
                {showEarnings && (
                  <TableCell>
                    <Typography fontWeight={700}>{row.earnings}</Typography>
                  </TableCell>
                )}

                {/* ACTIONS */}
                {!isOverview && (
                  <TableCell align="right">
                    <IconButton onClick={(e) => handleClick(e, row)}>
                      <IconDotsVertical size={18} />
                    </IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* MENU */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem
          onClick={() => {
            handleViewDetails(selectedItem);
            handleClose();
          }}
        >
          <ListItemIcon>
            <IconEye size={18} />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            onEditCommission(selectedItem);
            handleClose();
          }}
        >
          <ListItemIcon>
            <IconEdit size={18} />
          </ListItemIcon>
          <ListItemText>Edit Commission</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            onChangeType(selectedItem);
            handleClose();
          }}
        >
          <ListItemIcon>
            <IconExchange size={18} />
          </ListItemIcon>
          <ListItemText>Change Type</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default CommissionTable;
