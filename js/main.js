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
    })

}

const databaseURL = 'https://landing-2df6a-default-rtdb.firebaseio.com/data.json'; 

let sendData = () => { 
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    data['saved'] = new Date().toLocaleString('es-CO', { timeZone: 'America/Guayaquil' })
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
        form.reset()
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
            let regionVotes = { "Costa": 0, "Sierra": 0, "Amazonía": 0, "Insular": 0 };
            let festivityVotes = {
                "Inti Raymi": 0, "La Mama Negra": 0, "Semana Santa": 0, "Día de los Fieles Difuntos": 0,
                "Carnaval": 0, "Diablada del Pillaro": 0
            };
            let dishVotes = {
                "Encebollado": 0, "Hornado": 0, "Yapingacho": 0, "Tigrillo": 0,
                "Fanesca": 0, "Cazuela": 0
            };
            for (let key in data) {
                let { option1, option2, option3 } = data[key];
                if (option1) regionVotes[option1]++;
                if (option2) festivityVotes[option2]++;
                if (option3) dishVotes[option3]++;
            }
            let regionTable = document.getElementById('region-votes').getElementsByTagName('tbody')[0];
            for (let region in regionVotes) {
                let row = regionTable.querySelector(`tr[data-region="${region}"]`);
                if (row) {
                    let currentVotes = parseInt(row.querySelector('td:nth-child(2)').textContent) || 0;
                    row.querySelector('td:nth-child(2)').textContent = currentVotes + regionVotes[region];
                } else {
                    let newRow = document.createElement('tr');
                    newRow.setAttribute('data-region', region);
                    newRow.innerHTML = `
                        <td>${region}</td>
                        <td>${regionVotes[region]}</td>
                    `;
                    regionTable.appendChild(newRow);
                }
            }
            let festivityTable = document.getElementById('festivity-votes').getElementsByTagName('tbody')[0];
            for (let festivity in festivityVotes) {
                let row = festivityTable.querySelector(`tr[data-festivity="${festivity}"]`);
                if (row) {
                    let currentVotes = parseInt(row.querySelector('td:nth-child(2)').textContent) || 0;
                    row.querySelector('td:nth-child(2)').textContent = currentVotes + festivityVotes[festivity];
                } else {
                    let newRow = document.createElement('tr');
                    newRow.setAttribute('data-festivity', festivity);
                    newRow.innerHTML = `
                        <td>${festivity}</td>
                        <td>${festivityVotes[festivity]}</td>
                    `;
                    festivityTable.appendChild(newRow);
                }
            }
            let dishTable = document.getElementById('dish-votes').getElementsByTagName('tbody')[0];
            for (let dish in dishVotes) {
                let row = dishTable.querySelector(`tr[data-dish="${dish}"]`);
                if (row) {
                    let currentVotes = parseInt(row.querySelector('td:nth-child(2)').textContent) || 0;
                    row.querySelector('td:nth-child(2)').textContent = currentVotes + dishVotes[dish];
                } else {
                    let newRow = document.createElement('tr');
                    newRow.setAttribute('data-dish', dish);
                    newRow.innerHTML = `
                        <td>${dish}</td>
                        <td>${dishVotes[dish]}</td>
                    `;
                    dishTable.appendChild(newRow);
                }
            }
        }
    } catch (error) {
        alert('Hemos experimentado un error en la petición GET. ¡Vuelve pronto!');
    }
};

window.addEventListener("DOMContentLoaded", ready);
window.addEventListener("load", loaded)