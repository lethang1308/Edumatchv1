import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumb = ({ items = [], className }) => {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center text-caption text-muted ${className || ''}`}
    >
      <ol className="flex items-center space-x-1.5">
        <li>
          <Link
            to="/"
            className="flex items-center text-faint hover:text-ink transition-colors"
            title="Trang chủ"
          >
            <Home className="w-3.5 h-3.5" />
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center space-x-1.5">
              <ChevronRight className="w-3 h-3 text-line-strong shrink-0" />
              {item.path && !isLast ? (
                <Link
                  to={item.path}
                  className="font-medium text-muted hover:text-ink transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="font-semibold text-ink">{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
