package com.hospedaflow.repository;

import com.fasterxml.jackson.core.type.TypeReference;
import com.hospedaflow.model.entity.Reserva;
import com.hospedaflow.util.JsonDatabase;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * ReservaJsonRepository (Sección 3.1 & US-1.3)
 * Encargado de la lectura, escritura y actualización sobre reservas.json
 */
@Repository
public class ReservaJsonRepository {

    @Value("${hospedaflow.data.dir:src/main/resources/data}")
    private String dataDir;

    private String getRuta() {
        return dataDir + File.separator + "reservas.json";
    }

    public List<Reserva> findAll() {
        return JsonDatabase.leerLista(getRuta(), new TypeReference<List<Reserva>>() {});
    }

    public Optional<Reserva> findById(String id) {
        return findAll().stream()
                .filter(r -> r.getId().equals(id))
                .findFirst();
    }

    public Optional<Reserva> findByCodigo(String codigo) {
        return findAll().stream()
                .filter(r -> r.getCodigoReserva().equalsIgnoreCase(codigo.trim()))
                .findFirst();
    }

    public List<Reserva> findByHabitacionId(String habitacionId) {
        return findAll().stream()
                .filter(r -> r.getHabitacionId().equals(habitacionId))
                .collect(Collectors.toList());
    }

    public Reserva save(Reserva reserva) {
        List<Reserva> lista = new ArrayList<>(findAll());
        int index = -1;
        for (int i = 0; i < lista.size(); i++) {
            if (lista.get(i).getId().equals(reserva.getId())) {
                index = i;
                break;
            }
        }

        if (index >= 0) {
            lista.set(index, reserva);
        } else {
            lista.add(0, reserva);
        }

        JsonDatabase.guardarLista(getRuta(), lista);
        return reserva;
    }

    public boolean deleteById(String id) {
        List<Reserva> lista = new ArrayList<>(findAll());
        boolean removed = lista.removeIf(r -> r.getId().equals(id));
        if (removed) {
            JsonDatabase.guardarLista(getRuta(), lista);
        }
        return removed;
    }
}
