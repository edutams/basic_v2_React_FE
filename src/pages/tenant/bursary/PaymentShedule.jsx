import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Tabs,
  Tab,
  Alert,
  Snackbar,
} from '@mui/material';
import { IconSettings, IconFileText } from '@tabler/icons-react';
import {
  Settings as SettingsIcon,
  CreditCard as CreditCardIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import StatCard from '@/components/shared/StatCard';

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'Payment Shedule' }];

const PaymentShedule = () => {
  
  return (
    <PageContainer title="Payment Shedule" description="Configure fees and payment settings">
      <Breadcrumb
        title="Payment Shedule"
        subtitle="Configure how fees are collected for the current term"
        items={BCrumb}
      />


    </PageContainer>
  );
};

export default PaymentShedule;
