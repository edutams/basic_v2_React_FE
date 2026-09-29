import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
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
import { IconX } from '@tabler/icons-react';

// Generic read-only list modal shared by the "Total Sub Orgs" stat card and
// Commission Management's per-agent Schools drill-down — each just supplies
// its own columns/rows; this handles pagination so a long list never renders
// unbounded.
const CommissionListModal = ({ open, onClose, title, columns, rows, loading, maxWidth = 'sm' }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    if (open) setPage(0);
  }, [open]);

  const pagedRows = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
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
                {columns.map((col) => (
                  <TableCell key={col.key} align={col.align || 'left'} sx={{ fontWeight: 700 }}>
                    {col.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    {columns.map((col) => (
                      <TableCell key={col.key}>
                        <Skeleton variant="text" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center" sx={{ py: 3 }}>
                    <Alert severity="info" sx={{ width: '100%', justifyContent: 'center' }}>
                      No records found
                    </Alert>
                  </TableCell>
                </TableRow>
              ) : (
                pagedRows.map((row, index) => (
                  <TableRow key={row.id ?? index} hover>
                    {columns.map((col) => (
                      <TableCell key={col.key} align={col.align || 'left'}>
                        {col.render ? col.render(row) : (row[col.key] ?? '—')}
                      </TableCell>
                    ))}
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
  );
};

export default CommissionListModal;
