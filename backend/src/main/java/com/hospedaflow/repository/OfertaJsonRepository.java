package com.hospedaflow.repository;

import com.fasterxml.jackson.core.type.TypeReference;
import com.hospedaflow.model.entity.Oferta;
import com.hospedaflow.util.JsonDatabase;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * OfertaJsonRepository (Sección 3.1 & US-1.3)
 * Administra la persistencia de ofertas comerciales en ofertas.json
 */
@Repository
public class OfertaJsonRepository {

    @Value("${hospedaflow.data.dir:src/main/resources/data}")
    private String dataDir;

    private String getRuta() {
        return dataDir + File.separator + "ofertas.json";
    }

    public List<Oferta> findAll() {
        return JsonDatabase.leerLista(getRuta(), new TypeReference<List<Oferta>>() {});
    }

    public Optional<Oferta> findById(String id) {
        return findAll().stream()
                .filter(o -> o.getId().equals(id))
                .findFirst();
    }

    public Optional<Oferta> findByCodigo(String codigo) {
        return findAll().stream()
                .filter(o -> o.getCodigo().equalsIgnoreCase(codigo.trim()))
                .findFirst();
    }

    public Oferta save(Oferta oferta) {
        List<Oferta> lista = new ArrayList<>(findAll());
        int index = -1;
        for (int i = 0; i < lista.size(); i++) {
            if (lista.get(i).getId().equals(oferta.getId())) {
                index = i;
                break;
            }
        }

        if (index >= 0) {
            lista.set(index, oferta);
        } else {
            lista.add(oferta);
        }

        JsonDatabase.guardarLista(getRuta(), lista);
        return oferta;
    }

    public boolean deleteById(String id) {
        List<Oferta> lista = new ArrayList<>(findAll());
        boolean removed = lista.removeIf(o -> o.getId().equals(id));
        if (removed) {
            JsonDatabase.guardarLista(getRuta(), lista);
        }
        return removed;
    }
}
