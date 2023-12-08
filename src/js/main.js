let numberFormat;
let leafletMap;
let filter = {};

const AQ_PARAM_META = {
    pm10: {
        title: "PM10",
        levels: [25, 35, 50, 9999]
    },
    pm25: {
        title: "PM25",
        levels: [5, 12, 17, 20, 9999]
    }
}

$(document).ready(function () {

    numberFormat = new Intl.NumberFormat('cs-CZ', {maximumSignificantDigits: 4});

    initLeaflet();

    initMarkers();

    zoomToCurrentLocation();

    $("#get-air-quality").on('click', async function (e) {

        e.stopPropagation();

        let $btn = $(this);

        $btn.prop('disabled', true);

        let centre = leafletMap.getCenter();

        let sensorsData = await openaq.byCoords(centre.lat, centre.lng, ["pm10", "pm25"]);

        setTimeout(function () {

            parseSensorData(sensorsData);

            $btn.prop('disabled', false);
        }, 1000);
    })

    $('.filter-wrapper > .parent > p').on('click', function () {
        $(this).toggleClass('active');
        $('.filter-wrapper').find('form#map-filters').slideToggle(125).css('display', 'flex');
    });

    $('#map-filters').submit(function (e) {
        e.preventDefault();

        let formData = new FormData(this);

        filter = {
            pm10: {
                min: formData.get("pm10-min"),
                max: formData.get("pm10-max"),
            },
            pm25: {
                min: formData.get("pm25-min"),
                max: formData.get("pm25-max"),
            }
        };

        applyMarkerFilter();
    });
});

function applyMarkerFilter() {

    let markersCache = JSON.parse(localStorage.getItem('markers'));

    leafletMap.eachLayer(function (l) {
        if (l instanceof L.Marker) {

            let sensorId = l.sensorId;
            let sensorData = markersCache[sensorId];

            let setFilter = filter?.pm10?.min && sensorData.parameters.pm10.lastValue <= filter.pm10.min;
            setFilter = setFilter || filter?.pm10?.max && sensorData.parameters.pm10.lastValue >= filter.pm10.max;

            setFilter = setFilter || filter?.pm25?.min && sensorData.parameters.pm25.lastValue <= filter.pm25.min;
            setFilter = setFilter || filter?.pm25?.max && sensorData.parameters.pm25.lastValue >= filter.pm25.max;

            if (setFilter) {

                l.setOpacity(0.25);
            } else {

                l.setOpacity(1);
            }
        }
    });
}

function initMarkers() {

    if (!localStorage.getItem('markers')) {

        localStorage.setItem('markers', "{}");
    } else {

        let markersCache = JSON.parse(localStorage.getItem('markers'));

        for (const i in markersCache) {

            markersCache[i].id = i;
            addSensorToMap(markersCache[i])
        }
    }
}

function parseSensorData(sensorsData) {

    let markersCache = JSON.parse(localStorage.getItem('markers'));
    let requiredParameters = Object.keys(AQ_PARAM_META);

    for (const i in sensorsData.results) {

        let sensor = sensorsData.results[i];

        if (!Object.hasOwn(markersCache, sensor.id)) {

            let selectedParameters = {};

            for (const i in sensor.parameters) {

                let s = sensor.parameters[i];

                if (requiredParameters.includes(s.parameter)) {
                    selectedParameters[s.parameter] = s;
                }
            }

            let sensorObject = {
                name: sensor.name,
                lastUpdated: sensor.lastUpdated,
                coordinates: sensor.coordinates,
                parameters: selectedParameters
            }

            addSensorToMap(sensorObject).sensorId = sensor.id;

            markersCache[sensor.id] = sensorObject
        }
    }

    localStorage.setItem('markers', JSON.stringify(markersCache));

    applyMarkerFilter();
}

function addSensorToMap(sensor) {

    let marker = addMarker(sensor.coordinates.latitude, sensor.coordinates.longitude);
    marker.bindPopup(getMarkerText(sensor));
    marker.sensorId = sensor.id;

    return marker;
}

function getMarkerText(sensorData) {

    function constructRow(param) {

        let metadata = AQ_PARAM_META[param.parameter];

        let $row = $(`
        <tr class="param-${param.parameter}">
            <td class="title">${metadata?.title || param.parameter}</td>
            <td class="last-value">${numberFormat.format(param.lastValue)}</td>
            <td class="avg-value">${numberFormat.format(param.average)}</td>
            <td class="unit">${param.unit}</td>
        </tr>`);

        if (metadata?.levels) {

            let lastLevel = getLevel(metadata.levels, param.lastValue);
            let averageLevel = getLevel(metadata.levels, param.average);

            $row.find('.last-value').addClass('level-' + lastLevel);
            $row.find('.avg-value').addClass('level-' + averageLevel);
        }

        return $row;
    }

    function getLevel(levels, currentLevel) {

        let i;

        for (i in levels) {

            if (currentLevel <= levels[i])
                break;
        }

        return i;
    }

    let $content = $(`<div>
        <b>${sensorData.name}</b><br>
        <table>
            <tr>
                <th></th>
                <th>Poslední</th>
                <th>Průměr</th>
                <th>Jednotka</th>
            </tr>
        </table>
    </div>`);

    for (const i in sensorData.parameters) {

        $content.find('table').append(constructRow(sensorData.parameters[i]));
    }

    return $content[0];
}

function zoomToCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            leafletMap.flyTo([position.coords.latitude, position.coords.longitude], 12, {
                animate: false
            });
        }, console.error, {
            enableHighAccuracy: true,
        });
    } else {
        console.error("Geolocation is not supported by this browser.");
    }
}