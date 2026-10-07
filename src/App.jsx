import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts';
import AppRoutes from '@/routes';
import { COLORS } from '@/constants/theme';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Global Toast Provider */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: COLORS.surface,
              color: COLORS.ink,
              border: `1px solid ${COLORS.line}`,
              borderRadius: 'var(--radius-control)',
              boxShadow: 'var(--shadow-edu)',
              fontSize: 'var(--text-body)',
            },
          }}
        />

        {/* Centralized Route Tree */}
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
