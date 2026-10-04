import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '@/components/navigation/Header';
import { Footer } from '@/components/navigation/Footer';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export const MainLayout = () => {
  const [theme, setTheme] = useLocalStorage('edumatch:theme', 'system');
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const update = (event) => setSystemDark(event.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  const resolvedTheme = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;
  return (
    <div className="edu-site min-h-dvh flex flex-col" data-theme={resolvedTheme}>
      <Header
        theme={resolvedTheme}
        onToggleTheme={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
