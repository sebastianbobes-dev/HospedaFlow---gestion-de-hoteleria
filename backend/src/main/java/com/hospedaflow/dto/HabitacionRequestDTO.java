package com.hospedaflow.dto;

import com.hospedaflow.model.enums.EstadoHabitacion;
import java.util.List;

/**
 * HabitacionRequestDTO (Sección 5.3 & US-3.1)
 * Objeto plano de transferencia para registro y actualización de habitaciones.
 */
public class HabitacionRequestDTO {
    private String numero;
    private String tipo;
    private double precioBase;
    private int capacidad;
    private EstadoHabitacion estado;
    private String descripcion;
    private List<String> caracteristicas;
    private int piso = 1;

    public HabitacionRequestDTO() {}

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
