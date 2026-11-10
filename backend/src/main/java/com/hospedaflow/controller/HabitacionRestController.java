package com.hospedaflow.controller;

import com.hospedaflow.dto.HabitacionRequestDTO;
import com.hospedaflow.model.entity.Habitacion;
import com.hospedaflow.model.enums.EstadoHabitacion;
import com.hospedaflow.service.HabitacionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * HabitacionRestController (Sección 5.3 & US-3.2)
 * Endpoints HTTP para la gestión de habitaciones y disponibilidad.
 */
@RestController
@RequestMapping("/api/habitaciones")
@CrossOrigin(origins = "*")
public class HabitacionRestController {

    @Autowired
    private HabitacionService habitacionService;

    @GetMapping
    public ResponseEntity<List<Habitacion>> listarHabitaciones() {
        return ResponseEntity.ok(habitacionService.listarTodas());
    }

    @GetMapping("/disponibilidad")
    public ResponseEntity<?> consultarDisponibilidad(
            @RequestParam String fechaEntrada,
            @RequestParam String fechaSalida,
            @RequestParam(required = false) String tipo,
            @RequestParam(required = false) Integer numHuespedes) {
        try {
            List<Habitacion> disponibles = habitacionService.consultarDisponibilidad(fechaEntrada, fechaSalida, tipo, numHuespedes);
            return ResponseEntity.ok(disponibles);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable String id) {
        try {
            return ResponseEntity.ok(habitacionService.obtenerPorId(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> crearHabitacion(@RequestBody HabitacionRequestDTO dto) {
        try {
            Habitacion creada = habitacionService.crearHabitacion(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(creada);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(@PathVariable String id, @RequestBody Map<String, String> body) {
        try {
            String nuevoEstado = body.get("estado");
            Habitacion hab = habitacionService.cambiarEstado(id, EstadoHabitacion.valueOf(nuevoEstado));
            return ResponseEntity.ok(hab);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarHabitacion(@PathVariable String id) {
        try {
            boolean eliminada = habitacionService.eliminarHabitacion(id);
            return ResponseEntity.ok(Map.of("eliminada", eliminada));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
