package com.hospedaflow.repository;

import com.fasterxml.jackson.core.type.TypeReference;
import com.hospedaflow.model.entity.Usuario;
import com.hospedaflow.util.JsonDatabase;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * UsuarioJsonRepository (Sección 3.1 & US-1.3)
 * Administra la persistencia de los perfiles de usuario en usuarios.json
 */
@Repository
public class UsuarioJsonRepository {

    @Value("${hospedaflow.data.dir:src/main/resources/data}")
    private String dataDir;

    private String getRuta() {
        return dataDir + File.separator + "usuarios.json";
    }

    public List<Usuario> findAll() {
        return JsonDatabase.leerLista(getRuta(), new TypeReference<List<Usuario>>() {});
    }

    public Optional<Usuario> findById(String id) {
        return findAll().stream()
                .filter(u -> u.getId().equals(id))
                .findFirst();
    }

    public Optional<Usuario> findByEmail(String email) {
        return findAll().stream()
                .filter(u -> u.getEmail().equalsIgnoreCase(email.trim()))
                .findFirst();
    }

    public Usuario save(Usuario usuario) {
        List<Usuario> lista = new ArrayList<>(findAll());
        int index = -1;
        for (int i = 0; i < lista.size(); i++) {
            if (lista.get(i).getId().equals(usuario.getId())) {
                index = i;
                break;
            }
        }

        if (index >= 0) {
            lista.set(index, usuario);
        } else {
            lista.add(usuario);
        }

        JsonDatabase.guardarLista(getRuta(), lista);
        return usuario;
    }

    public boolean deleteById(String id) {
        List<Usuario> lista = new ArrayList<>(findAll());
        boolean removed = lista.removeIf(u -> u.getId().equals(id));
        if (removed) {
            JsonDatabase.guardarLista(getRuta(), lista);
        }
        return removed;
    }
}
