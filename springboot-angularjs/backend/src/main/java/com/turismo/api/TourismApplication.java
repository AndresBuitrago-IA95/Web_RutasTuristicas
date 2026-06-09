package com.turismo.api;

import com.turismo.api.model.Ciudad;
import com.turismo.api.model.Ruta;
import com.turismo.api.model.Parada;
import com.turismo.api.repository.CiudadRepository;
import com.turismo.api.repository.RutaRepository;
import com.turismo.api.repository.ParadaRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@SpringBootApplication
public class TourismApplication {

    public static void main(String[] args) {
        SpringApplication.run(TourismApplication.class, args);
    }

    // Configuración global de CORS para permitir peticiones desde AngularJS (puerto 3000, etc.)
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins("*")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*");
            }
        };
    }

    // Semilla inicial de datos para pruebas rápidas
    @Bean
    public CommandLineRunner initData(
            CiudadRepository ciudadRepository,
            RutaRepository rutaRepository,
            ParadaRepository paradaRepository) {
        return args -> {
            if (ciudadRepository.count() == 0) {
                // Crear Ciudades
                Ciudad medellin = ciudadRepository.save(new Ciudad("Medellín", 6.2442, -75.5812));
                Ciudad bogota = ciudadRepository.save(new Ciudad("Bogotá", 4.7110, -74.0721));
                Ciudad barcelona = ciudadRepository.save(new Ciudad("Barcelona", 41.3851, 2.1734));

                // Crear Rutas para Medellín
                Ruta rutaRio = rutaRepository.save(new Ruta("Recorrido de Parques del Río", "Caminata ecológica por la ribera del río Medellín.", medellin));
                Ruta rutaGraffiti = rutaRepository.save(new Ruta("Tour Graffiti Comuna 13", "Inmersión artística e histórica en el arte urbano.", medellin));

                // Crear Rutas para Barcelona
                Ruta rutaGaudi = rutaRepository.save(new Ruta("Tour Gaudí del Modernismo", "Admira las impresionantes obras arquitectónicas de Antoni Gaudí.", barcelona));

                // Crear Paradas para 'Recorrido de Parques del Río' (Medellín)
                paradaRepository.save(new Parada("Teatro Metropolitano", 1, 6.2422, -75.5786, 10, "Punto de encuentro al costado del auditorio.", rutaRio));
                paradaRepository.save(new Parada("Plaza de la Libertad", 2, 6.2435, -75.5768, 15, "Espacio cívico rodeado de arquitectura moderna.", rutaRio));

                // Crear Paradas para 'Tour Gaudí del Modernismo' (Barcelona)
                paradaRepository.save(new Parada("Casa Batlló", 1, 41.3916, 2.1649, 20, "Increíbles formas marinas diseñadas por Gaudí.", rutaGaudi));
                paradaRepository.save(new Parada("Sagrada Familia", 2, 41.4036, 2.1744, 30, "La basílica inacabada e imponente del arquitecto.", rutaGaudi));

                System.out.println(">>> Base de datos pre-sembrada con éxito en el H2 en memoria!");
            }
        };
    }
}
