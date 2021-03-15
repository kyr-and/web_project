function basicInformationScript() {
    // Get Basic Information
    $.getJSON('dashboard/api/basicInformation')
        .done( basics => {
            fillBasicInformation(basics);
        });
}

function fillBasicInformation(basics) {
    let counts = { 
        'Number of users': basics.user_count,
        'Number of unique domains': basics.domain_count,
        'Number of ISPs': basics.isp_count
     }
    fillCountsTable(counts);

    fillCharts(basics);
}

function fillCountsTable(counts) {
    let counts_table = $('#basic-counts-body');
    for (const [key, value] of Object.entries(counts)) {
        counts_table.append(`<tr class="table-secondary"><td>${key}</td><td>${value}</td></tr>`);
    }
}

function fillCharts(stats) {
    let randomColors = Array.from({length: 100}, () => randomColor());

    let requests_data = {
        datasets: [{
            data: stats.requests_per_method.map(obj => obj.count),
            backgroundColor: randomColors
        }],
        labels: stats.requests_per_method.map(obj => obj.method)
    };
    fillRequestsChart(requests_data);

    let responses_data = {
        datasets: [{
            data: stats.responses_per_status.map(obj => obj.count),
            backgroundColor: randomColors
        }],
        labels: stats.responses_per_status.map(obj => `Status ${obj.status}`)
    };
    fillResponsesChart(responses_data);

    let lifespan_data = {
        datasets: [{
            data: stats.content_lifespan.map(obj => obj.lifespan),
            backgroundColor: randomColors
        }],
        labels: stats.content_lifespan.map(obj => obj.content_type)
    };
    fillLifespanChart(lifespan_data);
}

function fillRequestsChart(data) {
    let canvas = document.getElementById('requestsChart').getContext('2d');
    let requestsPieChart = new Chart(canvas, {
        type: 'pie',
        data,
        options: {
            title: {
                display: true,
                text: 'Requests per Method',
                position: 'bottom'
            }
        }
    });
}

function fillResponsesChart(data) {
    let canvas = document.getElementById('responsesChart').getContext('2d');
    let responsesPieChart = new Chart(canvas, {
        type: 'pie',
        data,
        options: {
            title: {
                display: true,
                text: 'Responses per Status',
                position: 'bottom'
            }
        }
    });
}

function fillLifespanChart(data) {
    let canvas = document.getElementById('lifespanChart').getContext('2d');
    let responsesPieChart = new Chart(canvas, {
        type: 'doughnut',
        data,
        options: {
            title: {
                display: true,
                text: 'Lifespan(in hours) per content type',
                position: 'bottom'
            }
        }
    });
}


function randomColor() {
    let randomString = Math.floor(Math.random() * 16777215).toString(16);
    let randomColor = "#" + randomString;
    return randomColor;
}