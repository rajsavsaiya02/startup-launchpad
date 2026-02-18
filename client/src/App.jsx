import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';


import { ToastProvider } from './components/ui/Toast';

import { HelmetProvider } from 'react-helmet-async';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <HelmetProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </HelmetProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;