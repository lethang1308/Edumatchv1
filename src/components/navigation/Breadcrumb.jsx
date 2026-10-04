import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumb = ({ items = [], className }) => {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center text-xs text-slate-500 ${className || ''}`}
    >
      <ol className="flex items-center space-x-1.5">
        <li>
          <Link
            to="/"
            className="flex items-center text-slate-400 hover:text-slate-700 transition-colors"
            title="Trang chủ"
          >
            <Home className="w-3.5 h-3.5" />
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center space-x-1.5">
              <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
              {item.path && !isLast ? (
                <Link
                  to={item.path}
                  className="font-medium text-slate-500 hover:text-slate-800 transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="font-semibold text-slate-800">{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
