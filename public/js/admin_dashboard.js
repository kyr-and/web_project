let pageContainer = $('#pageContainer');
let basicsNav = $('#basics-nav');
let timingsNav = $('#timings-nav');
let headersNav = $('#headers-nav');
let dataNav = $('#data-nav');

basicsNav.on('click', event => {
    event.preventDefault();

    $.get('/dashboard/basics', pageContent => {
        pageContainer.empty();
        pageContainer.html(pageContent);
        basicInformationScript();
    });
});

timingsNav.on('click', event => {
    event.preventDefault();

    $.get('/dashboard/timings', pageContent => {
        pageContainer.empty();
        pageContainer.html(pageContent);
        timingsScript();
    });
});

headersNav.on('click', event => {
    event.preventDefault();

    $.get('/dashboard/headers', pageContent => {
        pageContainer.empty();
        pageContainer.html(pageContent);
        headersScript();
    });
});

dataNav.on('click', event => {
    event.preventDefault();

    $.get('/dashboard/data', pageContent => {
        pageContainer.empty();
        pageContainer.html(pageContent);
        dataScript();
    });
});

$('a').on('click', event => {
    $('a').removeClass('active');
    $(event.target).addClass('active');
});

basicsNav.click();