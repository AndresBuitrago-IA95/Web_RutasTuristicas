/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { Tipo, Pais, Ciudad, Ruta, Parada } from "./src/types.js";

interface DbSchema {
  tipos: Tipo[];
  paises: Pais[];
  ciudades: Ciudad[];
  rutas: Ruta[];
  paradas: Parada[];
}

const DB_FILE = path.join(process.cwd(), "db.json");

const defaultDb: DbSchema = {
  tipos: [
    { id: 1, nombre: "Fluvial" },
    { id: 2, nombre: "Terrestre" },
    { id: 3, nombre: "Marítima" },
    { id: 4, nombre: "Aérea" },
    { id: 5, nombre: "Senderismo" }
  ],
  paises: [
    { id: 1, nombre: "España", codigoAlfa2: "ES" },
    { id: 2, nombre: "Colombia", codigoAlfa2: "CO" },
    { id: 3, nombre: "México", codigoAlfa2: "MX" },
    { id: 4, nombre: "Perú", codigoAlfa2: "PE" },
    { id: 5, nombre: "Egipto", codigoAlfa2: "EG" },
    { id: 6, nombre: "Japón", codigoAlfa2: "JP" },
    { id: 7, nombre: "Estados Unidos", codigoAlfa2: "US" },
    { id: 8, nombre: "Francia", codigoAlfa2: "FR" },
    { id: 9, nombre: "Italia", codigoAlfa2: "IT" }
  ],
  ciudades: [
    { id: 1, nombre: "Barcelona", idPais: 1, latitud: 41.3851, longitud: 2.1734 },
    { id: 2, nombre: "Bogotá", idPais: 2, latitud: 4.7110, longitud: -74.0721 },
    { id: 3, nombre: "Cancún", idPais: 3, latitud: 21.1619, longitud: -86.8515 },
    { id: 4, nombre: "Ciudad de México", idPais: 3, latitud: 19.4326, longitud: -99.1332 },
    { id: 5, nombre: "Cusco", idPais: 4, latitud: -13.5319, longitud: -71.9675 },
    { id: 6, nombre: "El Cairo", idPais: 5, latitud: 30.0444, longitud: 31.2357 },
    { id: 7, nombre: "Kioto", idPais: 6, latitud: 35.0116, longitud: 135.7681 },
    { id: 8, nombre: "Madrid", idPais: 1, latitud: 40.4168, longitud: -3.7038 },
    { id: 9, nombre: "Medellín", idPais: 2, latitud: 6.2442, longitud: -75.5812 },
    { id: 10, nombre: "Nueva York", idPais: 7, latitud: 40.7128, longitud: -74.0060 },
    { id: 11, nombre: "París", idPais: 8, latitud: 48.8566, longitud: 2.3522 },
    { id: 12, nombre: "Roma", idPais: 9, latitud: 41.9028, longitud: 12.4964 },
    { id: 13, nombre: "Tokio", idPais: 6, latitud: 35.6762, longitud: 139.6503 },
    { id: 14, nombre: "Venecia", idPais: 9, latitud: 45.4408, longitud: 12.3155 }
  ],
  rutas: [
    { id: 1, nombre: "Crucero Histórico por el Sena", idTipo: 1, idCiudad: 11, descripcion: "Disfruta de la belleza de los monumentos más icónicos de París desde sus aguas históricas." },
    { id: 2, nombre: "Recorrido de los Parques del Río", idTipo: 2, idCiudad: 9, descripcion: "Caminata ecológica por la ribera del río Medellín y su integrado diseño urbanístico." },
    { id: 3, nombre: "Tour Gaudí de Modernismo", idTipo: 2, idCiudad: 1, descripcion: "Admira las impresionantes fachadas de la joya cumbre del modernismo catalán." }
  ],
  paradas: [
    { id: 1, nombre: "Embarcadero Torre Eiffel", orden: 1, idRuta: 1, latitud: 48.8592, longitud: 2.2931, tiempo: 15, descripcion: "Punto de inicio a los pies de la Torre Eiffel." },
    { id: 2, nombre: "Muelle del Museo de Orsay", orden: 2, idRuta: 1, latitud: 48.8606, longitud: 2.3265, tiempo: 20, descripcion: "Avistamiento de la antigua estación de tren convertida en museo." },
    { id: 3, nombre: "Isla de la Cité - Notre Dame", orden: 3, idRuta: 1, latitud: 48.8530, longitud: 2.3499, tiempo: 25, descripcion: "Parada junto a la emblemática catedral." },
    { id: 4, nombre: "Teatro Metropolitano", orden: 1, idRuta: 2, latitud: 6.2422, longitud: -75.5786, tiempo: 10, descripcion: "Punto de encuentro al costado del auditorio del teatro." },
    { id: 5, nombre: "Plaza de la Libertad", orden: 2, idRuta: 2, latitud: 6.2435, longitud: -75.5768, tiempo: 15, descripcion: "Espacio cívico de esparcimiento rodeado de arquitectura moderna." },
    { id: 6, idRuta: 3, orden: 1, nombre: "Casa Batlló", latitud: 41.3916, longitud: 2.1649, tiempo: 20, descripcion: "Increíbles colores y formas marinas diseñadas por Gaudí." },
    { id: 7, idRuta: 3, orden: 2, nombre: "Sagrada Familia", latitud: 41.4036, longitud: 2.1744, tiempo: 30, descripcion: "La basílica inacabada de imponentes torres de Antoni Gaudí." }
  ]
};

