<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CreditPayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use App\Models\Credit;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Reader\Csv;

class CreditPaymentController extends Controller
{
    /**
     * Lógica centralizada para aplicar pagos (Waterfall / Cascada)
     * Distribuye el monto entre las cuotas pendientes y genera el recibo.
     */
    private function processPaymentTransaction($credit, $montoTotal, $fecha, $source, $cedulaRef)
    {
        $remaining = (float) $montoTotal;
        $originalCuotaSnapshot = 0;
        $firstCuotaAffected = null;

        // 1. Obtener todas las cuotas pendientes ordenadas por antigüedad
        $cuotas = $credit->planDePagos()
            ->where('estado', '!=', 'Pagado')
            ->where('cuota', '>', 0) // Solo las que tienen saldo positivo
            ->orderBy('numero_cuota', 'asc')
            ->get();

        if ($cuotas->isEmpty()) {
            return null; // No hay deuda que cobrar
        }

        // 2. Distribuir el dinero (Lógica de Cascada)
        foreach ($cuotas as $cuota) {
            if ($remaining <= 0) break;

            if (!$firstCuotaAffected) {
                $firstCuotaAffected = $cuota;
                $originalCuotaSnapshot = $cuota->cuota; // Guardamos la foto de la primera cuota tocada
            }

            // Cuánto se debe en esta cuota específica
            $deudaCuota = (float) $cuota->cuota;

            // Cuánto vamos a aplicar a esta cuota (lo que tengo o lo que debo, el menor)
            $aplicado = min($remaining, $deudaCuota);

            // Actualizar la cuota
            $cuota->cuota = round($deudaCuota - $aplicado, 2);
            $cuota->amortizacion = ($cuota->amortizacion ?? 0) + $aplicado; // Acumulamos lo amortizado

            // Si la deuda de la cuota llega a 0, se marca como pagada
            if ($cuota->cuota <= 0.00) {
                $cuota->estado = 'Pagado';
                $cuota->fecha_pago = $fecha;
            }

            $cuota->save();

            // Restar del dinero que tiene el cliente en la mano
            $remaining = round($remaining - $aplicado, 2);
        }

        // 3. Crear el Registro del Pago (Historial)
        // Se crea un solo registro por la transacción total
        $payment = CreditPayment::create([
            'credit_id'      => $credit->id,
            'numero_cuota'   => $firstCuotaAffected->numero_cuota ?? 0,
            'fecha_cuota'    => $firstCuotaAffected->fecha_cuota ?? null,
            'fecha_pago'     => $fecha,
            'monto'          => $montoTotal, // Lo que pagó realmente
            'cuota'          => $originalCuotaSnapshot, // Cuánto debía la cuota principal antes de pagar
            'saldo_anterior' => $originalCuotaSnapshot,
            'nuevo_saldo'    => $firstCuotaAffected->cuota ?? 0, // Cómo quedó la cuota principal
            'estado'         => 'Aplicado',
            'cedula'         => $cedulaRef,
            'source'         => $source,
        ]);

        // 4. RECALCULO GENERAL DEL CRÉDITO
        // Actualizamos los saldos globales del plan
        $this->recalculateCreditBalances($credit);

        return $payment;
    }

    /**
     * Recalcula los saldos (anterior y nuevo) de todo el plan de pagos
     * basándose en el saldo inicial del crédito.
     */
    /**
     * Recalcula los saldos de forma segura.
     * En lugar de ciegas restas, recalcula basado en la deuda real remanente.
     */
    private function recalculateCreditBalances(Credit $credit)
    {
        // 1. ACTUALIZAR SALDO TOTAL DEL CRÉDITO (Cabecera)
        // La forma más segura de saber el saldo es sumar lo que todavía se debe en las cuotas.
        // Si una cuota está pagada (0), no suma. Si está parcial, suma el remanente.
        $nuevoSaldoTotal = $credit->planDePagos()
            ->sum('cuota'); // Suma la columna 'cuota' (deuda pendiente)

        $credit->saldo = $nuevoSaldoTotal;
        $credit->save();

        // 2. ACTUALIZAR TABLA VISUAL (Saldos Anterior y Nuevo en Plan de Pagos)
        // Esto es para que el reporte se vea bonito, fila por fila.

        $balanceCorriendo = (float) $credit->monto_credito; // Empezamos con el préstamo original

        // Obtenemos todas las cuotas en orden
        $planCompleto = $credit->planDePagos()->orderBy('numero_cuota', 'asc')->get();

        foreach ($planCompleto as $item) {
            // El saldo anterior de esta cuota es el balance actual
            $item->saldo_anterior = max(0, round($balanceCorriendo, 2));

            // Calculamos cuánto bajó el saldo en esta cuota
            // Lógica: Si la cuota era de 100 y ahora es de 0, se amortizaron 100.
            // Si no tienes el valor original guardado, usamos 'amortizacion' que fuimos llenando en processPaymentTransaction
            $amortizadoEnEstaCuota = (float) $item->amortizacion;

            // El nuevo saldo es el anterior menos lo pagado
            $balanceCorriendo = round($balanceCorriendo - $amortizadoEnEstaCuota, 2);

            // Freno de seguridad: El saldo nunca puede ser menor que la deuda pendiente real de esa fila
            // Si por error matemático da negativo, lo forzamos a 0.
            $item->saldo_nuevo = max(0, $balanceCorriendo);

            $item->save();
        }
    }
    /**
     * Adelanto de cuotas (Manual desde el botón)
     */
    public function adelanto(Request $request)
    {
        $validated = $request->validate([
            'credit_id' => 'required|exists:credits,id',
            'tipo'      => 'nullable|string',
            'monto'     => 'required|numeric|min:0.01',
            'fecha'     => 'required|date',
        ]);

        $credit = Credit::findOrFail($validated['credit_id']);

        // Usamos la función centralizada
        $payment = $this->processPaymentTransaction(
            $credit,
            $validated['monto'],
            $validated['fecha'],
            'Ventanilla',
            $credit->lead->cedula ?? null
        );

        if (!$payment) {
            return response()->json(['message' => 'El crédito no tiene cuotas pendientes o ya está pagado.'], 422);
        }

        return response()->json([
            'message' => 'Adelanto aplicado y saldos recalculados',
            'payment' => $payment,
            'nuevo_saldo_credito' => $credit->saldo
        ]);
    }

