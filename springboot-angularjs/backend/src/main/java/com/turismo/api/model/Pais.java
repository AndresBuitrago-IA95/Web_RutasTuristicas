package com.turismo.api.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pais")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Pais {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "nombre", nullable = false, length = 50)
    private String nombre;

    @Column(name = "codigoalfa2", nullable = false, length = 5)
    private String codigoAlfa2;

    @OneToMany(mappedBy = "pais", cascade = CascadeType.ALL)
    @JsonIgnoreProperties("pais")
    private List<Ciudad> ciudades = new ArrayList<>();

    public Pais() {}

    public Pais(String nombre, String codigoAlfa2) {
        this.nombre = nombre;
        this.codigoAlfa2 = codigoAlfa2;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getCodigoAlfa2() { return codigoAlfa2; }
    public void setCodigoAlfa2(String codigoAlfa2) { this.codigoAlfa2 = codigoAlfa2; }

    public List<Ciudad> getCiudades() { return ciudades; }
    public void setCiudades(List<Ciudad> ciudades) { this.ciudades = ciudades; }
}
