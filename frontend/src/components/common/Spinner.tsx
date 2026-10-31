import { cn } from '@/lib/utils';
export function Spinner({ className }: { className?: string }) {
  return <div role="status" className={cn('loading-state', className)}><span className="loading-spinner" /><span>Cargando información…</span></div>;
}
