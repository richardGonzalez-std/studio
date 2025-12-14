<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add columns only if they don't already exist to avoid duplicate column errors
        if (!Schema::hasColumn('credit_payments', 'numero_cuota')) {
            Schema::table('credit_payments', function (Blueprint $table) {
                $table->integer('numero_cuota')->after('credit_id')->nullable(false);
            });
        }

        if (!Schema::hasColumn('credit_payments', 'proceso')) {
            Schema::table('credit_payments', function (Blueprint $table) {
                $table->string('proceso')->nullable()->after('numero_cuota');
            });
        }

        if (!Schema::hasColumn('credit_payments', 'fecha_cuota')) {
            Schema::table('credit_payments', function (Blueprint $table) {
                $table->date('fecha_cuota')->nullable()->after('proceso');
            });
        }

        if (!Schema::hasColumn('credit_payments', 'cuota')) {
            Schema::table('credit_payments', function (Blueprint $table) {
                $table->decimal('cuota', 15, 2)->default(0)->after('fecha_cuota');
            });
        }

        if (!Schema::hasColumn('credit_payments', 'cargos')) {
            Schema::table('credit_payments', function (Blueprint $table) {
                $table->decimal('cargos', 15, 2)->default(0)->after('cuota');
            });
        }

        if (!Schema::hasColumn('credit_payments', 'poliza')) {
            Schema::table('credit_payments', function (Blueprint $table) {
                $table->decimal('poliza', 15, 2)->default(0)->after('cargos');
            });
        }

        if (!Schema::hasColumn('credit_payments', 'interes_corriente')) {
            Schema::table('credit_payments', function (Blueprint $table) {
                $table->decimal('interes_corriente', 15, 2)->default(0)->after('poliza');
            });
        }

        if (!Schema::hasColumn('credit_payments', 'interes_moratorio')) {
            Schema::table('credit_payments', function (Blueprint $table) {
                $table->decimal('interes_moratorio', 15, 2)->default(0)->after('interes_corriente');
            });
        }

        if (!Schema::hasColumn('credit_payments', 'amortizacion')) {
            Schema::table('credit_payments', function (Blueprint $table) {
                $table->decimal('amortizacion', 15, 2)->default(0)->after('interes_moratorio');
            });
        }

        if (!Schema::hasColumn('credit_payments', 'saldo_anterior')) {
            Schema::table('credit_payments', function (Blueprint $table) {
                $table->decimal('saldo_anterior', 15, 2)->default(0)->after('amortizacion');
            });
        }

        if (!Schema::hasColumn('credit_payments', 'nuevo_saldo')) {
            Schema::table('credit_payments', function (Blueprint $table) {
                $table->decimal('nuevo_saldo', 15, 2)->default(0)->after('saldo_anterior');
            });
        }

        if (!Schema::hasColumn('credit_payments', 'estado')) {
            Schema::table('credit_payments', function (Blueprint $table) {
                $table->string('estado')->default('Pendiente')->after('nuevo_saldo');
            });
        }

        if (!Schema::hasColumn('credit_payments', 'fecha_movimiento')) {
            Schema::table('credit_payments', function (Blueprint $table) {
                $table->date('fecha_movimiento')->nullable()->after('estado');
            });
        }

        if (!Schema::hasColumn('credit_payments', 'movimiento_total')) {
            Schema::table('credit_payments', function (Blueprint $table) {
                $table->decimal('movimiento_total', 15, 2)->default(0)->after('fecha_movimiento');
            });
        }

        if (!Schema::hasColumn('credit_payments', 'linea')) {
            Schema::table('credit_payments', function (Blueprint $table) {
                $table->string('linea')->nullable()->after('movimiento_total');
            });
        }

        if (!Schema::hasColumn('credit_payments', 'fecha_inicio')) {
            Schema::table('credit_payments', function (Blueprint $table) {
                $table->date('fecha_inicio')->nullable()->after('linea');
            });
        }

        if (!Schema::hasColumn('credit_payments', 'fecha_corte')) {
            Schema::table('credit_payments', function (Blueprint $table) {
                $table->date('fecha_corte')->nullable()->after('fecha_inicio');
            });
        }

        if (!Schema::hasColumn('credit_payments', 'tasa_actual')) {
            Schema::table('credit_payments', function (Blueprint $table) {
                $table->decimal('tasa_actual', 5, 2)->nullable()->after('fecha_corte');
            });
        }

        if (!Schema::hasColumn('credit_payments', 'plazo_actual')) {
            Schema::table('credit_payments', function (Blueprint $table) {
                $table->integer('plazo_actual')->nullable()->after('tasa_actual');
            });
        }

        if (!Schema::hasColumn('credit_payments', 'dias')) {
            Schema::table('credit_payments', function (Blueprint $table) {
                $table->integer('dias')->nullable()->after('plazo_actual');
            });
        }

        if (!Schema::hasColumn('credit_payments', 'dias_mora')) {
            Schema::table('credit_payments', function (Blueprint $table) {
                $table->integer('dias_mora')->nullable()->after('dias');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('credit_payments', function (Blueprint $table) {
            $table->dropColumn([
                'numero_cuota', 'proceso', 'fecha_cuota', 'cuota', 'cargos', 'poliza', 'interes_corriente',
                'interes_moratorio', 'amortizacion', 'saldo_anterior', 'nuevo_saldo', 'estado', 'fecha_movimiento',
                'movimiento_total', 'linea', 'fecha_inicio', 'fecha_corte', 'tasa_actual', 'plazo_actual', 'dias', 'dias_mora'
            ]);
        });
    }
};