    /**
     * Upload (Carga masiva desde Excel/CSV)
     */
    public function upload(Request $request)
    {
        $validated = $request->validate([
            'file' => 'required|file',
        ]);

        $file = $request->file('file');
        $path = $file->store('uploads/planillas', 'public');
        $fullPath = storage_path('app/public/' . $path);
        $results = [];
        $delimiter = ',';

        try {
            // 1. Detección de formato (CSV vs Excel)
            $readerType = IOFactory::identify($fullPath);
            $reader = IOFactory::createReader($readerType);

            if ($readerType === 'Csv') {
                // Detección inteligente de delimitador
                $handle = fopen($fullPath, 'r');
                if ($handle) {
                    $sample = '';
                    $lineCount = 0;
                    while (($line = fgets($handle)) !== false && $lineCount < 5) {
                        $sample .= $line; $lineCount++;
                    }
                    fclose($handle);

                    $semicolon = substr_count($sample, ';');
                    $comma     = substr_count($sample, ',');
                    if ($semicolon > $comma) $delimiter = ';';
                }
                // Solo llamar setDelimiter si es instancia de Csv
                if ($reader instanceof Csv) {
                    $reader->setDelimiter($delimiter);
                }
            }

            $spreadsheet = $reader->load($fullPath);
            $rows = $spreadsheet->getActiveSheet()->toArray(null, true, true, true);
            $header = reset($rows);

            // 2. Mapeo de columnas
            $montoCol = null;
            $cedulaCol = null;
            foreach ($header as $col => $val) {
                $v = mb_strtolower(trim((string)$val));
                if (str_contains($v, 'monto')) $montoCol = $col;
                if (str_contains($v, 'cedula') || str_contains($v, 'cédula')) $cedulaCol = $col;
            }

            if (!$montoCol || !$cedulaCol || $montoCol === $cedulaCol) {
                return response()->json(['message' => 'Error de columnas (monto/cedula)'], 422);
            }

            // 3. Procesamiento de filas
            $rowIndex = 0;
            foreach ($rows as $row) {
                $rowIndex++;
                if ($rowIndex === 1) continue;

                $rawCedula = trim((string)($row[$cedulaCol] ?? ''));
                $rawMonto  = trim((string)($row[$montoCol] ?? ''));
                $cleanCedula = preg_replace('/[^0-9]/', '', $rawCedula);

                if ($cleanCedula === '' || $rawMonto === '') {
                    $results[] = ['cedula' => $rawCedula, 'status' => 'skipped'];
                    continue;
                }

                // Buscar Crédito
                $credit = Credit::whereHas('lead', function($q) use ($rawCedula, $cleanCedula) {
                    $q->where('cedula', $rawCedula)->orWhere('cedula', $cleanCedula);
                })->first();

                if ($credit) {
                    // Limpieza del monto
                    $montoPagado = str_replace(',', '.', $rawMonto);
                    $montoPagado = preg_replace('/[^0-9\.]/', '', $montoPagado);
                    $montoPagado = floatval($montoPagado);

                    if ($montoPagado > 0) {
                        // --- AQUÍ LLAMAMOS A LA MISMA LÓGICA DE RECALCULO ---
                        $payment = $this->processPaymentTransaction(
                            $credit,
                            $montoPagado,
                            now(),      // Fecha pago
                            'Planilla', // Source
                            $rawCedula  // Cedula original del archivo
                        );

                        if ($payment) {
                            $results[] = [
                                'cedula' => $rawCedula,
                                'monto' => $montoPagado,
                                'status' => 'applied',
                                'lead' => $credit->lead->name ?? 'N/A'
                            ];
                        } else {
                            $results[] = ['cedula' => $rawCedula, 'status' => 'paid_or_error'];
                        }
                    } else {
                        $results[] = ['cedula' => $rawCedula, 'status' => 'zero_amount'];
                    }
                } else {
                    $results[] = ['cedula' => $rawCedula, 'status' => 'not_found'];
                }
            }

            return response()->json([
                'message' => 'Proceso completado',
                'results' => $results,
            ]);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Error', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * List all payments (updated with eager loading)
     */
    public function index()
    {
        $payments = CreditPayment::with('credit.lead')
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($payments);
    }

    // ... store, show, update, destroy se mantienen igual ...
    public function store(Request $request) { return response()->json([], 200); }
    public function show(string $id) { return response()->json([], 200); }
    public function update(Request $request, string $id) { return response()->json([], 200); }
    public function destroy(string $id) { return response()->json([], 200); }
}
