import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import resultSetupApi from '@/api/tenant/result-setup/resultSetupApi';

const ResultTemplateContext = createContext(null);

// The 13 shipped report-card designs (result_templates.result_sample enum
// on the backend). The selected sample name is persisted per division
// through the /result-templates API; the preview images are static assets.
const TEMPLATE_SAMPLES = [
  { id: 1, sample: 'Sample 1', image: 'https://i.ibb.co/Pt1LngW/Template01-Screenshot.png' },
  { id: 2, sample: 'Sample 2', image: 'https://i.ibb.co/sJFDMCj/Template02-Screenshot.png' },
  { id: 3, sample: 'Sample 3', image: 'https://i.ibb.co/G01BBMM/Template03-Screenshot.png' },
  { id: 4, sample: 'Sample 4', image: 'https://i.ibb.co/tbDkbP8/Template04-Screenshot.png' },
  { id: 5, sample: 'Sample 5', image: 'https://i.ibb.co/pPv4w6N/Template05-Screenshot.png' },
  { id: 6, sample: 'Sample 6', image: 'https://i.ibb.co/w00w4kt/Template06-Screenshot.png' },
  { id: 7, sample: 'Sample 7', image: 'https://i.ibb.co/88vdsKW/Template07-Screenshot.png' },
  { id: 8, sample: 'Sample 8', image: 'https://i.ibb.co/WnYdb83/Template08-Screenshot.png' },
  { id: 9, sample: 'Sample 9', image: 'https://i.ibb.co/6bdvW2m/Template09-Screenshot.png' },
  { id: 10, sample: 'Sample 10', image: 'https://i.ibb.co/LvHLWyW/Template10-Screenshot.png' },
  { id: 11, sample: 'Sample 11', image: 'https://i.ibb.co/KrpPzsL/Template11-Screenshot.png' },
  { id: 12, sample: 'Sample 12', image: 'https://i.ibb.co/1mPDkpB/Template12-Screenshot.png' },
  { id: 13, sample: 'Sample 13', image: 'https://i.ibb.co/JmkK00t/Template13-Screenshot.png' },
];

export const ResultTemplateProvider = ({ children }) => {
  const [activeTemplate, setActiveTemplate] = useState('Sample 1');
  const [enableCAReport, setEnableCAReportState] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // Load the school-wide (division_id = null) template on boot so report
  // rendering (getTemplateIndex) knows which sample to use.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await resultSetupApi.getActiveTemplate();
        if (!cancelled && res.data?.status) {
          setActiveTemplate(res.data.data?.result_sample || 'Sample 1');
          setEnableCAReportState(res.data.data?.enable_ca_report === 'yes');
        }
      } catch (err) {
        console.error('Failed to fetch active result template:', err);
      } finally {
        if (!cancelled) setInitializing(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Fetch the active template for one division (school-wide when
  // divisionId is null). Resolves { resultSample, enableCAReport }.
  const fetchActiveTemplate = useCallback(async (divisionId = null) => {
    const res = await resultSetupApi.getActiveTemplate(
      divisionId ? { division_id: divisionId } : {},
    );
    const data = res.data?.data || {};
    return {
      resultSample: data.result_sample || 'Sample 1',
      enableCAReport: data.enable_ca_report === 'yes',
    };
  }, []);

  // Persist the selected template for a division and mirror it into the
  // global state. Throws on API failure so callers can revert/recover.
  const selectTemplate = useCallback(async (sampleName, divisionId = null) => {
    const res = await resultSetupApi.setTemplate({
      result_sample: sampleName,
      division_id: divisionId,
    });
    setActiveTemplate(sampleName);
    return res;
  }, []);

  // Persist the CA Reportsheet switch for a division (null = school-wide).
  const setEnableCAReport = useCallback(async (value, divisionId = null) => {
    const res = await resultSetupApi.toggleCAReport({ value, division_id: divisionId });
    setEnableCAReportState(value);
    return res;
  }, []);

  const getTemplateIndex = useCallback(() => {
    const idx = TEMPLATE_SAMPLES.findIndex((t) => t.sample === activeTemplate);
    return idx >= 0 ? idx : 0;
  }, [activeTemplate]);

  return (
    <ResultTemplateContext.Provider value={{
      activeTemplate,
      selectTemplate,
      fetchActiveTemplate,
      getTemplateIndex,
      enableCAReport,
      setEnableCAReport,
      templateSamples: TEMPLATE_SAMPLES,
      initializing,
    }}>
      {children}
    </ResultTemplateContext.Provider>
  );
};

export const useResultTemplate = () => {
  const ctx = useContext(ResultTemplateContext);
  if (!ctx) throw new Error('useResultTemplate must be used within ResultTemplateProvider');
  return ctx;
};

export { TEMPLATE_SAMPLES };
export default ResultTemplateContext;