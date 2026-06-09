package com.turismo.api.controller;

import com.turismo.api.model.Parada;
import com.turismo.api.model.Ruta;
import com.turismo.api.repository.ParadaRepository;
import com.turismo.api.repository.RutaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/paradas")
@CrossOrigin(origins = "*")
public class ParadaController {

    @Autowired
    private ParadaRepository paradaRepository;

    @Autowired
    private RutaRepository rutaRepository;

    // --- DTO de respuesta aplanado para el frontend ---
    public static class ParadaResponse {
        public Long id;
        public String nombre;
        public Integer orden;
        public Long idRuta;
        public Double latitud;
        public Double longitud;
        public Integer tiempo;
        public String descripcion;

        public ParadaResponse(Parada p) {
            this.id = p.getId();
            this.nombre = p.getNombre();
            this.orden = p.getOrden();
            this.idRuta = p.getRuta() != null ? p.getRuta().getId() : null;
            this.latitud = p.getLatitud();
            this.longitud = p.getLongitud();
            this.tiempo = p.getTiempo();
            this.descripcion = p.getDescripcion();
        }
    }

    @GetMapping
    public List<ParadaResponse> getAllParadas() {
        return paradaRepository.findAll().stream()
                .map(ParadaResponse::new)
                .collect(Collectors.toList());
    }

    @GetMapping("/ruta/{idRuta}")
    public List<ParadaResponse> getParadasByRuta(@PathVariable Long idRuta) {
        return paradaRepository.findByRutaIdOrderByOrdenAsc(idRuta).stream()
                .map(ParadaResponse::new)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ParadaResponse> getParadaById(@PathVariable Long id) {
        return paradaRepository.findById(id)
                .map(p -> ResponseEntity.ok(new ParadaResponse(p)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createParada(@RequestBody ParadaRequest req) {
        var optionalRuta = rutaRepository.findById(req.getIdRuta());
        if (optionalRuta.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Ruta con ID " + req.getIdRuta() + " no encontrada.");
        }

        Ruta ruta = optionalRuta.get();
        Parada parada = new Parada();
        parada.setNombre(req.getNombre());
        parada.setOrden(req.getOrden());
        parada.setLatitud(req.getLatitud());
        parada.setLongitud(req.getLongitud());
        parada.setTiempo(req.getTiempo());
        parada.setDescripcion(req.getDescripcion());
        parada.setRuta(ruta);
        Parada saved = paradaRepository.save(parada);
        return ResponseEntity.status(HttpStatus.CREATED).body(new ParadaResponse(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateParada(@PathVariable Long id, @RequestBody ParadaRequest req) {
        return paradaRepository.findById(id)
                .map(parada -> {
                    parada.setNombre(req.getNombre());
                    parada.setOrden(req.getOrden());
                    parada.setLatitud(req.getLatitud());
                    parada.setLongitud(req.getLongitud());
                    parada.setTiempo(req.getTiempo());
                    parada.setDescripcion(req.getDescripcion());
                    if (req.getIdRuta() != null) {
                        rutaRepository.findById(req.getIdRuta()).ifPresent(parada::setRuta);
                    }
                    Parada updated = paradaRepository.save(parada);
                    return ResponseEntity.ok(new ParadaResponse(updated));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteParada(@PathVariable Long id) {
        if (paradaRepository.existsById(id)) {
            paradaRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // DTO de entrada
    public static class ParadaRequest {
        private String nombre;
        private Integer orden;
        private Long idRuta;
        private Double latitud;
        private Double longitud;
        private Integer tiempo;
        private String descripcion;

        public ParadaRequest() {}

        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }
        public Integer getOrden() { return orden; }
        public void setOrden(Integer orden) { this.orden = orden; }
        public Long getIdRuta() { return idRuta; }
        public void setIdRuta(Long idRuta) { this.idRuta = idRuta; }
        public Double getLatitud() { return latitud; }
        public void setLatitud(Double latitud) { this.latitud = latitud; }
        public Double getLongitud() { return longitud; }
        public void setLongitud(Double longitud) { this.longitud = longitud; }
        public Integer getTiempo() { return tiempo; }
        public void setTiempo(Integer tiempo) { this.tiempo = tiempo; }
        public String getDescripcion() { return descripcion; }
        public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    }
}
