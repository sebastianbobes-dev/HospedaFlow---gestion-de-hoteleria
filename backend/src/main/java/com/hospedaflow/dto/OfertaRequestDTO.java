package com.hospedaflow.dto;

/**
 * OfertaRequestDTO (Sección 5.3 & US-3.1)
 * Objeto plano de transferencia para la creación y edición de ofertas comerciales.
 */
public class OfertaRequestDTO {
    private String titulo;
    private String descripcion;
    private String codigo;
    private int porcentajeDescuento;
    private String fechaInicio;
    private String fechaFin;
    private String habitacionTipo;
    private Boolean activa;

    public OfertaRequestDTO() {}

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

    public Boolean getActiva() { return activa; }
    public void setActiva(Boolean activa) { this.activa = activa; }
}
