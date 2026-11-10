package com.hospedaflow.model.entity;

/**
 * Entidad Oferta (Sección 3.3 del Documento Técnico)
 * Representa promociones comerciales vinculadas a habitaciones.
 */
public class Oferta {
    private String id;
    private String titulo;
    private String descripcion;
    private String codigo;
    private int porcentajeDescuento;
    private String fechaInicio;
    private String fechaFin;
    private String habitacionTipo;
    private boolean activa = true;

    public Oferta() {}

    public Oferta(String id, String titulo, String descripcion, String codigo, int porcentajeDescuento, String fechaInicio, String fechaFin, String habitacionTipo, boolean activa) {
        this.id = id;
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.codigo = codigo;
        this.porcentajeDescuento = porcentajeDescuento;
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
        this.habitacionTipo = habitacionTipo;
        this.activa = activa;
    }

    public boolean esVigente(String fecha) {
        if (!activa) return false;
        if (fecha == null) return false;
        return fecha.compareTo(fechaInicio) >= 0 && fecha.compareTo(fechaFin) <= 0;
    }

    public double calcularDescuento(double subtotal) {
        if (!activa || porcentajeDescuento <= 0) return 0.0;
        return (subtotal * porcentajeDescuento) / 100.0;
    }

    // Getters y Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }

    public int getPorcentajeDescuento() { return porcentajeDescuento; }
    public void setPorcentajeDescuento(int porcentajeDescuento) { this.porcentajeDescuento = porcentajeDescuento; }

    public String getFechaInicio() { return fechaInicio; }
    public void setFechaInicio(String fechaInicio) { this.fechaInicio = fechaInicio; }

    public String getFechaFin() { return fechaFin; }
    public void setFechaFin(String fechaFin) { this.fechaFin = fechaFin; }

    public String getHabitacionTipo() { return habitacionTipo; }
    public void setHabitacionTipo(String habitacionTipo) { this.habitacionTipo = habitacionTipo; }

    public boolean isActiva() { return activa; }
    public void setActiva(boolean activa) { this.activa = activa; }
}
