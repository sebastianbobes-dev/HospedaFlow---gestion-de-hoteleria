package com.hospedaflow.service;

import com.hospedaflow.dto.ReservaRequestDTO;
import com.hospedaflow.model.entity.Habitacion;
import com.hospedaflow.model.entity.Oferta;
import com.hospedaflow.model.entity.Reserva;
import com.hospedaflow.model.enums.EstadoHabitacion;
import com.hospedaflow.model.enums.EstadoReserva;
import com.hospedaflow.repository.HabitacionJsonRepository;
import com.hospedaflow.repository.ReservaJsonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * ReservaService (Sección 3.2 & US-2.2)
 * Orquesta las operaciones críticas del Sprint 1: registrar reservas, modificar fechas, cancelar reservas,
 * confirmarlas y asignar habitaciones específicas.
 */
@Service
public class ReservaService {

    @Autowired
    private ReservaJsonRepository reservaRepository;

    @Autowired
    private HabitacionJsonRepository habitacionRepository;

    @Autowired
    private OfertaService ofertaService;

    public List<Reserva> listarTodas(EstadoReserva estado, String habitacionId) {
        List<Reserva> reservas = reservaRepository.findAll();
        if (estado != null) {
            reservas = reservas.stream().filter(r -> r.getEstado() == estado).collect(Collectors.toList());
        }
        if (habitacionId != null && !habitacionId.trim().isEmpty()) {
            reservas = reservas.stream().filter(r -> r.getHabitacionId().equals(habitacionId)).collect(Collectors.toList());
        }
        return reservas;
    }

    public Reserva obtenerPorId(String id) {
        return reservaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reserva con ID '" + id + "' no encontrada"));
    }

    public Reserva registrarReserva(ReservaRequestDTO dto) {
        if (dto.getHabitacionId() == null || dto.getFechaEntrada() == null || dto.getFechaSalida() == null) {
            throw new IllegalArgumentException("Habitación y rango de fechas son obligatorios");
        }
        if (dto.getHuespedNombre() == null || dto.getHuespedNombre().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre del huésped es obligatorio");
        }

        LocalDate entrada = LocalDate.parse(dto.getFechaEntrada());
        LocalDate salida = LocalDate.parse(dto.getFechaSalida());

        if (!salida.isAfter(entrada)) {
            throw new IllegalArgumentException("La fecha de salida debe ser posterior a la fecha de entrada");
        }

        Habitacion hab = habitacionRepository.findById(dto.getHabitacionId())
                .orElseThrow(() -> new IllegalArgumentException("Habitación seleccionada no existe"));

        if (hab.getEstado() == EstadoHabitacion.Mantenimiento) {
            throw new IllegalStateException("La habitación se encuentra en mantenimiento");
        }

        int huespedes = dto.getNumHuespedes() > 0 ? dto.getNumHuespedes() : 1;
        if (huespedes > hab.getCapacidad()) {
            throw new IllegalArgumentException("La capacidad máxima de la habitación es de " + hab.getCapacidad() + " personas");
        }

        // Validar conflicto de fechas
        List<Reserva> existentes = reservaRepository.findByHabitacionId(hab.getId());
        boolean conflicto = existentes.stream()
                .filter(r -> r.getEstado() != EstadoReserva.Cancelada)
                .anyMatch(r -> dto.getFechaEntrada().compareTo(r.getFechaSalida()) < 0 && dto.getFechaSalida().compareTo(r.getFechaEntrada()) > 0);

        if (conflicto) {
            throw new IllegalStateException("La habitación " + hab.getNumero() + " ya tiene una reserva en el rango solicitado");
        }

        long noches = ChronoUnit.DAYS.between(entrada, salida);
        if (noches <= 0) noches = 1;

        double subtotal = hab.getPrecioBase() * noches;
        double descuento = 0.0;
        String ofertaId = null;
        String ofertaCodigo = null;

        if (dto.getOfertaCodigo() != null && !dto.getOfertaCodigo().trim().isEmpty()) {
            Oferta oft = ofertaService.validarCodigo(dto.getOfertaCodigo(), hab.getTipo(), dto.getFechaEntrada());
            if (oft != null) {
                ofertaId = oft.getId();
                ofertaCodigo = oft.getCodigo();
                descuento = oft.calcularDescuento(subtotal);
            }
        }

        double total = Math.max(0.0, Math.round((subtotal - descuento) * 100.0) / 100.0);
        int consecutivo = reservaRepository.findAll().size() + 1;
        String codigoReserva = "HF-" + LocalDate.now().getYear() + "-" + String.format("%03d", consecutivo);

        Reserva nueva = new Reserva(
                "res-" + UUID.randomUUID().toString().substring(0, 8),
                codigoReserva,
                dto.getHuespedId() != null ? dto.getHuespedId() : "usr-guest-" + UUID.randomUUID().toString().substring(0, 4),
                dto.getHuespedNombre().trim(),
                dto.getHuespedEmail() != null ? dto.getHuespedEmail().trim() : "",
                dto.getHuespedTelefono() != null ? dto.getHuespedTelefono().trim() : "",
                hab.getId(),
                hab.getNumero(),
                hab.getTipo(),
                dto.getFechaEntrada(),
                dto.getFechaSalida(),
                (int) noches,
                huespedes,
                hab.getPrecioBase(),
                ofertaId,
                ofertaCodigo,
                descuento,
                total,
                EstadoReserva.Confirmada,
                dto.getNotas(),
                LocalDate.now().toString()
        );

        return reservaRepository.save(nueva);
    }

