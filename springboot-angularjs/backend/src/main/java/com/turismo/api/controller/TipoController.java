package com.turismo.api.controller;

import com.turismo.api.model.Tipo;
import com.turismo.api.repository.TipoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tipos")
@CrossOrigin(origins = "*")
public class TipoController {

    @Autowired
    private TipoRepository tipoRepository;

    @GetMapping
    public List<Tipo> getAll() {
        return tipoRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Tipo> getById(@PathVariable Long id) {
        return tipoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Tipo> create(@RequestBody Tipo tipo) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tipoRepository.save(tipo));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Tipo> update(@PathVariable Long id, @RequestBody Tipo details) {
        var opt = tipoRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        Tipo tipo = opt.get();
        tipo.setNombre(details.getNombre());
        return ResponseEntity.ok(tipoRepository.save(tipo));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (tipoRepository.existsById(id)) {
            tipoRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
