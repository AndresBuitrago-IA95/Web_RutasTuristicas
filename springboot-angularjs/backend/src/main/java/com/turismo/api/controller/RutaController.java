package com.turismo.api.controller;

import com.turismo.api.model.Ruta;
import com.turismo.api.repository.CiudadRepository;
import com.turismo.api.repository.RutaRepository;
import com.turismo.api.repository.TipoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/rutas")
@CrossOrigin(origins = "*")
public class RutaController {

    @Autowired
    private RutaRepository rutaRepository;

    @Autowired
    private CiudadRepository ciudadRepository;

    @Autowired
    private TipoRepository tipoRepository;

    // --- DTO de respuesta aplanado para el frontend ---
    public static class RutaResponse {
        public Long id;
        public String nombre;
        public String descripcion;
        public Long idCiudad;
        public Long idTipo;

        public RutaResponse(Ruta r) {
            this.id = r.getId();
            this.nombre = r.getNombre();
            this.descripcion = r.getDescripcion();
            this.idCiudad = r.getCiudad() != null ? r.getCiudad().getId() : null;
            this.idTipo = r.getTipo() != null ? r.getTipo().getId() : null;
        }
    }

    @GetMapping
    public List<RutaResponse> getAllRutas() {
        return rutaRepository.findAll().stream()
                .map(RutaResponse::new)
                .collect(Collectors.toList());
    }

    @GetMapping("/ciudad/{idCiudad}")
    public List<RutaResponse> getRutasByCiudad(@PathVariable Long idCiudad) {
        return rutaRepository.findByCiudadId(idCiudad).stream()
                .map(RutaResponse::new)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RutaResponse> getRutaById(@PathVariable Long id) {
        return rutaRepository.findById(id)
                .map(r -> ResponseEntity.ok(new RutaResponse(r)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createRuta(@RequestBody RutaRequest req) {
        var optCiudad = ciudadRepository.findById(req.getIdCiudad());
        if (optCiudad.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Ciudad con ID " + req.getIdCiudad() + " no encontrada.");
        }
        var optTipo = tipoRepository.findById(req.getIdTipo());
        if (optTipo.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Tipo con ID " + req.getIdTipo() + " no encontrado.");
        }
        Ruta ruta = new Ruta(req.getNombre(), req.getDescripcion(), optCiudad.get(), optTipo.get());
        return ResponseEntity.status(HttpStatus.CREATED).body(new RutaResponse(rutaRepository.save(ruta)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateRuta(@PathVariable Long id, @RequestBody RutaRequest req) {
        var optRuta = rutaRepository.findById(id);
        if (optRuta.isEmpty()) return ResponseEntity.notFound().build();

        Ruta ruta = optRuta.get();
        ruta.setNombre(req.getNombre());
        ruta.setDescripcion(req.getDescripcion());
        if (req.getIdCiudad() != null) {
            ciudadRepository.findById(req.getIdCiudad()).ifPresent(ruta::setCiudad);
        }
        if (req.getIdTipo() != null) {
            tipoRepository.findById(req.getIdTipo()).ifPresent(ruta::setTipo);
        }
        return ResponseEntity.ok(new RutaResponse(rutaRepository.save(ruta)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRuta(@PathVariable Long id) {
        if (rutaRepository.existsById(id)) {
            rutaRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // DTO de entrada
    public static class RutaRequest {
        private String nombre;
        private String descripcion;
        private Long idCiudad;
        private Long idTipo;

        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }
        public String getDescripcion() { return descripcion; }
        public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
        public Long getIdCiudad() { return idCiudad; }
        public void setIdCiudad(Long idCiudad) { this.idCiudad = idCiudad; }
        public Long getIdTipo() { return idTipo; }
        public void setIdTipo(Long idTipo) { this.idTipo = idTipo; }
    }
}
