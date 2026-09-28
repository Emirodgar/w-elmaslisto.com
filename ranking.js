// Ranking local de mejores puntuaciones, por juego y por navegador.
// No usa servidor ni base de datos: todo se guarda con localStorage,
// así que cada dispositivo/navegador tiene su propia tabla de récords.
const Ranking = (function () {
    const PREFIJO = 'elmaslisto-ranking-';
    const NOMBRE_KEY = 'elmaslisto-nombre-jugador';
    const MAX_PUESTOS = 10;

    function obtenerLista(juegoId) {
        try {
            const datos = JSON.parse(localStorage.getItem(PREFIJO + juegoId));
            return Array.isArray(datos) ? datos : [];
        } catch (e) {
            return [];
        }
    }

    function guardarLista(juegoId, lista) {
        try {
            localStorage.setItem(PREFIJO + juegoId, JSON.stringify(lista));
        } catch (e) {
            // localStorage no disponible (modo privado, cuota llena, etc.): se ignora.
        }
    }

    function obtenerNombreGuardado() {
        try {
            return localStorage.getItem(NOMBRE_KEY) || '';
        } catch (e) {
            return '';
        }
    }

    function guardarNombreGuardado(nombre) {
        try {
            localStorage.setItem(NOMBRE_KEY, nombre);
        } catch (e) { /* se ignora */ }
    }

    function comparadorPorDefecto(ascendente) {
        return (a, b) => ascendente ? (a.puntuacion - b.puntuacion) : (b.puntuacion - a.puntuacion);
    }

    function agregarPuntuacion(juegoId, nombre, puntuacion, comparar) {
        const lista = obtenerLista(juegoId);
        const entrada = {
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
            nombre: nombre.slice(0, 18),
            puntuacion,
            fecha: Date.now(),
        };
        lista.push(entrada);
        lista.sort(comparar);
        const recortada = lista.slice(0, MAX_PUESTOS);
        guardarLista(juegoId, recortada);
        return { lista: recortada, entrada, entroEnTop: recortada.includes(entrada) };
    }

    function escapeHtml(texto) {
        const div = document.createElement('div');
        div.textContent = String(texto);
        return div.innerHTML;
    }

    function renderizarTabla(lista, formatear, entradaDestacada) {
        if (lista.length === 0) {
            return '<p class="ranking-vacio">Aún no hay puntuaciones guardadas. ¡Sé el primero!</p>';
        }
        const filas = lista.map((entrada, i) => {
            const claseFila = entrada === entradaDestacada ? ' class="ranking-fila-nueva"' : '';
            return `<tr${claseFila}><td class="ranking-puesto">${i + 1}</td><td class="ranking-nombre">${escapeHtml(entrada.nombre)}</td><td class="ranking-puntos">${escapeHtml(formatear(entrada.puntuacion))}</td></tr>`;
        }).join('');
        return `<table class="ranking-tabla"><thead><tr><th>#</th><th>Nombre</th><th>Puntos</th></tr></thead><tbody>${filas}</tbody></table>`;
    }

    /**
     * Muestra (y permite guardar) el ranking local de un juego dentro de contenedorEl.
     *
     * opciones:
     *  - ascendente: true si una puntuación más BAJA es mejor (por defecto, más alta es mejor)
     *  - comparar(a, b): comparador propio para ordenar entradas (recibe los objetos completos); tiene prioridad sobre "ascendente"
     *  - formatear(puntuacion): formatea el valor guardado para mostrarlo (por defecto, tal cual)
     *  - claveGuardado: si se indica (p.ej. la fecha de hoy), solo se permite guardar una vez por esa clave para ese juego,
     *    pensado para juegos con reto diario de un único intento al día
     */
    function mostrar(contenedorEl, juegoId, puntuacionActual, opciones) {
        if (!contenedorEl) return;
        opciones = opciones || {};
        const comparar = opciones.comparar || comparadorPorDefecto(!!opciones.ascendente);
        const formatear = opciones.formatear || (p => p);
        const claveGuardado = opciones.claveGuardado;
        const guardadoKey = claveGuardado ? PREFIJO + 'guardado-' + juegoId + '-' + claveGuardado : null;
        const puedeGuardar = puntuacionActual !== undefined && puntuacionActual !== null;

        function yaGuardado() {
            if (!guardadoKey) return false;
            try {
                return localStorage.getItem(guardadoKey) === '1';
            } catch (e) {
                return false;
            }
        }

        function marcarGuardado() {
            if (!guardadoKey) return;
            try {
                localStorage.setItem(guardadoKey, '1');
            } catch (e) { /* se ignora */ }
        }

        function pintar(entradaDestacada) {
            const lista = obtenerLista(juegoId);
            contenedorEl.innerHTML =
                '<h3 class="ranking-titulo">🏆 Mejores puntuaciones en este dispositivo</h3>' +
                renderizarTabla(lista, formatear, entradaDestacada);

            if (!puedeGuardar) return;

            if (yaGuardado()) {
                contenedorEl.insertAdjacentHTML('beforeend', '<p class="ranking-info">Ya has guardado tu puntuación de hoy para este reto.</p>');
                return;
            }

            contenedorEl.insertAdjacentHTML('beforeend',
                '<form class="ranking-form">' +
                '<input type="text" class="ranking-input" maxlength="18" placeholder="Tu nombre" required>' +
                '<button type="submit" class="ranking-guardar">Guardar puntuación</button>' +
                '</form>'
            );
            const formEl = contenedorEl.querySelector('.ranking-form');
            const inputEl = contenedorEl.querySelector('.ranking-input');
            inputEl.value = obtenerNombreGuardado();
            formEl.addEventListener('submit', function (e) {
                e.preventDefault();
                const nombre = inputEl.value.trim();
                if (!nombre) return;
                guardarNombreGuardado(nombre);
                const resultado = agregarPuntuacion(juegoId, nombre, puntuacionActual, comparar);
                marcarGuardado();
                pintar(resultado.entroEnTop ? resultado.entrada : null);
            });
        }

        pintar(null);
    }

    return { mostrar };
})();
