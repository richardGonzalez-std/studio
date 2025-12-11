<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PlanDePago extends Model
{
    /** @use HasFactory<\Database\Factories\PlanDePagoFactory> */
    use HasFactory;

    protected $fillable = [
        'credit_id',
        'linea',
        'numero_cuota',
        'proceso',
        'fecha_inicio',
        'fecha_corte',
        'fecha_pago',
        'tasa_actual',
        'plazo_actual',
        'cuota',
        'cargos',
        'poliza',
        'interes_corriente',
        'interes_moratorio',
        'amortizacion',
        'saldo_anterior',
        'saldo_nuevo',
        'dias',
        'estado',
        'dias_mora',
        'fecha_movimiento',
        'movimiento_total',
        'movimiento_cargos',
        'movimiento_poliza',
        'movimiento_interes_corriente',
        'movimiento_interes_moratorio',
        'movimiento_principal',
        'movimiento_caja_usuario',
        'tipo_documento',
        'numero_documento',
        'concepto',
    ];

    protected $casts = [
        'fecha_inicio' => 'date',
        'fecha_corte' => 'date',
        'fecha_pago' => 'date',
        'fecha_movimiento' => 'date',
        'tasa_actual' => 'decimal:2',
        'cuota' => 'decimal:2',
        'cargos' => 'decimal:2',
        'poliza' => 'decimal:2',
        'interes_corriente' => 'decimal:2',
        'interes_moratorio' => 'decimal:2',
        'amortizacion' => 'decimal:2',
        'saldo_anterior' => 'decimal:2',
        'saldo_nuevo' => 'decimal:2',
        'movimiento_total' => 'decimal:2',
        'movimiento_cargos' => 'decimal:2',
        'movimiento_poliza' => 'decimal:2',
        'movimiento_interes_corriente' => 'decimal:2',
        'movimiento_interes_moratorio' => 'decimal:2',
        'movimiento_principal' => 'decimal:2',
    ];

    public function credit()
    {
        return $this->belongsTo(Credit::class);
    }
}
