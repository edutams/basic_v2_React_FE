import React, { useMemo } from 'react';
import {
  Avatar,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  Chip,
} from '@mui/material';
import { createColumnHelper } from '@tanstack/react-table';
import { IconDotsVertical, IconEdit, IconEye } from '@tabler/icons-react';
import StandardDataTable from 'src/components/shared/StandardDataTable';

const columnHelper = createColumnHelper();

const MyCommissionTable = ({ data, rowsPerPage = 10 }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [selectedItem, setSelectedItem] = React.useState(null);

  const handleClick = (event, item) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'S/N',
        cell: (info) => (
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {info.getValue()}
          </Typography>
        ),
      }),
      columnHelper.accessor('transactionId', {
        header: 'Transaction ID',
        cell: (info) => (
          <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
            {info.getValue()}
          </Typography>
        ),
      }),
      columnHelper.accessor('sessionId', {
        header: 'Session ID',
        cell: (info) => (
          <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
            {info.getValue()}
          </Typography>
        ),
      }),
      columnHelper.accessor('narration', {
        header: 'Narration',
        cell: (info) => (
          <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
            {info.getValue()}
          </Typography>
        ),
      }),
      columnHelper.accessor('amount', {
        header: 'Amount',
        cell: (info) => (
          <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
            {info.getValue()}
          </Typography>
        ),
      }),
      columnHelper.accessor('paymentType', {
        header: 'Payment Type',
        cell: (info) => (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Chip
              label={info.getValue()}
              size="small"
              color="success"
              sx={{
                textTransform: 'capitalize',
                fontWeight: 500,
              }}
            />
          </Box>
        ),
      }),
      columnHelper.accessor('transactionDate', {
        header: 'Transaction Date',
        cell: (info) => (
          <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
            {info.getValue()}
          </Typography>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: (info) => (
          <IconButton size="small" onClick={(e) => handleClick(e, info.row.original)}>
            <IconDotsVertical size={18} color={theme.palette.text.secondary} />
          </IconButton>
        ),
        meta: { align: 'right' },
      }),
    ],
    [theme],
  );

  return (
    <Box>
      <StandardDataTable
        columns={columns}
        data={data}
        pageSize={rowsPerPage}
        showPagination={false}
      />

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 180,
            bgcolor: theme.palette.background.paper,
            boxShadow: theme.shadows[3],
            borderRadius: '12px',
          },
        }}
      >
        <MenuItem onClick={handleClose}>
          {/* <IconEye size={18} color={theme.palette.text.secondary} /> */}
          View Details
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default MyCommissionTable;
