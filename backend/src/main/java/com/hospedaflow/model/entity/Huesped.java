package com.hospedaflow.model.entity;

import com.hospedaflow.model.enums.RolUsuario;

/**
 * Especialización Huésped
 */
public class Huesped extends Usuario {
    private String ciudadOrigen;
    private String preferencias;

    public Huesped() {
        this.rol = RolUsuario.Huesped;
    }

    public Huesped(String id, String nombre, String email, String password, String telefono, String documentoIdentidad, String fechaRegistro, String ciudadOrigen, String preferencias) {
        super(id, nombre, email, password, telefono, RolUsuario.Huesped, documentoIdentidad, fechaRegistro);
        this.ciudadOrigen = ciudadOrigen;
        this.preferencias = preferencias;
    }

    public String getCiudadOrigen() { return ciudadOrigen; }
    public void setCiudadOrigen(String ciudadOrigen) { this.ciudadOrigen = ciudadOrigen; }

    public String getPreferencias() { return preferencias; }
    public void setPreferencias(String preferencias) { this.preferencias = preferencias; }
}
