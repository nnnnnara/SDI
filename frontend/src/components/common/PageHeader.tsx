interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-textMain">{title}</h1>
      {description && <p className="mt-1 text-sm text-brand-textSub">{description}</p>}
    </div>
  );
}
