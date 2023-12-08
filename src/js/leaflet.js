function initLeaflet() {

    leafletMap = L.map('map').setView([49.61, 16.17], 5);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 20,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        doubleClickZoom: false,
    }).addTo(leafletMap);

    leafletMap.zoomControl.remove();

    L.control.zoom({
        position: 'bottomright'
    }).addTo(leafletMap);
}

function addMarker(lat, long){

    return L.marker([lat, long]).addTo(leafletMap);
}