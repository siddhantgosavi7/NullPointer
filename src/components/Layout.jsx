import { Menu, Moon, Sprout, Sun, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import { LanguageSelector } from './LanguageSelector';
import { OfflineBanner } from './OfflineBanner';
import { ToastHost } from './ToastHost';

const links = [
  ['/', 'home'],
  ['/detect', 'detection'],
  ['/dashboard', 'dashboard'],
  ['/reports', 'reports'],
  ['/weather', 'weather'],
  ['/schemes', 'schemes'],
  ['/chatbot', 'chatbot'],
  ['/auth', 'login'],
];

export function Layout({ children }) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const { darkMode, setDarkMode, offline, setOffline, user, logout, isAuthenticated } = useApp();

  const visibleLinks = links.filter(([to]) => (to === '/auth' ? !isAuthenticated : true));

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-[#f7fbf5] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-slate-950/88">
          <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
            <Link to="/" className="flex items-center gap-2 font-black text-leaf-800 dark:text-leaf-200">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-leaf-600 text-white">
                <Sprout size={22} />
              </span>
              <span className="leading-tight">{t('appName')}</span>
            </Link>
            <div className="hidden items-center gap-1 lg:flex">
              {visibleLinks.map(([to, key]) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2 text-sm font-semibold transition ${
                      isActive ? 'bg-leaf-100 text-leaf-800 dark:bg-leaf-900 dark:text-leaf-100' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10'
                    }`
                  }
                >
                  {t(`nav.${key}`)}
                </NavLink>
              ))}
            </div>
            <div className="hidden items-center gap-2 lg:flex">
              {user && (
                <div className="mr-2 rounded-full border border-leaf-200 bg-leaf-50 px-3 py-2 text-xs font-bold text-leaf-900 dark:border-leaf-900 dark:bg-leaf-950 dark:text-leaf-100">
                  {user.name || user.email}
                </div>
              )}
              <LanguageSelector />
              <button
                onClick={() => setOffline(!offline)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold dark:border-white/10"
              >
                {offline ? 'Online' : 'Offline'}
              </button>
              {user && (
                <button onClick={logout} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold dark:border-white/10">
                  Logout
                </button>
              )}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 dark:border-white/10"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun size={19} /> : <Moon size={19} />}
              </button>
            </div>
            <button onClick={() => setOpen(true)} className="grid h-11 w-11 place-items-center rounded-lg border border-slate-200 lg:hidden dark:border-white/10" aria-label="Open menu">
              <Menu />
            </button>
          </nav>
        </header>
        <OfflineBanner />
        {open && (
          <div className="fixed inset-0 z-[60] bg-slate-950/40 lg:hidden">
            <aside className="ml-auto flex h-full w-[86vw] max-w-sm flex-col gap-4 bg-white p-4 shadow-soft dark:bg-slate-950">
              <div className="flex items-center justify-between">
                <span className="font-black text-leaf-800 dark:text-leaf-100">{t('appName')}</span>
                <button onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-white/10" aria-label="Close menu">
                  <X />
                </button>
              </div>
              <LanguageSelector />
              <div className="grid gap-2">
                {visibleLinks.map(([to, key]) => (
                  <NavLink
                    key={to}
                    onClick={() => setOpen(false)}
                    to={to}
                    className={({ isActive }) =>
                      `rounded-lg px-3 py-3 font-semibold ${isActive ? 'bg-leaf-100 text-leaf-800 dark:bg-leaf-900 dark:text-leaf-100' : 'hover:bg-slate-100 dark:hover:bg-white/10'}`
                    }
                  >
                    {t(`nav.${key}`)}
                  </NavLink>
                ))}
                {user && (
                  <button
                    onClick={() => {
                      logout();
                      setOpen(false);
                    }}
                    className="rounded-lg px-3 py-3 text-left font-semibold hover:bg-slate-100 dark:hover:bg-white/10"
                  >
                    Logout {user.name ? `(${user.name})` : ''}
                  </button>
                )}
              </div>
            </aside>
          </div>
        )}
        <main>{children}</main>
        <footer className="border-t border-slate-200 bg-white px-4 py-10 dark:border-white/10 dark:bg-slate-950">
          <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-[1.3fr_.7fr_.7fr]">
            <div>
              <h3 className="text-xl font-black text-leaf-800 dark:text-leaf-200">{t('appName')}</h3>
              <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
                Crop diagnosis, weather intelligence, expert access, and reports in one farmer-friendly workspace.
              </p>
            </div>
            <div>
              <p className="font-bold">Contact</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">support@krishirakshak.ai</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">+91 1800 204 1020</p>
            </div>
            <div>
              <p className="font-bold">Social</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">WhatsApp · YouTube · X · LinkedIn</p>
            </div>
          </div>
        </footer>
        <ToastHost />
      </div>
    </div>
  );
}
