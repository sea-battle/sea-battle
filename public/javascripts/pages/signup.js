function checkEmailAddress() {
    'use strict';

    var signupEmailMessage = document.getElementById(event.target.id + '-message');

    var regexEmail = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

    if (!regexEmail.test(event.target.value)) {
        event.target.classList.add('error');
        signupEmailMessage.innerHTML = 'Entrez une adresse e-mail valide';
    } else {
        event.target.classList.remove('error');
        signupEmailMessage.innerHTML = '';
    }
}

function checkUsername() {
    'use strict';

    var usernameField = document.getElementById('username'),
        usernameMessage = document.getElementById('username-message');

    if (usernameField.value === '') {
        signupUsernameMessage.innerHTML = '';
        return;
    } else {
        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && this.status === 200) {
                var response = JSON.parse(xhr.responseText);

                if (!response['success']) {
                    usernameField.classList.add('error');
                } else {
                    usernameField.classList.remove('error');
                }

                usernameMessage.innerHTML = response['message'];
            }
        };

        xhr.open('POST', '/check-username-availability', true);
        xhr.setRequestHeader('content-type', 'application/json; charset=utf-8');
        xhr.send(JSON.stringify({ username: usernameField.value }));
    }
}

function checkPassword() {
    'use strict';

    var passwordField = document.getElementById('password'),
        passwordMessage = document.getElementById('password-message'),
        passwordConfirmationField = document.getElementById('password-confirmation'),
        passwordConfirmationMessage = document.getElementById('password-confirmation-message');

    if (passwordField.value !== passwordConfirmationField.value) {
        event.target.classList.add('error');
        passwordConfirmationMessage.innerHTML = 'Les mots de passe ne correspondent pas';
    } else {
        event.target.classList.remove('error');
        passwordConfirmationMessage.innerHTML = '';
    }
}

function proceedSignup() {
    'use strict';

    event.preventDefault();

    var xhr = new XMLHttpRequest();

    var emailField = document.getElementById('email'),
        usernameField = document.getElementById('username'),
        passwordField = document.getElementById('password'),
        passwordConfirmationField = document.getElementById('password-confirmation');

    var user = {
        email: emailField.value,
        username: usernameField.value,
        password: passwordField.value,
        password_confirmation: passwordConfirmationField.value
    }

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && (this.status === 200 || this.status === 403)) {
            var response = JSON.parse(xhr.responseText);
            document.getElementById('signup-message').innerHTML = response['message'];
        }
    };

    xhr.open('POST', '/signup', true);
    xhr.setRequestHeader('content-type', 'application/json; charset=utf-8');
    xhr.send(JSON.stringify(user));
}

document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    var emailField = document.getElementById('email'),
        usernameField = document.getElementById('username'),
        passwordField = document.getElementById('password'),
        passwordConfirmationField = document.getElementById('password-confirmation'),
        signupSubmit = document.getElementById('signup-submit');

    emailField.addEventListener('blur', checkEmailAddress, false);
    usernameField.addEventListener('keyup', checkUsername, false);
    passwordField.addEventListener('keyup', checkPassword, false);
    passwordConfirmationField.addEventListener('keyup', checkPassword, false);
    signupSubmit.addEventListener('click', proceedSignup, false);
}, false);