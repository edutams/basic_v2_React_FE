import { useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Button, Grid, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, Snackbar, Alert, IconButton, useTheme,
  Card, CardHeader, CardContent, TablePagination,
} from '@mui/material';
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';

const initialComments = [
  { id: 1, comment: 'An excellent performance. Keep it up!', type: 'positive', created_by: 'Admin' },
  { id: 2, comment: 'Good effort but needs more practice in problem-solving.', type: 'positive', created_by: 'Admin' },
  { id: 3, comment: 'Below expectations. Needs serious attention and parental support.', type: 'negative', created_by: 'Admin' },
  { id: 4, comment: 'Very consistent in class. A role model to other students.', type: 'positive', created_by: 'Admin' },
  { id: 5, comment: 'Frequent absenteeism is affecting academic performance.', type: 'negative', created_by: 'Admin' },
  { id: 6, comment: 'Shows great improvement from last term. Well done!', type: 'positive', created_by: 'Admin' },
  { id: 7, comment: 'Needs to participate more actively in class discussions.', type: 'negative', created_by: 'Admin' },
  { id: 8, comment: 'A disciplined and hardworking student.', type: 'positive', created_by: 'Admin' },
  { id: 9, comment: 'Late submission of assignments is affecting grades.', type: 'negative', created_by: 'Admin' },
  { id: 10, comment: 'Excellent conduct and academic performance.', type: 'positive', created_by: 'Admin' },
];

const CommentBankTab = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [comments, setComments] = useState(initialComments);
  const [filterType, setFilterType] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dialog, setDialog] = useState({ open: false, editing: null });
  const [form, setForm] = useState({ comment: '', type: 'positive' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const showSnackbar = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  const filtered = filterType ? comments.filter(c => c.type === filterType) : comments;

  const handleSave = () => {
    if (dialog.editing) {
      setComments(comments.map(c => c.id === dialog.editing.id ? { ...c, ...form } : c));
      showSnackbar('Comment updated');
    } else {
      setComments([...comments, { id: Date.now(), ...form, created_by: 'Admin' }]);
      showSnackbar('Comment added');
    }
    setDialog({ open: false, editing: null });
    setForm({ comment: '', type: 'positive' });
  };

  const handleDelete = (id) => {
    setComments(comments.filter(c => c.id !== id));
    showSnackbar('Comment deleted');
  };

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 2 }}>
        Manage predefined teacher and admin comments for report cards.
      </Alert>

      <Card elevation={2}>
        <CardHeader
          title="Comment Bank"
          action={
            <Button variant="contained" size="small" startIcon={<IconPlus size={16} />} onClick={() => { setDialog({ open: true, editing: null }); setForm({ comment: '', type: 'positive' }); }}>
              Add Comment
            </Button>
          }
        />
        <CardContent>
          {/* ── Filter ────────────────────────────────────────── */}
          <Box sx={{ mb: 2 }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Filter by Type</InputLabel>
              <Select value={filterType} label="Filter by Type" onChange={e => setFilterType(e.target.value)}>
                <MenuItem value="">All</MenuItem>
                <MenuItem value="positive">Positive</MenuItem>
                <MenuItem value="negative">Negative</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* ── Comments Table ────────────────────────────────── */}
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table stickyHeader sx={{ '& .MuiTableCell-root': { py: 0.5, px: 1 }, whiteSpace: 'nowrap' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, width: '5%' }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: '45%' }}>Comment</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: '12%' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: '15%' }}>Created By</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: '12%' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((c, i) => (
                  <TableRow key={c.id} hover>
                    <TableCell>{page * rowsPerPage + i + 1}</TableCell>
                    <TableCell>{c.comment}</TableCell>
                    <TableCell>
                      <Chip label={c.type} size="small" color={c.type === 'positive' ? 'success' : 'error'} />
                    </TableCell>
                    <TableCell>{c.created_by}</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => { setDialog({ open: true, editing: c }); setForm({ comment: c.comment, type: c.type }); }}>
                        <IconEdit size={16} />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(c.id)}>
                        <IconTrash size={16} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filtered.length}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </CardContent>
      </Card>

      {/* ── Dialog ──────────────────────────────────────────── */}
      <Dialog open={dialog.open} onClose={() => setDialog({ open: false, editing: null })} maxWidth="sm" fullWidth>
        <DialogTitle>{dialog.editing ? 'Edit Comment' : 'Add Comment'}</DialogTitle>
        <DialogContent>
          <TextField label="Comment" fullWidth multiline rows={3} sx={{ mt: 2, mb: 2 }} value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })} />
          <FormControl fullWidth size="small">
            <InputLabel>Type</InputLabel>
            <Select value={form.type} label="Type" onChange={e => setForm({ ...form, type: e.target.value })}>
              <MenuItem value="positive">Positive</MenuItem>
              <MenuItem value="negative">Negative</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog({ open: false, editing: null })}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={() => setSnackbar(s => ({ ...s, open: false }))} severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default CommentBankTab;
