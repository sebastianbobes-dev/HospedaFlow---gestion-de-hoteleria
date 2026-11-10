package com.hospedaflow.controller;

import com.hospedaflow.dto.OfertaRequestDTO;
import com.hospedaflow.model.entity.Oferta;
import com.hospedaflow.service.OfertaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * OfertaRestController (Sección 5.3 & US-3.2)
 * Endpoints HTTP para la administración de ofertas y descuentos comerciales.
 */
@RestController
@RequestMapping("/api/ofertas")
@CrossOrigin(origins = "*")
public class OfertaRestController {

    @Autowired
    private OfertaService ofertaService;

    @GetMapping
    public ResponseEntity<List<Oferta>> listarOfertas(@RequestParam(defaultValue = "false") boolean activas) {
        return ResponseEntity.ok(ofertaService.listarTodas(activas));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable String id) {
        try {
            return ResponseEntity.ok(ofertaService.obtenerPorId(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> crearOferta(@RequestBody OfertaRequestDTO dto) {
        try {
            Oferta creada = ofertaService.crearOferta(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(creada);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarOferta(@PathVariable String id, @RequestBody OfertaRequestDTO dto) {
        try {
            Oferta actualizada = ofertaService.actualizarOferta(id, dto);
            return ResponseEntity.ok(actualizada);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarOferta(@PathVariable String id) {
        try {
            boolean eliminada = ofertaService.eliminarOferta(id);
            return ResponseEntity.ok(Map.of("eliminada", eliminada));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/validar")
    public ResponseEntity<?> validarCodigo(@RequestBody Map<String, String> body) {
        String codigo = body.get("codigo");
        String tipoHabitacion = body.getOrDefault("tipoHabitacion", "Todas");
        String fecha = body.getOrDefault("fecha", java.time.LocalDate.now().toString());

        Oferta oft = ofertaService.validarCodigo(codigo, tipoHabitacion, fecha);
        if (oft != null) {
            return ResponseEntity.ok(Map.of("valida", true, "oferta", oft));
        } else {
            return ResponseEntity.ok(Map.of("valida", false, "motivo", "Cupón no válido o no aplicable"));
        }
    }
}
