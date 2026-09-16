import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Skeleton,
  Alert,
  TablePagination,
  useTheme,
} from '@mui/material';
import { IconX, IconDotsVertical, IconReceipt } from '@tabler/icons-react';
import SchoolTransactionsModal from './SchoolTransactionsModal';

const formatNaira = (value) =>
  `₦${Number(value ?? 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const parseSchoolType = (raw) => {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.join(', ') : raw;
  } catch {
    return raw;
  }
};

// Per-row 3-dot action menu — a separate component so each row keeps its
// own anchorEl state (CommissionListModal's generic col.render(row) has no
// per-row state of its own to reuse).
const SchoolRowActions = ({ onViewTransactions }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  return (
    <>
      <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
        <IconDotsVertical size={18} />
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem
          onClick={() => {
            onViewTransactions();
            setAnchorEl(null);
          }}
        >
          <ListItemIcon>
            <IconReceipt size={18} />
          </ListItemIcon>
          <ListItemText>View Transactions</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

/**
 * Reusable "Schools" drill-down — used both by the "Total School" stat card
 * on My Commission by Subscription/Transaction (CommissionWalletView) and by
 * Commission Management's per-agent Schools column (a click on that number
 * scopes this same list to just that one agent's own schools). Each row
 * carries its own subscription/transaction stats (see
 * CommissionController::getSchools()) plus a "View Transactions" action
 * that opens SchoolTransactionsModal for that one school.
 */
const SchoolsListModal = ({ open, onClose, title = 'Schools', rows = [], loading }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [txnOpen, setTxnOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);

  useEffect(() => {
    if (open) setPage(0);
  }, [open]);

  const pagedRows = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleViewTransactions = (school) => {
    setSelectedSchool(school);
    setTxnOpen(true);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" fontWeight={700}>
            {title}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <IconX size={20} />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead sx={{ bgcolor: isDarkMode ? 'rgba(255,255,255,0.02)' : '#fafafa' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>School</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Agent</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Subscription Value</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Subscription Volume</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Subscription Commission</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Transaction Value</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Transaction Volume</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <TableRow key={i}>
                      {[...Array(10)].map((__, j) => (
                        <TableCell key={j}>
                          <Skeleton variant="text" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                      <Alert severity="info" sx={{ width: '100%', justifyContent: 'center' }}>
                        No schools found
                      </Alert>
                    </TableCell>
                  </TableRow>
                ) : (
                  pagedRows.map((row, index) => (
                    <TableRow key={row.id ?? index} hover>
                      <TableCell>{row.tenant_name ?? '—'}</TableCell>
                      <TableCell>{row.organization_name ?? '—'}</TableCell>
                      <TableCell>{parseSchoolType(row.school_type)}</TableCell>
                      <TableCell>{row.status ?? '—'}</TableCell>
                      <TableCell align="right">{formatNaira(row.subscription_transaction_value)}</TableCell>
                      <TableCell align="right">{row.subscription_transaction_volume ?? 0}</TableCell>
                      <TableCell align="right">{formatNaira(row.subscription_commission)}</TableCell>
                      <TableCell align="right">{formatNaira(row.transaction_value)}</TableCell>
                      <TableCell align="right">{row.transaction_volume ?? 0}</TableCell>
                      <TableCell align="right">
                        <SchoolRowActions onViewTransactions={() => handleViewTransactions(row)} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {!loading && rows.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              count={rows.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(event, newPage) => setPage(newPage)}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(parseInt(event.target.value, 10));
                setPage(0);
              }}
              component="Box"
            />
          )}
        </DialogContent>

        <DialogActions>
          <Button variant="contained" size="small" onClick={onClose}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <SchoolTransactionsModal open={txnOpen} onClose={() => setTxnOpen(false)} school={selectedSchool} />
    </>
  );
};

export default SchoolsListModal;
