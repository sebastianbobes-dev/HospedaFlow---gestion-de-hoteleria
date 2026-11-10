/**
 * HospedaFlow - Controlador de Reservaciones (Capa Frontend)
 * Consumo asíncrono con Fetch API y async/await (US-4.2)
 */

// Detecta automáticamente la URL del backend sin que tengas que cambiar nada
const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port !== '8080'
    ? 'http://localhost:8080/api'
    : '/api';

const API_RESERVAS = `${API_BASE}/reservas`;
const API_HABITACIONES_R = `${API_BASE}/habitaciones`;
const API_OFERTAS_R = `${API_BASE}/ofertas`;

document.addEventListener('DOMContentLoaded', () => {
    cargarReservas();
    cargarOpcionesHabitacion();

    const form = document.getElementById('formCrearReserva');
    if (form) {
        form.addEventListener('submit', registrarReserva);
    }
});

async function cargarReservas() {
    try {
        const res = await fetch(API_RESERVAS);
        const data = await res.json();
        const lista = data.data !== undefined ? data.data : data;
        renderizarReservas(lista);
    } catch (err) {
        console.error('Error cargando reservas:', err);
    }
}

function renderizarReservas(reservas) {
    const tbody = document.getElementById('tbodyReservas');
    if (!tbody) return;

    if (!reservas || reservas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--color-text-muted);">No hay reservas registradas.</td></tr>';
        return;
    }

    tbody.innerHTML = reservas.map(r => {
        const badgeClass = r.estado === 'Confirmada' ? 'badge-confirmada' :
                           r.estado === 'Pendiente' ? 'badge-pendiente' : 'badge-cancelada';

        return `
            <tr>
                <td style="font-family: var(--font-mono); font-weight: 600;">${r.codigoReserva}</td>
                <td>
                    <div style="font-weight: 600;">${r.huespedNombre}</div>
                    <div style="font-size: 0.7rem; color: var(--color-text-muted);">${r.huespedTelefono}</div>
                </td>
                <td>
                    <div>Hab. #${r.habitacionNumero}</div>
                    <div style="font-size: 0.7rem; color: var(--color-text-muted);">${r.habitacionTipo}</div>
                </td>
                <td style="font-family: var(--font-mono); font-size: 0.75rem;">
                    ${r.fechaEntrada} → ${r.fechaSalida}
                    <div style="font-size: 0.65rem; color: var(--color-text-muted);">${r.numNoches} noche(s)</div>
                </td>
                <td style="font-family: var(--font-mono); font-weight: 700;">$${r.precioTotal}</td>
                <td><span class="badge ${badgeClass}">${r.estado}</span></td>
                <td>
                    <div style="display: flex; gap: 4px;">
                        ${r.estado === 'Pendiente' ? `
                            <button onclick="confirmarReserva('${r.id}')" class="btn btn-secondary" style="font-size: 0.65rem; padding: 2px 6px;">Confirmar</button>
                        ` : ''}
                        ${r.estado !== 'Cancelada' ? `
                            <button onclick="cancelarReserva('${r.id}')" class="btn btn-secondary" style="font-size: 0.65rem; padding: 2px 6px; color: var(--color-danger);">Cancelar</button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

async function cargarOpcionesHabitacion() {
    const select = document.getElementById('resHabitacion');
    if (!select) return;
    try {
        const res = await fetch(API_HABITACIONES_R);
        const data = await res.json();
        const lista = data.data !== undefined ? data.data : data;

        select.innerHTML = '<option value="">Seleccione una habitación...</option>' +
            lista.filter(h => h.estado !== 'Mantenimiento').map(h => `
                <option value="${h.id}">Hab. ${h.numero} - ${h.tipo} ($${h.precioBase}/noche)</option>
            `).join('');
    } catch (err) {
        console.error(err);
    }
}

async function registrarReserva(e) {
    e.preventDefault();
    const huespedNombre = document.getElementById('resNombre').value.trim();
    const huespedEmail = document.getElementById('resEmail').value.trim();
    const huespedTelefono = document.getElementById('resTelefono').value.trim();
    const habitacionId = document.getElementById('resHabitacion').value;
    const fechaEntrada = document.getElementById('resEntrada').value;
    const fechaSalida = document.getElementById('resSalida').value;
    const numHuespedes = parseInt(document.getElementById('resHuespedes').value);
    const ofertaCodigo = document.getElementById('resOferta').value.trim();
    const notas = document.getElementById('resNotas').value.trim();

    const dto = {
        huespedNombre,
        huespedEmail,
        huespedTelefono,
        habitacionId,
        fechaEntrada,
        fechaSalida,
        numHuespedes,
        ofertaCodigo: ofertaCodigo || undefined,
        notas: notas || undefined
    };

    try {
        const res = await fetch(API_RESERVAS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dto)
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Error al registrar reserva');
        }

        cerrarModal('modalNuevaReserva');
        e.target.reset();
        await cargarReservas();
    } catch (err) {
        alert(err.message);
    }
}

async function confirmarReserva(id) {
    try {
        const res = await fetch(`${API_RESERVAS}/${id}/confirmar`, { method: 'PATCH' });
        if (res.ok) cargarReservas();
    } catch (err) {
        console.error(err);
    }
}

async function cancelarReserva(id) {
    const motivo = prompt('Motivo de la cancelación:');
    if (motivo === null) return;

    try {
        const res = await fetch(`${API_RESERVAS}/${id}/cancelar`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ motivo })
        });
        if (res.ok) cargarReservas();
    } catch (err) {
        console.error(err);
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
