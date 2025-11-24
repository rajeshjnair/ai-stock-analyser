import * as React from 'react';
import { Search, FileX, Inbox, AlertCircle, type LucideIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

export interface EmptyStateProps {
  variant?: 'default' | 'search' | 'no-data' | 'error';
  title?: string;
  description?: string;
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const variantConfig = {
  default: {
    icon: Inbox,
    title: 'No items yet',
    description: 'Get started by adding your first item.',
  },
  search: {
    icon: Search,
    title: 'No results found',
    description: 'Try adjusting your search terms or filters.',
  },
  'no-data': {
    icon: FileX,
    title: 'No data available',
    description: 'There is no data to display at this time.',
  },
  error: {
    icon: AlertCircle,
    title: 'Something went wrong',
    description: 'An error occurred while loading the data.',
  },
};

export function EmptyState({
  variant = 'default',
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  const config = variantConfig[variant];
  const Icon = icon || config.icon;
  const displayTitle = title || config.title;
  const displayDescription = description || config.description;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-6 text-center',
        className
      )}
    >
      <div className="mb-4 rounded-full bg-surface-50 p-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-foreground">
        {displayTitle}
      </h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">
        {displayDescription}
      </p>
      {action && (
        <Button variant="default" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
