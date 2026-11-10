package com.hospedaflow.dto;

import com.hospedaflow.model.enums.RolUsuario;

/**
 * UsuarioRequestDTO (Sección 5.3 & US-3.1)
 * Objeto plano de transferencia para la gestión de usuarios y roles.
 */
public class UsuarioRequestDTO {
    private String nombre;
    private String email;
    private String password;
    private String telefono;
    private RolUsuario rol;
    private String documentoIdentidad;

    public UsuarioRequestDTO() {}

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public RolUsuario getRol() { return rol; }
    public void setRol(RolUsuario rol) { this.rol = rol; }

    public String getDocumentoIdentidad() { return documentoIdentidad; }
    public void setDocumentoIdentidad(String documentoIdentidad) { this.documentoIdentidad = documentoIdentidad; }
}
