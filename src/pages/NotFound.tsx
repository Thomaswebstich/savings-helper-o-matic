
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
      <div className="bg-white/30 backdrop-blur-md shadow-glass rounded-xl p-8 max-w-md animate-slide-up">
        <div className="w-24 h-24 rounded-full bg-muted/50 mx-auto mb-6 flex items-center justify-center">
          <span className="text-3xl">404</span>
        </div>
        
        <h1 className="text-3xl font-bold mb-3">Page not found</h1>
        <p className="text-muted-foreground mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <Button onClick={() => navigate('/')} className="mt-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
