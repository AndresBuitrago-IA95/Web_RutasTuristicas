/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Parada } from "../types";
import { X, Check } from "lucide-react";

interface StopFormProps {
  stop?: Parada | null; // If present, we are editing
  idRuta: number;
  nextOrden: number;
  onSave: (stopData: Partial<Parada>) => void;
  onCancel: () => void;
}

export default function StopForm({ stop, idRuta, nextOrden, onSave, onCancel }: StopFormProps) {
  const [nombre, setNombre] = useState("");
  const [orden, setOrden] = useState<number>(1);
  const [latitud, setLatitud] = useState<string>("");
  const [longitud, setLongitud] = useState<string>("");
  const [tiempo, setTiempo] = useState<string>("");
  const [descripcion, setDescripcion] = useState("");

  useEffect(() => {
    if (stop) {
      setNombre(stop.nombre);
      setOrden(stop.orden);
      setLatitud(stop.latitud.toString());
      setLongitud(stop.longitud.toString());
      setTiempo(stop.tiempo.toString());
      setDescripcion(stop.descripcion);
    } else {
      setNombre("");
      setOrden(nextOrden);
      setLatitud("");
      setLongitud("");
      setTiempo("");
      setDescripcion("");
    }
  }, [stop, nextOrden]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !latitud || !longitud || !tiempo) return;

    onSave({
      id: stop?.id,
      nombre: nombre.trim(),
      orden: Number(orden),
      idRuta: stop ? stop.idRuta : idRuta,
      latitud: Number(latitud),
      longitud: Number(longitud),
      tiempo: Number(tiempo),
      descripcion: descripcion.trim(),
    });
  };

  return (
    <form
      id="stop-form-container"
      onSubmit={handleSubmit}
      className="bg-slate-50 rounded border border-emerald-200 p-3 mb-4 flex flex-col md:flex-row flex-wrap items-center gap-2 text-sm"
    >
      {/* Orden Input */}
      <div className="w-full md:w-16">
        <input
          type="number"
          value={orden}
          onChange={(e) => setOrden(Number(e.target.value))}
          placeholder="Orden"
          className="w-full text-center border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
          min={1}
          required
        />
      </div>

      {/* Nombre parada Input */}
      <div className="w-full md:flex-1 min-w-[140px]">
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre parada"
          className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
          required
        />
      </div>

      {/* Latitud Input */}
      <div className="w-full md:w-28">
        <input
          type="number"
          step="any"
          value={latitud}
          onChange={(e) => setLatitud(e.target.value)}
          placeholder="Latitud"
          className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
          required
        />
      </div>

      {/* Longitud Input */}
      <div className="w-full md:w-28">
        <input
          type="number"
          step="any"
          value={longitud}
          onChange={(e) => setLongitud(e.target.value)}
          placeholder="Longitud"
          className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
          required
        />
      </div>

      {/* Minutos Input */}
      <div className="w-full md:w-20">
        <input
          type="number"
          value={tiempo}
          onChange={(e) => setTiempo(e.target.value)}
          placeholder="Min."
          className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
          min={0}
          required
        />
      </div>

      {/* Descripcion Input */}
      <div className="w-full md:flex-1 min-w-[160px]">
        <input
          type="text"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Descripción corta"
          className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-1.5 w-full md:w-auto ml-auto justify-end mt-2 md:mt-0">
        <button
          type="submit"
          className="px-3 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors flex items-center gap-1"
        >
          Guardar
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="p-1 text-gray-500 hover:bg-gray-200 rounded transition-colors"
          title="Cancelar"
        >
          <X size={16} />
        </button>
      </div>
    </form>
  );
}
