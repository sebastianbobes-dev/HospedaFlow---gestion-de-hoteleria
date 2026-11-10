package com.hospedaflow.model.entity;

import com.hospedaflow.model.enums.EstadoReserva;

/**
 * Entidad Central Reserva (Sección 3.3 del Documento Técnico)
 * Une al huésped, la habitación asignada y la oferta aplicada.
 * Soporta métodos de negocio locales como confirmar(), cancelar(), modificarFechas() y asignarHabitacion().
 */
public class Reserva {
    private String id;
    private String codigoReserva;
    private String huespedId;
    private String huespedNombre;
    private String huespedEmail;
    private String huespedTelefono;
    private String habitacionId;
    private String habitacionNumero;
    private String habitacionTipo;
    private String fechaEntrada;
    private String fechaSalida;
    private int numNoches;
    private int numHuespedes;
    private double precioNoche;
    private String ofertaId;
    private String ofertaCodigo;
    private double descuentoAplicado;
    private double precioTotal;
    private EstadoReserva estado;
    private String notas;
    private String fechaRegistro;

    public Reserva() {}

    public Reserva(String id, String codigoReserva, String huespedId, String huespedNombre, String huespedEmail, String huespedTelefono, String habitacionId, String habitacionNumero, String habitacionTipo, String fechaEntrada, String fechaSalida, int numNoches, int numHuespedes, double precioNoche, String ofertaId, String ofertaCodigo, double descuentoAplicado, double precioTotal, EstadoReserva estado, String notas, String fechaRegistro) {
        this.id = id;
        this.codigoReserva = codigoReserva;
        this.huespedId = huespedId;
        this.huespedNombre = huespedNombre;
        this.huespedEmail = huespedEmail;
        this.huespedTelefono = huespedTelefono;
        this.habitacionId = habitacionId;
        this.habitacionNumero = habitacionNumero;
        this.habitacionTipo = habitacionTipo;
        this.fechaEntrada = fechaEntrada;
        this.fechaSalida = fechaSalida;
        this.numNoches = numNoches;
        this.numHuespedes = numHuespedes;
        this.precioNoche = precioNoche;
        this.ofertaId = ofertaId;
        this.ofertaCodigo = ofertaCodigo;
        this.descuentoAplicado = descuentoAplicado;
        this.precioTotal = precioTotal;
        this.estado = estado;
        this.notas = notas;
        this.fechaRegistro = fechaRegistro;
    }

    public void confirmar() {
        this.estado = EstadoReserva.Confirmada;
    }

    public void cancelar(String motivo) {
        this.estado = EstadoReserva.Cancelada;
        if (motivo != null && !motivo.trim().isEmpty()) {
            this.notas = (this.notas == null || this.notas.isEmpty()) ? "Cancelación: " + motivo : this.notas + " | Cancelación: " + motivo;
        }
    }

    public void modificarFechas(String nuevaEntrada, String nuevaSalida, int nuevasNoches, double nuevoTotal) {
        this.fechaEntrada = nuevaEntrada;
        this.fechaSalida = nuevaSalida;
        this.numNoches = nuevasNoches;
        this.precioTotal = nuevoTotal;
    }

    public void asignarHabitacion(Habitacion nuevaHabitacion) {
        this.habitacionId = nuevaHabitacion.getId();
        this.habitacionNumero = nuevaHabitacion.getNumero();
        this.habitacionTipo = nuevaHabitacion.getTipo();
        this.precioNoche = nuevaHabitacion.getPrecioBase();
    }

    // Getters y Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCodigoReserva() { return codigoReserva; }
    public void setCodigoReserva(String codigoReserva) { this.codigoReserva = codigoReserva; }

    public String getHuespedId() { return huespedId; }
    public void setHuespedId(String huespedId) { this.huespedId = huespedId; }

    public String getHuespedNombre() { return huespedNombre; }
    public void setHuespedNombre(String huespedNombre) { this.huespedNombre = huespedNombre; }

    public String getHuespedEmail() { return huespedEmail; }
    public void setHuespedEmail(String huespedEmail) { this.huespedEmail = huespedEmail; }

    public String getHuespedTelefono() { return huespedTelefono; }
    public void setHuespedTelefono(String huespedTelefono) { this.huespedTelefono = huespedTelefono; }

    public String getHabitacionId() { return habitacionId; }
    public void setHabitacionId(String habitacionId) { this.habitacionId = habitacionId; }

    public String getHabitacionNumero() { return habitacionNumero; }
    public void setHabitacionNumero(String habitacionNumero) { this.habitacionNumero = habitacionNumero; }

    public String getHabitacionTipo() { return habitacionTipo; }
    public void setHabitacionTipo(String habitacionTipo) { this.habitacionTipo = habitacionTipo; }

    public String getFechaEntrada() { return fechaEntrada; }
    public void setFechaEntrada(String fechaEntrada) { this.fechaEntrada = fechaEntrada; }

    public String getFechaSalida() { return fechaSalida; }
    public void setFechaSalida(String fechaSalida) { this.fechaSalida = fechaSalida; }

    public int getNumNoches() { return numNoches; }
    public void setNumNoches(int numNoches) { this.numNoches = numNoches; }

    public int getNumHuespedes() { return numHuespedes; }
    public void setNumHuespedes(int numHuespedes) { this.numHuespedes = numHuespedes; }

    public double getPrecioNoche() { return precioNoche; }
    public void setPrecioNoche(double precioNoche) { this.precioNoche = precioNoche; }

    public String getOfertaId() { return ofertaId; }
    public void setOfertaId(String ofertaId) { this.ofertaId = ofertaId; }

    public String getOfertaCodigo() { return ofertaCodigo; }
    public void setOfertaCodigo(String ofertaCodigo) { this.ofertaCodigo = ofertaCodigo; }

    public double getDescuentoAplicado() { return descuentoAplicado; }
    public void setDescuentoAplicado(double descuentoAplicado) { this.descuentoAplicado = descuentoAplicado; }

    public double getPrecioTotal() { return precioTotal; }
    public void setPrecioTotal(double precioTotal) { this.precioTotal = precioTotal; }

    public EstadoReserva getEstado() { return estado; }
    public void setEstado(EstadoReserva estado) { this.estado = estado; }

    public String getNotas() { return notas; }
    public void setNotas(String notas) { this.notas = notas; }

    public String getFechaRegistro() { return fechaRegistro; }
    public void setFechaRegistro(String fechaRegistro) { this.fechaRegistro = fechaRegistro; }
}
