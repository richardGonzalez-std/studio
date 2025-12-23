<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class ClientDocumentController extends Controller
{
    public function checkCedulaFolder(Request $request)
{
        $request->validate([
            'cedula' => 'required|string|max:20',
        ]);

        $cedula = preg_replace('/[^0-9]/', '', $request->input('cedula'));

        if (empty($cedula)) {
            return response()->json([
                'exists' => false,
                'has_files' => false,
                'files_count' => 0,
            ]);
        }

        $cedulaFolder = "documentos/{$cedula}";
        $exists = Storage::disk('public')->exists($cedulaFolder);

        // Solo archivos directamente en la carpeta (no en subcarpetas/oportunidades)
        $files = $exists ? Storage::disk('public')->files($cedulaFolder) : [];

        // También obtener las subcarpetas (oportunidades) para información
        $opportunities = $exists ? Storage::disk('public')->directories($cedulaFolder) : [];

        return response()->json([
            'exists' => $exists,
            'has_files' => count($files) > 0,
            'files_count' => count($files),
            'files' => array_map(fn($f) => basename($f), $files),
            'opportunities_count' => count($opportunities),
            'opportunities' => array_map(fn($d) => basename($d), $opportunities),
        ]);
    }
}
