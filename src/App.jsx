import { useContext } from 'react';
import { CustomizerContext } from 'src/context/CustomizerContext';
import { ThemeSettings } from './theme/Theme';
import RTL from './layouts/landlord/shared/customizer/RTL';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { RouterProvider } from 'react-router-dom';
import router from './routes/Router';
import { ResultTemplateProvider } from '@/context/ResultTemplateContext';

function App() {
  const theme = ThemeSettings();
  const { activeDir } = useContext(CustomizerContext);

  return (
    <ThemeProvider theme={theme}>
      <RTL direction={activeDir}>
        <CssBaseline />
        <ResultTemplateProvider>
          <RouterProvider router={router} />
        </ResultTemplateProvider>
      </RTL>
    </ThemeProvider>
  );
}

export default App;
