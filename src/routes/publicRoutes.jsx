import React from 'react';
import { ROUTES } from '@/constants/routes';
import { MainLayout } from '@/layouts/MainLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Home } from '@/pages/Home';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { StudentWelcomePage } from '@/pages/StudentWelcome';
import { Forbidden } from '@/pages/Forbidden';
import { NotFound } from '@/pages/NotFound';
import { ProtectedRoute } from './ProtectedRoute';
import { CreateCoursePage, CourseDetailPage } from '@/pages/Courses';
import { TeacherProfilePage } from '@/pages/TeacherProfile';
import { MessagesPage } from '@/pages/Messages';
import { PartnerTermsPage } from '@/pages/PartnerTerms';
import { CenterSupportPage } from '@/pages/CenterSupport';
import { ContactPage } from '@/pages/Contact';
import { FeedPage } from '@/pages/Feed';

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
      {
        path: ROUTES.SEARCH_RESULTS,
        element: <Home />,
      },
      {
        path: ROUTES.PARTNER_TERMS,
        element: <PartnerTermsPage />,
      },
      {
        path: ROUTES.CENTER_SUPPORT,
        element: <CenterSupportPage />,
      },
      {
        path: ROUTES.CONTACT,
        element: <ContactPage />,
      },
      {
        path: ROUTES.FEED,
        element: <FeedPage />,
      },
      {
        path: ROUTES.COURSE_DETAIL(),
        element: <CourseDetailPage />,
      },
      {
        path: ROUTES.TEACHER_PROFILE(),
        element: <TeacherProfilePage />,
      },
      {
        path: ROUTES.CREATE_COURSE,
        element: <ProtectedRoute><CreateCoursePage /></ProtectedRoute>,
      },
      {
        path: ROUTES.MESSAGES,
        element: <ProtectedRoute><MessagesPage /></ProtectedRoute>,
      },
      {
        path: ROUTES.STUDENT_WELCOME,
        element: <ProtectedRoute><StudentWelcomePage /></ProtectedRoute>,
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
