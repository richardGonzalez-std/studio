'use client';

import api from '@/lib/axios';
import { useEffect, useState } from 'react';

// 1. DEFINICIÓN DE TIPOS (Interfaces)
// Define la estructura para que TypeScript sepa qué esperar de la relación anidada.

interface Lead {
  id: number;
  name: string;     // Asumo que tienes un nombre
  profesion: string | null;
  puesto: string | null;
  estado_puesto: string | null;
}

interface Opportunity {
  id: number;
  lead: Lead | null; // La oportunidad tiene un Lead
}

interface AnalisisItem {
  id: number;
  reference: string;
  monto_credito: number;
  status: string;
  created_at: string;
  opportunity: Opportunity | null; // El análisis tiene una Oportunidad
}

export default function AnalisisPage() {
  const [analisisList, setAnalisisList] = useState<AnalisisItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 2. FETCH DE DATOS
  useEffect(() => {
    const fetchAnalisis = async () => {
      try {
        // Asegúrate de que tu URL apunte a tu backend Laravel
        // Recuerda: En el controller de Laravel debes tener ->with('opportunity.lead')
        const response = await api.get(`/api/analisis`);
        
        if (!response.status.toString().startsWith('2')) {
          throw new Error('Error al cargar los análisis');
        }

        const data = response.data as AnalisisItem[];
        setAnalisisList(data);
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar los datos.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalisis();
  }, []);

  // 3. RENDERIZADO CONDICIONAL (Carga / Error)
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Cargando análisis...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error}
      </div>
    );
  }

  // 4. TABLA PRINCIPAL
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Listado de Análisis</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow">
          Nuevo Análisis
        </button>
      </div>

      <div className="overflow-x-auto bg-white shadow-md rounded-lg border border-gray-200">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-6 py-3">Referencia</th>
              <th className="px-6 py-3">Cliente (Lead)</th>
              
              {/* NUEVAS COLUMNAS SOLICITADAS */}
              <th className="px-6 py-3 bg-blue-50 text-blue-800">Profesión</th>
              <th className="px-6 py-3 bg-blue-50 text-blue-800">Puesto</th>
              <th className="px-6 py-3 bg-blue-50 text-blue-800">Estado Puesto</th>
              
              <th className="px-6 py-3">Monto</th>
              <th className="px-6 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {analisisList.length > 0 ? (
              analisisList.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  
                  {/* Referencia */}
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {item.reference}
                  </td>

                  {/* Nombre del Lead */}
                  <td className="px-6 py-4 text-gray-700">
                    {item.opportunity?.lead?.name || 'Sin Asignar'}
                  </td>

                  {/* COLUMNA: Profesión (Acceso anidado) */}
                  <td className="px-6 py-4 text-gray-600">
                    {/* Usamos ?. (Optional Chaining) para evitar error si lead es null */}
                    {item.opportunity?.lead?.profesion || '-'}
                  </td>

                  {/* COLUMNA: Puesto */}
                  <td className="px-6 py-4 text-gray-600">
                    {item.opportunity?.lead?.puesto || '-'}
                  </td>

                  {/* COLUMNA: Estado Puesto */}
                  <td className="px-6 py-4 text-gray-600">
                    <span className={`px-2 py-1 rounded text-xs font-semibold
                      ${item.opportunity?.lead?.estado_puesto === 'Fijo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                    `}>
                      {item.opportunity?.lead?.estado_puesto || 'N/A'}
                    </span>
                  </td>

                  {/* Monto (Formateado) */}
                  <td className="px-6 py-4 text-gray-700">
                    {new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC' }).format(item.monto_credito)}
                  </td>

                  {/* Estado del Análisis */}
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold 
                      ${item.status === 'Aprobado' ? 'bg-green-100 text-green-700' : 
                        item.status === 'Rechazado' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-800'}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  No hay análisis registrados aún.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}