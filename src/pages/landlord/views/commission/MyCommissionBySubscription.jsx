import React from 'react';
import CommissionWalletView from './components/CommissionWalletView';

const MyCommissionBySubscription = () => (
  <CommissionWalletView
    pageTitle="My Commission by Subscription"
    tableTitle="Subscription Commission Details"
    emptyMessage="No subscription commission transactions yet."
  />
);

export default MyCommissionBySubscription;
