import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Acceso no autorizado</CardTitle>
          <CardDescription>No tienes permisos para acceder a esta página</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={() => navigate('/dashboard')} className="w-full">
            Ir al Panel de Control
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

