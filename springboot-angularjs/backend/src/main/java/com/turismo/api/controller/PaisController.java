package com.turismo.api.controller;

import com.turismo.api.model.Pais;
import com.turismo.api.repository.PaisRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/paises")
@CrossOrigin(origins = "*")
public class PaisController {

    @Autowired
    private PaisRepository paisRepository;

    @GetMapping
    public List<Pais> getAll() {
        return paisRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pais> getById(@PathVariable Long id) {
        return paisRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Pais> create(@RequestBody Pais pais) {
        return ResponseEntity.status(HttpStatus.CREATED).body(paisRepository.save(pais));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Pais> update(@PathVariable Long id, @RequestBody Pais details) {
        var opt = paisRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        Pais pais = opt.get();
        pais.setNombre(details.getNombre());
        pais.setCodigoAlfa2(details.getCodigoAlfa2());
        return ResponseEntity.ok(paisRepository.save(pais));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (paisRepository.existsById(id)) {
            paisRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
