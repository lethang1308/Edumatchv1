import React from 'react';
import { ROUTES } from '@/constants/routes';
import { MainLayout } from '@/layouts/MainLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Home } from '@/pages/Home';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { Forbidden } from '@/pages/Forbidden';
import { NotFound } from '@/pages/NotFound';

/**
 * Public routes accessible without authentication
 */
export const publicRoutes = [
  {
    element: <MainLayout />,
    children: [
      {
        path: ROUTES.HOME,
        element: <Home />,
      },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: ROUTES.LOGIN,
        element: <Login />,
      },
      {
        path: ROUTES.REGISTER,
        element: <Register />,
      },
    ],
  },
  {
    path: ROUTES.FORBIDDEN,
    element: <Forbidden />,
  },
  {
    path: ROUTES.NOT_FOUND,
    element: <NotFound />,
  },
];

export default publicRoutes;
