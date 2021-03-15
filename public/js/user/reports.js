function reportsScript() {
    let mymap = L.map('mapid', {
        minZoom: 2
    });
    let tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
    tiles.addTo(mymap);
    mymap.setView([50, 0], 2);

    // Get Map Data
    $.getJSON('dashboard/api/mapData')
        .done( map_data => {
            let cfg = {
                "radius": 40,
                "maxOpacity": 0.8,
                "scaleRadius": false,
                "useLocalExtrema": false,
                latField: 'lat',
                lngField: 'lng',
                valueField: 'count'
            }

            let heatmapLayer = new HeatmapOverlay(cfg);
            mymap.addLayer(heatmapLayer);
            heatmapLayer.setData(map_data);
        });
}