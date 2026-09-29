import React from 'react';
import CommissionWalletView from './components/CommissionWalletView';

const MyCommissionByTransaction = () => (
  <CommissionWalletView
    pageTitle="My Commission by Transaction"
    tableTitle="Transaction Commission Details"
    emptyMessage="No transaction commission transactions yet."
    commissionType="transaction"
  />
);

export default MyCommissionByTransaction;
