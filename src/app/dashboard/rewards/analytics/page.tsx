"use client";

import { useState } from "react";
import { useRewardsAnalytics, type TopAction, type BadgeDistribution, type ChallengeStats, type RedemptionByCategory, type WeeklyActivity, type AnalyticsData } from "@/hooks/use-rewards";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  Users,
  Target,
  Star,
  Medal,
  Gift,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Zap,
  Award,
  LineChart,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const rarityColors: Record<string, string> = {
  common: "bg-gray-500",
  uncommon: "bg-green-500",
  rare: "bg-blue-500",
  epic: "bg-purple-500",
  legendary: "bg-amber-500",
};

const rarityLabels: Record<string, string> = {
  common: "Común",
  uncommon: "Poco común",
  rare: "Raro",
  epic: "Épico",
  legendary: "Legendario",
};

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  description,
  isLoading,
}: {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  description?: string;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-3 w-32 mt-2" />
        </CardContent>
      </Card>
    );
  }

  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div className={cn(
            "flex items-center text-xs mt-1",
            isPositive && "text-green-500",
            isNegative && "text-red-500",
            !isPositive && !isNegative && "text-muted-foreground"
          )}>
            {isPositive ? (
              <ArrowUpRight className="h-3 w-3 mr-1" />
            ) : isNegative ? (
              <ArrowDownRight className="h-3 w-3 mr-1" />
            ) : null}
            {Math.abs(change)}% vs período anterior
          </div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

