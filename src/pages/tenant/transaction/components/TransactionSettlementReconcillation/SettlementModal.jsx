import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Typography,
  IconButton,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const SettlementModal = ({ open, onClose, settlementData }) => {
  if (!settlementData) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        Settlements - {settlementData.bank_name} ({settlementData.account_number})
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Alert severity="info" sx={{ mb: 2 }} color="info" variant="outlined">
        <Typography variant="body2">
          Settlement represents the amount expected from transactions processed through payment
          channels. To ensure accuracy, always reconcile settlement figures against your uploaded
          bank statement.
        </Typography>
      </Alert>
      <DialogContent>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Transaction ID</TableCell>
              <TableCell>Session ID</TableCell>
              <TableCell>Amount (₦)</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Dummy rows - replace with real data later  */}
            {/* We well order the data by settlement date( latest first) */}
            {[1, 2, 3, 4].map((i) => (
              <TableRow key={i}>
                <TableCell>
                  TXN-{Date.now().toString().slice(-6)}
                  {i}
                </TableCell>
                <TableCell>SESSION-{Date.now().toString().slice(-6)}</TableCell>
                <TableCell>850,000</TableCell>
                <TableCell>01/01/2023</TableCell>
                <TableCell>
                  <Typography color="success.main">Pending Reconciliation</Typography>
                </TableCell>
                <TableCell align="center">
                  <Button variant="contained" color="success" size="small">
                    Reconcile
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
};

export default SettlementModal;
