package com.hospedaflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * HospedaFlowApplication - Clase Principal Spring Boot
 * Backend del Sistema de Gestión para Hoteles Pequeños y Medianos (Sprint 1)
 */
@SpringBootApplication
public class HospedaFlowApplication {

    public static void main(String[] args) {
        SpringApplication.run(HospedaFlowApplication.class, args);
        System.out.println(">>> [HospedaFlow] Backend Spring Boot iniciado con éxito en el puerto 8080 <<<");
    }
}
