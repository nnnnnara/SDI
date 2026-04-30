import type { HTMLAttributes, ReactNode } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'default';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: ReactNode;
}

export function Badge({ variant = 'default', children, className, ...props }: BadgeProps) {
  const variantStyles = {
    success: 'bg-brand-success/20 text-brand-success border-brand-success/30',
    warning: 'bg-brand-warning/20 text-brand-warning border-brand-warning/30',
    danger: 'bg-brand-danger/20 text-brand-danger border-brand-danger/30',
    info: 'bg-brand-info/20 text-brand-info border-brand-info/30',
    default: 'bg-brand-border/50 text-brand-textSub border-brand-border',
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
