package com.hospedaflow.model.entity;

import com.hospedaflow.model.enums.RolUsuario;

/**
 * Especialización Gerente / Administrador
 */
public class Gerente extends Usuario {
    private String departamento;

    public Gerente() {
        this.rol = RolUsuario.Admin;
    }

    public Gerente(String id, String nombre, String email, String password, String telefono, String documentoIdentidad, String fechaRegistro, String departamento) {
        super(id, nombre, email, password, telefono, RolUsuario.Admin, documentoIdentidad, fechaRegistro);
        this.departamento = departamento;
    }

    public String getDepartamento() { return departamento; }
    public void setDepartamento(String departamento) { this.departamento = departamento; }
}
