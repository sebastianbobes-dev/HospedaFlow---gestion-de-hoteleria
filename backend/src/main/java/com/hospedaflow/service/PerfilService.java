package com.hospedaflow.service;

import com.hospedaflow.dto.UsuarioRequestDTO;
import com.hospedaflow.model.entity.Gerente;
import com.hospedaflow.model.entity.Huesped;
import com.hospedaflow.model.entity.Recepcionista;
import com.hospedaflow.model.entity.Usuario;
import com.hospedaflow.model.enums.RolUsuario;
import com.hospedaflow.repository.UsuarioJsonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * PerfilService (Sección 3.2 & US-2.3)
 * Maneja la lógica detrás de la creación de perfiles generales y de huéspedes, asignación de roles y consulta de usuarios.
 */
@Service
public class PerfilService {

    @Autowired
    private UsuarioJsonRepository usuarioRepository;

    public List<Usuario> listarUsuarios(RolUsuario rol) {
        List<Usuario> lista = usuarioRepository.findAll();
        if (rol != null) {
            return lista.stream()
                    .filter(u -> u.getRol() == rol)
                    .collect(Collectors.toList());
        }
        return lista;
    }

    public Usuario obtenerPorId(String id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario con ID '" + id + "' no encontrado"));
    }

    public Usuario crearUsuario(UsuarioRequestDTO dto) {
        if (dto.getNombre() == null || dto.getNombre().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre es obligatorio");
        }
        if (dto.getEmail() == null || dto.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("El correo electrónico es obligatorio");
        }
        String emailLimpio = dto.getEmail().trim().toLowerCase();
        if (usuarioRepository.findByEmail(emailLimpio).isPresent()) {
            throw new IllegalArgumentException("El correo '" + emailLimpio + "' ya está registrado");
        }

        String id = "usr-" + UUID.randomUUID().toString().substring(0, 8);
        String fecha = LocalDate.now().toString();
        RolUsuario rol = dto.getRol() != null ? dto.getRol() : RolUsuario.Huesped;
        String pass = dto.getPassword() != null ? dto.getPassword() : "123456";

        Usuario usuario;
        if (rol == RolUsuario.Admin) {
            usuario = new Gerente(id, dto.getNombre().trim(), emailLimpio, pass, dto.getTelefono(), dto.getDocumentoIdentidad(), fecha, "Gerencia General");
        } else if (rol == RolUsuario.Recepcionista) {
            usuario = new Recepcionista(id, dto.getNombre().trim(), emailLimpio, pass, dto.getTelefono(), dto.getDocumentoIdentidad(), fecha, "Turno Principal");
        } else {
            usuario = new Huesped(id, dto.getNombre().trim(), emailLimpio, pass, dto.getTelefono(), dto.getDocumentoIdentidad(), fecha, "Venezuela", "Ninguna");
        }

        return usuarioRepository.save(usuario);
    }

    public Usuario autenticar(String email, String password) {
        Usuario u = usuarioRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con el correo '" + email + "'"));
        if (!u.autenticar(password)) {
            throw new IllegalArgumentException("Contraseña incorrecta");
        }
        return u;
    }

    public boolean eliminarUsuario(String id) {
        obtenerPorId(id);
        return usuarioRepository.deleteById(id);
    }
}
