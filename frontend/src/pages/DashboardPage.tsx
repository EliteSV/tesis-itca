import { useAuth } from '@/hooks/useAuth';
import { useDashboard } from '@/hooks/useDashboard';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getRoleLabel } from '@/utils/role.utils';
import { UserRole } from '@/types/auth.types';
import {
  Users,
  Building2,
  GraduationCap,
  FolderTree,
  UserCheck,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  BookOpen,
  FileText,
  PlayCircle,
  Briefcase,
  UserPlus,
  UsersRound,
  FileCheck,
  Power,
  PowerOff,
  Timer,
  Target,
} from 'lucide-react';
import type {
  CompanyDashboardStats,
  AdminDashboardStats,
  StudentDashboardStats,
} from '@/types/dashboard.types';

export function DashboardPage() {
  const { user } = useAuth();
  const { data: stats, isLoading, error } = useDashboard();

  if (isLoading) {
    return (
      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Panel de Control
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Cargando estadísticas...
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Panel de Control
          </h1>
        </div>
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error al cargar datos</CardTitle>
            <CardDescription>
              No se pudieron cargar las estadísticas del dashboard. Por favor, intenta
              nuevamente.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Renderizar dashboard según el rol del usuario
  if (user?.role === UserRole.COMPANY) {
    return <CompanyDashboard stats={stats as CompanyDashboardStats} user={user} />;
  }

  if (user?.role === UserRole.ESTUDIANTE) {
    return <StudentDashboard stats={stats as StudentDashboardStats} user={user} />;
  }

  return <AdminDashboard stats={stats as AdminDashboardStats} user={user} />;
}

function CompanyDashboard({
  stats,
  user,
}: {
  stats: CompanyDashboardStats;
  user: { name: string; role: string } | null;
}) {
  const metrics = [
    {
      title: 'Oportunidades Totales',
      value: stats?.opportunities?.total ?? 0,
      description: `${stats?.opportunities?.active ?? 0} activas`,
      icon: Briefcase,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      title: 'Aplicaciones Recibidas',
      value: stats?.applications?.total ?? 0,
      description: `${stats?.applications?.pending ?? 0} pendientes`,
      icon: FileText,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950',
    },
    {
      title: 'Vacantes Totales',
      value: stats?.positions?.total ?? 0,
      description: `${stats?.positions?.occupied ?? 0} ocupadas`,
      icon: UsersRound,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950',
    },
    {
      title: 'Aplicaciones Aceptadas',
      value: stats?.applications?.accepted ?? 0,
      description: `${stats?.applications?.rejected ?? 0} rechazadas`,
      icon: CheckCircle2,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
    },
  ];

  const applicationStatusStats = [
    {
      label: 'Pendientes',
      value: stats?.applications?.pending ?? 0,
      icon: Clock,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950',
      variant: 'outline' as const,
    },
    {
      label: 'Aceptadas',
      value: stats?.applications?.accepted ?? 0,
      icon: CheckCircle2,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950',
      variant: 'default' as const,
    },
    {
      label: 'Rechazadas',
      value: stats?.applications?.rejected ?? 0,
      icon: XCircle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-950',
      variant: 'destructive' as const,
    },
  ];

  const opportunityStatusStats = [
    {
      label: 'Activas',
      value: stats?.opportunities?.active ?? 0,
      icon: Power,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950',
    },
    {
      label: 'Cerradas',
      value: stats?.opportunities?.closed ?? 0,
      icon: PowerOff,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-950',
    },
    {
      label: 'Borrador',
      value: stats?.opportunities?.draft ?? 0,
      icon: FileText,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    },
    {
      label: 'Desactivadas',
      value: stats?.opportunities?.inactive ?? 0,
      icon: XCircle,
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-50 dark:bg-gray-950',
    },
  ];

  return (
    <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Panel de Control
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Bienvenido, {user?.name} - {user?.role ? getRoleLabel(user.role as UserRole) : ''}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                  <Icon className={`h-5 w-5 ${metric.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {metric.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Estado de Aplicaciones
            </CardTitle>
            <CardDescription>
              Distribución de aplicaciones según su estado actual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {applicationStatusStats.map((stat) => {
                const Icon = stat.icon;
                const total = stats?.applications?.total ?? 1;
                const percentage =
                  total > 0 ? Math.round((stat.value / total) * 100) : 0;

                return (
                  <div key={stat.label} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${stat.color}`} />
                        <span className="text-sm font-medium">{stat.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{stat.value}</span>
                        <Badge variant={stat.variant} className="text-xs">
                          {percentage}%
                        </Badge>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${stat.bgColor}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Estado de Oportunidades
            </CardTitle>
            <CardDescription>
              Distribución de oportunidades según su estado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {opportunityStatusStats.map((stat) => {
                const Icon = stat.icon;
                const total = stats?.opportunities?.total ?? 1;
                const percentage =
                  total > 0 ? Math.round((stat.value / total) * 100) : 0;

                return (
                  <div key={stat.label} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${stat.color}`} />
                        <span className="text-sm font-medium">{stat.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{stat.value}</span>
                        <Badge variant="outline" className="text-xs">
                          {percentage}%
                        </Badge>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${stat.bgColor}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Resumen de Vacantes
          </CardTitle>
          <CardDescription>
            Información sobre las vacantes disponibles y ocupadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950">
                  <UsersRound className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Vacantes Totales</p>
                  <p className="text-xs text-muted-foreground">
                    {stats?.positions?.occupied ?? 0} ocupadas
                  </p>
                </div>
              </div>
              <span className="text-lg font-bold">
                {stats?.positions?.total ?? 0}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950">
                  <UserPlus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Vacantes Disponibles</p>
                  <p className="text-xs text-muted-foreground">
                    Listas para nuevas aplicaciones
                  </p>
                </div>
              </div>
              <span className="text-lg font-bold">
                {stats?.positions?.available ?? 0}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950">
                  <FileCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Aplicaciones Aceptadas</p>
                  <p className="text-xs text-muted-foreground">
                    {stats?.applications?.total ?? 0} aplicaciones totales
                  </p>
                </div>
              </div>
              <span className="text-lg font-bold">
                {stats?.applications?.accepted ?? 0}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StudentDashboard({
  stats,
  user,
}: {
  stats: StudentDashboardStats;
  user: { name: string; role: string } | null;
}) {
  const metrics = [
    {
      title: 'Mis Aplicaciones',
      value: stats?.applications?.total ?? 0,
      description: `${stats?.applications?.pending ?? 0} pendientes`,
      icon: FileText,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      title: 'Aplicaciones Aceptadas',
      value: stats?.applications?.accepted ?? 0,
      description: `${stats?.applications?.rejected ?? 0} rechazadas`,
      icon: CheckCircle2,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950',
    },
    {
      title: 'Oportunidades Disponibles',
      value: stats?.opportunities?.available ?? 0,
      description: 'Nuevas oportunidades para aplicar',
      icon: Briefcase,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950',
    },
    {
      title: 'Aplicaciones Pendientes',
      value: stats?.applications?.pending ?? 0,
      description: 'En proceso de revisión',
      icon: Clock,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    },
  ];

  const applicationStatusStats = [
    {
      label: 'Pendientes',
      value: stats?.applications?.pending ?? 0,
      icon: Clock,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950',
      variant: 'outline' as const,
    },
    {
      label: 'Aceptadas',
      value: stats?.applications?.accepted ?? 0,
      icon: CheckCircle2,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950',
      variant: 'default' as const,
    },
    {
      label: 'Rechazadas',
      value: stats?.applications?.rejected ?? 0,
      icon: XCircle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-950',
      variant: 'destructive' as const,
    },
  ];

  return (
    <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Panel de Control
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Bienvenido, {user?.name} - {user?.role ? getRoleLabel(user.role as UserRole) : ''}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                  <Icon className={`h-5 w-5 ${metric.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {metric.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Estado de Mis Aplicaciones
            </CardTitle>
            <CardDescription>
              Distribución de tus aplicaciones según su estado actual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {applicationStatusStats.map((stat) => {
                const Icon = stat.icon;
                const total = stats?.applications?.total ?? 1;
                const percentage =
                  total > 0 ? Math.round((stat.value / total) * 100) : 0;

                return (
                  <div key={stat.label} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${stat.color}`} />
                        <span className="text-sm font-medium">{stat.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{stat.value}</span>
                        <Badge variant={stat.variant} className="text-xs">
                          {percentage}%
                        </Badge>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${stat.bgColor}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Resumen de Oportunidades
            </CardTitle>
            <CardDescription>
              Información sobre tus aplicaciones y oportunidades disponibles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950">
                    <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Aplicaciones Totales</p>
                    <p className="text-xs text-muted-foreground">
                      {stats?.applications?.accepted ?? 0} aceptadas
                    </p>
                  </div>
                </div>
                <span className="text-lg font-bold">
                  {stats?.applications?.total ?? 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950">
                    <Briefcase className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Oportunidades Disponibles</p>
                    <p className="text-xs text-muted-foreground">
                      A las que aún no has aplicado
                    </p>
                  </div>
                </div>
                <span className="text-lg font-bold">
                  {stats?.opportunities?.available ?? 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Aplicaciones Aceptadas</p>
                    <p className="text-xs text-muted-foreground">
                      {stats?.applications?.total ?? 0} aplicaciones totales
                    </p>
                  </div>
                </div>
                <span className="text-lg font-bold">
                  {stats?.applications?.accepted ?? 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {stats?.practiceProfessional && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="h-5 w-5" />
                  Mi Práctica Profesional
                </CardTitle>
                <CardDescription>
                  Información sobre el progreso de tu práctica profesional
                </CardDescription>
              </div>
              <Badge
                className={
                  stats.practiceProfessional.isFinalized === true
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                }
              >
                {stats.practiceProfessional.isFinalized === true ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Finalizada
                  </>
                ) : (
                  <>
                    <Clock className="h-3 w-3 mr-1" />
                    En Curso
                  </>
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950">
                    <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Horas Totales</p>
                    <p className="text-xs text-muted-foreground">Trabajadas</p>
                  </div>
                </div>
                <p className="text-2xl font-bold mt-2">
                  {stats.practiceProfessional.totalHours}
                </p>
              </div>

              <div className="flex flex-col p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Horas Aceptadas</p>
                    <p className="text-xs text-muted-foreground">Aprobadas</p>
                  </div>
                </div>
                <p className="text-2xl font-bold mt-2">
                  {stats.practiceProfessional.approvedHours}
                </p>
              </div>

              <div className="flex flex-col p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950">
                    <Target className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Horas Faltantes</p>
                    <p className="text-xs text-muted-foreground">
                      De {stats.practiceProfessional.requiredHours} requeridas
                    </p>
                  </div>
                </div>
                <p className="text-2xl font-bold mt-2">
                  {stats.practiceProfessional.remainingHours}
                </p>
              </div>
            </div>

            {stats.practiceProfessional.requiredHours > 0 && (
              <div className="mt-6 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Progreso de la práctica</span>
                  <span className="text-muted-foreground">
                    {Math.round(
                      (stats.practiceProfessional.approvedHours /
                        stats.practiceProfessional.requiredHours) *
                        100,
                    )}
                    %
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                  <div
                    className="h-3 rounded-full transition-all bg-green-500 dark:bg-green-600"
                    style={{
                      width: `${Math.min(
                        100,
                        (stats.practiceProfessional.approvedHours /
                          stats.practiceProfessional.requiredHours) *
                          100,
                      )}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {stats.practiceProfessional.approvedHours} de{' '}
                  {stats.practiceProfessional.requiredHours} horas requeridas
                  completadas
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function AdminDashboard({
  stats,
  user,
}: {
  stats: AdminDashboardStats;
  user: { name: string; role: string } | null;
}) {
  const metrics = [
    {
      title: 'Total de Estudiantes',
      value: stats?.users?.students ?? 0,
      description: `${stats?.users?.total ?? 0} usuarios en total`,
      icon: GraduationCap,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      title: 'Total de Solicitudes',
      value: stats?.requests?.total ?? 0,
      description: `${stats?.requests?.pending ?? 0} pendientes`,
      icon: FileText,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950',
    },
    {
      title: 'Total de Empresas',
      value: stats?.companies?.total ?? 0,
      description: `${stats?.companies?.active ?? 0} activas`,
      icon: Building2,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950',
    },
    {
      title: 'Carreras',
      value: stats?.careers?.total ?? 0,
      description: `${stats?.careers?.active ?? 0} activas`,
      icon: BookOpen,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
    },
  ];

  const requestStatusStats = [
    {
      label: 'Pendientes',
      value: stats?.requests?.pending ?? 0,
      icon: Clock,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950',
      badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
    },
    {
      label: 'En Proceso',
      value: stats?.requests?.inProgress ?? 0,
      icon: PlayCircle,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
    },
    {
      label: 'Aprobadas',
      value: stats?.requests?.approved ?? 0,
      icon: CheckCircle2,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950',
      badgeClass: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
    },
    {
      label: 'Rechazadas',
      value: stats?.requests?.rejected ?? 0,
      icon: XCircle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-950',
      badgeClass: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
    },
  ];

  return (
    <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Panel de Control
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Bienvenido, {user?.name} - {user?.role ? getRoleLabel(user.role as UserRole) : ''}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                  <Icon className={`h-5 w-5 ${metric.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {metric.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Estado de Solicitudes
            </CardTitle>
            <CardDescription>
              Distribución de solicitudes según su estado actual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {requestStatusStats.map((stat) => {
                const Icon = stat.icon;
                const total = stats?.requests?.total ?? 1;
                const percentage =
                  total > 0 ? Math.round((stat.value / total) * 100) : 0;

                return (
                  <div key={stat.label} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${stat.color}`} />
                        <span className="text-sm font-medium">{stat.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{stat.value}</span>
                        <Badge variant="outline" className={`text-xs ${stat.badgeClass}`}>
                          {percentage}%
                        </Badge>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${stat.bgColor}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Resumen del Sistema
            </CardTitle>
            <CardDescription>
              Información general sobre usuarios y contenido
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950">
                    <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Usuarios Totales</p>
                    <p className="text-xs text-muted-foreground">
                      {stats?.users?.admins ?? 0} administradores
                    </p>
                  </div>
                </div>
                <span className="text-lg font-bold">
                  {stats?.users?.total ?? 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950">
                    <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Solicitudes Totales</p>
                    <p className="text-xs text-muted-foreground">
                      {stats?.requests?.pending ?? 0} pendientes
                    </p>
                  </div>
                </div>
                <span className="text-lg font-bold">
                  {stats?.requests?.total ?? 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950">
                    <UserCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Empresas Activas</p>
                    <p className="text-xs text-muted-foreground">
                      {stats?.companies?.inactive ?? 0} inactivas
                    </p>
                  </div>
                </div>
                <span className="text-lg font-bold">
                  {stats?.companies?.active ?? 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950">
                    <BookOpen className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Carreras Activas</p>
                    <p className="text-xs text-muted-foreground">
                      {stats?.careers?.inactive ?? 0} inactivas
                    </p>
                  </div>
                </div>
                <span className="text-lg font-bold">
                  {stats?.careers?.active ?? 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950">
                    <FolderTree className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Categorías Activas</p>
                    <p className="text-xs text-muted-foreground">
                      {stats?.careerCategories?.inactive ?? 0} inactivas
                    </p>
                  </div>
                </div>
                <span className="text-lg font-bold">
                  {stats?.careerCategories?.active ?? 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
