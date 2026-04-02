import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Box,
  TableContainer,
  Select,
  MenuItem,
  Button,
  TextField,
  Paper,
  Stack,
  useTheme,
  TablePagination,
  Grid,
  Avatar,
  Chip,
  IconButton,
  Menu,
  FormControl,
  InputLabel,
} from '@mui/material';
import { IconUsers } from '@tabler/icons-react';
import AgentModal from '../../../components/add-agent/components/AgentModal';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useNavigate } from 'react-router';

const columnHelper = createColumnHelper();

const TeamTab = ({ team = [], onAddAgent }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Filter state
  const [search, setSearch] = useState('');
  const [agentLevel, setAgentLevel] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [actionType, setActionType] = useState('create');

  const handleAction = (agent, type) => {
    setSelectedAgent(agent);
    setActionType(type);
    setIsModalOpen(true);
  };

  // Apply filters client-side (team data comes from parent)
  const filteredData = useMemo(() => {
    return team.filter((row) => {
      const matchSearch = !search || (row.name || '').toLowerCase().includes(search.toLowerCase());
      const matchLevel = !agentLevel || String(row.level) === String(agentLevel);
      const matchStatus =
        !filterStatus || (row.status || '').toLowerCase() === filterStatus.toLowerCase();
      return matchSearch && matchLevel && matchStatus;
    });
  }, [team, search, agentLevel, filterStatus]);

  const paginatedData = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  // ── Columns ──────────────────────────────────────────────────────────
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 's_n',
        header: () => 'S/N',
        cell: (info) => (
          <Typography color="textSecondary" variant="body2" fontWeight={400}>
            {page * rowsPerPage + info.row.index + 1}
          </Typography>
        ),
      }),
      columnHelper.accessor('name', {
        header: () => 'Organization Details',
        cell: (info) => {
          const row = info.row.original;
          const initials = (row.name || 'NA')
            .split(' ')
            .slice(0, 2)
            .map((w) => w[0])
            .join('')
            .toUpperCase();
          return (
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  fontSize: '12px',
                  fontWeight: 700,
                  bgcolor: '#3949ab',
                  flexShrink: 0,
                }}
              >
                {initials}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" fontWeight={700} sx={{ lineHeight: 1.3 }}>
                  {row.name}
                </Typography>
                <Typography
                  variant="caption"
                  color="textSecondary"
                  sx={{ display: 'block', lineHeight: 1.4 }}
                >
                  {row.phone || 'N/A'}
                </Typography>
                <Typography
                  variant="caption"
                  color="textSecondary"
                  sx={{ display: 'block', lineHeight: 1.4 }}
                >
                  {row.handle || 'N/A'}
                </Typography>
              </Box>
            </Stack>
          );
        },
      }),
      columnHelper.accessor('transaction', {
        header: () => 'Transaction',
        cell: (info) => (
          <Typography variant="body2" fontWeight={700} color="textPrimary">
            #{info.getValue() || '0'}
          </Typography>
        ),
      }),
      columnHelper.accessor('performance', {
        header: () => 'Performance',
        cell: (info) => (
          <Stack
            direction="row"
            spacing={0}
            sx={{ borderRadius: '6px', overflow: 'hidden', width: 'fit-content' }}
          >
            <Box sx={{ px: 1.5, py: 0.5 }}>
              <Typography variant="caption" fontWeight={800} color="textPrimary">
                School
              </Typography>
            </Box>
            <Box sx={{ bgcolor: '#3949ab', px: 1.5, py: 0.5 }}>
              <Typography variant="caption" fontWeight={700} sx={{ color: '#fff' }}>
                {info.getValue() || 0}
              </Typography>
            </Box>
          </Stack>
        ),
      }),
      columnHelper.accessor('level', {
        header: () => 'Level',
        cell: (info) => (
          <Chip
            size="small"
            label={`${info.getValue()}`}
            sx={{ bgcolor: '#e8eaf6', color: '#3949ab', fontWeight: 700, borderRadius: '8px' }}
          />
        ),
      }),
      columnHelper.accessor('descendent', {
        header: () => 'Descendent',
        cell: (info) => (
          <Box
            sx={{
              bgcolor: '#ede9fe',
              color: '#6d28d9',
              borderRadius: '20px',
              px: 2,
              py: 0.4,
              display: 'inline-flex',
              fontWeight: 700,
              fontSize: '13px',
            }}
          >
            {info.getValue() ?? 0}
          </Box>
        ),
      }),
      columnHelper.accessor('status', {
        header: () => 'Status',
        cell: (info) => (
          <Chip
            size="small"
            label={info.getValue()}
            sx={{
              bgcolor: info.getValue() === 'Active' ? '#dcfee6' : '#ffe4e6',
              color: info.getValue() === 'Active' ? '#16a34a' : '#e11d48',
              fontWeight: 600,
              borderRadius: '6px',
            }}
          />
        ),
      }),
      columnHelper.display({
        id: 'action',
        header: () => 'Action',
        cell: (info) => {
          const row = info.row.original;
          const [anchor, setAnchor] = useState(null);
          return (
            <>
              <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)}>
                <Typography variant="body2" fontWeight={700} color="textSecondary">
                  ···
                </Typography>
              </IconButton>
              <Menu
                anchorEl={anchor}
                open={Boolean(anchor)}
                onClose={() => setAnchor(null)}
                PaperProps={{ sx: { borderRadius: '8px', minWidth: 160 } }}
              >
                <MenuItem
                  onClick={() => {
                    setAnchor(null);
                    navigate(`/agent/view/${row.id}`);
                  }}
                >
                  View Profile
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setAnchor(null);
                    handleAction(row, 'update');
                  }}
                >
                  Update Info
                </MenuItem>
              </Menu>
            </>
          );
        },
      }),
    ],
    [page, rowsPerPage, navigate],
  );

  const table = useReactTable({
    data: paginatedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" mb={2}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box
            sx={{
              width: 24,
              height: 24,
              bgcolor: '#2ca87f',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            <IconUsers size={16} />
          </Box>
          <Typography variant="h5">List of Agents</Typography>
        </Stack>
        <Button
          variant="contained"
          startIcon={<IconUsers size={16} />}
          onClick={onAddAgent}
          sx={{
            bgcolor: '#3949ab',
            textTransform: 'none',
            borderRadius: '8px',
            '&:hover': { bgcolor: '#303f9f' },
          }}
        >
          Add New Agent
        </Button>
      </Stack>

      {/* Filters */}
      <Grid container spacing={2} mb={3} alignItems="center">
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            size="small"
            label="Search by Name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Agent Level</InputLabel>
            <Select
              value={agentLevel}
              label="Agent Level"
              onChange={(e) => setAgentLevel(e.target.value)}
            >
              <MenuItem value="">All Levels</MenuItem>
              {[1, 2, 3, 4, 5].map((l) => (
                <MenuItem key={l} value={l}>
                  Level {l}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              label="Status"
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, md: 2 }}>
          <Button
            fullWidth
            variant="contained"
            size="small"
            onClick={() => setPage(0)}
            sx={{ bgcolor: '#3949ab', textTransform: 'none', borderRadius: '8px', py: 1 }}
          >
            Search
          </Button>
        </Grid>
      </Grid>

      {/* Table */}
      <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent' }}>
        <Table>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell
                    key={header.id}
                    sx={{ fontWeight: 700, fontSize: '12px', color: theme.palette.text.secondary }}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} hover>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} sx={{ py: 1.5 }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  align="center"
                  sx={{ py: 6, color: 'text.secondary' }}
                >
                  No agents found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
      />

      <AgentModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAgent(null);
        }}
        handleRefresh={() => { }}
        selectedAgent={selectedAgent}
        actionType={actionType}
      />
    </Box>
  );
};

export default TeamTab;
