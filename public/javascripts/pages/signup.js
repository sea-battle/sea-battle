function checkEmailAddress() {
    'use strict';

    var regexEmail = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

    if (!regexEmail.test(event.target.value)) {
        // Action if e-mail address is valid
        return true;
    } else {
        // Action if e-mail address is not valid
        return false
    }
}

function checkUsername() {
    'use strict';

    var usernameAvailabilityMessage = document.getElementById('username-availability-message');

    if (event.target.value === '') {
        usernameAvailabilityMessage.innerHTML = '';
        return;
    } else {
        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && this.status === 200) {
                var checkUsernameAvailabilityResponse = JSON.parse(xhr.responseText);

                usernameAvailabilityMessage.innerHTML = checkUsernameAvailabilityResponse['usernameAvailabilityMessage'];
            }
        };

        xhr.open('POST', '/check-username-availability', true);
        xhr.setRequestHeader('content-type', 'application/json; charset=utf-8');
        xhr.send(JSON.stringify({ username: event.target.value }));
    }
}

function checkPassword() {
    'use strict';

    var passwordField = document.getElementById('signup-password');

    if (passwordField.value === event.target.value) {
        return true;
    } else {
        return false;
    }
}

function proceedSignup() {
    'use strict';

    event.preventDefault();

    var xhr = new XMLHttpRequest();

    var username = document.getElementById('signup-username').value,
        email = document.getElementById('signup-email').value,
        password = document.getElementById('signup-password').value,
        passwordConfirmation = document.getElementById('signup-password-confirmation').value;

    var user = {
        username: username,
        email: email,
        password: password,
        password_confirmation: passwordConfirmation
    }

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && this.status === 200) {
            var signupResponse = JSON.parse(xhr.responseText);

            document.getElementById('signup-message').innerHTML = signupResponse['signupMessage'];
        }
    };

    xhr.open('POST', '/signup', true);
    xhr.setRequestHeader('content-type', 'application/json; charset=utf-8');
    xhr.send(JSON.stringify(user));
}

document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    var buttonSignupSubmit = document.getElementById('signup-submit'),
        emailField = document.getElementById('signup-email'),
        usernameField = document.getElementById('signup-username'),
        passwordConfirmationField = document.getElementById('signup-password-confirmation');

    buttonSignupSubmit.addEventListener('click', proceedSignup, false);
    emailField.addEventListener('blur', checkEmailAddress, false);
    usernameField.addEventListener('keyup', checkUsername, false);
    passwordConfirmationField.addEventListener('blur', checkPassword, false);
});