async function getLocations() {

    const options = { method: 'GET', headers: { accept: 'application/json' } };

    fetch('https://api.openaq.org/v2/locations?limit=100&page=1&offset=0&sort=desc&radius=1000&order_by=lastUpdated&dump_raw=false', options)
        .then(response => response.json())
        .then(response => console.log(response))
        .catch(err => console.error(err));
}