import React from 'react';
import { useNavigate } from 'react-router-dom';
import ReusableFunnelChart from '@/components/shared/charts/ReusableFunnelChart';

const AdmissionFunnel = ({ funnel = [], onViewFullReport }) => {
  const navigate = useNavigate();

  return (
    <ReusableFunnelChart
      data={funnel}
      title="ADMISSION FUNNEL"
      layout="apex"
      footerLabel="View Full Funnel Report"
      onFooterClick={() => (onViewFullReport ? onViewFullReport() : navigate('/admission/tracker'))}
    />
  );
};

export default AdmissionFunnel;
