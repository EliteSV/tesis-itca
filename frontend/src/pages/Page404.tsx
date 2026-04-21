import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { siteConfig } from '@/config/site.config';

export function Page404() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary/20 dark:text-primary/10 mb-4">
            404
          </h1>
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Página no encontrada
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
            Lo sentimos, la página que estás buscando no existe o ha sido movida.
          </p>
        </div>

        <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardContent className="pt-8 sm:pt-10 px-6 sm:px-8 pb-8 sm:pb-10">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate(-1)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver atrás
              </Button>
              <Button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Ir al Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8">
          <img
            src={siteConfig.logo.main}
            alt={siteConfig.organization.name}
            className="h-12 mx-auto opacity-50"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}


