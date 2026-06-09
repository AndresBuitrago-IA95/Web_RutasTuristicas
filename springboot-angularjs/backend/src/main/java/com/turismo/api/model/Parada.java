package com.turismo.api.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
@Table(name = "parada")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Parada {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "orden", nullable = false)
    private Integer orden;

    @Column(name = "nombre", nullable = false, length = 50)
    private String nombre;

    @Column(name = "longitud", nullable = false)
    private Double longitud;

    @Column(name = "latitud", nullable = false)
    private Double latitud;

    @Column(name = "tiempo")
    private Integer tiempo;

    @Column(name = "descripcion")
    private String descripcion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idruta", nullable = false)
    @JsonIgnoreProperties("paradas")
    private Ruta ruta;

    public Parada() {}

    public Parada(Integer orden, String nombre, Double latitud, Double longitud, Integer tiempo, String descripcion, Ruta ruta) {
        this.orden = orden;
        this.nombre = nombre;
        this.latitud = latitud;
        this.longitud = longitud;
        this.tiempo = tiempo;
        this.descripcion = descripcion;
        this.ruta = ruta;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getOrden() { return orden; }
    public void setOrden(Integer orden) { this.orden = orden; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public Double getLatitud() { return latitud; }
    public void setLatitud(Double latitud) { this.latitud = latitud; }

    public Double getLongitud() { return longitud; }
    public void setLongitud(Double longitud) { this.longitud = longitud; }

    public Integer getTiempo() { return tiempo; }
    public void setTiempo(Integer tiempo) { this.tiempo = tiempo; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public Ruta getRuta() { return ruta; }
    public void setRuta(Ruta ruta) { this.ruta = ruta; }
}
