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
        Schema::create('plan_de_pagos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('credit_id')->constrained()->onDelete('cascade');

            // Attributes
            $table->string('linea')->nullable();
            $table->integer('numero_cuota');
            $table->string('proceso')->nullable();
            $table->date('fecha_inicio')->nullable();
            $table->date('fecha_corte')->nullable();
            $table->date('fecha_pago')->nullable();
            $table->decimal('tasa_actual', 10, 2)->default(33.5);
            $table->integer('plazo_actual')->default(0);
            $table->decimal('cuota', 15, 2)->default(0);
            $table->decimal('cargos', 15, 2)->default(0);
            $table->decimal('poliza', 15, 2)->default(0);
            $table->decimal('interes_corriente', 15, 2)->default(0);
            $table->decimal('interes_moratorio', 15, 2)->default(0);
            $table->decimal('amortizacion', 15, 2)->default(0);
            $table->decimal('saldo_anterior', 15, 2)->default(0);
            $table->decimal('saldo_nuevo', 15, 2)->default(0);
            $table->integer('dias')->default(0);
            $table->string('estado')->nullable();
            $table->integer('dias_mora')->default(0);
            $table->date('fecha_movimiento')->nullable();
            $table->decimal('movimiento_total', 15, 2)->default(0);
            $table->decimal('movimiento_cargos', 15, 2)->default(0);
            $table->decimal('movimiento_poliza', 15, 2)->default(0);
            $table->decimal('movimiento_interes_corriente', 15, 2)->default(0);
            $table->decimal('movimiento_interes_moratorio', 15, 2)->default(0);
            $table->decimal('movimiento_principal', 15, 2)->default(0);
            $table->string('movimiento_caja_usuario')->nullable();
            $table->string('tipo_documento')->nullable();
            $table->string('numero_documento')->nullable();
            $table->string('concepto')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plan_de_pagos');
    }
};
