package com.hospedaflow.model.entity;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.hospedaflow.model.enums.RolUsuario;

/**
 * Entidad Base Abstracta Usuario (Sección 3.3 del Documento Técnico)
 * Define los atributos comunes de identidad y operaciones de autenticación.
 */
@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.PROPERTY,
    property = "rol",
    visible = true,
    defaultImpl = Usuario.class
)
@JsonSubTypes({
    @JsonSubTypes.Type(value = Gerente.class, name = "Admin"),
    @JsonSubTypes.Type(value = Recepcionista.class, name = "Recepcionista"),
    @JsonSubTypes.Type(value = Huesped.class, name = "Huesped")
})
public class Usuario {
    protected String id;
    protected String nombre;
    protected String email;
    protected String password;
    protected String telefono;
    protected RolUsuario rol;
    protected String documentoIdentidad;
    protected String fechaRegistro;

    public Usuario() {}

    public Usuario(String id, String nombre, String email, String password, String telefono, RolUsuario rol, String documentoIdentidad, String fechaRegistro) {
        this.id = id;
        this.nombre = nombre;
        this.email = email;
        this.password = password;
        this.telefono = telefono;
        this.rol = rol;
        this.documentoIdentidad = documentoIdentidad;
        this.fechaRegistro = fechaRegistro;
    }

    public boolean autenticar(String pass) {
        if (this.password == null || pass == null) return false;
        return this.password.equals(pass);
    }

    // Getters y Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

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

    public String getFechaRegistro() { return fechaRegistro; }
    public void setFechaRegistro(String fechaRegistro) { this.fechaRegistro = fechaRegistro; }
}
