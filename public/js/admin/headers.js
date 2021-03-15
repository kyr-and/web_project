function headersScript() {
    // Initialize multiselect plugin
    $('select').multiselect({
        buttonWidth: '150px',
        widthSynchronizationMode: 'always',
        maxHeight: 200
    });

    // Fill the selections in multiselects (fuctnion exists in timings.js)
    getSelections(false);

    // Get Histogram Information
    getHistogramData();

    // Get Cacheability Percentage
    getTableData();

    // Update table functionallity
    let updateTableButton = $('#update-table');
    updateTableButton.on('click', event => {
        $('#cacheability-body').empty();

        let restrictions = {
            content_type: $('#selectContentType').val().join(';'),
            isp: $('#selectISP').val().join(';')
        };

        getTableData(restrictions);
    });
}

function fillCacheabilityTable(cacheability_info) {
    let table = $('#cacheability-body');
    let info_array = cacheability_info.info;
    let max = cacheability_info.num_responses;
    
    info_array.forEach(info => {
        let dir = info.cacheability_directives;

        // Populate table row
        let public = (dir.public) ? ((dir.public/max)* 100).toFixed(1) : 0;
        let private = (dir.private) ? ((dir.private/max)* 100).toFixed(1) : 0;
        let no_cache =  (dir['no-cache']) ? ((dir['no-cache']/max) * 100).toFixed(1) : 0;
        let no_store = (dir['no-store']) ? ((dir['no-store']/max)* 100).toFixed(1) : 0;
        table.append(`<tr class="table-secondary"><td>${info.content_type}</td><td>${public}</td><td>${private}</td><td>${no_cache}</td><td>${no_store}</td></tr>`);
    });
}

function getTableData(restrictions = null) {
    let content_type, isp;
    if (!restrictions) {
        content_type = isp = "";
    } 
    else {
        content_type = restrictions.content_type || "";
        isp = restrictions.isp || "";
    }
    
    $.getJSON(`dashboard/api/cacheability?content_type=${content_type}&isp=${isp}`)
        .done( cacheability_info => {
            console.log(cacheability_info);
            fillCacheabilityTable(cacheability_info);
        });
}

function getHistogramData(restrictions = null) {
    let content_type, isp;
    if (!restrictions) {
        content_type = isp = "";
    } 
    else {
        content_type = restrictions.content_type || "";
        isp = restrictions.isp || "";
    }

    $.getJSON(`dashboard/api/histogram?content_type=${content_type}&isp=${isp}`)
        .done( histogram_info => {
            console.log(histogram_info);
        });
}