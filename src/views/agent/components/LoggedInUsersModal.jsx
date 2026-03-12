import React, { useState } from 'react';

import {
  IconButton,
  Typography,
  Box,
  Grid,
  Stack,
  Select,
  MenuItem,
  TextField,
  Menu,
  Card,
  useTheme,
  ListItemIcon, ListItemText,
} from '@mui/material';
import GetAppIcon from '@mui/icons-material/GetApp';
import GridViewIcon from '@mui/icons-material/GridView';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { IconUsers, IconEye, IconEdit, IconTrash, IconFilter, IconChartBar, IconHelpCircle, IconDotsVertical, IconDownload } from '@tabler/icons-react';
import StandardModal from 'src/components/shared/StandardModal';
import PrimaryButton from 'src/components/shared/PrimaryButton';
import StandardDataTable from 'src/components/shared/StandardDataTable';

const LoggedInUsersModal = ({ onClose, open, onViewUserList }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const isMenuOpen = Boolean(anchorEl);
  const openMenu = Boolean(anchorEl);

  const handleMenuClick = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };


  return (
    <>
      <StandardModal
        open={open}
        onClose={onClose}
        maxWidth="lg"
        padding={4}
        headerBg={isDarkMode ? theme.palette.background.paper : '#f4f6f8'}
        sx={{ bgcolor: isDarkMode ? theme.palette.background.default : '#f4f6f8' }}
        dividers={false}
        actions={
          <Stack direction="row" spacing={2} justifyContent="flex-end" width="100%">
            <PrimaryButton variant="secondary" onClick={onClose}>Cancel</PrimaryButton>
            <PrimaryButton variant="primary" onClick={onClose}>Save</PrimaryButton>
          </Stack>
        }
      >
        {/* Top Stat Cards */}
        <Grid container spacing={1.5} mb={3}>
          {[
            { label: 'Teacher', count: 20, icon: <IconUsers size={24} />, color: '#3B82F6' },
            { label: 'Student', count: 20, icon: <IconUsers size={24} />, color: '#10B981' },
            { label: 'SPA', count: 20, icon: <IconUsers size={24} />, color: '#F59E0B' },
            { label: 'Parent', count: 20, icon: <IconUsers size={24} />, color: '#EF4444' },
          ].map((stat, idx) => (
            <Grid size={{ xs: 6, sm: 6, lg: 3 }} key={idx}>
              <Card sx={{
                p: { xs: 1.5, sm: 2 },
                borderRadius: '12px',
                boxShadow: theme.shadows[1],
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: theme.palette.background.paper,
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[3],
                  borderColor: stat.color
                }
              }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%' }}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: { xs: 32, sm: 40 },
                    height: { xs: 32, sm: 40 },
                    borderRadius: '8px',
                    bgcolor: isDarkMode ? `${stat.color}20` : `${stat.color}15`,
                    color: stat.color
                  }}>
                    {stat.icon}
                  </Box>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography
                      variant="caption"
                      fontWeight="700"
                      color="textSecondary"
                      sx={{ display: 'block', fontSize: { xs: '10px', sm: '12px' }, textTransform: 'uppercase' }}
                    >
                      {stat.label}
                    </Typography>
                    <Typography
                      variant="h5"
                      fontWeight="800"
                      color="textPrimary"
                      sx={{ fontSize: { xs: '16px', sm: '20px' } }}
                    >
                      {stat.count}
                    </Typography>
                  </Box>
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Card sx={{
          p: 0,
          borderRadius: '4px',
          boxShadow: 'none',
          overflow: 'hidden',
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.background.paper
        }}>
          {/* Header */}
          <Box sx={{
            p: 2,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            bgcolor: 'transparent',
            gap: 2
          }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: '4px', p: 0.5, display: 'flex' }}>
                <GridViewIcon sx={{ color: theme.palette.text.disabled, fontSize: '24px' }} />
              </Box>
              <Typography variant="subtitle1" fontWeight="600" color="textPrimary">Logged In Users This Week</Typography>
            </Stack>
            <PrimaryButton
              startIcon={<GetAppIcon />}
              sx={{
                color: '#ffffff !important',
                bgcolor: '#2ca87f !important',
                '&:hover': { bgcolor: '#238a68 !important' },
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              Export to Excel
            </PrimaryButton>
          </Box>

          {/* Filter Bar */}
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            p: 2,
            alignItems: { xs: 'stretch', sm: 'center' },
            flexWrap: 'wrap',
            bgcolor: isDarkMode ? 'rgba(44, 168, 127, 0.05)' : '#f2fdf5',
            borderTop: `1px solid ${theme.palette.divider}`
          }}>
            {/* Agent Filter */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: '6px',
              bgcolor: theme.palette.background.paper,
              overflow: 'hidden',
              flex: { xs: '1 1 auto', sm: '0 0 auto' }
            }}>
              <Box sx={{ px: 2, py: 0.8, bgcolor: isDarkMode ? 'rgba(0, 188, 212, 0.1)' : '#e0f7fa', borderRight: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="body2" fontWeight="600" color="textPrimary">Agent</Typography>
              </Box>
              <Select size="small" defaultValue="Agent 2" sx={{ border: 'none', '& fieldset': { border: 'none' }, minWidth: { xs: 'auto', sm: 120 }, flexGrow: 1 }}>
                <MenuItem value="Agent 2">Agent 2</MenuItem>
              </Select>
            </Box>

            {/* User Type Filter */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: '6px',
              bgcolor: theme.palette.background.paper,
              overflow: 'hidden',
              flex: { xs: '1 1 auto', sm: '0 0 auto' }
            }}>
              <Box sx={{ px: 2, py: 0.8, bgcolor: isDarkMode ? 'rgba(0, 188, 212, 0.1)' : '#e0f7fa', borderRight: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="body2" fontWeight="600" color="textPrimary">User Type</Typography>
              </Box>
              <Select size="small" defaultValue="Teacher" sx={{ border: 'none', '& fieldset': { border: 'none' }, minWidth: { xs: 'auto', sm: 120 }, flexGrow: 1 }}>
                <MenuItem value="Teacher">Teacher</MenuItem>
              </Select>
            </Box>

            {/* From Filter */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: '6px',
              bgcolor: theme.palette.background.paper,
              overflow: 'hidden',
              flex: { xs: '1 1 auto', sm: '0 0 auto' }
            }}>
              <Box sx={{ px: 1, py: 0.8, bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f4f6f8', borderRight: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="caption" sx={{ fontSize: '10px', color: 'textSecondary' }}>From</Typography>
              </Box>
              <TextField
                size="small"
                type="date"
                sx={{
                  '& fieldset': { border: 'none' },
                  '& input': { py: 0.8, fontSize: '13px', color: theme.palette.text.primary },
                  flexGrow: 1
                }}
              />
            </Box>

            {/* To Filter */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: '6px',
              bgcolor: theme.palette.background.paper,
              overflow: 'hidden',
              flex: { xs: '1 1 auto', sm: '0 0 auto' }
            }}>
              <Box sx={{ px: 1, py: 0.8, bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f4f6f8', borderRight: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="caption" sx={{ fontSize: '10px', color: 'textSecondary' }}>To</Typography>
              </Box>
              <TextField
                size="small"
                type="date"
                sx={{
                  '& fieldset': { border: 'none' },
                  '& input': { py: 0.8, fontSize: '13px', color: theme.palette.text.primary },
                  flexGrow: 1
                }}
              />
            </Box>

            <PrimaryButton
              sx={{
                color: '#ffffff !important',
                bgcolor: '#2ca87f !important',
                '&:hover': { bgcolor: '#238a68 !important' },
                ml: { sm: 'auto' }
              }}
            >
              Filter
            </PrimaryButton>
          </Box>

          <Box sx={{ p: 2 }}>
            <StandardDataTable
              columns={[
                { header: '#', accessorKey: 'id' },
                {
                  header: 'School', accessorKey: 'school', cell: (info) => (
                    <Typography variant="body2" fontWeight="600" color="textPrimary">{info.getValue()}</Typography>
                  )
                },
                {
                  header: 'URL', accessorKey: 'url', cell: (info) => (
                    <Typography sx={{ color: '#2ca87f', fontSize: '13px', fontWeight: 600 }}>{info.getValue()}</Typography>
                  )
                },
                {
                  header: 'Number', accessorKey: 'number', cell: (info) => (
                    <Typography variant="body2" color="textSecondary" fontWeight="600">{info.getValue()}</Typography>
                  )
                },
                {
                  header: 'Action', accessorKey: 'action', cell: (info) => (
                    <IconButton size="small" onClick={(e) => handleMenuClick(e, info.row.original)}>
                      <IconDotsVertical size={18} color={theme.palette.text.secondary} />
                    </IconButton>
                  ),

                }
              ]}
              data={[
                { id: 1, school: 'FESTIVAL SPECIAL PRIAMRY SCHOOL', url: 'https://fsps.sef.edutams.net', number: 30 },
                { id: 2, school: 'GIDAN MAKAMA SPECIAL PRIMARY SCHOOL', url: 'https://gmsps.sef.edutams.net', number: 10 },
                { id: 3, school: 'LAURE IBRAHIM KOKI SPECIAL PRIMARY SCHOOL', url: 'https://iksps.sef.edutams.net', number: 39 },
                { id: 4, school: 'KABIRU KIRU MODEL PRIMARY SCHOOL', url: 'https://kkmps.sef.edutams.net', number: 13 },
                { id: 5, school: 'KOFAR KUDU SPECIAL PRIMARY SCHOOL', url: 'https://kksps.sef.edutams.net', number: 33 },
                { id: 6, school: 'KWALLI SPECIAL PRIMARY SCHOOL', url: 'https://ksps.sef.edutams.net', number: 32 },
                { id: 7, school: 'Lgea Agabija', url: 'https://las.sef.edutams.net', number: 18 },
                { id: 8, school: 'Lgea Early Child, Mairafi.', url: 'https://lecm.sef.edutams.net', number: 10 },
                { id: 9, school: 'Lgea Agudu', url: 'https://lgag.sef.edutams.net', number: 8 },
              ]}
              pageSize={5}
            />

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}

            >
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  if (onViewUserList) onViewUserList();
                }}
              >
                View Users Listsdeee
              </MenuItem>
            </Menu>
          </Box>
        </Card>


      </StandardModal>


    </>
  );
};

export default LoggedInUsersModal;
