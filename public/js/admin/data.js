function dataScript() {
    let mymap = L.map('mapid', {
        minZoom: 2
    });
    let tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
    tiles.addTo(mymap);
    mymap.setView([50, 0], 2);

    // Icon for User Marker
    let greenIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    // Get Map Data
    $.getJSON('dashboard/api/adminMapData')
        .then( info => {
            let maxCount = info.maxCount;
            info.usersData.forEach( (userData, idx) => {
                // User Marker
                let userCoords = [Math.floor(Math.random() * 50), Math.floor(Math.random() * 50)]; // Artificially creating a location for the user
                let userMarker = L.marker(userCoords, {icon: greenIcon});
                userMarker.addTo(mymap);
                userMarker.bindPopup(`<b>User with id: ${userData.user_id}`);

                // Requests Markers
                let requests = userData.ip_requests;
                let color = randomColor()

                requests.forEach(request => {
                    let requestCoords = [request.lat, request.lng];
                    let requestMarker = L.marker(requestCoords);
                    requestMarker.addTo(mymap);

                    let lineWeight = (request.count / maxCount) * 3;
                    let line = L.polyline([userCoords, requestCoords], {
                        weight: lineWeight,
                        color
                    });
                    line.addTo(mymap);
                });
            });
        });
}

function randomColor() {
    let randomString = Math.floor(Math.random() * 16777215).toString(16);
    let randomColor = "#" + randomString;
    return randomColor;
}