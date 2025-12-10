<?php

declare(strict_types=1);

namespace App\Console\Commands\Rewards;

use App\Models\Rewards\RewardLeaderboard;
use App\Services\Rewards\LeaderboardService;
use Illuminate\Console\Command;

class UpdateLeaderboardsCommand extends Command
{
    protected $signature = 'rewards:update-leaderboards 
                            {--metric= : Métrica específica (points, experience, streak, level)}
                            {--period= : Período específico (daily, weekly, monthly, all_time)}
                            {--snapshots : Generar snapshots para histórico}';

    protected $description = 'Actualiza los rankings de los leaderboards';

    public function __construct(
        protected LeaderboardService $leaderboardService
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $this->info('🏆 Actualizando leaderboards...');
        $startTime = microtime(true);

        $specificMetric = $this->option('metric');
        $specificPeriod = $this->option('period');
        $generateSnapshots = $this->option('snapshots');

        $metrics = $specificMetric 
            ? [$specificMetric] 
            : ['points', 'experience', 'streak', 'level'];
            
        $periods = $specificPeriod 
            ? [$specificPeriod] 
            : ['daily', 'weekly', 'monthly', 'all_time'];

        $stats = [
            'updated' => 0,
            'errors' => 0,
        ];

        $total = count($metrics) * count($periods);
        $bar = $this->output->createProgressBar($total);
        $bar->start();

        foreach ($metrics as $metric) {
            foreach ($periods as $period) {
                try {
                    // Forzar recálculo del ranking (invalida caché)
                    $cacheKey = "rewards:leaderboard:{$metric}:{$period}:50";
                    \Illuminate\Support\Facades\Cache::forget($cacheKey);
                    
                    // Obtener nuevo ranking
                    $ranking = $this->leaderboardService->getRanking($metric, $period, 100);
                    
                    $stats['updated']++;
                    
                    if ($this->output->isVerbose()) {
                        $this->newLine();
                        $this->line("   ✓ {$metric}/{$period}: " . count($ranking['entries']) . " entradas");
                    }
                } catch (\Exception $e) {
                    $stats['errors']++;
                    $this->newLine();
                    $this->error("   ✗ Error en {$metric}/{$period}: {$e->getMessage()}");
                }

                $bar->advance();
            }
        }

        $bar->finish();
        $this->newLine(2);

        // Generar snapshots si se solicita
        if ($generateSnapshots) {
            $this->info('📸 Generando snapshots...');
            try {
                $this->leaderboardService->updateLeaderboardSnapshots();
                $this->info('   ✓ Snapshots generados correctamente');
            } catch (\Exception $e) {
                $this->error("   ✗ Error generando snapshots: {$e->getMessage()}");
                $stats['errors']++;
            }
        }

        $elapsed = round(microtime(true) - $startTime, 2);

        // Mostrar resumen
        $this->newLine();
        $this->info("📊 Resumen:");
        $this->table(
            ['Métrica', 'Valor'],
            [
                ['Leaderboards actualizados', $stats['updated']],
                ['Errores', $stats['errors']],
                ['Tiempo', "{$elapsed}s"],
            ]
        );

        return $stats['errors'] > 0 ? Command::FAILURE : Command::SUCCESS;
    }
}