function readDb(): DbSchema {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2), "utf-8");
    return defaultDb;
  }
  try {
    const data = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    return defaultDb;
  }
}

function writeDb(db: DbSchema) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Log request API details
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });

  // --- CRUD TIPO ---
  app.get("/api/tipos", (req, res) => {
    const db = readDb();
    res.json(db.tipos);
  });

  app.post("/api/tipos", (req, res) => {
    const db = readDb();
    const { nombre } = req.body;
    const id = db.tipos.reduce((max, cur) => cur.id > max ? cur.id : max, 0) + 1;
    const nuevo = { id, nombre };
    db.tipos.push(nuevo);
    writeDb(db);
    res.status(201).json(nuevo);
  });

  app.put("/api/tipos", (req, res) => {
    const db = readDb();
    const { id, nombre } = req.body;
    const idx = db.tipos.findIndex(t => t.id === Number(id));
    if (idx !== -1) {
      db.tipos[idx] = { id: Number(id), nombre };
      writeDb(db);
      res.json(db.tipos[idx]);
    } else {
      res.status(404).json({ error: "Tipo no encontrado" });
    }
  });

  app.get("/api/tipos/:id", (req, res) => {
    const db = readDb();
    const item = db.tipos.find(t => t.id === Number(req.params.id));
    if (item) {
      res.json(item);
    } else {
      res.status(404).json({ error: "Tipo no encontrado" });
    }
  });

  app.delete("/api/tipos/:id", (req, res) => {
    const db = readDb();
    const idNum = Number(req.params.id);
    const exists = db.tipos.some(t => t.id === idNum);
    if (exists) {
      db.tipos = db.tipos.filter(t => t.id !== idNum);
      writeDb(db);
      res.json({ message: "Tipo eliminado exitosamente" });
    } else {
      res.status(404).json({ error: "Tipo no encontrado" });
    }
  });

  // --- CRUD PAIS ---
  app.get("/api/paises", (req, res) => {
    const db = readDb();
    res.json(db.paises);
  });

  app.post("/api/paises", (req, res) => {
    const db = readDb();
    const { nombre, codigoAlfa2 } = req.body;
    const id = db.paises.reduce((max, cur) => cur.id > max ? cur.id : max, 0) + 1;
    const nuevo = { id, nombre, codigoAlfa2 };
    db.paises.push(nuevo);
    writeDb(db);
    res.status(201).json(nuevo);
  });

  app.put("/api/paises", (req, res) => {
    const db = readDb();
    const { id, nombre, codigoAlfa2 } = req.body;
    const idx = db.paises.findIndex(p => p.id === Number(id));
    if (idx !== -1) {
      db.paises[idx] = { id: Number(id), nombre, codigoAlfa2 };
      writeDb(db);
      res.json(db.paises[idx]);
    } else {
      res.status(404).json({ error: "Pais no encontrado" });
    }
  });

  app.get("/api/paises/:id", (req, res) => {
    const db = readDb();
    const item = db.paises.find(p => p.id === Number(req.params.id));
    if (item) {
      res.json(item);
    } else {
      res.status(404).json({ error: "Pais no encontrado" });
    }
  });

  app.delete("/api/paises/:id", (req, res) => {
    const db = readDb();
    const idNum = Number(req.params.id);
    const exists = db.paises.some(p => p.id === idNum);
    if (exists) {
      db.paises = db.paises.filter(p => p.id !== idNum);
      writeDb(db);
      res.json({ message: "Pais eliminado exitosamente" });
    } else {
      res.status(404).json({ error: "Pais no encontrado" });
    }
  });

  // --- CRUD CIUDAD ---
  app.get("/api/ciudades", (req, res) => {
    const db = readDb();
    res.json(db.ciudades);
  });

  app.post("/api/ciudades", (req, res) => {
    const db = readDb();
    const { nombre, idPais, latitud, longitud } = req.body;
    const id = db.ciudades.reduce((max, cur) => cur.id > max ? cur.id : max, 0) + 1;
    const nuevo = {
      id,
      nombre,
      idPais: Number(idPais),
      latitud: Number(latitud),
      longitud: Number(longitud)
    };
    db.ciudades.push(nuevo);
    writeDb(db);
    res.status(201).json(nuevo);
  });

  app.put("/api/ciudades", (req, res) => {
    const db = readDb();
    const { id, nombre, idPais, latitud, longitud } = req.body;
    const idx = db.ciudades.findIndex(c => c.id === Number(id));
    if (idx !== -1) {
      db.ciudades[idx] = {
        id: Number(id),
        nombre,
        idPais: Number(idPais),
        latitud: Number(latitud),
        longitud: Number(longitud)
      };
      writeDb(db);
      res.json(db.ciudades[idx]);
    } else {
      res.status(404).json({ error: "Ciudad no encontrada" });
    }
  });

  app.get("/api/ciudades/:id", (req, res) => {
    const db = readDb();
    const item = db.ciudades.find(c => c.id === Number(req.params.id));
    if (item) {
      res.json(item);
    } else {
      res.status(404).json({ error: "Ciudad no encontrada" });
    }
  });

  app.delete("/api/ciudades/:id", (req, res) => {
    const db = readDb();
    const idNum = Number(req.params.id);
    const exists = db.ciudades.some(c => c.id === idNum);
    if (exists) {
      db.ciudades = db.ciudades.filter(c => c.id !== idNum);
      writeDb(db);
      res.json({ message: "Ciudad eliminada exitosamente" });
    } else {
      res.status(404).json({ error: "Ciudad no encontrada" });
    }
  });

  // --- CRUD RUTA ---
  app.get("/api/rutas", (req, res) => {
    const db = readDb();
    res.json(db.rutas);
  });

  app.get("/api/rutas/ciudad/:idCiudad", (req, res) => {
    const db = readDb();
    const filtered = db.rutas.filter(r => r.idCiudad === Number(req.params.idCiudad));
    res.json(filtered);
  });

  app.post("/api/rutas", (req, res) => {
    const db = readDb();
    const { nombre, idTipo, idCiudad, descripcion } = req.body;
    const id = db.rutas.reduce((max, cur) => cur.id > max ? cur.id : max, 0) + 1;
    const nuevo = {
      id,
      nombre,
      idTipo: Number(idTipo),
      idCiudad: Number(idCiudad),
      descripcion
    };
    db.rutas.push(nuevo);
    writeDb(db);
    res.status(201).json(nuevo);
  });

  app.put("/api/rutas", (req, res) => {
    const db = readDb();
    const { id, nombre, idTipo, idCiudad, descripcion } = req.body;
    const idx = db.rutas.findIndex(r => r.id === Number(id));
    if (idx !== -1) {
      db.rutas[idx] = {
        id: Number(id),
        nombre,
        idTipo: Number(idTipo),
        idCiudad: Number(idCiudad),
        descripcion
      };
      writeDb(db);
      res.json(db.rutas[idx]);
    } else {
      res.status(404).json({ error: "Ruta no encontrada" });
    }
  });

  app.get("/api/rutas/:id", (req, res) => {
    const db = readDb();
    const item = db.rutas.find(r => r.id === Number(req.params.id));
    if (item) {
      res.json(item);
    } else {
      res.status(404).json({ error: "Ruta no encontrada" });
    }
  });

  app.delete("/api/rutas/:id", (req, res) => {
    const db = readDb();
    const idNum = Number(req.params.id);
    const exists = db.rutas.some(r => r.id === idNum);
    if (exists) {
      db.rutas = db.rutas.filter(r => r.id !== idNum);
      // clean up orphaned stops as well to keep data clean
      db.paradas = db.paradas.filter(p => p.idRuta !== idNum);
      writeDb(db);
      res.json({ message: "Ruta eliminada exitosamente" });
    } else {
      res.status(404).json({ error: "Ruta no encontrada" });
    }
  });

  // --- CRUD PARADA ---
  app.get("/api/paradas", (req, res) => {
    const db = readDb();
    res.json(db.paradas);
  });

  app.get("/api/paradas/ruta/:idRuta", (req, res) => {
    const db = readDb();
    const filtered = db.paradas.filter(p => p.idRuta === Number(req.params.idRuta));
    // Must list sorted by field 'orden'
    filtered.sort((a, b) => a.orden - b.orden);
    res.json(filtered);
  });

  app.post("/api/paradas", (req, res) => {
    const db = readDb();
    const { nombre, orden, idRuta, latitud, longitud, tiempo, descripcion } = req.body;
    const id = db.paradas.reduce((max, cur) => cur.id > max ? cur.id : max, 0) + 1;
    const nuevo = {
      id,
      nombre,
      orden: Number(orden),
      idRuta: Number(idRuta),
      latitud: Number(latitud),
      longitud: Number(longitud),
      tiempo: Number(tiempo),
      descripcion
    };
    db.paradas.push(nuevo);
    writeDb(db);
    res.status(201).json(nuevo);
  });

  app.put("/api/paradas", (req, res) => {
    const db = readDb();
    const { id, nombre, orden, idRuta, latitud, longitud, tiempo, descripcion } = req.body;
    const idx = db.paradas.findIndex(p => p.id === Number(id));
    if (idx !== -1) {
      db.paradas[idx] = {
        id: Number(id),
        nombre,
        orden: Number(orden),
        idRuta: Number(idRuta),
        latitud: Number(latitud),
        longitud: Number(longitud),
        tiempo: Number(tiempo),
        descripcion
      };
      writeDb(db);
      res.json(db.paradas[idx]);
    } else {
      res.status(404).json({ error: "Parada no encontrada" });
    }
  });

  app.get("/api/paradas/:id", (req, res) => {
    const db = readDb();
    const item = db.paradas.find(p => p.id === Number(req.params.id));
    if (item) {
      res.json(item);
    } else {
      res.status(404).json({ error: "Parada no encontrada" });
    }
  });

  app.delete("/api/paradas/:id", (req, res) => {
    const db = readDb();
    const idNum = Number(req.params.id);
    const exists = db.paradas.some(p => p.id === idNum);
    if (exists) {
      db.paradas = db.paradas.filter(p => p.id !== idNum);
      writeDb(db);
      res.json({ message: "Parada eliminada exitosamente" });
    } else {
      res.status(404).json({ error: "Parada no encontrada" });
    }
  });

  // --- VITE MIDDLEWARE OR STATIC FILES ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server", err);
});
