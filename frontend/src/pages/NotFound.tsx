import { Link } from 'react-router-dom';
import { Home, AlertTriangle, ArrowLeft } from 'lucide-react';

export function NotFound() {
  return (
    <div className='flex-1 w-full flex items-center justify-center px-4 py-16 bg-slate-50 dark:bg-slate-950 transition-colors'>
      <div className='max-w-md w-full text-center bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg'>
        <div className='w-16 h-16 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm'>
          <AlertTriangle className='w-8 h-8' />
        </div>
        <h1 className='text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2'>404</h1>
        <h2 className='text-xl font-bold text-slate-900 dark:text-white mb-3'>Página no encontrada</h2>
        <p className='text-sm font-medium text-slate-700 dark:text-slate-300 mb-8 leading-relaxed'>
          La sección o recurso electoral que buscas no existe o ha sido movida dentro de la plataforma de Radiografía de Participación Ciudadana.
        </p>
        <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
          <Link
            to='/'
            className='w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg text-sm transition-colors shadow-sm'
          >
            <Home className='w-4 h-4' />
            Volver al Inicio
          </Link>
          <button
            onClick={() => window.history.back()}
            className='w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 font-semibold rounded-lg text-sm transition-colors border border-slate-300 dark:border-slate-700'
          >
            <ArrowLeft className='w-4 h-4' />
            Página Anterior
          </button>
        </div>
      </div>
    </div>
  );
}
