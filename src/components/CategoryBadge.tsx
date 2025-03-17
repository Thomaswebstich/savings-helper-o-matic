
import { useMemo } from 'react';
import { Category } from '@/lib/data';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import * as Icons from 'lucide-react';

interface CategoryBadgeProps {
  category: Category | string;
  className?: string;
  withLabel?: boolean;
}

export function CategoryBadge({ category, className, withLabel = true }: CategoryBadgeProps) {
  const { iconName, categoryName, colorClass } = useMemo(() => {
    if (typeof category === 'string') {
      // Legacy support for when category is just a string name
      return {
        iconName: 'Circle',
        categoryName: category,
        colorClass: 'bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-300'
      };
    } else {
      return {
        iconName: category.icon || 'Circle',
        categoryName: category.name,
        colorClass: category.color
      };
    }
  }, [category]);

  const IconComponent = useMemo(() => {
    return Icons[iconName as keyof typeof Icons] as LucideIcon || Icons.Circle;
  }, [iconName]);

  return (
    <div className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
      colorClass,
      className
    )}>
      {IconComponent && <IconComponent className="w-3 h-3 mr-1" />}
      {withLabel && categoryName}
    </div>
  );
}
