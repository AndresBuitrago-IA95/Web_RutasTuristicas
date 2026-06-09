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
            $scope.showToastMsg('La selección se ha restablecido.', 'info');
        };

    }]);

})();
