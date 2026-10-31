import { Outlet, Link, useLocation } from 'react-router-dom';
import { ArrowUpRight, Database, ShieldCheck } from 'lucide-react';
import { Navbar } from './Navbar';
import { CivicMark } from '@/components/common/CivicMark';
import { useEffect } from 'react';

export function Footer() {
  return <footer className="site-footer"><div className="site-container">
    <div className="footer-grid">
      <div className="footer-identity"><CivicMark className="footer-mark" /><div><strong>Radiografía ciudadana</strong><p>Datos que ayudan a entender<br />cómo participa México.</p></div></div>
      <div><h2><Database size={15} />Información abierta</h2><p>Conteos Censales de Participación Ciudadana.<br />Elecciones federales de 2018, 2021 y 2024.</p><a href="https://www.ine.mx/transparencia/datos-abiertos/visualizacion-datos/conteos-censales-participacion/" target="_blank" rel="noopener noreferrer">Consultar la fuente del INE <ArrowUpRight size={13} /></a></div>
      <div><h2><ShieldCheck size={15} />Lecturas con contexto</h2><p>Indicadores descriptivos, fuentes transparentes<br />y protección de datos individuales.</p><Link to="/metodologia">Conocer la metodología <ArrowUpRight size={13} /></Link></div>
    </div>
    <div className="footer-bottom"><span>© 2026 Radiografía de participación ciudadana</span><span>Proyecto académico independiente · Datos públicos del INE</span></div>
  </div></footer>;
}

export function Layout({ children }: { children?: React.ReactNode }) {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);
  return <div className="app-shell">
    <Navbar />
    <main id="contenido" tabIndex={-1} className="site-container main-content"><div className="route-view" key={location.pathname}><Outlet />{children}</div></main>
    <Footer />
  </div>;
}
