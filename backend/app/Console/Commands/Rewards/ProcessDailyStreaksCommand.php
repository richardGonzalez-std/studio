<?php

declare(strict_types=1);

namespace App\Console\Commands\Rewards;

use App\Models\Rewards\RewardUser;
use App\Services\Rewards\StreakService;
use App\Services\Rewards\CacheService;
use Illuminate\Console\Command;
use Carbon\Carbon;

class ProcessDailyStreaksCommand extends Command
{
    protected $signature = 'rewards:process-streaks 
                            {--dry-run : Simular sin hacer cambios}
                            {--reset-inactive : Resetear rachas de usuarios inactivos}';

    protected $description = 'Procesa las rachas diarias de los usuarios';

    public function __construct(
        protected StreakService $streakService,
        protected CacheService $cacheService
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $this->info('🔥 Procesando rachas diarias...');
        $startTime = microtime(true);
        $isDryRun = $this->option('dry-run');

        if ($isDryRun) {
            $this->warn('⚠️  Modo simulación activado. No se realizarán cambios.');
        }

        $stats = [
            'processed' => 0,
            'maintained' => 0,
            'broken' => 0,
            'errors' => 0,
        ];

        // Obtener usuarios que necesitan procesamiento
        $yesterday = Carbon::yesterday();
        
        // Usuarios con racha activa que no actualizaron ayer
        $usersToProcess = RewardUser::where('current_streak', '>', 0)
            ->where(function ($query) use ($yesterday) {
                $query->whereNull('streak_updated_at')
                    ->orWhere('streak_updated_at', '<', $yesterday->startOfDay());
            })
            ->get();

        $this->info("📋 Usuarios a procesar: {$usersToProcess->count()}");
        
        if ($usersToProcess->isEmpty()) {
            $this->info('✅ No hay rachas que procesar.');
            return Command::SUCCESS;
        }

        $bar = $this->output->createProgressBar($usersToProcess->count());
        $bar->start();

        foreach ($usersToProcess as $user) {
            try {
                $lastUpdate = $user->streak_updated_at 
                    ? Carbon::parse($user->streak_updated_at) 
                    : null;

                // Si la última actualización fue hace más de 1 día, la racha se rompe
                $daysSinceUpdate = $lastUpdate 
                    ? $lastUpdate->startOfDay()->diffInDays(Carbon::today()) 
                    : 999;

                if ($daysSinceUpdate > 1) {
                    // Racha rota
                    if (!$isDryRun) {
                        $user->update(['current_streak' => 0]);
                        $this->cacheService->invalidateUser($user->id);
                    }
                    $stats['broken']++;
                } else {
                    $stats['maintained']++;
                }

                $stats['processed']++;
            } catch (\Exception $e) {
                $stats['errors']++;
                $this->newLine();
                $this->error("Error procesando usuario {$user->id}: {$e->getMessage()}");
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $elapsed = round(microtime(true) - $startTime, 2);

        // Mostrar resumen
        $this->info("📊 Resumen del procesamiento:");
        $this->table(
            ['Métrica', 'Cantidad'],
            [
                ['Usuarios procesados', $stats['processed']],
                ['Rachas mantenidas', $stats['maintained']],
                ['Rachas rotas', $stats['broken']],
                ['Errores', $stats['errors']],
                ['Tiempo', "{$elapsed}s"],
            ]
        );

        if ($isDryRun) {
            $this->warn('⚠️  Los cambios NO fueron aplicados (modo simulación).');
        }

        return $stats['errors'] > 0 ? Command::FAILURE : Command::SUCCESS;
    }
}
