package com.turismo.api.controller;

import com.turismo.api.model.Ciudad;
import com.turismo.api.model.Ruta;
import com.turismo.api.repository.CiudadRepository;
import com.turismo.api.repository.RutaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/rutas")
@CrossOrigin(origins = "*")
public class RutaController {

    @Autowired
    private RutaRepository rutaRepository;

    @Autowired
    private CiudadRepository ciudadRepository;

    @GetMapping
    public List<Ruta> getAllRutas() {
        return rutaRepository.findAll();
    }

    @GetMapping("/ciudad/{idCiudad}")
    public List<Ruta> getRutasByCiudad(@PathVariable Long idCiudad) {
        return rutaRepository.findByCiudadId(idCiudad);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ruta> getRutaById(@PathVariable Long id) {
        return rutaRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createRuta(@RequestBody RutaRequest rutaRequest) {
        return ciudadRepository.findById(rutaRequest.getIdCiudad())
                .map(ciudad -> {
                    Ruta ruta = new Ruta();
                    ruta.setNombre(rutaRequest.getNombre());
                    ruta.setDescripcion(rutaRequest.getDescripcion());
                    ruta.setCiudad(ciudad);
                    Ruta saved = rutaRepository.save(ruta);
                    return ResponseEntity.status(HttpStatus.CREATED).body(saved);
                })
                .orElse(ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Ciudad con ID " + rutaRequest.getIdCiudad() + " no encontrada."));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateRuta(@PathVariable Long id, @RequestBody RutaRequest rutaRequest) {
        return rutaRepository.findById(id)
                .map(ruta -> {
                    ruta.setNombre(rutaRequest.getNombre());
                    ruta.setDescripcion(rutaRequest.getDescripcion());
                    if (rutaRequest.getIdCiudad() != null) {
                        ciudadRepository.findById(rutaRequest.getIdCiudad()).ifPresent(ruta::setCiudad);
                    }
                    Ruta updated = rutaRepository.save(ruta);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRuta(@PathVariable Long id) {
        return rutaRepository.findById(id)
                .map(ruta -> {
                    rutaRepository.delete(ruta);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // DTO auxiliar para recibir los datos de transferencia del cliente
    public static class RutaRequest {
        private String nombre;
        private String descripcion;
        private Long idCiudad;

        public RutaRequest() {}

        public String getNombre() {
            return nombre;
        }

        public void setNombre(String nombre) {
            this.nombre = nombre;
        }

        public String getDescripcion() {
            return descripcion;
        }

        public void setDescripcion(String descripcion) {
            this.descripcion = descripcion;
        }

        public Long getIdCiudad() {
            return idCiudad;
        }

        public void setIdCiudad(Long idCiudad) {
            this.idCiudad = idCiudad;
        }
    }
}
