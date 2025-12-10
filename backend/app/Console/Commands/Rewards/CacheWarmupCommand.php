<?php

declare(strict_types=1);

namespace App\Console\Commands\Rewards;

use App\Models\Rewards\RewardUser;
use App\Models\Rewards\RewardBadge;
use App\Models\Rewards\RewardLeaderboard;
use App\Services\Rewards\CacheService;
use App\Services\Rewards\LeaderboardService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;

class CacheWarmupCommand extends Command
{
    protected $signature = 'rewards:cache-warmup 
                            {--full : Realizar warmup completo}
                            {--leaderboards : Solo leaderboards}
                            {--badges : Solo badges}
                            {--users= : IDs de usuarios específicos (separados por coma)}';

    protected $description = 'Precarga datos en caché para mejorar rendimiento';

    public function __construct(
        protected CacheService $cacheService,
        protected LeaderboardService $leaderboardService
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $this->info('🔥 Iniciando warmup de caché...');
        $startTime = microtime(true);

        $full = $this->option('full');
        $onlyLeaderboards = $this->option('leaderboards');
        $onlyBadges = $this->option('badges');
        $specificUsers = $this->option('users');

        $stats = [
            'leaderboards' => 0,
            'badges' => 0,
            'users' => 0,
        ];

        // Warmup de leaderboards
        if ($full || $onlyLeaderboards || (!$onlyBadges && !$specificUsers)) {
            $stats['leaderboards'] = $this->warmupLeaderboards();
        }

        // Warmup de badges
        if ($full || $onlyBadges) {
            $stats['badges'] = $this->warmupBadges();
        }

        // Warmup de usuarios
        if ($full || $specificUsers) {
            $userIds = $specificUsers 
                ? explode(',', $specificUsers) 
                : null;
            $stats['users'] = $this->warmupUsers($userIds);
        }

        $elapsed = round(microtime(true) - $startTime, 2);

        $this->newLine();
        $this->info("✅ Warmup completado en {$elapsed}s");
        $this->table(
            ['Tipo', 'Items cacheados'],
            [
                ['Leaderboards', $stats['leaderboards']],
                ['Badges', $stats['badges']],
                ['Usuarios', $stats['users']],
            ]
        );

        return Command::SUCCESS;
    }

    protected function warmupLeaderboards(): int
    {
        $this->info('📊 Cargando leaderboards...');
        
        $metrics = ['points', 'experience', 'streak', 'level'];
        $periods = ['daily', 'weekly', 'monthly', 'all_time'];
        $count = 0;

        $bar = $this->output->createProgressBar(count($metrics) * count($periods));
        $bar->start();

        foreach ($metrics as $metric) {
            foreach ($periods as $period) {
                try {
                    $this->leaderboardService->getRanking($metric, $period, 100);
                    $count++;
                } catch (\Exception $e) {
                    $this->warn("\n⚠️  Error en {$metric}/{$period}: {$e->getMessage()}");
                }
                $bar->advance();
            }
        }

        $bar->finish();
        $this->newLine();

        return $count;
    }

    protected function warmupBadges(): int
    {
        $this->info('🏆 Cargando badges...');
        
        $badges = RewardBadge::where('is_active', true)->get();
        
        // Cachear lista de badges por categoría
        $badgesByCategory = $badges->groupBy('category_id');
        
        foreach ($badgesByCategory as $categoryId => $categoryBadges) {
            $key = "rewards:badges:category:{$categoryId}";
            Cache::put($key, $categoryBadges->toArray(), 3600);
        }

        // Cachear lista completa
        Cache::put('rewards:badges:all', $badges->toArray(), 3600);
        
        // Cachear badges por criterio
        $badgesByCriteria = $badges->groupBy('criteria_type');
        foreach ($badgesByCriteria as $criteriaType => $criteriaBadges) {
            $key = "rewards:badges:criteria:{$criteriaType}";
            Cache::put($key, $criteriaBadges->pluck('id')->toArray(), 3600);
        }

        $this->line("   → {$badges->count()} badges cacheados");

        return $badges->count();
    }

    protected function warmupUsers(?array $userIds = null): int
    {
        $this->info('👥 Cargando datos de usuarios...');
        
        $query = RewardUser::with(['user:id,name,email']);
        
        if ($userIds) {
            $query->whereIn('user_id', $userIds);
        } else {
            // Solo los más activos si es warmup completo
            $query->where('last_activity_at', '>=', now()->subDays(30))
                  ->orderByDesc('total_points')
                  ->limit(1000);
        }

        $users = $query->get();
        $count = 0;

        $bar = $this->output->createProgressBar($users->count());
        $bar->start();

        foreach ($users as $rewardUser) {
            try {
                $userData = [
                    'id' => $rewardUser->id,
                    'user_id' => $rewardUser->user_id,
                    'level' => $rewardUser->level,
                    'experience_points' => $rewardUser->experience_points,
                    'total_points' => $rewardUser->total_points,
                    'lifetime_points' => $rewardUser->lifetime_points,
                    'current_streak' => $rewardUser->current_streak,
                    'longest_streak' => $rewardUser->longest_streak,
                ];

                $this->cacheService->setUser($rewardUser->id, $userData);
                $count++;
            } catch (\Exception $e) {
                // Silently continue
            }
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();

        return $count;
    }
}
