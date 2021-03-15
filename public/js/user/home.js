function homeScript() {
    let user_since = $('#user-since');

    $.getJSON('dashboard/api/home')
        .done( info => {
            let date_formatted = info.createdAt.split('T')[0];
            user_since.text("You've been with us since: "+ date_formatted);
        });
}