import { Link, useLocation } from 'react-router-dom';
import { Home, Map, BarChart3, Building2, BookOpen, Sun, Moon, ArrowUpRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { CivicMark } from '@/components/common/CivicMark';

const navItems = [
  { path: '/', label: 'Inicio', icon: Home },
  { path: '/explorador', label: 'Explorador Territorial', icon: Map },
  { path: '/comparador', label: 'Comparador Histórico', icon: BarChart3 },
  { path: '/perfiles', label: 'Perfiles de Participación', icon: Building2 },
  { path: '/metodologia', label: 'Metodología', icon: BookOpen },
];

export function Navbar() {
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(() => {
    const theme = localStorage.getItem('theme');
    return theme ? theme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);
  return <header className="site-header">
    <a href="#contenido" className="skip-link">Saltar al contenido</a>
    <div className="utility-bar"><div className="site-container utility-content">
      <span>DATOS ABIERTOS PARA UNA CIUDADANÍA INFORMADA</span>
      <a href="https://www.ine.mx/transparencia/datos-abiertos/visualizacion-datos/conteos-censales-participacion/" target="_blank" rel="noopener noreferrer">Fuente: INE <ArrowUpRight size={12} /></a>
    </div></div>
    <div className="site-container identity-bar">
      <Link to="/" className="brand" aria-label="Radiografía Ciudadana · Inicio">
        <CivicMark className="brand-mark" />
        <span className="brand-name">Radiografía<span>de participación ciudadana</span></span>
      </Link>
      <div className="identity-actions">
        <span className="data-period"><span className="status-dot" />Elecciones 2018 — 2024</span>
        <button onClick={() => setDarkMode(value => !value)} className="theme-toggle" title="Alternar tema claro/oscuro" aria-label="Alternar tema claro/oscuro" aria-pressed={darkMode}>
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </div>
    <nav className="primary-navigation" aria-label="Navegación principal">
      <div className="site-container nav-links">{navItems.map(({ path, label, icon: Icon }) => <Link key={path} to={path} aria-current={location.pathname === path ? 'page' : undefined} className="nav-link"><Icon size={16} strokeWidth={1.7} />{label}</Link>)}</div>
    </nav>
  </header>;
}
