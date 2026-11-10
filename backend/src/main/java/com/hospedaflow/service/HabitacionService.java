package com.hospedaflow.service;

import com.hospedaflow.dto.HabitacionRequestDTO;
import com.hospedaflow.model.entity.Habitacion;
import com.hospedaflow.model.entity.Reserva;
import com.hospedaflow.model.enums.EstadoHabitacion;
import com.hospedaflow.model.enums.EstadoReserva;
import com.hospedaflow.repository.HabitacionJsonRepository;
import com.hospedaflow.repository.ReservaJsonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * HabitacionService (Sección 3.2 & US-2.1)
 * Centraliza los casos de uso relacionados con la creación, eliminación y validación de disponibilidad de habitaciones.
 */
@Service
public class HabitacionService {

    @Autowired
    private HabitacionJsonRepository habitacionRepository;

    @Autowired
    private ReservaJsonRepository reservaRepository;

    public List<Habitacion> listarTodas() {
        return habitacionRepository.findAll();
    }

    public Habitacion obtenerPorId(String id) {
        return habitacionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Habitación con ID '" + id + "' no encontrada"));
    }

    public Habitacion crearHabitacion(HabitacionRequestDTO dto) {
        if (dto.getNumero() == null || dto.getNumero().trim().isEmpty()) {
            throw new IllegalArgumentException("El número de habitación es obligatorio");
        }
        if (habitacionRepository.findByNumero(dto.getNumero()).isPresent()) {
            throw new IllegalArgumentException("Ya existe una habitación registrada con el número " + dto.getNumero());
        }
        if (dto.getPrecioBase() <= 0) {
            throw new IllegalArgumentException("El precio base debe ser mayor a 0");
        }
        if (dto.getCapacidad() <= 0) {
            throw new IllegalArgumentException("La capacidad debe ser de al menos 1 persona");
        }

        Habitacion nueva = new Habitacion(
                "hab-" + UUID.randomUUID().toString().substring(0, 8),
                dto.getNumero().trim(),
                dto.getTipo() != null ? dto.getTipo() : "Matrimonial",
                dto.getPrecioBase(),
                dto.getCapacidad(),
                dto.getEstado() != null ? dto.getEstado() : EstadoHabitacion.Disponible,
                dto.getDescripcion() != null ? dto.getDescripcion() : "",
                dto.getCaracteristicas() != null ? dto.getCaracteristicas() : new ArrayList<>(),
                dto.getPiso() > 0 ? dto.getPiso() : 1
        );

        return habitacionRepository.save(nueva);
    }

    public Habitacion cambiarEstado(String id, EstadoHabitacion nuevoEstado) {
        Habitacion hab = obtenerPorId(id);
        hab.cambiarEstado(nuevoEstado);
        return habitacionRepository.save(hab);
    }

    public boolean eliminarHabitacion(String id) {
        Habitacion hab = obtenerPorId(id);
        List<Reserva> reservas = reservaRepository.findByHabitacionId(id);
        boolean tieneActivas = reservas.stream()
                .anyMatch(r -> r.getEstado() == EstadoReserva.Confirmada || r.getEstado() == EstadoReserva.Pendiente);

        if (tieneActivas) {
            throw new IllegalStateException("No se puede eliminar la habitación " + hab.getNumero() + " porque tiene reservas activas");
        }
        return habitacionRepository.deleteById(id);
    }

    public List<Habitacion> consultarDisponibilidad(String fechaEntrada, String fechaSalida, String tipo, Integer minCapacidad) {
        if (fechaEntrada == null || fechaSalida == null) {
            throw new IllegalArgumentException("Las fechas de entrada y salida son obligatorias");
        }
        if (fechaSalida.compareTo(fechaEntrada) <= 0) {
            throw new IllegalArgumentException("La fecha de salida debe ser posterior a la fecha de entrada");
        }

        List<Habitacion> todas = habitacionRepository.findAll();
        List<Reserva> reservas = reservaRepository.findAll();

        return todas.stream()
                .filter(h -> h.getEstado() != EstadoHabitacion.Mantenimiento)
                .filter(h -> tipo == null || tipo.equalsIgnoreCase("Todos") || h.getTipo().equalsIgnoreCase(tipo))
                .filter(h -> minCapacidad == null || h.getCapacidad() >= minCapacidad)
                .filter(h -> {
                    // Verificar que no tenga reservas activas con solapamiento
                    boolean conflicto = reservas.stream()
                            .filter(r -> r.getHabitacionId().equals(h.getId()))
                            .filter(r -> r.getEstado() == EstadoReserva.Confirmada || r.getEstado() == EstadoReserva.Pendiente)
                            .anyMatch(r -> fechaEntrada.compareTo(r.getFechaSalida()) < 0 && fechaSalida.compareTo(r.getFechaEntrada()) > 0);
                    return !conflicto;
                })
                .collect(Collectors.toList());
    }
}
