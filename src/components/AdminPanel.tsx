/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Pais, Ciudad, Tipo } from "../types";
import { Plus, Trash2, Edit, X, Globe, Flag, Layers, Check } from "lucide-react";

interface AdminPanelProps {
  paises: Pais[];
  ciudades: Ciudad[];
  tipos: Tipo[];
  onRefresh: () => void;
  onClose: () => void;
}

type TabType = "ciudades" | "paises" | "tipos";

export default function AdminPanel({ paises, ciudades, tipos, onRefresh, onClose }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>("ciudades");
  const [editingItem, setEditingItem] = useState<any | null>(null);

  // Forms states
  const [cityName, setCityName] = useState("");
  const [cityCountryId, setCityCountryId] = useState<number>(1);
  const [cityLat, setCityLat] = useState("");
  const [cityLng, setCityLng] = useState("");

  const [countryName, setCountryName] = useState("");
  const [countryCode, setCountryCode] = useState("");

  const [typeName, setTypeName] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const flashSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleCreateOrUpdateCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityName.trim() || !cityLat || !cityLng) return;

    const payload = {
      id: editingItem?.id,
      nombre: cityName.trim(),
      idPais: Number(cityCountryId || (paises[0]?.id || 1)),
      latitud: Number(cityLat),
      longitud: Number(cityLng),
    };

    try {
      const url = editingItem ? `/api/ciudades/${editingItem.id}` : "/api/ciudades";
      const response = await fetch(url, {
        method: editingItem ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        flashSuccess(editingItem ? "Ciudad actualizada" : "Ciudad creada");
        resetForm();
        onRefresh();
      } else {
        const data = await response.json();
        setErrorMsg(data.error || "Error al procesar de ciudad");
      }
    } catch (err) {
      setErrorMsg("Error de conexión");
    }
  };

  const handleCreateOrUpdateCountry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!countryName.trim() || !countryCode.trim()) return;

    const payload = {
      id: editingItem?.id,
      nombre: countryName.trim(),
      codigoAlfa2: countryCode.trim().toUpperCase(),
    };

    try {
      const url = editingItem ? `/api/paises/${editingItem.id}` : "/api/paises";
      const response = await fetch(url, {
        method: editingItem ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        flashSuccess(editingItem ? "País actualizado" : "País creado");
        resetForm();
        onRefresh();
      } else {
        const data = await response.json();
        setErrorMsg(data.error || "Error al procesar país");
      }
    } catch (err) {
      setErrorMsg("Error de de conexión");
    }
  };

  const handleCreateOrUpdateType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typeName.trim()) return;

    const payload = {
      id: editingItem?.id,
      nombre: typeName.trim(),
    };

    try {
      const url = editingItem ? `/api/tipos/${editingItem.id}` : "/api/tipos";
      const response = await fetch(url, {
        method: editingItem ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        flashSuccess(editingItem ? "Tipo de ruta actualizado" : "Tipo de ruta creado");
        resetForm();
        onRefresh();
      } else {
        const data = await response.json();
        setErrorMsg(data.error || "Error al procesar tipo");
      }
    } catch (err) {
      setErrorMsg("Error de conexión");
    }
  };

  const handleDeleteItem = async (type: TabType, id: number) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar este registro? Esto podría causar inconsistencias si hay dependencias.`)) return;

    let url = "";
    if (type === "ciudades") url = `/api/ciudades/${id}`;
    else if (type === "paises") url = `/api/paises/${id}`;
    else if (type === "tipos") url = `/api/tipos/${id}`;

    try {
      const r = await fetch(url, { method: "DELETE" });
      if (r.ok) {
        flashSuccess("Registro eliminado exitosamente");
        onRefresh();
      } else {
        const dat = await r.json();
        setErrorMsg(dat.error || "No se pudo eliminar");
      }
    } catch (err) {
      setErrorMsg("Error de conexión");
    }
  };

  const startEdit = (item: any) => {
    setEditingItem(item);
    setErrorMsg("");
    if (activeTab === "ciudades") {
      setCityName(item.nombre);
      setCityCountryId(item.idPais);
      setCityLat(item.latitud.toString());
      setCityLng(item.longitud.toString());
    } else if (activeTab === "paises") {
      setCountryName(item.nombre);
      setCountryCode(item.codigoAlfa2);
    } else if (activeTab === "tipos") {
      setTypeName(item.nombre);
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setCityName("");
    setCityCountryId(paises[0]?.id || 1);
    setCityLat("");
    setCityLng("");
    setCountryName("");
    setCountryCode("");
    setTypeName("");
    setErrorMsg("");
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] border border-gray-100">
        {/* Header */}
        <div className="bg-blue-800 text-white px-5 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            <h2 className="font-bold text-lg">Panel de Administración de Datos</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-blue-700 rounded-full transition-colors text-blue-100">
            <X size={20} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-gray-200 bg-slate-50">
          <button
            onClick={() => { setActiveTab("ciudades"); resetForm(); }}
            className={`flex-1 py-3 px-4 text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors border-b-2 ${
              activeTab === "ciudades"
                ? "border-blue-600 text-blue-600 bg-white"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Globe size={16} />
            Ciudades ({ciudades.length})
          </button>
          <button
            onClick={() => { setActiveTab("paises"); resetForm(); }}
            className={`flex-1 py-3 px-4 text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors border-b-2 ${
              activeTab === "paises"
                ? "border-blue-600 text-blue-600 bg-white"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Flag size={16} />
            Países ({paises.length})
          </button>
          <button
            onClick={() => { setActiveTab("tipos"); resetForm(); }}
            className={`flex-1 py-3 px-4 text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors border-b-2 ${
              activeTab === "tipos"
                ? "border-blue-600 text-blue-600 bg-white"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Layers size={16} />
            Tipos de Ruta ({tipos.length})
          </button>
        </div>

        {/* Messaging area */}
        {successMsg && (
          <div className="mx-5 mt-4 p-2 text-xs font-semibold bg-green-50 border border-green-200 text-green-700 rounded">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="mx-5 mt-4 p-2 text-xs font-semibold bg-red-50 border border-red-200 text-red-700 rounded flex justify-between items-center">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg("")} className="text-red-500 font-bold hover:text-red-700">X</button>
          </div>
        )}

        {/* Content Body: Dual layout with Form and List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Form */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <h3 className="font-bold text-gray-800 text-sm mb-3">
              {editingItem ? "Editar Registro Seleccionado" : "Agregar Nuevo Registro"}
            </h3>

            {activeTab === "ciudades" && (
              <form onSubmit={handleCreateOrUpdateCity} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Nombre Ciudad</label>
                  <input
                    type="text"
                    value={cityName}
                    onChange={(e) => setCityName(e.target.value)}
                    placeholder="Ej: Buenos Aires"
                    className="w-full text-sm border border-gray-300 rounded p-1.5 bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">País</label>
                  <select
                    value={cityCountryId}
                    onChange={(e) => setCityCountryId(Number(e.target.value))}
                    className="w-full text-sm border border-gray-300 rounded p-1.5 bg-white"
                  >
                    {paises.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre} ({p.codigoAlfa2})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Latitud</label>
                  <input
                    type="number"
                    step="any"
                    value={cityLat}
                    onChange={(e) => setCityLat(e.target.value)}
                    placeholder="-34.6037"
                    className="w-full text-sm border border-gray-300 rounded p-1.5 bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Longitud</label>
                  <input
                    type="number"
                    step="any"
                    value={cityLng}
                    onChange={(e) => setCityLng(e.target.value)}
                    placeholder="-58.3816"
                    className="w-full text-sm border border-gray-300 rounded p-1.5 bg-white"
                    required
                  />
                </div>
                <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                  {editingItem && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-3 py-1.5 text-xs font-semibold border rounded text-gray-600 hover:bg-gray-100"
                    >
                      Cancelar Edición
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
                  >
                    <Check size={14} />
                    {editingItem ? "Actualizar" : "Guardar"}
                  </button>
                </div>
              </form>
            )}

            {activeTab === "paises" && (
              <form onSubmit={handleCreateOrUpdateCountry} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Nombre País</label>
                  <input
                    type="text"
                    value={countryName}
                    onChange={(e) => setCountryName(e.target.value)}
                    placeholder="Ej: Argentina"
                    className="w-full text-sm border border-gray-300 rounded p-1.5 bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Código Alfa-2</label>
                  <input
                    type="text"
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    placeholder="Ej: AR"
                    maxLength={2}
                    className="w-full text-sm border border-gray-300 rounded p-1.5 bg-white uppercase"
                    required
                  />
                </div>
                <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                  {editingItem && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-3 py-1.5 text-xs font-semibold border rounded text-gray-600 hover:bg-gray-100"
                    >
                      Cancelar Edición
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
                  >
                    <Check size={14} />
                    {editingItem ? "Actualizar" : "Guardar"}
                  </button>
                </div>
              </form>
            )}

            {activeTab === "tipos" && (
              <form onSubmit={handleCreateOrUpdateType} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Nombre del Tipo de Ruta</label>
                  <input
                    type="text"
                    value={typeName}
                    onChange={(e) => setTypeName(e.target.value)}
                    placeholder="Ej: Gastronómica"
                    className="w-full text-sm border border-gray-300 rounded p-1.5 bg-white"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  {editingItem && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-3 py-1.5 text-xs font-semibold border rounded text-gray-600 hover:bg-gray-100"
                    >
                      Cancelar Edición
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
                  >
                    <Check size={14} />
                    {editingItem ? "Actualizar" : "Guardar"}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* List display */}
          <div>
            <h4 className="font-bold text-gray-700 text-xs uppercase tracking-wider mb-2">Registros de {activeTab}</h4>
            <div className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-200 bg-white text-sm max-h-[250px] overflow-y-auto">
              {activeTab === "ciudades" && (
                ciudades.length === 0 ? <p className="p-4 text-center text-gray-400">No hay ciudades registradas.</p> :
                ciudades.map(c => {
                  const country = paises.find(p => p.id === c.idPais);
                  return (
                    <div key={c.id} className="p-3 flex justify-between items-center hover:bg-slate-50">
                      <div>
                        <div className="font-semibold text-gray-800">{c.nombre}</div>
                        <div className="text-xs text-gray-500">
                          País: {country ? `${country.nombre} (${country.codigoAlfa2})` : "Desconocido"} • Lat: {c.latitud}, Lng: {c.longitud}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => startEdit(c)} className="p-1 px-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Editar">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleDeleteItem("ciudades", c.id)} className="p-1 px-1.5 text-red-600 hover:bg-red-50 rounded transition-colors" title="Eliminar">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}

              {activeTab === "paises" && (
                paises.length === 0 ? <p className="p-4 text-center text-gray-400">No hay países registrados.</p> :
                paises.map(p => (
                  <div key={p.id} className="p-3 flex justify-between items-center hover:bg-slate-50">
                    <div>
                      <div className="font-semibold text-gray-800 flex items-center gap-2">
                        <span>{p.nombre}</span>
                        <span className="text-xs uppercase bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-bold">
                          {p.codigoAlfa2}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => startEdit(p)} className="p-1 px-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Editar">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => handleDeleteItem("paises", p.id)} className="p-1 px-1.5 text-red-600 hover:bg-red-50 rounded transition-colors" title="Eliminar">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}

              {activeTab === "tipos" && (
                tipos.length === 0 ? <p className="p-4 text-center text-gray-400">No hay tipos registrados.</p> :
                tipos.map(t => (
                  <div key={t.id} className="p-3 flex justify-between items-center hover:bg-slate-50">
                    <div>
                      <div className="font-semibold text-gray-800">{t.nombre}</div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => startEdit(t)} className="p-1 px-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Editar">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => handleDeleteItem("tipos", t.id)} className="p-1 px-1.5 text-red-600 hover:bg-red-50 rounded transition-colors" title="Eliminar">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 p-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-sm font-semibold transition-colors"
          >
            Cerrar Administrativos
          </button>
        </div>
      </div>
    </div>
  );
}
