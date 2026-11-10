package com.hospedaflow.model.entity;

import com.hospedaflow.model.enums.RolUsuario;

/**
 * Especialización Recepcionista
 */
public class Recepcionista extends Usuario {
    private String turno;

    public Recepcionista() {
        this.rol = RolUsuario.Recepcionista;
    }

    public Recepcionista(String id, String nombre, String email, String password, String telefono, String documentoIdentidad, String fechaRegistro, String turno) {
        super(id, nombre, email, password, telefono, RolUsuario.Recepcionista, documentoIdentidad, fechaRegistro);
        this.turno = turno;
    }

    public String getTurno() { return turno; }
    public void setTurno(String turno) { this.turno = turno; }
}
