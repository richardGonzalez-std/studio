<?php

declare(strict_types=1);

namespace App\Console\Commands\Rewards;

use App\Models\Rewards\RewardUser;
use App\Models\Rewards\RewardBadge;
use App\Services\Rewards\Badges\BadgeService;
use App\Services\Rewards\CacheService;
use Illuminate\Console\Command;

class EvaluateBadgesCommand extends Command
{
    protected $signature = 'rewards:evaluate-badges 
                            {--user= : ID de usuario específico}
                            {--badge= : Slug de badge específico}
                            {--event=daily_sync : Evento a simular}
                            {--dry-run : Simular sin otorgar badges}';

    protected $description = 'Evalúa y otorga badges a los usuarios';

    public function __construct(
        protected BadgeService $badgeService,
        protected CacheService $cacheService
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $this->info('🏅 Evaluando badges...');
        $startTime = microtime(true);
        
        $specificUserId = $this->option('user');
        $specificBadgeSlug = $this->option('badge');
        $event = $this->option('event');
        $isDryRun = $this->option('dry-run');

        if ($isDryRun) {
            $this->warn('⚠️  Modo simulación activado. No se otorgarán badges.');
        }

        $stats = [
            'users_evaluated' => 0,
            'badges_awarded' => 0,
            'errors' => 0,
        ];

        // Obtener usuarios a evaluar
        $usersQuery = RewardUser::query();
        
        if ($specificUserId) {
            $usersQuery->where('user_id', $specificUserId);
        } else {
            // Solo usuarios activos en los últimos 30 días
            $usersQuery->where('last_activity_at', '>=', now()->subDays(30));
        }

        $users = $usersQuery->get();

        if ($users->isEmpty()) {
            $this->warn('No se encontraron usuarios para evaluar.');
            return Command::SUCCESS;
        }

        $this->info("📋 Usuarios a evaluar: {$users->count()}");

        // Obtener badges a evaluar
        $badgesQuery = RewardBadge::where('is_active', true);
        
        if ($specificBadgeSlug) {
            $badgesQuery->where('slug', $specificBadgeSlug);
        }

        $badges = $badgesQuery->get();
        $this->info("🏆 Badges a evaluar: {$badges->count()}");
        $this->newLine();

        $bar = $this->output->createProgressBar($users->count());
        $bar->start();

        $awardedDetails = [];

        foreach ($users as $user) {
            try {
                $awarded = [];

                if (!$isDryRun) {
                    $awarded = $this->badgeService->checkAndAwardBadges($user, $event, [
                        'source' => 'scheduled_evaluation',
                        'timestamp' => now()->toIso8601String(),
                    ]);
                } else {
                    // En dry-run, solo evaluar sin otorgar
                    foreach ($badges as $badge) {
                        if (!$this->badgeService->userHasBadge($user, $badge)) {
                            if ($this->badgeService->evaluateBadge($user, $badge, [])) {
                                $awarded[] = $badge;
                            }
                        }
                    }
                }

                if (count($awarded) > 0) {
                    $stats['badges_awarded'] += count($awarded);
                    
                    foreach ($awarded as $badge) {
                        $badgeName = is_object($badge) ? $badge->name : ($badge->badge->name ?? 'Badge');
                        $awardedDetails[] = [
                            'user_id' => $user->user_id,
                            'badge' => $badgeName,
                        ];
                    }

                    // Invalidar caché del usuario
                    if (!$isDryRun) {
                        $this->cacheService->invalidateUser($user->id);
                    }
                }

                $stats['users_evaluated']++;
            } catch (\Exception $e) {
                $stats['errors']++;
                if ($this->output->isVerbose()) {
                    $this->newLine();
                    $this->error("Error evaluando usuario {$user->user_id}: {$e->getMessage()}");
                }
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $elapsed = round(microtime(true) - $startTime, 2);

        // Mostrar badges otorgados
        if (count($awardedDetails) > 0) {
            $this->info('🎉 Badges ' . ($isDryRun ? 'que se otorgarían' : 'otorgados') . ':');
            $this->table(
                ['Usuario ID', 'Badge'],
                $awardedDetails
            );
            $this->newLine();
        }

        // Mostrar resumen
        $this->info("📊 Resumen:");
        $this->table(
            ['Métrica', 'Valor'],
            [
                ['Usuarios evaluados', $stats['users_evaluated']],
                ['Badges ' . ($isDryRun ? 'elegibles' : 'otorgados'), $stats['badges_awarded']],
                ['Errores', $stats['errors']],
                ['Tiempo', "{$elapsed}s"],
            ]
        );

        if ($isDryRun) {
            $this->warn('⚠️  Los badges NO fueron otorgados (modo simulación).');
        }

        return $stats['errors'] > 0 ? Command::FAILURE : Command::SUCCESS;
    }
}
