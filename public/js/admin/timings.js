function timingsScript() {
    $('select').multiselect({
        buttonWidth: '150px',
        widthSynchronizationMode: 'always',
        maxHeight: 200
    });
    getData();
    getSelections();

    let updateButton = $('#update-chart');
    updateButton.on('click', event => {
        let restrictions = {
            content_type: $('#selectContentType').val().join(';'),
            method: $('#selectMethod').val().join(';'),
            day: $('#selectDay').val().join(';'),
            isp: $('#selectISP').val().join(';')
        }     
        
        getData(restrictions);
    });
}

function processTimingsData(timings) {
    let labels = Array.from(new Array(24), (x, i) => (i < 10) ? `0${i+1}:00` : `${i+1}:00`);
    let data = Array.from(new Array(24), (x, i) => {
        let idx = timings.findIndex(timing => timing.time == i);
        if (idx != -1) {
            return timings[idx].avg_wait;
        }
        else {
            return 0;
        }
    });

    let randomColors = Array.from({length: 24}, () => randomColor());

    let timings_data = {
        labels,
        datasets: [{
            label: 'Average Wait Time (in ms)',
            backgroundColor: randomColors,
            data
        }]
    };

    return timings_data
}

function fillTimingsChart(data) {
    let canvas = document.getElementById('timingsChart').getContext('2d');
    let timingsChart = new Chart(canvas, {
        type: 'bar',
        data,
        options: {}
    });
}

function getData(restrictions = null) {
    let content_type, day, method, isp;
    if (!restrictions) {
        content_type = day = method = isp = "";
    } 
    else {
        content_type = restrictions.content_type || "";
        day = restrictions.day || "";
        method = restrictions.method || "";
        isp = restrictions.isp || "";
    }
    
    $.getJSON(`dashboard/api/timingsInformation?content_type=${content_type}&day=${day}&method=${method}&isp=${isp}`)
        .done( timings => {
            let timings_data = processTimingsData(timings);  
            fillTimingsChart(timings_data);
        });
}

function getSelections(methods = true) {
    $.getJSON('dashboard/api/selections')
        .done( selections => {
            if (methods) {
                fillMethodsSelection(selections.methods);
            }
            fillContentTypesSelection(selections.content_types);
            fillISPsSelection(selections.isps);
        });
}

function fillContentTypesSelection(options) {
    let selectList = $('#selectContentType');
    options.forEach(option => {
        selectList.append(new Option(option.content_type, option.content_type));
    });
    selectList.multiselect('rebuild');
}

function fillMethodsSelection(options) {
    let selectList = $('#selectMethod');
    options.forEach(option => {
        selectList.append(new Option(option.method, option.method));
    });
    selectList.multiselect('rebuild');
}

function fillISPsSelection(options) {
    let selectList = $('#selectISP');
    options.forEach(option => {
        selectList.append(new Option(option.isp, option.isp));
    });
    selectList.multiselect('rebuild');
}

function randomColor() {
    let randomString = Math.floor(Math.random() * 16777215).toString(16);
    let randomColor = "#" + randomString;
    return randomColor;
}