package com.hospedaflow.controller;

import com.hospedaflow.dto.UsuarioRequestDTO;
import com.hospedaflow.model.entity.Usuario;
import com.hospedaflow.model.enums.RolUsuario;
import com.hospedaflow.service.PerfilService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * PerfilRestController (Sección 5.3 & US-3.2)
 * Endpoints HTTP para la gestión de usuarios y autenticación.
 */
@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class PerfilRestController {

    @Autowired
    private PerfilService perfilService;

    @GetMapping
    public ResponseEntity<List<Usuario>> listarUsuarios(@RequestParam(required = false) RolUsuario rol) {
        return ResponseEntity.ok(perfilService.listarUsuarios(rol));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable String id) {
        try {
            return ResponseEntity.ok(perfilService.obtenerPorId(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> crearUsuario(@RequestBody UsuarioRequestDTO dto) {
        try {
            Usuario creado = perfilService.crearUsuario(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(creado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        try {
            String email = body.get("email");
            String password = body.get("password");
            Usuario u = perfilService.autenticar(email, password);
            return ResponseEntity.ok(u);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarUsuario(@PathVariable String id) {
        try {
            boolean eliminado = perfilService.eliminarUsuario(id);
            return ResponseEntity.ok(Map.of("eliminado", eliminado));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
