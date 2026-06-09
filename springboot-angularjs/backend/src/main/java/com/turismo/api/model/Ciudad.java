package com.turismo.api.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ciudad")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Ciudad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "nombre", nullable = false, length = 50)
    private String nombre;

    @Column(name = "longitud", nullable = false)
    private Double longitud;

    @Column(name = "latitud", nullable = false)
    private Double latitud;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idpais", nullable = false)
    @JsonIgnoreProperties("ciudades")
    private Pais pais;

    @OneToMany(mappedBy = "ciudad", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("ciudad")
    private List<Ruta> rutas = new ArrayList<>();

    public Ciudad() {}

    public Ciudad(String nombre, Double latitud, Double longitud, Pais pais) {
        this.nombre = nombre;
        this.latitud = latitud;
        this.longitud = longitud;
        this.pais = pais;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public Double getLatitud() { return latitud; }
    public void setLatitud(Double latitud) { this.latitud = latitud; }

    public Double getLongitud() { return longitud; }
    public void setLongitud(Double longitud) { this.longitud = longitud; }

    public Pais getPais() { return pais; }
    public void setPais(Pais pais) { this.pais = pais; }

    public List<Ruta> getRutas() { return rutas; }
    public void setRutas(List<Ruta> rutas) { this.rutas = rutas; }
}
