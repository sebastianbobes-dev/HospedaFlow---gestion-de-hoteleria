/**
 * HospedaFlow - Controlador de Ofertas (Capa Frontend)
 * Consumo asíncrono con Fetch API y async/await (US-4.2)
 */

// Detecta automáticamente la URL del backend sin que tengas que cambiar nada
const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port !== '8080'
    ? 'http://localhost:8080/api'
    : '/api';

const API_OFERTAS = `${API_BASE}/ofertas`;

document.addEventListener('DOMContentLoaded', () => {
    cargarOfertas();

    const form = document.getElementById('formCrearOferta');
    if (form) {
        form.addEventListener('submit', guardarOferta);
    }
});

async function cargarOfertas() {
    try {
        const res = await fetch(API_OFERTAS);
        const data = await res.json();
        const lista = data.data !== undefined ? data.data : data;
        renderizarOfertas(lista);
    } catch (err) {
        console.error('Error cargando ofertas:', err);
    }
}

function renderizarOfertas(ofertas) {
    const contenedor = document.getElementById('gridOfertas');
    if (!contenedor) return;

    if (!ofertas || ofertas.length === 0) {
        contenedor.innerHTML = '<div class="alerta">No hay promociones activas.</div>';
        return;
    }

    contenedor.innerHTML = ofertas.map(o => `
        <div class="card-kpi" style="border: 1px solid var(--color-border);">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                <span style="font-weight: 700; font-size: 1rem;">${o.titulo}</span>
                <span style="font-family: var(--font-mono); font-weight: 800; color: var(--color-accent); font-size: 1.1rem;">${o.porcentajeDescuento}% OFF</span>
            </div>
            <p style="font-size: 0.75rem; color: var(--color-text-muted); margin-bottom: 12px;">
                ${o.descripcion || 'Sin descripción'}
            </p>
            <div style="background: #f5f5f4; padding: 6px 10px; border-radius: 4px; font-size: 0.75rem; display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>Cupón: <strong style="font-family: var(--font-mono);">${o.codigo}</strong></span>
                <button onclick="copiarCodigo('${o.codigo}')" style="background: none; border: none; cursor: pointer; font-size: 0.7rem; color: var(--color-text);">Copiar</button>
            </div>
            <div style="font-size: 0.65rem; color: var(--color-text-muted);">
                Vigencia: ${o.fechaInicio} al ${o.fechaFin}
            </div>
        </div>
    `).join('');
}

async function guardarOferta(e) {
    e.preventDefault();
    const titulo = document.getElementById('oftTitulo').value.trim();
    const codigo = document.getElementById('oftCodigo').value.trim().toUpperCase();
    const porcentajeDescuento = parseInt(document.getElementById('oftDescuento').value);
    const fechaInicio = document.getElementById('oftInicio').value;
    const fechaFin = document.getElementById('oftFin').value;
    const habitacionTipo = document.getElementById('oftTipo').value;
    const descripcion = document.getElementById('oftDescripcion').value.trim();

    const dto = {
        titulo,
        codigo,
        porcentajeDescuento,
        fechaInicio,
        fechaFin,
        habitacionTipo,
        descripcion,
        activa: true
    };

    try {
        const res = await fetch(API_OFERTAS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dto)
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Error al guardar oferta');
        }

        cerrarModal('modalNuevaOferta');
        e.target.reset();
        await cargarOfertas();
    } catch (err) {
        alert(err.message);
    }
}

function copiarCodigo(cod) {
    navigator.clipboard.writeText(cod);
    alert('Código ' + cod + ' copiado al portapapeles');
}

function abrirModal(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'flex';
}

function cerrarModal(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
}
