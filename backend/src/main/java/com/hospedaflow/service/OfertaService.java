package com.hospedaflow.service;

import com.hospedaflow.dto.OfertaRequestDTO;
import com.hospedaflow.model.entity.Oferta;
import com.hospedaflow.repository.OfertaJsonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * OfertaService (Sección 3.2 & US-2.3)
 * Administra el ciclo de vida de las ofertas comerciales (creación, modificación y eliminación).
 */
@Service
public class OfertaService {

    @Autowired
    private OfertaJsonRepository ofertaRepository;

    public List<Oferta> listarTodas(boolean soloActivas) {
        List<Oferta> ofertas = ofertaRepository.findAll();
        if (soloActivas) {
            String hoy = LocalDate.now().toString();
            return ofertas.stream()
                    .filter(o -> o.isActiva() && o.esVigente(hoy))
                    .collect(Collectors.toList());
        }
        return ofertas;
    }

    public Oferta obtenerPorId(String id) {
        return ofertaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Oferta con ID '" + id + "' no encontrada"));
    }

    public Oferta crearOferta(OfertaRequestDTO dto) {
        if (dto.getTitulo() == null || dto.getTitulo().trim().isEmpty()) {
            throw new IllegalArgumentException("El título de la oferta es obligatorio");
        }
        if (dto.getCodigo() == null || dto.getCodigo().trim().isEmpty()) {
            throw new IllegalArgumentException("El código promocional es obligatorio");
        }
        String codigoLimpio = dto.getCodigo().trim().toUpperCase();
        if (ofertaRepository.findByCodigo(codigoLimpio).isPresent()) {
            throw new IllegalArgumentException("Ya existe una oferta con el código promocional '" + codigoLimpio + "'");
        }
        if (dto.getPorcentajeDescuento() <= 0 || dto.getPorcentajeDescuento() > 100) {
            throw new IllegalArgumentException("El porcentaje de descuento debe estar entre 1% y 100%");
        }

        Oferta nueva = new Oferta(
                "oft-" + UUID.randomUUID().toString().substring(0, 8),
                dto.getTitulo().trim(),
                dto.getDescripcion() != null ? dto.getDescripcion().trim() : "",
                codigoLimpio,
                dto.getPorcentajeDescuento(),
                dto.getFechaInicio() != null ? dto.getFechaInicio() : LocalDate.now().toString(),
                dto.getFechaFin() != null ? dto.getFechaFin() : "2026-12-31",
                dto.getHabitacionTipo() != null ? dto.getHabitacionTipo() : "Todas",
                dto.getActiva() != null ? dto.getActiva() : true
        );

        return ofertaRepository.save(nueva);
    }

    public Oferta actualizarOferta(String id, OfertaRequestDTO dto) {
        Oferta oft = obtenerPorId(id);
        if (dto.getTitulo() != null) oft.setTitulo(dto.getTitulo().trim());
        if (dto.getDescripcion() != null) oft.setDescripcion(dto.getDescripcion().trim());
        if (dto.getPorcentajeDescuento() > 0 && dto.getPorcentajeDescuento() <= 100) {
            oft.setPorcentajeDescuento(dto.getPorcentajeDescuento());
        }
        if (dto.getFechaInicio() != null) oft.setFechaInicio(dto.getFechaInicio());
        if (dto.getFechaFin() != null) oft.setFechaFin(dto.getFechaFin());
        if (dto.getHabitacionTipo() != null) oft.setHabitacionTipo(dto.getHabitacionTipo());
        if (dto.getActiva() != null) oft.setActiva(dto.getActiva());

        return ofertaRepository.save(oft);
    }

    public boolean eliminarOferta(String id) {
        obtenerPorId(id);
        return ofertaRepository.deleteById(id);
    }

    public Oferta validarCodigo(String codigo, String tipoHabitacion, String fecha) {
        if (codigo == null || codigo.trim().isEmpty()) return null;
        return ofertaRepository.findByCodigo(codigo.trim().toUpperCase())
                .filter(o -> o.isActiva() && o.esVigente(fecha))
                .filter(o -> o.getHabitacionTipo().equalsIgnoreCase("Todas") || o.getHabitacionTipo().equalsIgnoreCase(tipoHabitacion))
                .orElse(null);
    }
}
