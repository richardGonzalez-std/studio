<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class LeadDocumentController extends Controller
{
    /**
     * Verificar si ya existe una carpeta con archivos para una cédula.
     * GET /api/leads/check-cedula-folder?cedula=123456789
     *
     * NOTA: Solo verifica archivos directamente en la carpeta de cédula,
     * NO en subcarpetas (oportunidades). Esto permite subir nuevos archivos
     * para crear nuevas oportunidades aunque ya existan oportunidades previas.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function checkCedulaFolder(Request $request)
    {
        $request->validate([
            'cedula' => 'required|string|min:9|max:20',
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

    /**
     * Subir un archivo para un lead específico.
     * Los archivos se guardan temporalmente en storage/app/public/leads/{leadId}/documents/
     *
     * NOTA: Solo bloquea si hay archivos directamente en documentos/{cedula}/
     * Si solo hay subcarpetas (oportunidades), permite subir nuevos archivos.
     *
     * @param Request $request
     * @param Lead $lead
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request, Lead $lead)
    {
        $request->validate([
            'file' => 'required|file|mimes:pdf,html|max:10240', // Max 10MB
        ]);

        // Verificar si ya existe carpeta con archivos para esta cédula
        $cedula = preg_replace('/[^0-9]/', '', $lead->cedula ?? '');
        if (!empty($cedula)) {
            $cedulaFolder = "documentos/{$cedula}";
            if (Storage::disk('public')->exists($cedulaFolder)) {
                // Solo contar archivos directamente en la carpeta, no en subcarpetas
                $existingFiles = Storage::disk('public')->files($cedulaFolder);
                if (count($existingFiles) > 0) {
                    return response()->json([
                        'success' => false,
                        'already_uploaded' => true,
                        'message' => 'Ya existen archivos pendientes para esta cédula. Debe crear una oportunidad primero o eliminar los archivos existentes.',
                        'files_count' => count($existingFiles),
                    ], 409); // 409 Conflict
                }
            }
        }

        try {
            $file = $request->file('file');
            $originalName = $file->getClientOriginalName();

            // Guardar temporalmente en carpeta del lead
            $path = $file->storeAs(
                "leads/{$lead->id}/documents",
                $originalName,
                'public'
            );

            return response()->json([
                'success' => true,
                'path' => $path,
                'original_name' => $originalName,
            ]);

        } catch (\Exception $e) {
            Log::error('Error subiendo archivo para lead', [
                'lead_id' => $lead->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al subir el archivo: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear carpeta con el número de cédula y mover los archivos a ella.
     * La estructura final será: storage/app/public/documentos/{cedula}/
     *
     * NOTA: Esta función mueve archivos de la carpeta temporal del lead
     * a la carpeta de cédula. Solo bloquea si ya hay archivos pendientes
     * (no si solo hay subcarpetas de oportunidades).
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function createCedulaFolder(Request $request)
    {
        $request->validate([
            'cedula' => 'required|string|min:9|max:20',
            'files' => 'required|array|min:1',
            'files.*' => 'required|string',
        ]);

        $cedula = preg_replace('/[^0-9]/', '', $request->input('cedula'));
        $files = $request->input('files');

        if (empty($cedula)) {
            return response()->json([
                'success' => false,
                'message' => 'Cédula inválida'
            ], 422);
        }

        // Verificar si ya existe la carpeta con archivos pendientes (no subcarpetas)
        $cedulaFolder = "documentos/{$cedula}";
        if (Storage::disk('public')->exists($cedulaFolder)) {
            $existingFiles = Storage::disk('public')->files($cedulaFolder);
            if (count($existingFiles) > 0) {
                // Limpiar archivos temporales ya que no se van a usar
                foreach ($files as $filePath) {
                    if (Storage::disk('public')->exists($filePath)) {
                        Storage::disk('public')->delete($filePath);
                    }
                }
                $this->cleanupEmptyDirectories($files);

                return response()->json([
                    'success' => false,
                    'already_exists' => true,
                    'message' => 'Ya existen archivos pendientes para esta cédula. Debe crear una oportunidad primero.',
                    'existing_files' => count($existingFiles),
                ], 409); // 409 Conflict
            }
        }

        try {
            $movedFiles = [];

            // Crear carpeta si no existe
            if (!Storage::disk('public')->exists($cedulaFolder)) {
                Storage::disk('public')->makeDirectory($cedulaFolder);
            }

            foreach ($files as $filePath) {
                if (!Storage::disk('public')->exists($filePath)) {
                    Log::warning('Archivo no encontrado para mover', ['path' => $filePath]);
                    continue;
                }

                $fileName = basename($filePath);
                $newPath = "{$cedulaFolder}/{$fileName}";

                // Si ya existe un archivo con el mismo nombre, agregar timestamp
                if (Storage::disk('public')->exists($newPath)) {
                    $extension = pathinfo($fileName, PATHINFO_EXTENSION);
                    $nameWithoutExt = pathinfo($fileName, PATHINFO_FILENAME);
                    $timestamp = now()->format('Ymd_His');
                    $fileName = "{$nameWithoutExt}_{$timestamp}.{$extension}";
                    $newPath = "{$cedulaFolder}/{$fileName}";
                }

                // Mover el archivo a la carpeta de cédula
                Storage::disk('public')->move($filePath, $newPath);
                $movedFiles[] = $newPath;
            }

            // Limpiar carpeta temporal del lead si quedó vacía
            $this->cleanupEmptyDirectories($files);

            return response()->json([
                'success' => true,
                'cedula' => $cedula,
                'folder' => $cedulaFolder,
                'files' => $movedFiles,
                'message' => 'Archivos movidos correctamente a la carpeta de cédula'
            ]);

        } catch (\Exception $e) {
            Log::error('Error creando carpeta de cédula', [
                'cedula' => $cedula,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al crear carpeta: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Limpiar directorios vacíos después de mover archivos.
     *
     * @param array $filePaths
     * @return void
     */
    private function cleanupEmptyDirectories(array $filePaths): void
    {
        $directories = [];

        foreach ($filePaths as $filePath) {
            $dir = dirname($filePath);
            if (!in_array($dir, $directories)) {
                $directories[] = $dir;
            }
        }

        foreach ($directories as $dir) {
            if (Storage::disk('public')->exists($dir)) {
                $files = Storage::disk('public')->files($dir);
                $subdirs = Storage::disk('public')->directories($dir);

                if (empty($files) && empty($subdirs)) {
                    Storage::disk('public')->deleteDirectory($dir);

                    $parentDir = dirname($dir);
                    if (Storage::disk('public')->exists($parentDir)) {
                        $parentFiles = Storage::disk('public')->files($parentDir);
                        $parentSubdirs = Storage::disk('public')->directories($parentDir);

                        if (empty($parentFiles) && empty($parentSubdirs)) {
                            Storage::disk('public')->deleteDirectory($parentDir);
                        }
                    }
                }
            }
        }
    }

    /**
     * Listar archivos de un lead (por cédula).
     *
     * @param Lead $lead
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Lead $lead)
    {
        $cedula = preg_replace('/[^0-9]/', '', $lead->cedula ?? '');

        if (empty($cedula)) {
            return response()->json([
                'success' => true,
                'files' => [],
                'message' => 'El lead no tiene cédula registrada'
            ]);
        }

        $cedulaFolder = "documentos/{$cedula}";

        if (!Storage::disk('public')->exists($cedulaFolder)) {
            return response()->json([
                'success' => true,
                'files' => [],
            ]);
        }

        $files = Storage::disk('public')->files($cedulaFolder);
        $fileList = [];

        foreach ($files as $file) {
            $fileList[] = [
                'name' => basename($file),
                'path' => $file,
                'url' => asset("storage/{$file}"),
                'size' => Storage::disk('public')->size($file),
                'last_modified' => Storage::disk('public')->lastModified($file),
            ];
        }

        return response()->json([
            'success' => true,
            'cedula' => $cedula,
            'folder' => $cedulaFolder,
            'files' => $fileList,
        ]);
    }

    /**
     * Eliminar un archivo específico.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Request $request)
    {
        $request->validate([
            'path' => 'required|string',
        ]);

        $path = $request->input('path');

        // Validar que el path sea seguro (dentro de documentos/ o leads/)
        if (!str_starts_with($path, 'documentos/') && !str_starts_with($path, 'leads/')) {
            return response()->json([
                'success' => false,
                'message' => 'Ruta no permitida'
            ], 403);
        }

        try {
            if (Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);

                return response()->json([
                    'success' => true,
                    'message' => 'Archivo eliminado correctamente'
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Archivo no encontrado'
            ], 404);

        } catch (\Exception $e) {
            Log::error('Error eliminando archivo', [
                'path' => $path,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar el archivo'
            ], 500);
        }
    }
}
