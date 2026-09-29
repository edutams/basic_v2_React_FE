import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import resultSetupApi from '@/api/tenant/result-setup/resultSetupApi';

const ResultTemplateContext = createContext(null);

// Fallback index when the samples catalog has not loaded yet:
// "Sample N" → component index N-1 (clamped to the 13 shipped React templates).
const sampleIndex = (sample) => {
  const match = /Sample\s*(\d+)/i.exec(sample || '');
  const n = match ? parseInt(match[1], 10) : 1;
  return Math.max(0, Math.min(n - 1, 12));
};

export const ResultTemplateProvider = ({ children }) => {
  // School-wide / default active template — the boot default.
  const [activeTemplate, setActiveTemplate] = useState('Sample 1');
  // Per-division overrides: { [divisionId]: 'Sample N' } — populated as
  // the setup page (or a report) resolves each division's template.
  const [divisionTemplates, setDivisionTemplates] = useState({});
  const [enableCAReport, setEnableCAReportState] = useState(false);
  // Per-division CA Reportsheet flag: { [divisionId]: boolean }.
  const [divisionCAReports, setDivisionCAReports] = useState({});
  const [initializing, setInitializing] = useState(true);
  // Catalog from DB (result_template_samples) — fetched when the setup
  // gallery needs it; empty until then.
  const [templateSamples, setTemplateSamples] = useState([]);
  const [samplesLoading, setSamplesLoading] = useState(false);

  // Load the default template on boot so report rendering
  // (getTemplateIndex) knows which sample to use.
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

  // Load the template samples catalog from the DB (idempotent GET).
  const fetchTemplateSamples = useCallback(async () => {
    setSamplesLoading(true);
    try {
      const res = await resultSetupApi.getTemplateSamples();
      const list = res.data?.status
        ? (res.data.data || []).map((s) => ({
            id: s.id,
            sample: s.result_sample,
            image: s.image_url,
            sort_order: s.sort_order,
          }))
        : [];
      setTemplateSamples(list);
      return list;
    } catch (err) {
      console.error('Failed to fetch template samples:', err);
      return [];
    } finally {
      setSamplesLoading(false);
    }
  }, []);

  // Fetch the active template for one division (default when
  // divisionId is null). Caches result sample + CA flag per division.
  const fetchActiveTemplate = useCallback(async (divisionId = null) => {
    const params = divisionId ? { division_id: divisionId } : {};
    const res = await resultSetupApi.getActiveTemplate(params);
    const data = res.data?.data || {};
    const resultSample = data.result_sample || 'Sample 1';
    const caEnabled = data.enable_ca_report === 'yes';
    if (divisionId) {
      setDivisionTemplates((prev) => ({ ...prev, [divisionId]: resultSample }));
      setDivisionCAReports((prev) => ({ ...prev, [divisionId]: caEnabled }));
    } else {
      setActiveTemplate(resultSample);
      setEnableCAReportState(caEnabled);
    }
    return { resultSample, enableCAReport: caEnabled };
  }, []);

  // Resolve the template for a division (from cache or API).
  const getTemplateForDivision = useCallback(async (divisionId) => {
    if (!divisionId) return activeTemplate;
    if (divisionTemplates[divisionId]) return divisionTemplates[divisionId];
    const { resultSample } = await fetchActiveTemplate(divisionId);
    return resultSample;
  }, [activeTemplate, divisionTemplates, fetchActiveTemplate]);

  // Persist the selected template for a division and mirror it into the
  // global/per-division state. Throws on API failure so callers can
  // revert/recover.
  const selectTemplate = useCallback(async (sampleName, divisionId = null) => {
    const res = await resultSetupApi.setTemplate({
      result_sample: sampleName,
      division_id: divisionId,
    });
    if (divisionId) {
      setDivisionTemplates((prev) => ({ ...prev, [divisionId]: sampleName }));
    } else {
      setActiveTemplate(sampleName);
    }
    return res;
  }, []);

  // Persist the CA Reportsheet switch for a division (null = default).
  // Always mirrors the new value into local state so the Switch re-renders.
  const setEnableCAReport = useCallback(async (value, divisionId = null) => {
    const res = await resultSetupApi.toggleCAReport({
      value,
      division_id: divisionId,
    });
    if (divisionId) {
      setDivisionCAReports((prev) => ({ ...prev, [divisionId]: value }));
    } else {
      setEnableCAReportState(value);
    }
    return res;
  }, []);

  // CA flag for the currently selected division (falls back to default).
  const getCAReportForDivision = useCallback(
    (divisionId) => (divisionId != null
      ? (divisionCAReports[divisionId] ?? enableCAReport)
      : enableCAReport),
    [divisionCAReports, enableCAReport],
  );

  // Index of the default active template (report rendering default).
  const getTemplateIndex = useCallback(() => sampleIndex(activeTemplate), [activeTemplate]);

  // Index for an explicit sample name (e.g. a dossier's result_template).
  const getTemplateIndexForSample = useCallback(
    (sample) => sampleIndex(sample || activeTemplate),
    [activeTemplate],
  );

  return (
    <ResultTemplateContext.Provider value={{
      activeTemplate,
      divisionTemplates,
      selectTemplate,
      fetchActiveTemplate,
      getTemplateForDivision,
      getTemplateIndex,
      getTemplateIndexForSample,
      enableCAReport,
      divisionCAReports,
      getCAReportForDivision,
      setEnableCAReport,
      templateSamples,
      samplesLoading,
      fetchTemplateSamples,
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

export { sampleIndex };
export default ResultTemplateContext;
