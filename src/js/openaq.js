if (typeof openaq === 'undefined') {
    var openaq = {};
}

openaq = (function () {

    const BASE_URL = "https://api.openaq.org/v2/";

    const OPTIONS = {method: 'GET', headers: {accept: 'application/json'}};

    async function byCoords(lat, long, parameters = []) {

        let coords = lat.toFixed(8) + "," + long.toFixed(8);

        let urlParams = {
            limit: '100',
            page: '1',
            offset: '0',
            radius: '25000',
            coordinates: coords,
        };

        let urlParamsString = new URLSearchParams(urlParams).toString();

        for(const i in parameters){

            urlParamsString += "&parameter=" + encodeURI(parameters[i]);
        }

        let url = BASE_URL + 'locations?' + urlParamsString;

        let res = await fetch(url, OPTIONS);

        return await res.json();
    }

    return {
        byCoords: byCoords,
    };
})();