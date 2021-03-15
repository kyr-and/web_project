function profileScript() {
    let num_upload_result = $('#num-upload-result');
    let num_entries_result = $('#num-entries-result');
    let last_upload_result = $('#last-upload-result');
    let username_input = $('#account-username');
    let email_input = $('#account-email');
    let update_button = $('#update-profile-button');
    let pass_input = $('#account-pass');
    let confirm_pass_input = $('#account-confirm-pass');
    let update_profile_form = $('#update-profile-form');

    // Get Profile Data
    $.getJSON('dashboard/api/profile')
        .done( profile_info => {
            let { num_upload, num_entries, username, email, last_upload } = profile_info;

            if (last_upload) {
                last_upload = last_upload.split('T').join(', ').split('.')[0];
            } 

            num_upload_result.text(num_upload);
            num_entries_result.text(num_entries);
            last_upload_result.text(last_upload);
            username_input.val(username);
            email_input.val(email);
        });

    // Get Leaderboard Data
    $.getJSON('dashboard/api/leaderboard')
        .done( leaderboard_info => {
            fillLeaderboard(leaderboard_info);
        });

    // Update Profile
    update_button.on('click', event => {
        event.preventDefault();

        let data = {
            username: username_input.val(),
            password: pass_input.val(),
            password2: confirm_pass_input.val()
        }
        $.ajax({
            type: 'POST',
            url: '/dashboard/api/update',
            data,
            datatype: 'json'
        }).done( validationErrors => {
            $('.error-container').remove();
            update_profile_form.prepend("<div class='error-container'></div>");

            if (validationErrors.length === 0) {
                $('.error-container').prepend('<p class="alert alert-success text-center">Update Successful.</p>');
            }
            else {
                addErrors(validationErrors);
            }
        });
    });
}

// Add Errors to Form
function addErrors(errors) {
    let errorContainer = $('.error-container');

    errors.forEach(error => {
        errorContainer.prepend(`<p class="alert alert-warning text-center">${error.msg}</p>`);
    });
}

// Fill Leaderboard
function fillLeaderboard(leaderboard_info) {
    let leaderboard_table = $('#leaderboard-body');
    leaderboard_table.empty();

    let curr_user = leaderboard_info.curr_user;

    leaderboard_info.leaderboard.forEach((user, idx) => {
        if (idx > 4) {
            return;
        }
        else {
            let tr_class = "table-secondary";
            if (user.username == curr_user) {
                tr_class = "table-success"
            }
            leaderboard_table.append($(`<tr class=${tr_class}><th scope="row">${idx+1}</th><td>${user.username}</td><td>${user.num_entries}</td></tr>`));
        }
    });
}