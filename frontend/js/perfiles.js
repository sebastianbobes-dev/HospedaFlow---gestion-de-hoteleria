/**
 * HospedaFlow - Controlador de Perfiles y Usuarios (Capa Frontend)
 * Consumo asíncrono con Fetch API y async/await (US-4.2)
 */

// Detecta automáticamente la URL del backend sin que tengas que cambiar nada
const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port !== '8080'
    ? 'http://localhost:8080/api'
    : '/api';

const API_USUARIOS = `${API_BASE}/usuarios`;

document.addEventListener('DOMContentLoaded', () => {
    cargarUsuarios();

    const form = document.getElementById('formCrearUsuario');
    if (form) {
        form.addEventListener('submit', guardarUsuario);
    }
});

async function cargarUsuarios() {
    try {
        const res = await fetch(API_USUARIOS);
        const data = await res.json();
        const lista = data.data !== undefined ? data.data : data;
        renderizarUsuarios(lista);
    } catch (err) {
        console.error('Error cargando usuarios:', err);
    }
}

function renderizarUsuarios(usuarios) {
    const tbody = document.getElementById('tbodyUsuarios');
    if (!tbody) return;

    if (!usuarios || usuarios.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--color-text-muted);">No hay usuarios registrados.</td></tr>';
        return;
    }

    tbody.innerHTML = usuarios.map(u => `
        <tr>
            <td style="font-weight: 600;">${u.nombre}</td>
            <td>${u.email}</td>
            <td style="font-family: var(--font-mono);">${u.telefono}</td>
            <td><span class="badge ${u.rol === 'Admin' ? 'badge-ocupada' : 'badge-disponible'}">${u.rol}</span></td>
            <td>${u.documentoIdentidad || 'N/A'}</td>
        </tr>
    `).join('');
}

async function guardarUsuario(e) {
    e.preventDefault();
    const nombre = document.getElementById('usrNombre').value.trim();
    const email = document.getElementById('usrEmail').value.trim();
    const telefono = document.getElementById('usrTelefono').value.trim();
    const rol = document.getElementById('usrRol').value;
    const documentoIdentidad = document.getElementById('usrDocumento').value.trim();

    const dto = {
        nombre,
        email,
        telefono,
        rol,
        documentoIdentidad: documentoIdentidad || undefined,
        password: "password123"
    };

    try {
        const res = await fetch(API_USUARIOS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dto)
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Error al crear usuario');
        }

        cerrarModal('modalNuevoUsuario');
        e.target.reset();
        await cargarUsuarios();
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
