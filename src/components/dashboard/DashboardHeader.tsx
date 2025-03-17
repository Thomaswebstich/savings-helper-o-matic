
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

interface DashboardHeaderProps {
  onSettingsClick: () => void;
}

export function DashboardHeader({ onSettingsClick }: DashboardHeaderProps) {
  return (
    <div className="mb-5 flex justify-between items-center">
      <div>
        <h1 className="text-xl font-bold mb-0.5">Financial Dashboard</h1>
        <p className="text-muted-foreground text-sm">Track, analyze, and plan your personal finances</p>
      </div>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onSettingsClick}
      >
        <Settings className="h-4 w-4 mr-1" />
        Manage Settings
      </Button>
    </div>
  );
}
