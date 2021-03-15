let loginForm = $('#login-form');
let formUsername = $('#username');
let formPassword = $('#password');

loginForm.on('submit', (event) => {
    event.preventDefault();

    let data = {
        'username': formUsername.val(),
        'password': formPassword.val()
    }

    $.ajax({
        type: 'POST',
        url: '/users/api/login',
        data,
        datatype: 'json'
    }).done(loggedIn => { 
        if (loggedIn) {
            window.location = '/dashboard';
        }
        else {
            $('#login-error').remove();
            loginForm.prepend(`<p id="login-error" class="alert alert-warning">Email or password incorrect.</p>`);
        }
     });
});