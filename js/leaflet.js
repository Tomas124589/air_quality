function initLeaflet() {

    var map = L.map('map').setView([49.84, 18.28], 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    map.on('click', onMapClick);
}

function onMapClick(e) {

    console.log("Map clicked", e);
}