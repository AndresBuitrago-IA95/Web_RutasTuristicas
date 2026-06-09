/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from "react";
import { Ciudad, Pais, Ruta, Parada, Tipo } from "./types";
import RouteMap from "./components/RouteMap";
import RouteForm from "./components/RouteForm";
import StopForm from "./components/StopForm";
import AdminPanel from "./components/AdminPanel";
import {
  MapPin,
  Plus,
  Edit,
  Trash2,
  Clock,
  Briefcase,
  Layers,
  Settings,
  X,
  ChevronRight,
  RefreshCw,
  Search,
  Check,
  AlertCircle
} from "lucide-react";

export default function App() {
  // Data lists state
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [paises, setPaises] = useState<Pais[]>([]);
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [paradas, setParadas] = useState<Parada[]>([]);
  const [tipos, setTipos] = useState<Tipo[]>([]);

  // Selection states
  const [selectedCity, setSelectedCity] = useState<Ciudad | null>(null);
  const [selectedRuta, setSelectedRuta] = useState<Ruta | null>(null);

  // Loading & error conditions
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");

  // Control over Dialogs/Forms visibility
  const [showRouteForm, setShowRouteForm] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Ruta | null>(null);

  const [showStopForm, setShowStopForm] = useState(false);
  const [editingStop, setEditingStop] = useState<Parada | null>(null);

  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Custom elegant Toast and Confirmation states to prevent native blocks in iframe
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const [toast, setToast] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({
    isOpen: false,
    message: "",
    type: "info",
  });

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ isOpen: true, message, type });
    // Auto-dismiss the toast notification after 4.5 seconds
    const activeMsg = message;
    setTimeout(() => {
      setToast((prev) => (prev.message === activeMsg ? { ...prev, isOpen: false } : prev));
    }, 4500);
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Load types, countries, and cities on launch
  useEffect(() => {
    loadBootstrapData();
  }, []);

  const loadBootstrapData = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const [resTipos, resPaises, resCiudades] = await Promise.all([
        fetch("/api/tipos"),
        fetch("/api/paises"),
        fetch("/api/ciudades"),
      ]);

      if (resTipos.ok && resPaises.ok && resCiudades.ok) {
        const dataTipos = await resTipos.json();
        const dataPaises = await resPaises.json();
        const dataCiudades = await resCiudades.json();

        setTipos(dataTipos);
        setPaises(dataPaises);
        setCiudades(dataCiudades);

        // Auto-select Paris (id: 11) or the first available city
        if (dataCiudades.length > 0) {
          const paris = dataCiudades.find((c: Ciudad) => c.nombre.toLowerCase().includes("parís")) || dataCiudades[0];
          setSelectedCity(paris);
        }
      } else {
        setErrorMsg("Error al obtener datos iniciales del servidor. Compruebe la conexión.");
      }
    } catch (e) {
      setErrorMsg("Ocurrió un error al contactar al servidor REST API.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch routes whenever the selected city changes
  useEffect(() => {
    if (!selectedCity) return;
    loadRoutes(selectedCity.id);
    setShowRouteForm(false);
    setEditingRoute(null);
  }, [selectedCity]);

  const loadRoutes = async (cityId: number) => {
    try {
      const response = await fetch(`/api/rutas/ciudad/${cityId}`);
      if (response.ok) {
        const data = await response.json();
        setRutas(data);

        // Auto-select first route if available, or clear selection
        if (data.length > 0) {
          // Double check if there is an active route with same ID, otherwise first
          const currentExist = selectedRuta ? data.find((r: Ruta) => r.id === selectedRuta.id) : null;
          setSelectedRuta(currentExist || data[0]);
        } else {
          setSelectedRuta(null);
        }
      }
    } catch (e) {
      console.error("Error al cargar rutas de la ciudad", e);
    }
  };

  // Fetch stops whenever the selected route changes
  useEffect(() => {
    if (!selectedRuta) {
      setParadas([]);
      setShowStopForm(false);
      setEditingStop(null);
      return;
    }
    loadStops(selectedRuta.id);
    setShowStopForm(false);
    setEditingStop(null);
  }, [selectedRuta]);

  const loadStops = async (rutaId: number) => {
    try {
      const response = await fetch(`/api/paradas/ruta/${rutaId}`);
      if (response.ok) {
        const data = await response.json();
        // The endpoint sorts by orden, but let's reinforce it on the frontend client as well.
        const sorted = data.sort((a: Parada, b: Parada) => a.orden - b.orden);
        setParadas(sorted);
      }
    } catch (e) {
      console.error("Error al cargar paradas de la ruta", e);
    }
  };

  // Helper getters
  const selectedCityCountry = useMemo(() => {
    if (!selectedCity) return null;
    return paises.find((p) => p.id === selectedCity.idPais) || null;
  }, [selectedCity, paises]);

  const getTipoName = (tipoId: number) => {
    const t = tipos.find((tipo) => tipo.id === tipoId);
    return t ? t.nombre : "Otros";
  };

  const getTipoBadgeClass = (tipoId: number) => {
    const name = getTipoName(tipoId).toLowerCase();
    if (name.includes("fluvial")) {
      return "bg-cyan-100 text-cyan-800 border-cyan-200";
    }
    if (name.includes("terrestre")) {
      return "bg-amber-100 text-amber-800 border-amber-200";
    }
    if (name.includes("marítima") || name.includes("maritima")) {
      return "bg-indigo-100 text-indigo-800 border-indigo-200";
    }
    if (name.includes("senderismo") || name.includes("eco")) {
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    }
    return "bg-slate-100 text-slate-800 border-slate-200";
  };

  // --- CRUD ACTIONS: ROUTES ---
  const handleSaveRoute = async (routeData: Partial<Ruta>) => {
    if (!selectedCity) return;
    const isEdit = !!routeData.id;

    try {
      const response = await fetch("/api/rutas", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(routeData),
      });

      if (response.ok) {
        const saved = await response.json();
        setShowRouteForm(false);
        setEditingRoute(null);
        await loadRoutes(selectedCity.id);
        
        // Auto select the newly created or updated route
        setSelectedRuta(saved);
        showToast(isEdit ? "Ruta turística actualizada exitosamente." : "Ruta turística creada exitosamente.", "success");
      } else {
        showToast("No se pudo guardar la ruta.", "error");
      }
    } catch (err) {
      showToast("Error de conexión al guardar la ruta.", "error");
    }
  };

  const handleDeleteRoute = async (id: number) => {
    showConfirm(
      "Confirmar Eliminación",
      "¿Estás seguro de que deseas eliminar esta ruta turística y todos sus paraderos de forma definitiva?",
      async () => {
        try {
          const response = await fetch(`/api/rutas/${id}`, {
            method: "DELETE",
          });

          if (response.ok) {
            showToast("Ruta eliminada con éxito.", "success");
            if (selectedCity) {
              await loadRoutes(selectedCity.id);
            }
          } else {
            showToast("Ocurrió un problema al intentar eliminar la ruta turística.", "error");
          }
        } catch (err) {
          showToast("Error de conexión al eliminar.", "error");
        }
      }
    );
  };

  // --- CRUD ACTIONS: STOPS / PARADAS ---
  const handleSaveStop = async (stopData: Partial<Parada>) => {
    if (!selectedRuta) return;
    const isEdit = !!stopData.id;

    try {
      const response = await fetch("/api/paradas", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stopData),
      });

      if (response.ok) {
        setShowStopForm(false);
        setEditingStop(null);
        await loadStops(selectedRuta.id);
        showToast(isEdit ? "Parada actualizada con éxito." : "Nueva parada agregada con éxito.", "success");
      } else {
        showToast("No se pudo guardar la parada. Asegúrate de ingresar coordenadas correctas.", "error");
      }
    } catch (err) {
      showToast("Error de conexión al registrar parada.", "error");
    }
  };

  const handleDeleteStop = async (id: number) => {
    showConfirm(
      "Confirmar Eliminación",
      "¿Seguro que deseas eliminar esta parada de la ruta?",
      async () => {
        try {
          const response = await fetch(`/api/paradas/${id}`, {
            method: "DELETE",
          });

          if (response.ok) {
            showToast("Parada eliminada con éxito.", "success");
            if (selectedRuta) {
              await loadStops(selectedRuta.id);
            }
          } else {
            showToast("Ocurrió un error al remover la parada.", "error");
          }
        } catch (err) {
          showToast("Error de conexión al eliminar.", "error");
        }
      }
    );
  };

  // Filter cities by search term
  const filteredCiudades = useMemo(() => {
    return ciudades.filter((c) => {
      const country = paises.find((p) => p.id === c.idPais);
      const text = `${c.nombre} ${country ? country.nombre : ""}`.toLowerCase();
      return text.includes(searchQuery.toLowerCase());
    });
  }, [ciudades, paises, searchQuery]);

  const nextStopOrden = useMemo(() => {
    if (paradas.length === 0) return 1;
    return Math.max(...paradas.map((p) => p.orden)) + 1;
  }, [paradas]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-800 flex flex-col">
      {/* Navbar Banner */}
      <header className="bg-gradient-to-r from-blue-800 via-blue-900 to-indigo-950 text-white shadow-md border-b border-indigo-700">
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2.5 rounded-full border border-white/20">
              <MapPin className="h-6 w-6 text-blue-300" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-2">
                Rutas Turísticas
                <span className="text-xs bg-indigo-500/30 text-indigo-200 border border-indigo-400/20 px-2 py-0.5 rounded-full font-normal">
                  Sena & Co.
                </span>
              </h1>
              <p className="text-xs text-blue-200 mt-0.5 font-light">
                Evaluación 5 Final • Sistema Fullstack de Gestión y Geoposicionamiento
              </p>
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowAdminPanel(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-blue-700/80 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-blue-500/30 transition-all shadow-sm cursor-pointer hover:shadow"
            >
              <Settings size={14} className="animate-spin-slow" />
              Gestión de Maestros
            </button>
            <button
              onClick={loadBootstrapData}
              className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/15 transition-all"
              title="Refrescar Datos"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 md:py-8 flex flex-col lg:flex-row gap-6">
        
        {/* SIDEBAR left: List countries/cities */}
        <aside className="w-full lg:w-1/4 flex flex-col gap-4 bg-white rounded-xl border border-gray-200/80 shadow-sm p-4 h-fit">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              <Layers size={15} className="text-blue-600" />
              1. Seleccione Ciudad
            </h2>
            <span className="text-xs bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
              {ciudades.length}
            </span>
          </div>

          {/* Search box within sidebar */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar ciudad..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* City Selection List */}
          <div className="space-y-1 overflow-y-auto max-h-[300px] lg:max-h-[500px] pr-1" id="cities-list-sidebar">
            {loading ? (
              <div className="py-8 text-center text-xs text-gray-400 flex flex-col items-center gap-2">
                <RefreshCw size={20} className="animate-spin text-blue-600" />
                Cargando destinos...
              </div>
            ) : filteredCiudades.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-6">No se encontraron ciudades.</p>
            ) : (
              filteredCiudades.map((ciudad) => {
                const isSelected = selectedCity?.id === ciudad.id;
                const country = paises.find((p) => p.id === ciudad.idPais);
                return (
                  <button
                    key={ciudad.id}
                    onClick={() => setSelectedCity(ciudad)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-lg flex items-center justify-between transition-all outline-none border text-xs cursor-pointer ${
                      isSelected
                        ? "bg-blue-600 border-blue-600 text-white font-bold shadow-md shadow-blue-600/15"
                        : "bg-white hover:bg-slate-50 border-gray-100 text-gray-700 hover:text-gray-900"
                    }`}
                  >
                    <div>
                      <h4 className="font-semibold block truncate leading-tight">{ciudad.nombre}</h4>
                      <p className={`text-[10px] mt-0.5 ${isSelected ? "text-blue-100" : "text-gray-400"}`}>
                        {country ? country.nombre : ""}
                      </p>
                    </div>
                    {isSelected && <ChevronRight size={14} className="text-blue-100" />}
                  </button>
                );
              })
            )}
          </div>

          <div className="pt-2 border-t border-gray-100">
            <button
              onClick={() => setShowAdminPanel(true)}
              className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-lg text-[11px] font-semibold text-gray-600 flex items-center justify-center gap-1 transition-colors"
            >
              <Plus size={12} />
              Agregar otra ciudad...
            </button>
          </div>
        </aside>

        {/* MAIN COLUMN right: Routes, stops, and map */}
        <main className="flex-1 flex flex-col gap-6">
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-xs font-semibold flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {selectedCity ? (
            <>
              {/* SECTION: RUTAS EN EL DESTINO */}
              <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden flex flex-col">
                <div className="bg-blue-600 text-white px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-2">
                  <h2 className="text-sm md:text-base font-bold flex items-center gap-1.5">
                    <MapPin size={16} className="text-blue-200" />
                    Rutas en: <span className="underline decoration-blue-300 decoration-2 underline-offset-2">{selectedCity.nombre}</span>
                  </h2>
                  <button
                    onClick={() => {
                      setEditingRoute(null);
                      setShowRouteForm(!showRouteForm);
                    }}
                    className="w-full sm:w-auto px-3.5 py-1.5 bg-white text-blue-800 text-xs font-bold rounded shadow-sm hover:bg-blue-50 transition-all flex items-center justify-center gap-1.5 border border-transparent"
                  >
                    <Plus size={13} strokeWidth={2.5} />
                    Agregar Ruta
                  </button>
                </div>

                {/* Subform Route Creator */}
                {showRouteForm && (
                  <div className="px-4">
                    <RouteForm
                      tipos={tipos}
                      idCiudad={selectedCity.id}
                      route={editingRoute}
                      onSave={handleSaveRoute}
                      onCancel={() => {
                        setShowRouteForm(false);
                        setEditingRoute(null);
                      }}
                    />
                  </div>
                )}

                {/* Routes listing table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-gray-200/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                        <th className="py-3 px-4 w-12 text-center">ID</th>
                        <th className="py-3 px-4">Nombre de la Ruta</th>
                        <th className="py-3 px-4 w-28">Tipo</th>
                        <th className="py-3 px-4 w-32 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {rutas.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-8 px-4 text-center text-xs text-gray-400">
                            No hay rutas cargadas para {selectedCity.nombre}. Presione "+ Agregar Ruta" para crear una.
                          </td>
                        </tr>
                      ) : (
                        rutas.map((ruta) => {
                          const isSelected = selectedRuta?.id === ruta.id;
                          return (
                            <tr
                              key={ruta.id}
                              onClick={() => setSelectedRuta(ruta)}
                              className={`group cursor-pointer transition-colors ${
                                isSelected ? "bg-blue-50/50" : "hover:bg-slate-50/70"
                              }`}
                            >
                              <td className="py-3.5 px-4 font-mono text-xs font-semibold text-gray-500 text-center">
                                {ruta.id}
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">
                                  {ruta.nombre}
                                </div>
                                {ruta.descripcion && (
                                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{ruta.descripcion}</p>
                                )}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold border rounded-full capitalize ${getTipoBadgeClass(ruta.idTipo)}`}>
                                  {getTipoName(ruta.idTipo)}
                                </span>
                              </td>
                              <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => {
                                      setEditingRoute(ruta);
                                      setShowRouteForm(true);
                                    }}
                                    className="p-1 px-2.5 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white rounded shadow-sm flex items-center gap-0.5 transition-colors"
                                    title="Editar ruta"
                                  >
                                    <Edit size={11} />
                                    Editar
                                  </button>
                                  <button
                                    onClick={() => handleDeleteRoute(ruta.id)}
                                    className="p-1 px-2.5 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded shadow-sm flex items-center gap-0.5 transition-colors"
                                    title="Eliminar ruta de forma definitiva"
                                  >
                                    <Trash2 size={11} />
                                    Eliminar
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION: PARADAS DE LA RUTA */}
              {selectedRuta ? (
                <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden flex flex-col">
                  {/* Stops Header Tab */}
                  <div className="bg-emerald-600 text-white px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-2">
                    <h2 className="text-sm md:text-base font-bold flex items-center gap-1.5">
                      <Clock size={16} className="text-emerald-200 animate-pulse" />
                      Paradas de la Ruta: <span className="underline decoration-emerald-300 decoration-2 underline-offset-2">{selectedRuta.nombre}</span>
                    </h2>
                    <button
                      onClick={() => {
                        setEditingStop(null);
                        setShowStopForm(!showStopForm);
                      }}
                      className="w-full sm:w-auto px-3.5 py-1.5 bg-white text-emerald-800 text-xs font-bold rounded shadow-sm hover:bg-emerald-50 transition-all flex items-center justify-center gap-1.5 border border-transparent"
                    >
                      <Plus size={13} strokeWidth={2.5} />
                      Agregar Parada
                    </button>
                  </div>

                  <div className="p-4">
                    {/* Add/Edit Stop Inline Form */}
                    {showStopForm && (
                      <StopForm
                        idRuta={selectedRuta.id}
                        stop={editingStop}
                        nextOrden={nextStopOrden}
                        onSave={handleSaveStop}
                        onCancel={() => {
                          setShowStopForm(false);
                          setEditingStop(null);
                        }}
                      />
                    )}

                    {/* Stops sequence Table */}
                    <div className="overflow-x-auto border border-gray-100 rounded-lg">
                      <table className="w-full text-left text-sm border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-gray-200/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                            <th className="py-2.5 px-3 w-10 text-center">ID</th>
                            <th className="py-2.5 px-3 w-12 text-center">Orden</th>
                            <th className="py-2.5 px-3">Parada</th>
                            <th className="py-2.5 px-3 w-40">Coordenadas (Lat, Long)</th>
                            <th className="py-2.5 px-3 w-20 text-center">Tiempo</th>
                            <th className="py-2.5 px-3">Descripción</th>
                            <th className="py-2.5 px-3 w-28 text-center">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {paradas.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="py-8 px-3 text-center text-xs text-gray-400">
                                No se registran paradas para esta ruta en el sistema. Presione "+ Agregar Parada".
                              </td>
                            </tr>
                          ) : (
                            paradas.map((parada) => (
                              <tr key={parada.id} className="hover:bg-emerald-50/20 transition-colors">
                                <td className="py-3 px-3 font-mono text-[11px] font-semibold text-gray-400 text-center">
                                  {parada.id}
                                </td>
                                <td className="py-3 px-3 text-center">
                                  <span className="inline-flex items-center justify-center font-bold text-xs bg-slate-100 rounded-full h-5 w-5 text-gray-700">
                                    {parada.orden}
                                  </span>
                                </td>
                                <td className="py-3 px-3 font-semibold text-gray-800">
                                  {parada.nombre}
                                </td>
                                <td className="py-3 px-3 font-mono text-[11px] text-gray-500">
                                  ({parada.latitud.toFixed(4)}, {parada.longitud.toFixed(4)})
                                </td>
                                <td className="py-3 px-3 text-center text-xs font-semibold text-gray-700">
                                  {parada.tiempo} min
                                </td>
                                <td className="py-3 px-3 text-xs text-gray-600 max-w-xs truncate" title={parada.descripcion}>
                                  {parada.descripcion || <span className="italic text-gray-300">Sin descripción</span>}
                                </td>
                                <td className="py-3 px-3">
                                  <div className="flex items-center justify-center gap-1">
                                    <button
                                      onClick={() => {
                                        setEditingStop(parada);
                                        setShowStopForm(true);
                                      }}
                                      className="p-1 px-2 text-[10px] font-bold bg-amber-500 hover:bg-amber-600 text-white rounded transition-colors"
                                      title="Editar esta parada"
                                    >
                                      Editar
                                    </button>
                                    <button
                                      onClick={() => handleDeleteStop(parada.id)}
                                      className="p-1 px-2 text-[10px] font-bold bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                                      title="Eliminar parada"
                                    >
                                      Eliminar
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Leaflet integration component Map */}
                  <div className="px-4 pb-4">
                    <RouteMap
                      routeName={selectedRuta.nombre}
                      paradas={paradas}
                      cityCoords={{
                        lat: selectedCity.latitud,
                        lng: selectedCity.longitud,
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-xs text-gray-400">
                  <Briefcase size={24} className="mx-auto text-gray-300 mb-2" />
                  No hay una ruta seleccionada en el menú. Seleccione una arriba para configurar sus paradas y ver el mapa interactivo.
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-xs text-gray-400 flex flex-col items-center justify-center">
              <RefreshCw className="animate-spin h-8 w-8 text-blue-600 mb-3" />
              Cargando interfaz de bases relacionales de transporte...
            </div>
          )}
        </main>
      </div>

      {/* ADMIN PANEL MASTER DATA DIALOG */}
      {showAdminPanel && (
        <AdminPanel
          paises={paises}
          ciudades={ciudades}
          tipos={tipos}
          onRefresh={loadBootstrapData}
          onClose={() => setShowAdminPanel(false)}
        />
      )}

      {/* Toast Notification */}
      {toast.isOpen && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg border text-xs font-semibold bg-white transition-all transform animate-fade-in ${
          toast.type === "success" 
            ? "border-green-200 text-green-800 bg-green-50" 
            : toast.type === "error" 
            ? "border-red-200 text-red-800 bg-red-50" 
            : "border-blue-200 text-blue-800 bg-blue-50"
        }`}>
          {toast.type === "error" ? <AlertCircle size={16} /> : <Check size={16} />}
          <span>{toast.message}</span>
          <button onClick={() => setToast(prev => ({ ...prev, isOpen: false }))} className="ml-2 hover:opacity-75 cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Confirmation Modal Overlay */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-2">{confirmModal.title}</h3>
            <p className="text-xs text-gray-500 mb-4">{confirmModal.message}</p>
            <div className="flex justify-end gap-2 text-xs font-bold">
              <button
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="px-3.5 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors cursor-pointer"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Credentials */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-center py-5 text-xs mt-auto">
        <p>© 2026 Universidad de Antioquia • Facultad de Ingeniería</p>
        <p className="text-[10px] opacity-65 mt-1">Laboratorio de Técnicas de Programación • Diseñado en React & Node.js</p>
      </footer>
    </div>
  );
}
