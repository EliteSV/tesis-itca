import { useReports } from '@/hooks/useDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Loader2, TrendingUp, Users, Briefcase, FileText, Award } from 'lucide-react';

const COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#84cc16',
];

export function ReportsPage() {
  const { data: reports, isLoading, error } = useReports();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-red-600 dark:text-red-400">
          Error al cargar los reportes
        </p>
      </div>
    );
  }

  if (!reports) {
    return null;
  }

  const statusLabels: Record<string, string> = {
    pendiente: 'Pendiente',
    aceptada: 'Aceptada',
    rechazada: 'Rechazada',
    activa: 'Activa',
    cerrada: 'Cerrada',
    borrador: 'Borrador',
    approved: 'Aprobada',
    pending: 'Pendiente',
    rejected: 'Rechazada',
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
          Reportes del Sistema
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2">
          Análisis y estadísticas del sistema de prácticas profesionales
        </p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Aplicaciones</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.applicationRates.total}</div>
            <p className="text-xs text-muted-foreground">
              {reports.applicationRates.acceptanceRate.toFixed(1)}% tasa de aceptación
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Oportunidades Activas</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.opportunitiesByStatus.find((s) => s.status === 'activa')?.count || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {reports.opportunitiesByStatus.reduce((acc, s) => acc + s.count, 0)} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Match Score Promedio</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.matchScoreStats?.average.toFixed(1) || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {reports.matchScoreStats?.count || 0} aplicaciones evaluadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empresas Activas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.topCompanies.length}</div>
            <p className="text-xs text-muted-foreground">Top empresas</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de aplicaciones por mes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Tendencias de Aplicaciones (Últimos 6 Meses)
          </CardTitle>
          <CardDescription>
            Evolución del número de aplicaciones recibidas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={reports.applicationsByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Aplicaciones"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución de aplicaciones por estado */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Aplicaciones por Estado</CardTitle>
            <CardDescription>Estado actual de todas las aplicaciones</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reports.applicationsByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${statusLabels[name] || name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {reports.applicationsByStatus.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Oportunidades por estado */}
        <Card>
          <CardHeader>
            <CardTitle>Oportunidades por Estado</CardTitle>
            <CardDescription>Distribución de oportunidades en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reports.opportunitiesByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${statusLabels[name] || name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {reports.opportunitiesByStatus.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top 10 Oportunidades más populares */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Oportunidades más Populares</CardTitle>
          <CardDescription>
            Oportunidades con mayor número de aplicaciones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={reports.topOpportunities}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis
                dataKey="title"
                type="category"
                width={200}
                tick={{ fontSize: 12 }}
              />
              <Tooltip />
              <Legend />
              <Bar dataKey="applicationsCount" fill="#3b82f6" name="Aplicaciones" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 10 Empresas más activas */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Empresas más Activas</CardTitle>
            <CardDescription>Empresas con más oportunidades y aplicaciones</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={reports.topCompanies}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 10 }}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="opportunitiesCount" fill="#10b981" name="Oportunidades" />
                <Bar dataKey="applicationsCount" fill="#3b82f6" name="Aplicaciones" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Carreras más demandadas */}
        <Card>
          <CardHeader>
            <CardTitle>Carreras más Demandadas</CardTitle>
            <CardDescription>
              Carreras con mayor número de aplicaciones y oportunidades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={reports.careersByApplications}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 10 }}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="opportunitiesCount" fill="#f59e0b" name="Oportunidades" />
                <Bar dataKey="applicationsCount" fill="#8b5cf6" name="Aplicaciones" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Distribución de estudiantes por carrera */}
      <Card>
        <CardHeader>
          <CardTitle>Distribución de Estudiantes por Carrera</CardTitle>
          <CardDescription>Número de estudiantes activos por carrera</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={reports.studentsByCareer}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 10 }}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#ec4899" name="Estudiantes" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Actividades de práctica profesional */}
      {reports.activitiesByStatus.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Actividades de Práctica Profesional</CardTitle>
            <CardDescription>
              Estado de las actividades registradas en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {reports.activitiesByStatus.map((activity) => (
                <div
                  key={activity.status}
                  className="p-4 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {statusLabels[activity.status] || activity.status}
                  </p>
                  <p className="text-2xl font-bold mt-2">{activity.count}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                    {activity.totalHours} horas totales
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tasas de aplicación */}
      <Card>
        <CardHeader>
          <CardTitle>Métricas de Aplicaciones</CardTitle>
          <CardDescription>Estadísticas detalladas de las aplicaciones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950">
              <p className="text-sm text-slate-600 dark:text-slate-400">Total</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {reports.applicationRates.total}
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950">
              <p className="text-sm text-slate-600 dark:text-slate-400">Aceptadas</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {reports.applicationRates.accepted}
              </p>
              <p className="text-xs text-slate-500">
                {reports.applicationRates.acceptanceRate.toFixed(1)}%
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-950">
              <p className="text-sm text-slate-600 dark:text-slate-400">Rechazadas</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {reports.applicationRates.rejected}
              </p>
              <p className="text-xs text-slate-500">
                {reports.applicationRates.rejectionRate.toFixed(1)}%
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950">
              <p className="text-sm text-slate-600 dark:text-slate-400">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {reports.applicationRates.pending}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
