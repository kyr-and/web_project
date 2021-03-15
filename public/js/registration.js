let registrationForm = $('.registration-form');
let formUsername = $('#username');
let formEmail = $('#email');
let formPassword = $('#password');
let formPassword2 = $('#password2');

registrationForm.on('submit', (event) => {
    event.preventDefault();

    let data = {
        'username': formUsername.val(),
        'email': formEmail.val(),
        'password': formPassword.val(),
        'password2': formPassword2.val()
    }

    $.ajax({
        type: 'POST',
        url: '/users/api/save',
        data,
        datatype: 'json'
    }).done( validationErrors => {
        $('.error-container').remove();
        registrationForm.prepend("<div class='error-container'></div>");

        if (validationErrors.length === 0) {
            $('.error-container').prepend('<p class="alert alert-success text-center">Registration Successful.<br>Redirecting to log in...</p>');
            setTimeout(() => window.location = '/users/login', 3000);
        }
        else {
            addErrors(validationErrors);
        }
    });
});


// Add Errors to Form
function addErrors(errors) {
    let errorContainer = $('.error-container');

    errors.forEach(error => {
        errorContainer.prepend(`<p class="alert alert-warning">${error.msg}</p>`);
    });
}
