package com.turismo.api.repository;

import com.turismo.api.model.Parada;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ParadaRepository extends JpaRepository<Parada, Long> {
    List<Parada> findByRutaIdOrderByOrdenAsc(Long idRuta);
}
