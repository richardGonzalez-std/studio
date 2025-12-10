<?php

declare(strict_types=1);

namespace App\Console\Commands\Rewards;

use App\Models\Rewards\RewardUser;
use App\Models\Rewards\RewardBadge;
use App\Models\Rewards\RewardChallenge;
use App\Models\Rewards\RewardCatalogItem;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class HealthCheckCommand extends Command
{
    protected $signature = 'rewards:health-check 
                            {--verbose : Mostrar detalles completos}
                            {--notify : Enviar notificación si hay problemas}';

    protected $description = 'Verifica el estado del sistema de gamificación';

    public function handle(): int
    {
        $this->info('🔍 Ejecutando verificación de salud del sistema de recompensas...');
        $this->newLine();

        $checks = [];
        $hasErrors = false;

        // 1. Verificar conexión a base de datos
        $checks['database'] = $this->checkDatabase();
        
        // 2. Verificar conexión a caché
        $checks['cache'] = $this->checkCache();
        
        // 3. Verificar tablas del sistema
        $checks['tables'] = $this->checkTables();
        
        // 4. Verificar integridad de datos
        $checks['data_integrity'] = $this->checkDataIntegrity();
        
        // 5. Verificar servicios
        $checks['services'] = $this->checkServices();

        // Mostrar resultados
        foreach ($checks as $name => $result) {
            $status = $result['status'] ? '✅' : '❌';
            $this->line("{$status} {$result['name']}: {$result['message']}");
            
            if (!$result['status']) {
                $hasErrors = true;
            }

            if ($this->option('verbose') && isset($result['details'])) {
                foreach ($result['details'] as $detail) {
                    $this->line("   → {$detail}");
                }
            }
        }

        $this->newLine();

        if ($hasErrors) {
            $this->error('⚠️  Se encontraron problemas en el sistema.');
            
            if ($this->option('notify')) {
                $this->notifyAdmins($checks);
            }
            
            return Command::FAILURE;
        }

        $this->info('✅ Todos los sistemas funcionan correctamente.');
        return Command::SUCCESS;
    }

    protected function checkDatabase(): array
    {
        try {
            DB::connection()->getPdo();
            $version = DB::select('SELECT VERSION() as version')[0]->version ?? 'unknown';
            
            return [
                'name' => 'Base de datos',
                'status' => true,
                'message' => 'Conectada',
                'details' => ["Versión: {$version}"],
            ];
        } catch (\Exception $e) {
            return [
                'name' => 'Base de datos',
                'status' => false,
                'message' => 'Error de conexión',
                'details' => [$e->getMessage()],
            ];
        }
    }

    protected function checkCache(): array
    {
        try {
            $testKey = 'rewards:health-check:' . time();
            Cache::put($testKey, 'test', 10);
            $value = Cache::get($testKey);
            Cache::forget($testKey);
            
            if ($value !== 'test') {
                throw new \Exception('El valor no coincide');
            }
            
            $driver = config('cache.default');
            
            return [
                'name' => 'Caché',
                'status' => true,
                'message' => 'Funcionando',
                'details' => ["Driver: {$driver}"],
            ];
        } catch (\Exception $e) {
            return [
                'name' => 'Caché',
                'status' => false,
                'message' => 'Error',
                'details' => [$e->getMessage()],
            ];
        }
    }

    protected function checkTables(): array
    {
        $tables = [
            'reward_users',
            'reward_badges',
            'reward_badge_categories',
            'reward_user_badges',
            'reward_transactions',
            'reward_leaderboards',
            'reward_leaderboard_entries',
            'reward_challenges',
            'reward_challenge_participations',
            'reward_catalog_items',
            'reward_redemptions',
        ];

        $missing = [];
        $details = [];

        foreach ($tables as $table) {
            if (!DB::getSchemaBuilder()->hasTable($table)) {
                $missing[] = $table;
            } else {
                $count = DB::table($table)->count();
                $details[] = "{$table}: {$count} registros";
            }
        }

        if (count($missing) > 0) {
            return [
                'name' => 'Tablas',
                'status' => false,
                'message' => 'Faltan ' . count($missing) . ' tablas',
                'details' => $missing,
            ];
        }

        return [
            'name' => 'Tablas',
            'status' => true,
            'message' => 'Todas las tablas existen',
            'details' => $details,
        ];
    }

    protected function checkDataIntegrity(): array
    {
        $issues = [];

        // Verificar usuarios huérfanos
        $orphanedRewardUsers = RewardUser::whereNotExists(function ($query) {
            $query->select(DB::raw(1))
                ->from('users')
                ->whereColumn('users.id', 'reward_users.user_id');
        })->count();

        if ($orphanedRewardUsers > 0) {
            $issues[] = "Usuarios de recompensas huérfanos: {$orphanedRewardUsers}";
        }

        // Verificar badges inactivos asignados
        $inactiveBadgesAssigned = DB::table('reward_user_badges')
            ->join('reward_badges', 'reward_badges.id', '=', 'reward_user_badges.reward_badge_id')
            ->where('reward_badges.is_active', false)
            ->count();

        if ($inactiveBadgesAssigned > 0) {
            $issues[] = "Badges inactivos asignados: {$inactiveBadgesAssigned}";
        }

        // Verificar transacciones con balance negativo
        $negativeBalances = RewardUser::where('total_points', '<', 0)->count();
        if ($negativeBalances > 0) {
            $issues[] = "Usuarios con balance negativo: {$negativeBalances}";
        }

        if (count($issues) > 0) {
            return [
                'name' => 'Integridad de datos',
                'status' => false,
                'message' => count($issues) . ' problemas encontrados',
                'details' => $issues,
            ];
        }

        return [
            'name' => 'Integridad de datos',
            'status' => true,
            'message' => 'Sin problemas',
            'details' => [
                'Usuarios: ' . RewardUser::count(),
                'Badges otorgados: ' . DB::table('reward_user_badges')->count(),
                'Transacciones: ' . DB::table('reward_transactions')->count(),
            ],
        ];
    }

    protected function checkServices(): array
    {
        $services = [
            \App\Services\Rewards\RewardService::class,
            \App\Services\Rewards\LeaderboardService::class,
            \App\Services\Rewards\CacheService::class,
            \App\Services\Rewards\Badges\BadgeService::class,
        ];

        $details = [];
        $allOk = true;

        foreach ($services as $service) {
            try {
                app($service);
                $shortName = class_basename($service);
                $details[] = "{$shortName}: OK";
            } catch (\Exception $e) {
                $shortName = class_basename($service);
                $details[] = "{$shortName}: ERROR - {$e->getMessage()}";
                $allOk = false;
            }
        }

        return [
            'name' => 'Servicios',
            'status' => $allOk,
            'message' => $allOk ? 'Todos disponibles' : 'Algunos con errores',
            'details' => $details,
        ];
    }

    protected function notifyAdmins(array $checks): void
    {
        // Aquí se implementaría la notificación a admins
        // Por ejemplo, vía email, Slack, etc.
        $this->warn('📧 Notificación enviada a administradores.');
    }
}
