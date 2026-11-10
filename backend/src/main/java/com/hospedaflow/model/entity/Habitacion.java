package com.hospedaflow.model.entity;

import com.hospedaflow.model.enums.EstadoHabitacion;
import java.util.ArrayList;
import java.util.List;

/**
 * Entidad Habitacion (Sección 3.3 del Documento Técnico)
 * Modela las características físicas y operativas de los espacios hoteleros.
 */
public class Habitacion {
    private String id;
    private String numero;
    private String tipo;
    private double precioBase;
    private int capacidad;
    private EstadoHabitacion estado;
    private String descripcion;
    private List<String> caracteristicas = new ArrayList<>();
    private int piso = 1;

    public Habitacion() {}

    public Habitacion(String id, String numero, String tipo, double precioBase, int capacidad, EstadoHabitacion estado, String descripcion, List<String> caracteristicas, int piso) {
        this.id = id;
        this.numero = numero;
        this.tipo = tipo;
        this.precioBase = precioBase;
        this.capacidad = capacidad;
        this.estado = estado;
        this.descripcion = descripcion;
        if (caracteristicas != null) this.caracteristicas = caracteristicas;
        this.piso = piso;
    }

    public void cambiarEstado(EstadoHabitacion nuevoEstado) {
        this.estado = nuevoEstado;
    }

    public boolean esDisponible() {
        return this.estado == EstadoHabitacion.Disponible;
    }

    // Getters y Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getNumero() { return numero; }
    public void setNumero(String numero) { this.numero = numero; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public double getPrecioBase() { return precioBase; }
    public void setPrecioBase(double precioBase) { this.precioBase = precioBase; }

    public int getCapacidad() { return capacidad; }
    public void setCapacidad(int capacidad) { this.capacidad = capacidad; }

    public EstadoHabitacion getEstado() { return estado; }
    public void setEstado(EstadoHabitacion estado) { this.estado = estado; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public List<String> getCaracteristicas() { return caracteristicas; }
    public void setCaracteristicas(List<String> caracteristicas) { this.caracteristicas = caracteristicas; }

    public int getPiso() { return piso; }
    public void setPiso(int piso) { this.piso = piso; }
}
