// Motor compartido por los juegos de "pregunta contrarreloj con 2 respuestas"
// (mates en cadena, mates complejas, trivial). Cada juego solo aporta cómo
// generar la siguiente ronda y cómo comprobar la respuesta elegida.
function crearQuizContrarreloj({ tiempoInicial, alIniciar, generarRonda, comprobarRespuesta }) {
    const juegoActivoEl = document.getElementById('juego-activo');
    const finJuegoEl = document.getElementById('fin-juego');
    const puntuacionEl = document.getElementById('puntuacion');
    const tiempoEl = document.getElementById('tiempo');
    const respuesta1Btn = document.getElementById('respuesta1');
    const respuesta2Btn = document.getElementById('respuesta2');
    const puntuacionFinalEl = document.getElementById('puntuacion-final');
    const reiniciarBtn = document.getElementById('reiniciar');

    let puntuacion = 0;
    let tiempoRestante;
    let temporizador;

    function iniciar() {
        puntuacion = 0;
        juegoActivoEl.classList.remove('oculto');
        finJuegoEl.classList.add('oculto');
        puntuacionEl.textContent = puntuacion;
        alIniciar();
        reiniciarTemporizador();
    }

    function reiniciarTemporizador() {
        clearInterval(temporizador);
        tiempoRestante = tiempoInicial;
        tiempoEl.textContent = tiempoRestante;
        temporizador = setInterval(() => {
            tiempoRestante--;
            tiempoEl.textContent = tiempoRestante;
            if (tiempoRestante <= 0) {
                terminar();
            }
        }, 1000);
    }

    function manejarRespuesta(e) {
        if (comprobarRespuesta(e.target.textContent)) {
            puntuacion++;
            puntuacionEl.textContent = puntuacion;
            generarRonda();
            reiniciarTemporizador();
        } else {
            terminar();
        }
    }

    function terminar() {
        clearInterval(temporizador);
        juegoActivoEl.classList.add('oculto');
        finJuegoEl.classList.remove('oculto');
        puntuacionFinalEl.textContent = puntuacion;
    }

    respuesta1Btn.addEventListener('click', manejarRespuesta);
    respuesta2Btn.addEventListener('click', manejarRespuesta);
    reiniciarBtn.addEventListener('click', iniciar);

    return { iniciar };
}