    public Reserva modificarFechas(String id, String nuevaEntrada, String nuevaSalida) {
        Reserva res = obtenerPorId(id);
        LocalDate entrada = LocalDate.parse(nuevaEntrada);
        LocalDate salida = LocalDate.parse(nuevaSalida);

        if (!salida.isAfter(entrada)) {
            throw new IllegalArgumentException("La fecha de salida debe ser posterior a la fecha de entrada");
        }

        List<Reserva> existentes = reservaRepository.findByHabitacionId(res.getHabitacionId());
        boolean conflicto = existentes.stream()
                .filter(r -> !r.getId().equals(id))
                .filter(r -> r.getEstado() != EstadoReserva.Cancelada)
                .anyMatch(r -> nuevaEntrada.compareTo(r.getFechaSalida()) < 0 && nuevaSalida.compareTo(r.getFechaEntrada()) > 0);

        if (conflicto) {
            throw new IllegalStateException("La habitación ya está ocupada en el nuevo rango solicitado");
        }

        long noches = ChronoUnit.DAYS.between(entrada, salida);
        if (noches <= 0) noches = 1;

        double subtotal = res.getPrecioNoche() * noches;
        double descuento = 0.0;
        if (res.getOfertaId() != null) {
            try {
                Oferta oft = ofertaService.obtenerPorId(res.getOfertaId());
                descuento = oft.calcularDescuento(subtotal);
            } catch (Exception ignored) {}
        }

        double nuevoTotal = Math.max(0.0, Math.round((subtotal - descuento) * 100.0) / 100.0);
        res.modificarFechas(nuevaEntrada, nuevaSalida, (int) noches, nuevoTotal);
        res.setDescuentoAplicado(descuento);

        return reservaRepository.save(res);
    }

    public Reserva confirmarReserva(String id) {
        Reserva res = obtenerPorId(id);
        res.confirmar();
        return reservaRepository.save(res);
    }

    public Reserva cancelarReserva(String id, String motivo) {
        Reserva res = obtenerPorId(id);
        res.cancelar(motivo);
        return reservaRepository.save(res);
    }

    public Reserva asignarHabitacion(String id, String nuevaHabitacionId) {
        Reserva res = obtenerPorId(id);
        Habitacion nuevaHab = habitacionRepository.findById(nuevaHabitacionId)
                .orElseThrow(() -> new IllegalArgumentException("Habitación no encontrada"));

        if (nuevaHab.getCapacidad() < res.getNumHuespedes()) {
            throw new IllegalArgumentException("La nueva habitación no tiene capacidad suficiente");
        }

        List<Reserva> existentes = reservaRepository.findByHabitacionId(nuevaHabitacionId);
        boolean conflicto = existentes.stream()
                .filter(r -> !r.getId().equals(id))
                .filter(r -> r.getEstado() != EstadoReserva.Cancelada)
                .anyMatch(r -> res.getFechaEntrada().compareTo(r.getFechaSalida()) < 0 && res.getFechaSalida().compareTo(r.getFechaEntrada()) > 0);

        if (conflicto) {
            throw new IllegalStateException("La habitación " + nuevaHab.getNumero() + " no está disponible en las fechas de la reserva");
        }

        res.asignarHabitacion(nuevaHab);
        double subtotal = nuevaHab.getPrecioBase() * res.getNumNoches();
        double nuevoTotal = Math.max(0.0, subtotal - res.getDescuentoAplicado());
        res.setPrecioTotal(nuevoTotal);

        return reservaRepository.save(res);
    }

    public boolean eliminarReserva(String id) {
        obtenerPorId(id);
        return reservaRepository.deleteById(id);
    }
}
