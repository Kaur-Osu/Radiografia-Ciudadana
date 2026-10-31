import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export function Card({ children, className, title }: CardProps) {
  return <section className={cn('data-card', className)}>
    {title && <h2 className="card-title">{title}</h2>}
    {children}
  </section>;
}
