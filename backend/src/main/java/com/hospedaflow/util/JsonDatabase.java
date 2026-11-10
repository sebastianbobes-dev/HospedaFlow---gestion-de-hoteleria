package com.hospedaflow.util;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * Motor de Persistencia Genérico Plano en JSON (Sección 3.1 & US-1.2)
 * Se encarga de la serialización y deserialización de listas de objetos hacia archivos planos en disco.
 */
public class JsonDatabase {

    private static final ObjectMapper mapper = new ObjectMapper()
            .enable(SerializationFeature.INDENT_OUTPUT);

    /**
     * Guarda una lista de entidades en el archivo plano especificado
     */
    public static synchronized <T> void guardarLista(String rutaArchivo, List<T> lista) {
        try {
            File archivo = new File(rutaArchivo);
            if (archivo.getParentFile() != null && !archivo.getParentFile().exists()) {
                archivo.getParentFile().mkdirs();
            }
            mapper.writeValue(archivo, lista);
        } catch (IOException e) {
            System.err.println("[JsonDatabase] Error crítico guardando archivo en " + rutaArchivo + ": " + e.getMessage());
            throw new RuntimeException("Error I/O al persistir lista en " + rutaArchivo, e);
        }
    }

    /**
     * Lee y deserializa una lista genérica desde un archivo plano en disco
     */
    public static synchronized <T> List<T> leerLista(String rutaArchivo, TypeReference<List<T>> tipo) {
        File archivo = new File(rutaArchivo);
        if (!archivo.exists()) {
            return new ArrayList<>();
        }
        try {
            return mapper.readValue(archivo, tipo);
        } catch (IOException e) {
            System.err.println("[JsonDatabase] Error leyendo archivo " + rutaArchivo + ": " + e.getMessage());
            return new ArrayList<>();
        }
    }
}
