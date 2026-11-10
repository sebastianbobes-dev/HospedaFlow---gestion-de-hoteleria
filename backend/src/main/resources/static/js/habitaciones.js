/**
 * HospedaFlow - Controlador de Habitaciones (Capa Frontend)
 * Consumo asíncrono con Fetch API y async/await (US-4.2)
 */

// Detecta automáticamente la URL del backend sin que tengas que cambiar nada
const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port !== '8080'
    ? 'http://localhost:8080/api'
    : '/api';

const API_HABITACIONES = `${API_BASE}/habitaciones`;

document.addEventListener('DOMContentLoaded', () => {
    cargarHabitaciones();

    const formCrear = document.getElementById('formCrearHabitacion');
    if (formCrear) {
        formCrear.addEventListener('submit', guardarHabitacion);
    }

    const formDisponibilidad = document.getElementById('formDisponibilidad');
    if (formDisponibilidad) {
        formDisponibilidad.addEventListener('submit', consultarDisponibilidad);
    }
});

async function cargarHabitaciones() {
    try {
        const res = await fetch(API_HABITACIONES);
        const data = await res.json();
        const lista = data.data !== undefined ? data.data : data;
        renderizarHabitaciones(lista);
    } catch (error) {
        console.error('Error cargando habitaciones:', error);
    }
}

function renderizarHabitaciones(habitaciones) {
    const contenedor = document.getElementById('gridHabitaciones');
    if (!contenedor) return;

    if (!habitaciones || habitaciones.length === 0) {
        contenedor.innerHTML = '<div class="alerta">No se encontraron habitaciones registradas.</div>';
        return;
    }

    contenedor.innerHTML = habitaciones.map(hab => {
        const badgeClass = hab.estado === 'Disponible' ? 'badge-disponible' :
                           hab.estado === 'Ocupada' ? 'badge-ocupada' : 'badge-mantenimiento';

        return `
            <div class="card-kpi" style="border: 1px solid var(--color-border);">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                    <div>
                        <span style="font-family: var(--font-mono); font-weight: 700; font-size: 1.1rem;">Habitación #${hab.numero}</span>
                        <div style="font-size: 0.75rem; color: var(--color-text-muted);">${hab.tipo} · Piso ${hab.piso || 1}</div>
                    </div>
                    <span class="badge ${badgeClass}">${hab.estado}</span>
                </div>
                <p style="font-size: 0.75rem; color: var(--color-text-muted); margin-bottom: 12px; min-height: 36px;">
                    ${hab.descripcion || 'Sin descripción adicional'}
                </p>
                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--color-border); padding-top: 10px;">
                    <div>
                        <span style="font-size: 1.1rem; font-weight: 700; font-family: var(--font-mono);">$${hab.precioBase}</span>
                        <span style="font-size: 0.65rem; color: var(--color-text-muted);"> / noche (Ref. $)</span>
                    </div>
                    <div style="display: flex; gap: 6px;">
                        <button onclick="cambiarEstadoHabitacion('${hab.id}', '${hab.estado}')" class="btn btn-secondary" style="font-size: 0.7rem; padding: 4px 8px;">
                            Estado
                        </button>
                        <button onclick="eliminarHabitacion('${hab.id}')" class="btn btn-danger" style="font-size: 0.7rem; padding: 4px 8px;">
                            Eliminar
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

async function guardarHabitacion(e) {
    e.preventDefault();
    const numero = document.getElementById('habNumero').value.trim();
    const tipo = document.getElementById('habTipo').value;
    const precioBase = parseFloat(document.getElementById('habPrecio').value);
    const capacidad = parseInt(document.getElementById('habCapacidad').value);
    const estado = document.getElementById('habEstado').value;
    const descripcion = document.getElementById('habDescripcion').value.trim();

    const dto = {
        numero,
        tipo,
        precioBase,
        capacidad,
        estado,
        descripcion,
        caracteristicas: ["Aire Acondicionado", "Wifi", "Baño Privado"]
    };

    try {
        const res = await fetch(API_HABITACIONES, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dto)
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Error al guardar');
        }

        cerrarModal('modalNuevaHabitacion');
        e.target.reset();
        await cargarHabitaciones();
    } catch (err) {
        alert(err.message);
    }
}

async function cambiarEstadoHabitacion(id, estadoActual) {
    let siguiente = 'Disponible';
    if (estadoActual === 'Disponible') siguiente = 'Ocupada';
    else if (estadoActual === 'Ocupada') siguiente = 'Mantenimiento';
    else siguiente = 'Disponible';

    try {
        const res = await fetch(`${API_HABITACIONES}/${id}/estado`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: siguiente })
        });
        if (res.ok) {
            cargarHabitaciones();
        }
    } catch (err) {
        console.error(err);
    }
}

async function eliminarHabitacion(id) {
    if (!confirm('¿Confirma que desea eliminar esta habitación?')) return;
    try {
        const res = await fetch(`${API_HABITACIONES}/${id}`, { method: 'DELETE' });
        if (res.ok) {
            cargarHabitaciones();
        } else {
            const err = await res.json();
            alert(err.error || 'No se pudo eliminar');
        }
    } catch (err) {
        console.error(err);
    }
}

async function consultarDisponibilidad(e) {
    e.preventDefault();
    const fechaEntrada = document.getElementById('filtroEntrada').value;
    const fechaSalida = document.getElementById('filtroSalida').value;
    const tipo = document.getElementById('filtroTipo').value;

    try {
        const params = new URLSearchParams({ fechaEntrada, fechaSalida });
        if (tipo !== 'Todos') params.append('tipo', tipo);

        const res = await fetch(`${API_HABITACIONES}/disponibilidad?${params.toString()}`);
        const data = await res.json();
        const lista = data.data !== undefined ? data.data : data;

        const resultadoDiv = document.getElementById('resultadoDisponibilidad');
        if (resultadoDiv) {
            resultadoDiv.innerHTML = `<div class="alerta alerta-exito">Se encontraron <strong>${lista.length}</strong> habitaciones disponibles para las fechas indicadas.</div>`;
        }
        renderizarHabitaciones(lista);
    } catch (err) {
        alert(err.message);
    }
}

function abrirModal(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'flex';
}

function cerrarModal(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
}
