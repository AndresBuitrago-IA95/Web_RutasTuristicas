/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Parada } from "../types";

interface RouteMapProps {
  routeName: string;
  paradas: Parada[];
  cityCoords: { lat: number; lng: number };
}

export default function RouteMap({ routeName, paradas, cityCoords }: RouteMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map if it doesn't exist
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        scrollWheelZoom: false,
      }).setView([cityCoords.lat, cityCoords.lng], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapInstanceRef.current);

      markerLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);
    }

    const map = mapInstanceRef.current;
    const markerLayer = markerLayerRef.current;

    // Clear existing markers & polyline
    if (markerLayer) {
      markerLayer.clearLayers();
    }
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    // Set view to city coords if no stops are present
    if (paradas.length === 0) {
      map.setView([cityCoords.lat, cityCoords.lng], 13);
      return;
    }

    const latlngs: L.LatLngTuple[] = [];

    // Add stops ordered by their 'orden' field
    const sortedParadas = [...paradas].sort((a, b) => a.orden - b.orden);

    sortedParadas.forEach((stop, index) => {
      const position: L.LatLngTuple = [stop.latitud, stop.longitud];
      latlngs.push(position);

      // Create a super clean custom marker using modern SVG representation
      const customIcon = L.divIcon({
        html: `
          <div class="flex items-center justify-center relative">
            <span class="absolute flex h-5 w-5 animate-ping rounded-full bg-blue-400 opacity-75"></span>
            <div class="relative flex items-center justify-center rounded-full bg-blue-600 font-bold text-white text-xs h-6 w-6 border-2 border-white shadow-md">
              ${stop.orden}
            </div>
          </div>
        `,
        className: "custom-div-icon",
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker(position, { icon: customIcon });
      
      const popupContent = `
        <div class="p-1 font-sans">
          <div class="font-bold text-blue-700 text-sm">Parada ${stop.orden}: ${stop.nombre}</div>
          ${stop.tiempo ? `<div class="text-xs text-gray-500 mt-0.5">Tiempo estimado: ${stop.tiempo} min</div>` : ""}
          <div class="text-xs text-gray-700 mt-1">${stop.descripcion || "Sin descripción."}</div>
        </div>
      `;
      marker.bindPopup(popupContent);
      
      if (markerLayer) {
        markerLayer.addLayer(marker);
      }
    });

    // Draw route sequence line
    if (latlngs.length > 1) {
      polylineRef.current = L.polyline(latlngs, {
        color: "#2563eb",
        weight: 4,
        opacity: 0.8,
        dashArray: "5, 8",
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map);

      // Fit map bounds to encompass all stops nicely with some padding
      const bounds = L.latLngBounds(latlngs);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (latlngs.length === 1) {
      map.setView(latlngs[0], 14);
    }

    // Force tile re-render fix for sizing
    setTimeout(() => {
      map.invalidateSize();
    }, 100);

  }, [paradas, cityCoords]);

  // Handle cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mt-6" id="map-container-card">
      <div className="bg-emerald-700 text-white px-4 py-3 flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse"></div>
        <h3 className="font-semibold text-sm md:text-base">
          Mapa de la Ruta: <span className="font-bold">{routeName}</span>
        </h3>
      </div>
      <div className="relative w-full h-[320px] md:h-[400px] bg-slate-50">
        <div ref={mapContainerRef} className="w-full h-full z-10" id="route-map-leaflet"></div>
        {paradas.length === 0 && (
          <div className="absolute inset-0 bg-slate-50/80 flex items-center justify-center flex-col p-4 text-center z-20">
            <svg className="w-12 h-12 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-sm font-semibold text-gray-600">No hay paradas definidas para esta ruta</p>
            <p className="text-xs text-gray-400 mt-1">Agrege una parada arriba para visualizarla en el mapa</p>
          </div>
        )}
      </div>
    </div>
  );
}
