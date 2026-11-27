import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Box,
  Typography,
  IconButton,
  Skeleton,
} from '@mui/material';
import { IconX } from '@tabler/icons';

const thCell = { fontWeight: 700, py: 1, px: 1.25 };
const tdCell = { py: 0.75, px: 1.25 };

/**
 * Shared "View All Transactions" drill-down for the Income/Expenditure
 * Details report tabs — same endpoint shape (paginated, period-scoped) as
 * each tab's own `recent_transactions` list, just without the limit(5).
 * `columns` is [{ header, render(row) }] so each tab keeps its own exact
 * column layout (Income's combined "Description / Payer" vs. Expenditure's
 * separate "Vendor / Supplier" column) without duplicating this component.
 */
const AllTransactionsModal = ({ open, onClose, title, fetchFn, periodParams, columns }) => {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ last_page: 1, total: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) setPage(1);
  }, [open]);

  useEffect(() => {
    if (!open || !fetchFn || !periodParams?.session_id || !periodParams?.term_id) return;
    setLoading(true);
    fetchFn({ ...periodParams, page, per_page: 15 })
      .then((res) => {
        setRows(res?.data || []);
        setMeta(res?.meta || { last_page: 1, total: 0 });
      })
      .catch(() => {
        setRows([]);
        setMeta({ last_page: 1, total: 0 });
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, page, fetchFn, periodParams?.session_id, periodParams?.term_id]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {title}
        <IconButton size="small" onClick={onClose}>
          <IconX size={18} />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#F8FAFC' }}>
              {columns.map((col) => (
                <TableCell key={col.header} sx={thCell} align={col.align || 'left'}>
                  {col.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <TableRow key={idx}>
                  {columns.map((col) => (
                    <TableCell key={col.header} sx={tdCell} align={col.align || 'left'}>
                      <Skeleton variant="text" height={18} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ ...tdCell, py: 3, color: 'text.secondary' }}>
                  No transactions found for this period.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, idx) => (
                <TableRow key={`${row.date}-${row.description}-${idx}`} hover>
                  {columns.map((col) => (
                    <TableCell key={col.header} sx={tdCell} align={col.align || 'left'}>
                      {col.render(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </DialogContent>
      <DialogActions sx={{ display: 'flex', justifyContent: 'space-between', px: 2, py: 1.25 }}>
        <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>
          {meta.total} transaction{meta.total === 1 ? '' : 's'} total
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Pagination count={meta.last_page} page={page} onChange={(_, val) => setPage(val)} shape="rounded" size="small" />
          <Button onClick={onClose} sx={{ textTransform: 'none', fontWeight: 600 }}>
            Close
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default AllTransactionsModal;
