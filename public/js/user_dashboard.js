let pageContainer = $('#pageContainer');
let uploadNav = $('#upload-nav');
let profileNav = $('#profile-nav');
let reportsNav = $('#reports-nav');
let homeNav = $('#home-nav');

homeNav.on('click', event => {
    event.preventDefault();

    $.get('/dashboard/home', pageContent => {
        pageContainer.empty();
        pageContainer.html(pageContent);
        homeScript();
    });
});

uploadNav.on('click', event => {
    event.preventDefault();

    $.get('/dashboard/upload', pageContent => {
        pageContainer.empty();
        pageContainer.html(pageContent);
        uploadScript();
    });
});

profileNav.on('click', event => {
    event.preventDefault();

    $.get('/dashboard/profile', pageContent => {
        pageContainer.empty();
        pageContainer.html(pageContent);
        profileScript();
    });
});

reportsNav.on('click', event => {
    event.preventDefault();

    $.get('/dashboard/reports', pageContent => {
        pageContainer.empty();
        pageContainer.html(pageContent);
        reportsScript();
    });
});

$('a').on('click', event => {
    $('a').removeClass('active');
    $(event.target).addClass('active');
});

homeNav.click();