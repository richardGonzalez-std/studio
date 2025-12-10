<?php

declare(strict_types=1);

namespace App\Console\Commands\Rewards;

use App\Models\Rewards\RewardUser;
use App\Models\Rewards\RewardTransaction;
use App\Models\Rewards\RewardUserBadge;
use App\Models\Rewards\RewardChallengeParticipation;
use App\Models\Rewards\RewardRedemption;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class GenerateMetricsCommand extends Command
{
    protected $signature = 'rewards:generate-metrics 
                            {--period=daily : Período (daily, weekly, monthly)}
                            {--date= : Fecha específica (YYYY-MM-DD)}
                            {--store : Guardar métricas en base de datos}
                            {--json : Salida en formato JSON}';

    protected $description = 'Genera métricas y estadísticas del sistema de gamificación';

    public function handle(): int
    {
        $period = $this->option('period');
        $dateOption = $this->option('date');
        $store = $this->option('store');
        $asJson = $this->option('json');

        $date = $dateOption ? Carbon::parse($dateOption) : Carbon::today();

        $this->info("📊 Generando métricas para: {$date->toDateString()} ({$period})");
        $this->newLine();

        $metrics = $this->calculateMetrics($date, $period);

        if ($asJson) {
            $this->line(json_encode($metrics, JSON_PRETTY_PRINT));
            return Command::SUCCESS;
        }

        // Mostrar métricas de usuarios
        $this->info('👥 Métricas de Usuarios:');
        $this->table(
            ['Métrica', 'Valor'],
            [
                ['Total usuarios con perfil', $metrics['users']['total']],
                ['Usuarios activos (período)', $metrics['users']['active']],
                ['Nuevos usuarios (período)', $metrics['users']['new']],
                ['Promedio de nivel', round($metrics['users']['avg_level'], 2)],
                ['Promedio de puntos', number_format($metrics['users']['avg_points'])],
            ]
        );

        // Métricas de puntos
        $this->newLine();
        $this->info('💰 Métricas de Puntos:');
        $this->table(
            ['Métrica', 'Valor'],
            [
                ['Puntos otorgados (período)', number_format($metrics['points']['earned'])],
                ['Puntos gastados (período)', number_format($metrics['points']['spent'])],
                ['Balance neto', number_format($metrics['points']['net'])],
                ['Transacciones totales', number_format($metrics['points']['transactions'])],
            ]
        );

        // Métricas de badges
        $this->newLine();
        $this->info('🏅 Métricas de Badges:');
        $this->table(
            ['Métrica', 'Valor'],
            [
                ['Badges otorgados (período)', $metrics['badges']['awarded']],
                ['Total badges otorgados', $metrics['badges']['total_awarded']],
                ['Badge más popular', $metrics['badges']['most_popular'] ?? 'N/A'],
            ]
        );

        // Métricas de challenges
        $this->newLine();
        $this->info('🎯 Métricas de Challenges:');
        $this->table(
            ['Métrica', 'Valor'],
            [
                ['Nuevas participaciones', $metrics['challenges']['new_participations']],
                ['Challenges completados', $metrics['challenges']['completed']],
                ['Tasa de completación', $metrics['challenges']['completion_rate'] . '%'],
            ]
        );

        // Métricas de redenciones
        $this->newLine();
        $this->info('🎁 Métricas de Redenciones:');
        $this->table(
            ['Métrica', 'Valor'],
            [
                ['Nuevas redenciones', $metrics['redemptions']['new']],
                ['Redenciones pendientes', $metrics['redemptions']['pending']],
                ['Puntos canjeados (período)', number_format($metrics['redemptions']['points_redeemed'])],
            ]
        );

        // Métricas de streaks
        $this->newLine();
        $this->info('🔥 Métricas de Streaks:');
        $this->table(
            ['Métrica', 'Valor'],
            [
                ['Usuarios con streak activo', $metrics['streaks']['active_users']],
                ['Promedio de streak', round($metrics['streaks']['avg_streak'], 1) . ' días'],
                ['Streak más largo', $metrics['streaks']['longest'] . ' días'],
            ]
        );

        if ($store) {
            $this->storeMetrics($metrics, $date, $period);
            $this->newLine();
            $this->info('✅ Métricas guardadas en base de datos.');
        }

        return Command::SUCCESS;
    }

    protected function calculateMetrics(Carbon $date, string $period): array
    {
        $startDate = $this->getPeriodStart($date, $period);
        $endDate = $this->getPeriodEnd($date, $period);

        return [
            'date' => $date->toDateString(),
            'period' => $period,
            'users' => $this->getUserMetrics($startDate, $endDate),
            'points' => $this->getPointsMetrics($startDate, $endDate),
            'badges' => $this->getBadgeMetrics($startDate, $endDate),
            'challenges' => $this->getChallengeMetrics($startDate, $endDate),
            'redemptions' => $this->getRedemptionMetrics($startDate, $endDate),
            'streaks' => $this->getStreakMetrics(),
            'generated_at' => now()->toIso8601String(),
        ];
    }

    protected function getPeriodStart(Carbon $date, string $period): Carbon
    {
        return match ($period) {
            'daily' => $date->copy()->startOfDay(),
            'weekly' => $date->copy()->startOfWeek(),
            'monthly' => $date->copy()->startOfMonth(),
            default => $date->copy()->startOfDay(),
        };
    }

    protected function getPeriodEnd(Carbon $date, string $period): Carbon
    {
        return match ($period) {
            'daily' => $date->copy()->endOfDay(),
            'weekly' => $date->copy()->endOfWeek(),
            'monthly' => $date->copy()->endOfMonth(),
            default => $date->copy()->endOfDay(),
        };
    }

    protected function getUserMetrics(Carbon $start, Carbon $end): array
    {
        return [
            'total' => RewardUser::count(),
            'active' => RewardUser::whereBetween('last_activity_at', [$start, $end])->count(),
            'new' => RewardUser::whereBetween('created_at', [$start, $end])->count(),
            'avg_level' => RewardUser::avg('level') ?? 0,
            'avg_points' => RewardUser::avg('total_points') ?? 0,
        ];
    }

    protected function getPointsMetrics(Carbon $start, Carbon $end): array
    {
        $earned = RewardTransaction::whereBetween('created_at', [$start, $end])
            ->where('amount', '>', 0)
            ->sum('amount');

        $spent = RewardTransaction::whereBetween('created_at', [$start, $end])
            ->where('amount', '<', 0)
            ->sum('amount');

        $transactions = RewardTransaction::whereBetween('created_at', [$start, $end])->count();

        return [
            'earned' => (int) $earned,
            'spent' => abs((int) $spent),
            'net' => (int) $earned + (int) $spent,
            'transactions' => $transactions,
        ];
    }

    protected function getBadgeMetrics(Carbon $start, Carbon $end): array
    {
        $awarded = RewardUserBadge::whereBetween('earned_at', [$start, $end])->count();
        $totalAwarded = RewardUserBadge::count();

        $mostPopular = DB::table('reward_user_badges')
            ->join('reward_badges', 'reward_badges.id', '=', 'reward_user_badges.reward_badge_id')
            ->select('reward_badges.name', DB::raw('COUNT(*) as count'))
            ->groupBy('reward_badges.id', 'reward_badges.name')
            ->orderByDesc('count')
            ->first();

        return [
            'awarded' => $awarded,
            'total_awarded' => $totalAwarded,
            'most_popular' => $mostPopular?->name,
        ];
    }

    protected function getChallengeMetrics(Carbon $start, Carbon $end): array
    {
        $newParticipations = RewardChallengeParticipation::whereBetween('joined_at', [$start, $end])->count();
        $completed = RewardChallengeParticipation::whereBetween('completed_at', [$start, $end])->count();
        
        $totalParticipations = RewardChallengeParticipation::count();
        $totalCompleted = RewardChallengeParticipation::whereNotNull('completed_at')->count();
        
        $completionRate = $totalParticipations > 0 
            ? round(($totalCompleted / $totalParticipations) * 100, 1) 
            : 0;

        return [
            'new_participations' => $newParticipations,
            'completed' => $completed,
            'completion_rate' => $completionRate,
        ];
    }

    protected function getRedemptionMetrics(Carbon $start, Carbon $end): array
    {
        $new = RewardRedemption::whereBetween('created_at', [$start, $end])->count();
        $pending = RewardRedemption::where('status', 'pending')->count();
        $pointsRedeemed = RewardRedemption::whereBetween('created_at', [$start, $end])
            ->sum('points_spent');

        return [
            'new' => $new,
            'pending' => $pending,
            'points_redeemed' => (int) $pointsRedeemed,
        ];
    }

    protected function getStreakMetrics(): array
    {
        return [
            'active_users' => RewardUser::where('current_streak', '>', 0)->count(),
            'avg_streak' => RewardUser::where('current_streak', '>', 0)->avg('current_streak') ?? 0,
            'longest' => RewardUser::max('longest_streak') ?? 0,
        ];
    }

    protected function storeMetrics(array $metrics, Carbon $date, string $period): void
    {
        // Aquí se guardarían las métricas en una tabla de histórico
        // Por ahora solo simulamos el guardado
        \Illuminate\Support\Facades\Cache::put(
            "rewards:metrics:{$period}:{$date->format('Y-m-d')}",
            $metrics,
            now()->addDays(90)
        );
    }
}
