function changeImage(thumbnail) {
    const mainImage = document.querySelector('.carousel-item.active .mainImage');
    mainImage.src = thumbnail.src;
}

let ready = () => {
    console.log('DOM está listo')
    getData();
}

let loaded = ( eventLoaded ) => {
    let myform = document.getElementById('form');
    myform.addEventListener('submit', (eventSubmit) => {
        eventSubmit.preventDefault();
        var emailElement = document.querySelector('.form-control-lg');
        var emailText = emailElement.value;
        if (emailText.length === 0) {
            emailElement.focus()
            emailElement.animate(
                [
                    { transform: "translateX(0)" },
                    { transform: "translateX(50px)" },
                    { transform: "translateX(-50px)" },
                    { transform: "translateX(0)" }
                ],
                {
                    duration: 400,
                    easing: "linear",
                }
            )
            return;
        }
        sendData();        
    });

}

const databaseURL = 'https://landing-b3136-default-rtdb.firebaseio.com/data.json'; 

let sendData = () => { 
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    data['saved'] = new Date().toLocaleString('es-CO', { timeZone: 'America/Guayaquil' });
    fetch(databaseURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.statusText}`);
        }
        return response.json();
    })
    .then(result => {
        alert('Agradecemos tu opinión, nos mantenemos actualizados y enfocados en brindarte información importante de tu destino.');
        form.reset();
        getData();
    })
    .catch(error => {
        alert('Hemos experimentado un error en el send. ¡Vuelve pronto!');
    });
}

let getData = async () => {
    try {
        const response = await fetch(databaseURL, {
            method: 'GET'
        });

        if (!response.ok) {
            alert('Hemos experimentado un error en la petición del GET. ¡Vuelve pronto!');
            return;
        }

        const data = await response.json();

        if (data != null) {
            // Obtener el contenedor del testimonio
            let testimonialsContainer = document.getElementById('testimonial-wrapper');
            
            // Limpiar el contenedor de testimonios antes de agregar los nuevos
            testimonialsContainer.innerHTML = '';

            // Iterar sobre los datos y agregar los testimonios
            for (let key in data) {
                let entry = data[key];
                let testimonial = entry.testimonial; // Testimonio
                let name = entry.name; // Nombre del usuario
                let option1 = entry.option1; // Plan seleccionado
                let saved = entry.saved; // Fecha de guardado

                // Crear el contenedor de testimonio dinámico
                let testimonialElement = document.createElement('div');
                testimonialElement.classList.add('swiper-slide'); // Agregar la clase para que sea un elemento del swiper
                testimonialElement.classList.add('testimonial-item'); // Clase adicional para estilo

                // Agregar el contenido del testimonio al contenedor
                testimonialElement.innerHTML = ` 
                    <div class="testimonial-item text-center">
                        <blockquote>
                            <p>"${testimonial}"</p>
                            <div class="review-title text-uppercase">${name}</div>
                            <div class="review-title text-uppercase">${option1}</div>
                        </blockquote>
                    </div>
                `;

                // Agregar el testimonio al contenedor principal
                testimonialsContainer.appendChild(testimonialElement);
            }

            // Después de cargar los testimonios, reiniciar Swiper
            resetSwiper();
        }
    } catch (error) {
        alert('Hemos experimentado un error en la petición GET. ¡Vuelve pronto!');
    }
};

// Función para destruir el Swiper anterior y reiniciar el contenedor
function resetSwiper() {
    // Destruir la instancia del swiper si existe
    const swiperElement = document.querySelector('.testimonial-swiper');
    if (swiperElement && swiperElement.swiper) {
        swiperElement.swiper.destroy(true, true); // Destruir la instancia del Swiper
    }

    // Asegurarse de que el contenedor de paginación esté vacío
    const paginationContainer = document.querySelector('.testimonial-swiper-pagination');
    if (paginationContainer) {
        paginationContainer.innerHTML = '';
    }

    // Inicializar un nuevo Swiper
    initializeSwiper();
}

// Función para inicializar el Swiper
function initializeSwiper() {
    new Swiper(".testimonial-swiper", {
        effect: "coverflow",
        grabCursor: true,
        centeredSlides: true, // Centra el primer testimonio
        loop: false, // Permite el deslizamiento circular
        slidesPerView: "auto", // Ajusta el número de slides visibles
        coverflowEffect: {
            fade: true,
        },
        pagination: {
            el: ".testimonial-swiper-pagination", // Asegurarse que la paginación esté correctamente asignada
            clickable: true
        },
        initialSlide: 0, // Asegura que el primer testimonio esté visible al inicio
    });
}

// Manejar el envío del formulario
document.querySelector('form').addEventListener('submit', function (event) {
    event.preventDefault(); // Evita el comportamiento predeterminado del formulario

    // Realiza lo que necesites con el formulario (guardar, validar, etc.)

    // Recargar los testimonios y reiniciar el Swiper
    getData().then(() => {
        // Destruir la instancia del Swiper anterior y reiniciar el Swiper
        resetSwiper();
    });
});

document.querySelectorAll('.clickable-container').forEach(container => {
    container.addEventListener('click', event => {
        event.preventDefault(); // Evita el comportamiento predeterminado del enlace

        const serviceId = container.id; // Obtiene el id del contenedor (ejemplo: "service-123")
        const imageDescription = container.querySelector('img').alt; // Obtiene el alt de la imagen como descripción

        if (confirm(`¿Estás seguro de que deseas solicitar el servicio: ${imageDescription}?`)) {
            // Datos para el correo
            const email = "gestify@gmail.com"; // Dirección del destinatario
            const subject = encodeURIComponent(`Solicitud de Servicio - ${serviceId}`); // Asunto del correo, incluye el id
            const body = encodeURIComponent(`Hola,\n\nQuisiera solicitar el servicio: ${imageDescription} (ID: ${serviceId}).\n\nGracias.`); // Cuerpo del correo con descripción y ID del servicio

            // Redirige al esquema mailto
            window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
        }
    });
});


// Inicializar los testimonios al cargar la página
window.addEventListener("DOMContentLoaded", ready);
window.addEventListener("load", loaded);