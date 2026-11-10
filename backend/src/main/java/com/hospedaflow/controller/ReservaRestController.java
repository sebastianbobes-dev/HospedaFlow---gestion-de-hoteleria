package com.hospedaflow.controller;

import com.hospedaflow.dto.ReservaRequestDTO;
import com.hospedaflow.model.entity.Reserva;
import com.hospedaflow.model.enums.EstadoReserva;
import com.hospedaflow.service.ReservaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * ReservaRestController (Sección 5.3 & US-3.2)
 * Endpoints HTTP para el ciclo de vida de reservaciones.
 */
@RestController
@RequestMapping("/api/reservas")
@CrossOrigin(origins = "*")
public class ReservaRestController {

    @Autowired
    private ReservaService reservaService;

    @GetMapping
    public ResponseEntity<List<Reserva>> listarReservas(
            @RequestParam(required = false) EstadoReserva estado,
            @RequestParam(required = false) String habitacionId) {
        return ResponseEntity.ok(reservaService.listarTodas(estado, habitacionId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable String id) {
        try {
            return ResponseEntity.ok(reservaService.obtenerPorId(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> registrarReserva(@RequestBody ReservaRequestDTO dto) {
        try {
            Reserva creada = reservaService.registrarReserva(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(creada);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/fechas")
    public ResponseEntity<?> modificarFechas(@PathVariable String id, @RequestBody Map<String, String> body) {
        try {
            String fechaEntrada = body.get("fechaEntrada");
            String fechaSalida = body.get("fechaSalida");
            Reserva actualizada = reservaService.modificarFechas(id, fechaEntrada, fechaSalida);
            return ResponseEntity.ok(actualizada);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/confirmar")
    public ResponseEntity<?> confirmarReserva(@PathVariable String id) {
        try {
            return ResponseEntity.ok(reservaService.confirmarReserva(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/cancelar")
    public ResponseEntity<?> cancelarReserva(@PathVariable String id, @RequestBody(required = false) Map<String, String> body) {
        try {
            String motivo = body != null ? body.get("motivo") : null;
            return ResponseEntity.ok(reservaService.cancelarReserva(id, motivo));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/asignar")
    public ResponseEntity<?> asignarHabitacion(@PathVariable String id, @RequestBody Map<String, String> body) {
        try {
            String nuevaHabitacionId = body.get("habitacionId");
            return ResponseEntity.ok(reservaService.asignarHabitacion(id, nuevaHabitacionId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarReserva(@PathVariable String id) {
        try {
            boolean eliminada = reservaService.eliminarReserva(id);
            return ResponseEntity.ok(Map.of("eliminada", eliminada));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