function TopActionsTable({ actions, isLoading }: { actions: TopAction[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-64 mt-1" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20 mt-1" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (actions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Acciones más realizadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>No hay datos de acciones aún</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Acciones más realizadas
        </CardTitle>
        <CardDescription>
          Acciones que más puntos han generado este período
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {actions.map((action, index) => (
            <div key={action.action} className="flex items-center gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="font-medium">{action.label}</p>
                <p className="text-sm text-muted-foreground">
                  {action.count.toLocaleString()} veces
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium text-amber-500">
                  {action.points.toLocaleString()} pts
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function BadgeDistributionChart({ distribution, isLoading }: { distribution: BadgeDistribution[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-48 mt-1" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalBadges = distribution.reduce((sum, item) => sum + item.count, 0);

  if (totalBadges === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Medal className="h-5 w-5" />
            Distribución de Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Medal className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>No hay badges otorgados aún</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Medal className="h-5 w-5" />
          Distribución de Badges
        </CardTitle>
        <CardDescription>
          {totalBadges.toLocaleString()} badges otorgados por rareza
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {distribution.map((item) => (
            <div key={item.rarity} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className={cn("h-3 w-3 rounded-full", rarityColors[item.rarity] || "bg-gray-500")} />
                  <span>{rarityLabels[item.rarity] || item.rarity}</span>
                </div>
                <span className="font-medium">{item.count.toLocaleString()}</span>
              </div>
              <Progress value={item.percentage} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ChallengeStatsCard({ stats, isLoading }: { stats: ChallengeStats | null; isLoading: boolean }) {
  if (isLoading || !stats) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Estadísticas de Challenges
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold text-blue-500">{stats.active}</p>
            <p className="text-xs text-muted-foreground">Activos</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold text-green-500">{stats.completed}</p>
            <p className="text-xs text-muted-foreground">Completados</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold text-purple-500">{stats.participation_rate}%</p>
            <p className="text-xs text-muted-foreground">Tasa de completado</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold text-amber-500">{stats.avg_completion_time}d</p>
            <p className="text-xs text-muted-foreground">Tiempo promedio</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RedemptionsByCategoryCard({ redemptions, isLoading }: { redemptions: RedemptionByCategory[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const total = redemptions.reduce((sum, cat) => sum + cat.count, 0);

  if (total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Canjes por Categoría
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Gift className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>No hay canjes registrados aún</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Canjes por Categoría
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {redemptions.map((cat) => {
            const percentage = Math.round((cat.count / total) * 100);
            return (
              <div key={cat.category} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="capitalize">{cat.category.replace(/_/g, " ")}</span>
                  <div className="text-right">
                    <span className="font-medium">{cat.count}</span>
                    <span className="text-muted-foreground ml-2">
                      ({cat.value.toLocaleString()} pts)
                    </span>
                  </div>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function WeeklyActivityChart({ activity, isLoading }: { activity: WeeklyActivity[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-64 mt-1" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  const maxPoints = Math.max(...activity.map(d => d.points), 1);
  const totalPoints = activity.reduce((sum, d) => sum + d.points, 0);

  if (totalPoints === 0) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            Actividad Semanal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <LineChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay actividad registrada esta semana</p>
            <p className="text-sm mt-1">Los datos aparecerán cuando los usuarios empiecen a ganar puntos</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LineChart className="h-5 w-5" />
          Actividad Semanal
        </CardTitle>
        <CardDescription>
          Puntos generados en los últimos 7 días ({totalPoints.toLocaleString()} total)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-2 h-48">
          {activity.map((day) => {
            const heightPercent = (day.points / maxPoints) * 100;
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col items-center gap-1">
                  <span className="text-xs text-muted-foreground">{day.points.toLocaleString()}</span>
                  <div 
                    className="w-full bg-gradient-to-t from-amber-500 to-amber-400 rounded-t transition-all duration-300"
                    style={{ height: `${Math.max(heightPercent, 5)}%`, minHeight: '8px' }}
                  />
                </div>
                <span className="text-xs font-medium">{day.day}</span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t">
          <div className="flex items-center gap-2 text-sm">
            <div className="h-3 w-3 rounded-full bg-amber-500" />
            <span className="text-muted-foreground">Puntos ganados</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function InsightsCard({ data, isLoading }: { data: AnalyticsData | null; isLoading: boolean }) {
  if (isLoading || !data) {
    return null;
  }

  const insights = [];

  // Generar insights basados en los datos reales
  if (data.trends.challenges_change > 20) {
    insights.push({
      type: "positive",
      icon: TrendingUp,
      title: "Challenges en auge",
      description: `Los challenges completados aumentaron ${data.trends.challenges_change}% este período.`,
    });
  }

  if (data.overview.active_users > 0 && data.overview.total_users > 0) {
    const engagementRate = Math.round((data.overview.active_users / data.overview.total_users) * 100);
    if (engagementRate > 50) {
      insights.push({
        type: "positive",
        icon: Users,
        title: "Alto engagement",
        description: `${engagementRate}% de los usuarios están activos en el sistema de recompensas.`,
      });
    }
  }

  if (data.badge_distribution.length > 0) {
    const legendaryBadges = data.badge_distribution.find(b => b.rarity === 'legendary');
    if (legendaryBadges && legendaryBadges.count > 0) {
      insights.push({
        type: "special",
        icon: Award,
        title: "Badges legendarios",
        description: `${legendaryBadges.count} usuarios han obtenido badges legendarios.`,
      });
    }
  }

  if (data.top_actions.length > 0) {
    const topAction = data.top_actions[0];
    insights.push({
      type: "info",
      icon: Zap,
      title: "Acción más popular",
      description: `"${topAction.label}" es la acción más realizada con ${topAction.count.toLocaleString()} veces.`,
    });
  }

  if (insights.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {insights.slice(0, 3).map((insight, index) => {
            const Icon = insight.icon;
            const colorClasses = {
              positive: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900 text-green-600 dark:text-green-400",
              special: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900 text-amber-600 dark:text-amber-400",
              info: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400",
            };
            return (
              <div key={index} className={cn("p-4 rounded-lg border", colorClasses[insight.type as keyof typeof colorClasses] || colorClasses.info)}>
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{insight.title}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {insight.description}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("month");
  const { data, isLoading, error, refetch } = useRewardsAnalytics(period);

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Analytics de Gamificación</h2>
            <p className="text-sm text-muted-foreground">
              Métricas y estadísticas del sistema de recompensas
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="p-8">
            <div className="text-center text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
              <p className="font-medium text-destructive">Error al cargar analytics</p>
              <p className="text-sm mt-1">{error.message}</p>
              <button
                onClick={() => refetch()}
                className="mt-4 text-sm text-primary hover:underline"
              >
                Intentar de nuevo
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Analytics de Gamificación</h2>
          <p className="text-sm text-muted-foreground">
            Métricas y estadísticas del sistema de recompensas
          </p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Última semana</SelectItem>
            <SelectItem value="month">Último mes</SelectItem>
            <SelectItem value="quarter">Último trimestre</SelectItem>
            <SelectItem value="year">Último año</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Usuarios Activos"
          value={data?.overview.active_users.toLocaleString() || "0"}
          change={data?.trends.users_change}
          icon={Users}
          description={`de ${data?.overview.total_users.toLocaleString() || "0"} totales`}
          isLoading={isLoading}
        />
        <StatCard
          title="Puntos Distribuidos"
          value={data ? `${(data.overview.total_points_distributed / 1000).toFixed(1)}K` : "0"}
          change={data?.trends.points_change}
          icon={Star}
          isLoading={isLoading}
        />
        <StatCard
          title="Badges Otorgados"
          value={data?.overview.total_badges_awarded.toLocaleString() || "0"}
          change={data?.trends.badges_change}
          icon={Medal}
          isLoading={isLoading}
        />
        <StatCard
          title="Challenges Completados"
          value={data?.overview.total_challenges_completed.toLocaleString() || "0"}
          change={data?.trends.challenges_change}
          icon={Target}
          isLoading={isLoading}
        />
      </div>

      {/* Weekly Activity */}
      <WeeklyActivityChart 
        activity={data?.weekly_activity || []} 
        isLoading={isLoading} 
      />

      {/* Details Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <TopActionsTable 
          actions={data?.top_actions || []} 
          isLoading={isLoading} 
        />
        <BadgeDistributionChart 
          distribution={data?.badge_distribution || []} 
          isLoading={isLoading} 
        />
        <ChallengeStatsCard 
          stats={data?.challenge_stats || null} 
          isLoading={isLoading} 
        />
        <RedemptionsByCategoryCard 
          redemptions={data?.redemptions_by_category || []} 
          isLoading={isLoading} 
        />
      </div>

      {/* Insights */}
      <InsightsCard data={data} isLoading={isLoading} />
    </div>
  );
}
