import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Layers } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { APP_CONFIG } from '@/config/app';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to={ROUTES.HOME} className="inline-flex items-center gap-2.5">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <span className="font-bold text-slate-900 text-xl tracking-tight">{APP_CONFIG.name}</span>
        </Link>
      </div>

      {/* Main Outlet Container */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200/80 rounded-2xl sm:px-10">
          <Outlet />
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} {APP_CONFIG.name}. Bảo mật và quyền riêng tư được bảo đảm.
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;
