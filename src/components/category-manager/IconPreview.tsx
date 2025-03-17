
import React from 'react';
import * as LucideIcons from 'lucide-react';

interface IconPreviewProps {
  iconName: string;
  className?: string;
}

export function IconPreview({ iconName, className = "h-4 w-4" }: IconPreviewProps) {
  const IconComponent = LucideIcons[iconName as keyof typeof LucideIcons] as React.ElementType;
  return IconComponent ? <IconComponent className={className} /> : null;
}
