import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts';
import AppRoutes from '@/routes';

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
              background: '#ffffff',
              color: '#0f172a',
              border: '1px solid #e2e8f0',
              borderRadius: '0.75rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              fontSize: '0.875rem',
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
