import React from 'react';
import { ROUTES } from '@/constants/routes';
import { ProtectedRoute } from './ProtectedRoute';
import { Dashboard } from '@/pages/Dashboard';

/**
 * Private / Protected routes requiring authentication
 */
export const privateRoutes = [
  {
    path: ROUTES.DASHBOARD,
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
];

export default privateRoutes;
