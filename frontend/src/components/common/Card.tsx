import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export function Card({ children, className, title }: CardProps) {
  return (
    <div className={cn('bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm p-4 sm:p-6 min-w-0', className)}>
      {title && (
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2 dark:text-slate-100">
          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
