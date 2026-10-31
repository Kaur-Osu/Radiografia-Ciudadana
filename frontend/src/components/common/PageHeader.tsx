import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description: string;
  eyebrow?: string;
  children?: ReactNode;
}

export function PageHeader({ title, description, eyebrow = 'DATOS ABIERTOS · PARTICIPACIÓN CIUDADANA', children }: PageHeaderProps) {
  return <section className="page-header">
    <div className="page-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="page-description">{description}</p>
    </div>
    {children && <div className="page-controls">{children}</div>}
  </section>;
}
