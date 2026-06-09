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

@RestController
@RequestMapping("/api/paradas")
@CrossOrigin(origins = "*")
public class ParadaController {

    @Autowired
    private ParadaRepository paradaRepository;

    @Autowired
    private RutaRepository rutaRepository;

    @GetMapping
    public List<Parada> getAllParadas() {
        return paradaRepository.findAll();
    }

    @GetMapping("/ruta/{idRuta}")
    public List<Parada> getParadasByRuta(@PathVariable Long idRuta) {
        // Retorna las paradas ordenadas de forma ascendente por el campo 'orden'
        return paradaRepository.findByRutaIdOrderByOrdenAsc(idRuta);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Parada> getParadaById(@PathVariable Long id) {
        return paradaRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createParada(@RequestBody ParadaRequest req) {
        return rutaRepository.findById(req.getIdRuta())
                .map(ruta -> {
                    Parada parada = new Parada();
                    parada.setNombre(req.getNombre());
                    parada.setOrden(req.getOrden());
                    parada.setLatitud(req.getLatitud());
                    parada.setLongitud(req.getLongitud());
                    parada.setTiempo(req.getTiempo());
                    parada.setDescripcion(req.getDescripcion());
                    parada.setRuta(ruta);
                    Parada saved = paradaRepository.save(parada);
                    return ResponseEntity.status(HttpStatus.CREATED).body(saved);
                })
                .orElse(ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Ruta con ID " + req.getIdRuta() + " no encontrada."));
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
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteParada(@PathVariable Long id) {
        return paradaRepository.findById(id)
                .map(parada -> {
                    paradaRepository.delete(parada);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // DTO auxiliar para recibir los datos de transferencia del cliente
    public static class ParadaRequest {
        private String nombre;
        private Integer orden;
        private Long idRuta;
        private Double latitud;
        private Double longitud;
        private Integer tiempo;
        private String descripcion;

        public ParadaRequest() {}

        public String getNombre() {
            return nombre;
        }

        public void setNombre(String nombre) {
            this.nombre = nombre;
        }

        public Integer getOrden() {
            return orden;
        }

        public void setOrden(Integer orden) {
            this.orden = orden;
        }

        public Long getIdRuta() {
            return idRuta;
        }

        public void setIdRuta(Long idRuta) {
            this.idRuta = idRuta;
        }

        public Double getLatitud() {
            return latitud;
        }

        public void setLatitud(Double latitud) {
            this.latitud = latitud;
        }

        public Double getLongitud() {
            return longitud;
        }

        public void setLongitud(Double longitud) {
            this.longitud = longitud;
        }

        public Integer getTiempo() {
            return tiempo;
        }

        public void setTiempo(Integer tiempo) {
            this.tiempo = tiempo;
        }

        public String getDescripcion() {
            return descripcion;
        }

        public void setDescripcion(String descripcion) {
            this.descripcion = descripcion;
        }
    }
}
