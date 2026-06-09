/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Ruta, Tipo } from "../types";
import { X, Check } from "lucide-react";

interface RouteFormProps {
  route?: Ruta | null; // If present, we are editing
  tipos: Tipo[];
  idCiudad: number;
  onSave: (routeData: Partial<Ruta>) => void;
  onCancel: () => void;
}

export default function RouteForm({ route, tipos, idCiudad, onSave, onCancel }: RouteFormProps) {
  const [nombre, setNombre] = useState("");
  const [idTipo, setIdTipo] = useState<number>(1);
  const [descripcion, setDescripcion] = useState("");

  useEffect(() => {
    if (route) {
      setNombre(route.nombre);
      setIdTipo(route.idTipo);
      setDescripcion(route.descripcion);
    } else {
      setNombre("");
      setIdTipo(tipos.length > 0 ? tipos[0].id : 1);
      setDescripcion("");
    }
  }, [route, tipos]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    onSave({
      id: route?.id,
      nombre: nombre.trim(),
      idTipo: Number(idTipo),
      idCiudad: idRutaCityId(),
      descripcion: descripcion.trim()
    });
  };

  const idRutaCityId = () => {
    return route ? route.idCiudad : idCiudad;
  };

  return (
    <div className="bg-slate-50 rounded-lg p-4 border border-blue-200 shadow-sm my-4">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-bold text-blue-800">
          {route ? `Editar Ruta: ${route.nombre}` : "Agregar Nueva Ruta"}
        </h4>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          type="button"
        >
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Nombre de la Ruta</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Ruta de los Castillos"
              maxLength={100}
              className="w-full text-sm border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Tipo de Ruta</label>
            <select
              value={idTipo}
              onChange={(e) => setIdTipo(Number(e.target.value))}
              className="w-full text-sm border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            >
              {tipos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Descripción</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Escribe una breve descripción de la ruta turística..."
            rows={2}
            className="w-full text-sm border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
          />
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-xs font-semibold border border-gray-300 rounded text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center gap-1 shadow-sm transition-colors"
          >
            <Check size={14} />
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}
