const databaseURL = 'https://landing-b3136-default-rtdb.firebaseio.com/data.json'; 
function changeImage(thumbnail) {
    const mainImage = document.querySelector('.carousel-item.active .mainImage');
    if (mainImage && thumbnail) {
        mainImage.src = thumbnail.src;
    }
}

let ready = () => {
    console.log('DOM está listo');
    getData();
};

let loaded = () => {
    let myform = document.getElementById('form');
    if (myform) {
        myform.addEventListener('submit', (eventSubmit) => {
            eventSubmit.preventDefault();
            const emailElement = document.querySelector('.form-control-lg');
            if (emailElement) {
                const emailText = emailElement.value;
                if (emailText.trim().length === 0) {
                    emailElement.focus();
                    emailElement.animate(
                        [
                            { transform: "translateX(0)" },
                            { transform: "translateX(50px)" },
                            { transform: "translateX(-50px)" },
                            { transform: "translateX(0)" }
                        ],
                        { duration: 400, easing: "linear" }
                    );
                    return;
                }
                sendData();
            }
        });
    }
};

let sendData = () => {
    const form = document.getElementById('form');
    if (form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        data['saved'] = new Date().toLocaleString('es-CO', { timeZone: 'America/Guayaquil' });

        fetch(databaseURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(response => {
                if (!response.ok) throw new Error(`Error en la solicitud: ${response.statusText}`);
                return response.json();
            })
            .then(() => {
                alert('Agradecemos tu opinión, nos mantenemos actualizados y enfocados en brindarte información importante de tu destino.');
                form.reset();
                getData();
            })
            .catch(() => {
                alert('Hemos experimentado un error en el send. ¡Vuelve pronto!');
            });
    }
};

let getData = async () => {
    try {
        const response = await fetch(databaseURL, { method: 'GET' });
        if (!response.ok) {
            alert('Hemos experimentado un error en la petición del GET. ¡Vuelve pronto!');
            return;
        }

        const data = await response.json();
        if (data && Object.keys(data).length > 0) {
            const testimonialsContainer = document.getElementById('testimonial-wrapper');
            if (testimonialsContainer) {
                testimonialsContainer.innerHTML = ''; // Limpiar contenedor

                for (let key in data) {
                    const entry = data[key];
                    if (entry.testimonial && entry.name && entry.option1) { // Verificar datos completos
                        const testimonialElement = document.createElement('div');
                        testimonialElement.classList.add('swiper-slide', 'testimonial-item');
                        testimonialElement.innerHTML = `
                            <div class="testimonial-item text-center">
                                <blockquote>
                                    <p>"${entry.testimonial}"</p>
                                    <div class="review-title text-uppercase">${entry.name}</div>
                                    <div class="review-title text-uppercase">${entry.option1}</div>
                                </blockquote>
                            </div>
                        `;
                        testimonialsContainer.appendChild(testimonialElement);
                    }
                }
                resetSwiper();
            }
        } else {
            console.log("No hay testimonios para mostrar.");
        }
    } catch (error) {
        alert('Hemos experimentado un error en la petición GET. ¡Vuelve pronto!');
    }
};

const updateVotesTable = async () => {
    try {
        // Obtener datos desde Firebase
        const response = await fetch(databaseURL, { method: 'GET' });

        if (!response.ok) {
            alert('Error al obtener los datos de votos. Intenta más tarde.');
            return;
        }

        const data = await response.json();

        // Validar que haya datos
        if (!data || typeof data !== 'object') {
            alert('No hay datos disponibles para mostrar en la tabla.');
            return;
        }

        // Contar votos por cada opción
        const voteCounts = {
            Starter: 0,
            Medium: 0,
            Ultimate: 0,
            "Ultimate+": 0
        };

        for (let key in data) {
            const entry = data[key];
            if (entry.option1 && voteCounts.hasOwnProperty(entry.option1)) {
                voteCounts[entry.option1]++;
            }
        }

        // Obtener el cuerpo de la tabla
        const tableBody = document.querySelector("#region-votes tbody");

        // Limpiar la tabla antes de agregar datos actualizados
        tableBody.innerHTML = "";

        // Crear filas para cada opción
        for (const [plan, votes] of Object.entries(voteCounts)) {
            // Crear un elemento <tr> para cada fila
            const row = document.createElement("tr");

            // Agregar contenido a la fila
            row.innerHTML = `
                <td>${plan}</td>
                <td>${votes}</td>
            `;

            // Añadir la fila al cuerpo de la tabla
            tableBody.appendChild(row);
        }
    } catch (error) {
        console.error("Error al actualizar la tabla de votos:", error);
        alert('Hemos experimentado un problema al cargar los votos.');
    }
};


function resetSwiper() {
    const swiperElement = document.querySelector('.testimonial-swiper');
    if (swiperElement && swiperElement.swiper) {
        swiperElement.swiper.destroy(true, true);
    }

    const paginationContainer = document.querySelector('.testimonial-swiper-pagination');
    if (paginationContainer) paginationContainer.innerHTML = '';

    initializeSwiper();
}

function initializeSwiper() {
    new Swiper(".testimonial-swiper", {
        effect: "coverflow",
        grabCursor: true,
        centeredSlides: true,
        loop: false,
        slidesPerView: "auto",
        coverflowEffect: { fade: true },
        pagination: {
            el: ".testimonial-swiper-pagination",
            clickable: true
        },
        initialSlide: 0
    });
};

document.querySelectorAll('.clickable-container').forEach(container => {
    container.addEventListener('click', event => {
        event.preventDefault(); // Evita el comportamiento predeterminado del enlace

        const serviceId = container.id; // Obtiene el id del contenedor (ejemplo: "service-123")
        const imageDescription = container.querySelector('img').alt; // Obtiene el alt de la imagen como descripción

        // Confirmación antes de redirigir
        if (confirm(`¿Estás seguro de que deseas solicitar el servicio: ${imageDescription}?`)) {
            // Datos para el correo
            const email = "gestifycompany@gmail.com"; // Dirección del destinatario
            const subject = encodeURIComponent(`Solicitud de Servicio - ${serviceId}`); // Asunto del correo, incluye el id
            const body = encodeURIComponent(`Hola,\n\nQuisiera solicitar el servicio: ${imageDescription} (ID: ${serviceId}).\n\nGracias.`); // Cuerpo del correo con descripción y ID del servicio

            // Redirige al esquema mailto
            window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
        }
    });
});

document.addEventListener("DOMContentLoaded", updateVotesTable);
window.addEventListener("DOMContentLoaded", ready);
window.addEventListener("load", loaded);
