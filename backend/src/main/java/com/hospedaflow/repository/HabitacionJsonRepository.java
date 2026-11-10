package com.hospedaflow.repository;

import com.fasterxml.jackson.core.type.TypeReference;
import com.hospedaflow.model.entity.Habitacion;
import com.hospedaflow.util.JsonDatabase;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * HabitacionJsonRepository (Sección 3.1 & US-1.3)
 * Repositorio específico que gestiona el archivo habitaciones.json
 */
@Repository
public class HabitacionJsonRepository {

    @Value("${hospedaflow.data.dir:src/main/resources/data}")
    private String dataDir;

    private String getRuta() {
        return dataDir + File.separator + "habitaciones.json";
    }

    public List<Habitacion> findAll() {
        return JsonDatabase.leerLista(getRuta(), new TypeReference<List<Habitacion>>() {});
    }

    public Optional<Habitacion> findById(String id) {
        return findAll().stream()
                .filter(h -> h.getId().equals(id))
                .findFirst();
    }

    public Optional<Habitacion> findByNumero(String numero) {
        return findAll().stream()
                .filter(h -> h.getNumero().equalsIgnoreCase(numero.trim()))
                .findFirst();
    }

    public Habitacion save(Habitacion habitacion) {
        List<Habitacion> lista = new ArrayList<>(findAll());
        int index = -1;
        for (int i = 0; i < lista.size(); i++) {
            if (lista.get(i).getId().equals(habitacion.getId())) {
                index = i;
                break;
            }
        }

        if (index >= 0) {
            lista.set(index, habitacion);
        } else {
            lista.add(habitacion);
        }

        JsonDatabase.guardarLista(getRuta(), lista);
        return habitacion;
    }

    public boolean deleteById(String id) {
        List<Habitacion> lista = new ArrayList<>(findAll());
        boolean removed = lista.removeIf(h -> h.getId().equals(id));
        if (removed) {
            JsonDatabase.guardarLista(getRuta(), lista);
        }
        return removed;
    }
}
