import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PageContainer from '@/components/container/PageContainer';
import AdmissionBatchModal from '@/components/tenant/admission/AdmissionBatchModal';
import {
  getParentWards,
  getParentBatches,
  getParentFinance,

  getSessionTermWeeks,
} from '@/api/tenant/admission/admissionApi';
import { fetchActiveSessionTerm, fetchSessionTerms } from '@/api/tenant/curriculum/tenantCurriculumApi';

import MyWards from './component/my-wards';
import QuickActions from './component/quick-actions';
import AcademicOverview from './component/academic-overview';
import ParentWalletAccount from './component/parent-wallet-account';
import TermCalendar from './component/term-calendar';
import ActivityLogs from './component/activity-logs';

const fmtDate = (d) => {
  if (!d) return '';
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return String(d);
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};


const ParentDashboard2 = () => {
  const navigate = useNavigate();
  const [admissionModalOpen, setAdmissionModalOpen] = useState(false);

  const [sessionTerms, setSessionTerms] = useState([]);
  const [selectedSessionTerm, setSelectedSessionTerm] = useState('');
  const [termsReady, setTermsReady] = useState(false);
  const [termInfo, setTermInfo] = useState(null);

  const [wards, setWards] = useState([]);
  const [selectedWard, setSelectedWard] = useState(null);

  const [batches, setBatches] = useState(null);
  const [finance, setFinance] = useState(null);
  const [loadingWards, setLoadingWards] = useState(true);

  const sessionTermId = selectedSessionTerm || null;

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const res = await fetchSessionTerms();
        if (!mounted || !res?.status) return;

        const options = [
          { id: '', label: 'All Sessions' },
          ...(res.data || []).map((st) => ({
            id: st.id,
            label: `${st.session?.sesname || ''} ${st.display_term?.display_name || ''}`.trim(),
          })),
        ];
        setSessionTerms(options);

        const active = await fetchActiveSessionTerm();
        const activeId = active?.data?.session_term_id;
        let defaultId = options.length > 1 ? options[1].id : '';
        if (active?.status && activeId != null) {
          const match = options.find((o) => String(o.id) === String(activeId));
          if (match) defaultId = match.id;
        }

        if (mounted) {
          setSelectedSessionTerm(defaultId);
          setTermsReady(true);
        }
      } catch (err) {
        console.error('Failed to load session terms:', err);
      }
    };
    load();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const active = await fetchActiveSessionTerm();
        if (!mounted || !active?.status || !active?.data?.session_term_id) return;
        const { session_name, term_name, session_term_id } = active.data;

        const weeksRes = await getSessionTermWeeks(session_term_id);
        const weeks = (weeksRes?.data || []).filter((w) => w.start_date && w.end_date);
        if (!mounted || weeks.length === 0) return;

        const starts = weeks.map((w) => new Date(w.start_date).getTime());
        const ends = weeks.map((w) => new Date(w.end_date).getTime());
        const first = Math.min(...starts);
        const last = Math.max(...ends);
        const daysCount = Math.round((last - first) / 86400000) + 1;

        setTermInfo({
          termName: `${session_name || ''} ${term_name || ''}`.trim(),
          daysCount: `${daysCount} Days`,
          startDate: fmtDate(weeks.find((w) => new Date(w.start_date).getTime() === first)?.start_date),
          endDate: fmtDate(weeks.find((w) => new Date(w.end_date).getTime() === last)?.end_date),
        });
      } catch (err) {
        console.error('Failed to load term calendar:', err);
      }
    };
    load();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!termsReady) return;
    let mounted = true;
    setLoadingWards(true);
    getParentWards(sessionTermId)
      .then((res) => {
        if (mounted) setWards(res.data);
      })
      .catch((err) => console.error('Failed to load parent wards:', err))
      .finally(() => {
        if (mounted) setLoadingWards(false);
      });
    return () => {
      mounted = false;
    };
  }, [sessionTermId, termsReady]);



  useEffect(() => {
    if (!termsReady) return;
    let mounted = true;
    getParentBatches(sessionTermId)
      .then((res) => {
        if (mounted && res?.status) setBatches(res.data);
      })
      .catch((err) => console.error('Failed to load open batches:', err));
    return () => {
      mounted = false;
    };
  }, [sessionTermId, termsReady]);

  useEffect(() => {
    if (!termsReady) return;
    let mounted = true;
    getParentFinance(sessionTermId)
      .then((res) => {
        if (mounted && res?.status) setFinance(res.data);
      })
      .catch((err) => console.error('Failed to load parent finance:', err));
    return () => {
      mounted = false;
    };
  }, [sessionTermId, termsReady]);

  useEffect(() => {
    if (!wards.length) {
      setSelectedWard(null);
      return;
    }
    const stillThere = wards.some(
      (w) => w.id === selectedWard?.id && w.class === selectedWard?.class
    );
    if (!stillThere) setSelectedWard(wards[0]);
  }, [wards]);

  const handleApply = (batch) => {
    setAdmissionModalOpen(false);
    navigate('/admission/new-application', { state: { batch } });
  };

  return (
    <PageContainer title="Parent Dashboard" description="Parent Portal Overview">
      
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 340px' },
          gap: 2.5,
          alignItems: 'stretch',
          pt: 1,
        }}
      >
        {/* ─── Row 1 ─── */}
        <MyWards
          wards={wards}
          loading={loadingWards}
          selectedWard={selectedWard}
          onSelectWard={setSelectedWard}
          sessionTerms={sessionTerms}
          selectedSessionTerm={selectedSessionTerm}
          onSessionTermChange={setSelectedSessionTerm}
        />

        <ParentWalletAccount totalPayable={finance?.outstanding} />

        {/* ─── Row 2 ─── */}
        <QuickActions
          onApplyAdmission={() => setAdmissionModalOpen(true)}
          hasOpenBatches={batches?.has_open_batches}
        />

        <TermCalendar {...termInfo} />

        {/* ─── Row 3 ─── */}
        <AcademicOverview
          wards={wards}
          selectedWard={selectedWard}
          onSelectWard={setSelectedWard}
        />

        <ActivityLogs />
      </Box>

      {/* Admission Application Modal */}
      <AdmissionBatchModal
        open={admissionModalOpen}
        onClose={() => setAdmissionModalOpen(false)}
        onApply={handleApply}
      />
    </PageContainer>
  );
};

export default ParentDashboard2;