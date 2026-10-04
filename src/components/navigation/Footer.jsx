import React from 'react';
import { Layers } from 'lucide-react';
import { APP_CONFIG } from '@/config/app';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-blue-600 text-white">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-slate-700">{APP_CONFIG.name}</span>
            <span>— React Base Starter Template</span>
          </div>
          <div>
            © {new Date().getFullYear()} {APP_CONFIG.name}. Sẵn sàng cho mọi dự án website.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
