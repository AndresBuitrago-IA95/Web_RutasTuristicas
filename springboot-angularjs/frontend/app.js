/**
 * AngularJS v1.8.2 Controller Client - Turismo Explorer
 * Se comunica con la API REST de Spring Boot alojada por defecto en http://localhost:8080/api
 */
(function () {
    'use strict';

    var app = angular.module('rutasApp', []);

    app.controller('MainController', ['$scope', '$http', function ($scope, $http) {
        
        // --- CONSTANTES ---
        var API_BASE_URL = 'http://localhost:8080/api';

        // --- VARIABLES DE MAPA (LEAFLET) ---
        var mapInstance = null;
        var markerLayer = null;
        var polylineInstance = null;

        // --- ESTADOS DE LA APLICACIÓN ---
        $scope.ciudades = [];
        $scope.selectedCiudad = null;
        
        $scope.rutas = [];
        $scope.selectedRuta = null;

        $scope.paradas = [];

        // Objetos auxiliares para formularios (Modales)
        $scope.editingRuta = {};
        $scope.editingStop = {};

        // Toasts
        $scope.toast = {
            show: false,
            message: '',
            type: 'info'
        };

        // --- SISTEMA DE TOASTS ---
        $scope.showToastMsg = function (message, type) {
            $scope.toast.message = message;
            $scope.toast.type = type || 'info';
            $scope.toast.show = true;

            // Ocultar mensaje automáticamente en 4 segundos
            setTimeout(function () {
                $scope.$apply(function () {
                    $scope.toast.show = false;
                });
            }, 4000);
        };

        $scope.hideToast = function () {
            $scope.toast.show = false;
        };

        // --- CARGAR DATOS INICIALES ---
        $scope.loadCiudades = function () {
            $http.get(API_BASE_URL + '/ciudades')
                .then(function (response) {
                    $scope.ciudades = response.data;
                })
                .catch(function (error) {
                    console.error('Error al cargar ciudades:', error);
                    $scope.showToastMsg('No se pudo conectar con el servidor Spring Boot. Asegúrate de iniciarlo en el puerto 8080.', 'danger');
                });
        };

        // LLAMADA INICIAL
        $scope.loadCiudades();

        // --- ACCIÓN: SELECCIONAR CIUDAD ---
        $scope.selectCiudad = function (ciudad) {
            $scope.selectedCiudad = ciudad;
            $scope.selectedRuta = null;
            $scope.paradas = [];
            $scope.loadRutas(ciudad.id);
            if (mapInstance) {
                mapInstance.remove();
                mapInstance = null;
            }
        };

        // --- ACCIONES: RUTAS ---
        $scope.loadRutas = function (idCiudad) {
            $http.get(API_BASE_URL + '/rutas/ciudad/' + idCiudad)
                .then(function (response) {
                    $scope.rutas = response.data;
                })
                .catch(function (error) {
                    console.error('Error al cargar rutas:', error);
                    $scope.showToastMsg('Error al recuperar las rutas de la ciudad.', 'danger');
                });
        };

        $scope.selectRuta = function (ruta) {
            $scope.selectedRuta = ruta;
            $scope.loadParadas(ruta.id);
        };

        // Abrir Modal de Ruta
        $scope.openRutaModal = function (ruta) {
            if (ruta) {
                // Clonar objeto para edición sin mutar la tabla principal
                $scope.editingRuta = {
                    id: ruta.id,
                    nombre: ruta.nombre,
                    descripcion: ruta.descripcion,
                    idCiudad: $scope.selectedCiudad.id
                };
            } else {
                // Nueva Ruta
                $scope.editingRuta = {
                    nombre: '',
                    descripcion: '',
                    idCiudad: $scope.selectedCiudad.id
                };
            }
            var myModal = new bootstrap.Modal(document.getElementById('rutaModal'));
            myModal.show();
        };

        // Crear o Modificar Ruta
        $scope.saveRuta = function () {
            if (!$scope.editingRuta.nombre) {
                $scope.showToastMsg('El nombre de la ruta es obligatorio.', 'danger');
                return;
            }

            var isEdit = !!$scope.editingRuta.id;
            var url = API_BASE_URL + '/rutas';
            var method = isEdit ? 'PUT' : 'POST';

            if (isEdit) {
                url = url + '/' + $scope.editingRuta.id;
            }

            $http({
                method: method,
                url: url,
                data: $scope.editingRuta
            }).then(function (response) {
                $scope.showToastMsg(isEdit ? 'Ruta modificada con éxito.' : 'Nueva ruta agregada con éxito.', 'success');
                
                // Cerrar modal
                var modalEl = document.getElementById('rutaModal');
                var modal = bootstrap.Modal.getInstance(modalEl);
                modal.hide();

                // Recargar listado
                $scope.loadRutas($scope.selectedCiudad.id);
                
                // Si modificamos la ruta que está actualmente cargada, actualizamos su info
                if (isEdit && $scope.selectedRuta && $scope.selectedRuta.id === response.data.id) {
                    $scope.selectedRuta = response.data;
                }
            }).catch(function (error) {
                console.error('Error al guardar la ruta:', error);
                $scope.showToastMsg('Error al intentar guardar la información de la ruta.', 'danger');
            });
        };

        // Eliminar Ruta
        $scope.deleteRuta = function (ruta) {
            if (confirm('¿Estás seguro de que deseas eliminar la ruta "' + ruta.nombre + '" de forma definitiva?')) {
                $http.delete(API_BASE_URL + '/rutas/' + ruta.id)
                    .then(function () {
                        $scope.showToastMsg('Ruta turística eliminada.', 'success');
                        
                        // Si era la ruta activa, limpiamos la selección
                        if ($scope.selectedRuta && $scope.selectedRuta.id === ruta.id) {
                            $scope.selectedRuta = null;
                            $scope.paradas = [];
                        }

                        $scope.loadRutas($scope.selectedCiudad.id);
                    })
                    .catch(function (error) {
                        console.error('Error al eliminar ruta:', error);
                        $scope.showToastMsg('No se pudo eliminar la ruta seleccionada.', 'danger');
                    });
            }
        };

        // --- ACCIONES: PARADAS (STOPS) ---
        $scope.loadParadas = function (idRuta) {
            $http.get(API_BASE_URL + '/paradas/ruta/' + idRuta)
                .then(function (response) {
                    // Ordenamos doblemente las paradas por el campo 'orden' para estar 100% seguros
                    $scope.paradas = response.data;
                    $scope.paradas.sort(function (a, b) {
                        return a.orden - b.orden;
                    });
                    $scope.updateMap();
                })
                .catch(function (error) {
                    console.error('Error al cargar paradas:', error);
                    $scope.showToastMsg('No se pudo recuperar las paradas de la ruta.', 'danger');
                });
        };

        // Abrir Modal de Parada
        $scope.openStopModal = function (parada) {
            if (parada) {
                // Clonar objeto para edición sin mutar la tabla principal
                $scope.editingStop = {
                    id: parada.id,
                    nombre: parada.nombre,
                    orden: parada.orden,
                    latitud: parseFloat(parada.latitud),
                    longitud: parseFloat(parada.longitud),
                    tiempo: parseInt(parada.tiempo),
                    descripcion: parada.descripcion,
                    idRuta: $scope.selectedRuta.id
                };
            } else {
                // Nueva Parada: calcular automáticamente sugerencia de orden
                var siguienteOrden = 1;
                if ($scope.paradas.length > 0) {
                    siguienteOrden = Math.max.apply(Math, $scope.paradas.map(function(o) { return o.orden; })) + 1;
                }

                $scope.editingStop = {
                    nombre: '',
                    orden: siguienteOrden,
                    latitud: $scope.selectedCiudad.latitud,
                    longitud: $scope.selectedCiudad.longitud,
                    tiempo: 15,
                    descripcion: '',
                    idRuta: $scope.selectedRuta.id
                };
            }
            var myModal = new bootstrap.Modal(document.getElementById('stopModal'));
            myModal.show();
        };

        // Guardar Parada
        $scope.saveStop = function () {
            if (!$scope.editingStop.nombre || !$scope.editingStop.orden || !$scope.editingStop.latitud || !$scope.editingStop.longitud) {
                $scope.showToastMsg('Por favor completa todos los campos obligatorios (*).', 'danger');
                return;
            }

            var isEdit = !!$scope.editingStop.id;
            var url = API_BASE_URL + '/paradas';
            var method = isEdit ? 'PUT' : 'POST';

            if (isEdit) {
                url = url + '/' + $scope.editingStop.id;
            }

            $http({
                method: method,
                url: url,
                data: $scope.editingStop
            }).then(function () {
                $scope.showToastMsg(isEdit ? 'Parada modificada exitosamente.' : 'Nueva parada añadida al itinerario.', 'success');
                
                // Cerrar modal
                var modalEl = document.getElementById('stopModal');
                var modal = bootstrap.Modal.getInstance(modalEl);
                modal.hide();

                // Recargar paradas de la ruta seleccionada
                $scope.loadParadas($scope.selectedRuta.id);
            }).catch(function (error) {
                console.error('Error al guardar la parada:', error);
                $scope.showToastMsg('Ocurrió un problema guardando el paradero turistico.', 'danger');
            });
        };

        // Eliminar Parada
        $scope.deleteStop = function (parada) {
            if (confirm('¿Eliminar la parada "' + parada.nombre + '" del itinerario?')) {
                $http.delete(API_BASE_URL + '/paradas/' + parada.id)
                    .then(function () {
                        $scope.showToastMsg('Parada removida.', 'success');
                        $scope.loadParadas($scope.selectedRuta.id);
                    })
                    .catch(function (error) {
                        console.error('Error al eliminar parada:', error);
                        $scope.showToastMsg('No se pudo eliminar la parada.', 'danger');
                    });
            }
        };

        // --- RESET / RE-SEED DATA ---
        // Envía una señal ficticia o de reset cargando las ciudades de nuevo
        $scope.reseedData = function() {
            $scope.loadCiudades();
            $scope.selectedCiudad = null;
            $scope.selectedRuta = null;
            $scope.paradas = [];
            if (mapInstance) {
                mapInstance.remove();
                mapInstance = null;
            }
            $scope.showToastMsg('La selección se ha restablecido.', 'info');
        };

        // --- ACTUALIZACIÓN DE MAPA (LEAFLET) ---
        $scope.updateMap = function () {
            setTimeout(function () {
                var mapContainer = document.getElementById('route-map');
                if (!mapContainer || !$scope.selectedCiudad) return;

                var cityCoords = [$scope.selectedCiudad.latitud, $scope.selectedCiudad.longitud];

                // Inicializar mapa si no existe
                if (!mapInstance) {
                    mapInstance = L.map('route-map', {
                        scrollWheelZoom: false
                    }).setView(cityCoords, 13);

                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    }).addTo(mapInstance);

                    markerLayer = L.layerGroup().addTo(mapInstance);
                }

                // Limpiar marcadores y polilíneas anteriores
                if (markerLayer) {
                    markerLayer.clearLayers();
                }
                if (polylineInstance) {
                    polylineInstance.remove();
                    polylineInstance = null;
                }

                // Si no hay paradas, centrar en la ciudad
                if ($scope.paradas.length === 0) {
                    mapInstance.setView(cityCoords, 13);
                    mapInstance.invalidateSize();
                    return;
                }

                var latlngs = [];

                // Agregar marcadores ordenados
                $scope.paradas.forEach(function (stop) {
                    var position = [stop.latitud, stop.longitud];
                    latlngs.push(position);

                    // Icono personalizado con el número de parada
                    var customIcon = L.divIcon({
                        html: '<div style="display: flex; align-items: center; justify-content: center; position: relative;">' +
                              '<span style="position: absolute; display: inline-flex; width: 16px; height: 16px; border-radius: 50%; background-color: #3b82f6; opacity: 0.75; animation: ping 1s infinite;"></span>' +
                              '<div style="position: relative; display: flex; align-items: center; justify-content: center; border-radius: 50%; background-color: #2563eb; color: white; font-weight: bold; font-size: 11px; width: 22px; height: 22px; border: 2px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">' +
                              stop.orden + '</div></div>',
                        className: 'custom-leaflet-icon',
                        iconSize: [24, 24],
                        iconAnchor: [12, 12]
                    });

                    var marker = L.marker(position, { icon: customIcon });

                    var popupContent = '<div style="font-family: sans-serif; padding: 4px; min-width: 150px;">' +
                        '<div style="font-weight: bold; color: #1e3a8a; font-size: 13px;">Parada ' + stop.orden + ': ' + stop.nombre + '</div>' +
                        (stop.tiempo ? '<div style="font-size: 11px; color: #6b7280; margin-top: 2px;">Tiempo: ' + stop.tiempo + ' min</div>' : '') +
                        '<div style="font-size: 11px; color: #374151; margin-top: 4px;">' + (stop.descripcion || 'Sin descripción.') + '</div>' +
                        '</div>';

                    marker.bindPopup(popupContent);
                    markerLayer.addLayer(marker);
                });

                // Trazar la polilínea conectando las paradas
                if (latlngs.length > 1) {
                    polylineInstance = L.polyline(latlngs, {
                        color: '#2563eb',
                        weight: 4,
                        opacity: 0.8,
                        dashArray: '5, 8',
                        lineCap: 'round',
                        lineJoin: 'round'
                    }).addTo(mapInstance);

                    // Ajustar zoom para que quepan todas las paradas
                    var bounds = L.latLngBounds(latlngs);
                    mapInstance.fitBounds(bounds, { padding: [50, 50] });
                } else if (latlngs.length === 1) {
                    mapInstance.setView(latlngs[0], 14);
                }

                // Forzar refresco de tamaño
                mapInstance.invalidateSize();
            }, 150);
        };

    }]);

})();
