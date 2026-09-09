import { createContext, useContext, useState, useCallback } from 'react';

const ResultTemplateContext = createContext(null);

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
  const [activeTemplate, setActiveTemplate] = useState('Sample 12');
  const [enableCAReport, setEnableCAReport] = useState(false);

  const selectTemplate = useCallback((sampleName) => {
    setActiveTemplate(sampleName);
  }, []);

  const getTemplateIndex = useCallback(() => {
    const idx = TEMPLATE_SAMPLES.findIndex(t => t.sample === activeTemplate);
    return idx >= 0 ? idx : 0;
  }, [activeTemplate]);

  return (
    <ResultTemplateContext.Provider value={{
      activeTemplate,
      selectTemplate,
      getTemplateIndex,
      enableCAReport,
      setEnableCAReport,
      templateSamples: TEMPLATE_SAMPLES,
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
