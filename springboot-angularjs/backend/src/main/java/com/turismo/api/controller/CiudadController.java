package com.turismo.api.controller;

import com.turismo.api.model.Ciudad;
import com.turismo.api.repository.CiudadRepository;
import com.turismo.api.repository.PaisRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/ciudades")
@CrossOrigin(origins = "*")
public class CiudadController {

    @Autowired
    private CiudadRepository ciudadRepository;

    @Autowired
    private PaisRepository paisRepository;

    @GetMapping
    public List<Ciudad> getAllCiudades() {
        return ciudadRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ciudad> getCiudadById(@PathVariable Long id) {
        return ciudadRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createCiudad(@RequestBody CiudadRequest req) {
        var optPais = paisRepository.findById(req.getIdPais());
        if (optPais.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("País con ID " + req.getIdPais() + " no encontrado.");
        }
        Ciudad ciudad = new Ciudad(req.getNombre(), req.getLatitud(), req.getLongitud(), optPais.get());
        return ResponseEntity.status(HttpStatus.CREATED).body(ciudadRepository.save(ciudad));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCiudad(@PathVariable Long id, @RequestBody CiudadRequest req) {
        var optCiudad = ciudadRepository.findById(id);
        if (optCiudad.isEmpty()) return ResponseEntity.notFound().build();

        Ciudad ciudad = optCiudad.get();
        ciudad.setNombre(req.getNombre());
        ciudad.setLatitud(req.getLatitud());
        ciudad.setLongitud(req.getLongitud());
        if (req.getIdPais() != null) {
            paisRepository.findById(req.getIdPais()).ifPresent(ciudad::setPais);
        }
        return ResponseEntity.ok(ciudadRepository.save(ciudad));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCiudad(@PathVariable Long id) {
        if (ciudadRepository.existsById(id)) {
            ciudadRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // DTO
    public static class CiudadRequest {
        private String nombre;
        private Double latitud;
        private Double longitud;
        private Long idPais;

        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }
        public Double getLatitud() { return latitud; }
        public void setLatitud(Double latitud) { this.latitud = latitud; }
        public Double getLongitud() { return longitud; }
        public void setLongitud(Double longitud) { this.longitud = longitud; }
        public Long getIdPais() { return idPais; }
        public void setIdPais(Long idPais) { this.idPais = idPais; }
    }
}
