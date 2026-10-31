import { Link, useLocation } from 'react-router-dom';
import { Home, Map, BarChart3, Building2, ShieldCheck, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

const navItems = [
  { path: '/', label: 'Inicio', icon: Home },
  { path: '/explorador', label: 'Explorador Territorial', icon: Map },
  { path: '/comparador', label: 'Comparador Histórico', icon: BarChart3 },
  { path: '/perfiles', label: 'Perfiles de Participación', icon: Building2 },
  { path: '/metodologia', label: 'Metodología', icon: ShieldCheck },
];

export function Navbar() {
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') ? localStorage.getItem('theme') === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-700 dark:bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              RC
            </div>
            <div>
              <Link
                to="/"
                className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
              >
                Radiografía de participación ciudadana
              </Link>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Observatorio Electoral (INE)</p>
            </div>
          </div>
          <div className="hidden xl:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all',
                    isActive
                      ? 'bg-blue-700 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Alternar tema claro/oscuro"
              aria-label="Alternar tema claro/oscuro"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
            </button>


          </div>
        </div>
      </div>
      <div className="xl:hidden flex gap-2 overflow-x-auto px-4 pb-3" aria-label="Navegación principal">
        {navItems.map(item => <Link key={item.path} to={item.path} className={cn('whitespace-nowrap rounded px-3 py-2 text-sm', location.pathname === item.path ? 'bg-blue-700 text-white' : 'text-slate-700 dark:text-slate-200')}>{item.label}</Link>)}
      </div>
    </nav>
  );
}
