
import { Category, CATEGORY_COLORS, CATEGORY_ICONS } from '@/lib/data';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { useMemo } from 'react';
import * as Icons from 'lucide-react';

interface CategoryBadgeProps {
  category: Category;
  className?: string;
  withLabel?: boolean;
}

export function CategoryBadge({ category, className, withLabel = true }: CategoryBadgeProps) {
  const IconComponent = useMemo(() => {
    const iconName = CATEGORY_ICONS[category];
    return Icons[iconName as keyof typeof Icons] as LucideIcon;
  }, [category]);

  return (
    <div className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
      CATEGORY_COLORS[category],
      className
    )}>
      {IconComponent && <IconComponent className="w-3 h-3 mr-1" />}
      {withLabel && category}
    </div>
  );
}
