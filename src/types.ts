/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Tipo {
  id: number;
  nombre: string;
}

export interface Pais {
  id: number;
  nombre: string;
  codigoAlfa2: string;
}

export interface Ciudad {
  id: number;
  nombre: string;
  idPais: number;
  longitud: number;
  latitud: number;
}

export interface Ruta {
  id: number;
  nombre: string;
  idTipo: number;
  idCiudad: number;
  descripcion: string;
}

export interface Parada {
  id: number;
  nombre: string;
  orden: number;
  idRuta: number;
  longitud: number;
  latitud: number;
  tiempo: number;
  descripcion: string;
}
