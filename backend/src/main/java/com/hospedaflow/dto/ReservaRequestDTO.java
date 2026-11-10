package com.hospedaflow.dto;

/**
 * ReservaRequestDTO (Sección 5.3 & US-3.1)
 * Objeto plano de transferencia para la creación de reservas.
 */
public class ReservaRequestDTO {
    private String huespedId;
    private String huespedNombre;
    private String huespedEmail;
    private String huespedTelefono;
    private String habitacionId;
    private String fechaEntrada;
    private String fechaSalida;
    private int numHuespedes;
    private String ofertaCodigo;
    private String notas;

    public ReservaRequestDTO() {}

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

    public String getFechaEntrada() { return fechaEntrada; }
    public void setFechaEntrada(String fechaEntrada) { this.fechaEntrada = fechaEntrada; }

    public String getFechaSalida() { return fechaSalida; }
    public void setFechaSalida(String fechaSalida) { this.fechaSalida = fechaSalida; }

    public int getNumHuespedes() { return numHuespedes; }
    public void setNumHuespedes(int numHuespedes) { this.numHuespedes = numHuespedes; }

    public String getOfertaCodigo() { return ofertaCodigo; }
    public void setOfertaCodigo(String ofertaCodigo) { this.ofertaCodigo = ofertaCodigo; }

    public String getNotas() { return notas; }
    public void setNotas(String notas) { this.notas = notas; }
}
