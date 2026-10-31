import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                RC
              </div>
              <span className="text-white font-bold text-base">Radiografía de participación ciudadana</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Plataforma de análisis, visualización y caracterización estadística de la participación electoral en México a partir de datos oficiales del INE.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Principios y Enfoque</h4>
            <ul className="text-xs space-y-2 text-slate-400">
              <li>• Transparencia en fuentes y metodología</li>
              <li>• Neutralidad partidista y rigor estadístico</li>
              <li>• Protección de datos: agregados territoriales</li>
              <li>• Reproducibilidad de indicadores</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Fuentes Oficiales</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Información basada en los Conteos Censales de Participación Ciudadana (CCPC) del Instituto Nacional Electoral (INE).
            </p>
            <a
              href="https://ine.mx/transparencia/datos-abiertos/visualizacion-datos/conteos-censales-participacion/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:underline"
            >
              Portal de Datos Abiertos del INE →
            </a>
          </div>
        </div>
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>© 2026 Radiografía de participación ciudadana</p>
          <p>Datos agregados del Instituto Nacional Electoral</p>
        </div>
      </div>
    </footer>
  );
}

export function Layout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col dark:bg-slate-950">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
        {children}
      </main>
      <Footer />
    </div>
  );
}
