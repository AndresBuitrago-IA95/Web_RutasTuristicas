package com.turismo.api.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
@Table(name = "paradas")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Parada {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(nullable = false)
    private Integer orden;

    private Double latitud;
    private Double longitud;

    private Integer tiempo; // tiempo en minutos

    @Column(length = 500)
    private String descripcion;

    // Relación ManyToOne: Muchas paradas pertenecen a una sola ruta turística
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_ruta", nullable = false)
    @JsonIgnoreProperties("paradas") // Evita ciclo infinito
    private Ruta ruta;

    // Constructores
    public Parada() {}

    public Parada(String nombre, Integer orden, Double latitud, Double longitud, Integer tiempo, String descripcion, Ruta ruta) {
        this.nombre = nombre;
        this.orden = orden;
        this.latitud = latitud;
        this.longitud = longitud;
        this.tiempo = tiempo;
        this.descripcion = descripcion;
        this.ruta = ruta;
    }

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public Ruta getRuta() {
        return ruta;
    }

    public void setRuta(Ruta ruta) {
        this.ruta = ruta;
    }
}
