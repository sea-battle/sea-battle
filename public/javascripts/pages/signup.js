function checkEmailAddress() {
    'use strict';

    var emailField = document.getElementById('email'),
        emailMessage = document.getElementById('email-message');

    var regexEmail = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

    if (!regexEmail.test(emailField.value)) {
        emailField.classList.add('error');
        emailMessage.innerHTML = 'Entrez une adresse e-mail valide';
    } else {
        emailField.classList.remove('error');
        emailMessage.innerHTML = '';
    }
}

function checkUsername() {
    'use strict';

    var usernameField = document.getElementById('username'),
        usernameMessage = document.getElementById('username-message');

    if (usernameField.value === '') {
        usernameMessage.innerHTML = '';
        return;
    } else {
        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (this.status === 200) {
                    usernameField.classList.remove('error');
                    usernameMessage.innerHTML = 'Ce pseudonyme est disponible';
                }

                if (this.status === 409) {
                    usernameField.classList.add('error');
                    usernameMessage.innerHTML = 'Ce pseudonyme est déjà utlisé';
                }
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
        passwordConfirmationField = document.getElementById('password-confirmation'),
        passwordMessage = document.getElementById('password-message');

    if (
        passwordField.value !== passwordConfirmationField.value &&
        passwordField.value !== '' &&
        passwordConfirmationField.value !== ''
    ) {
        event.target.classList.add('error');
        passwordMessage.innerHTML = 'Les mots de passe ne correspondent pas';
    } else {
        event.target.classList.remove('error');
        passwordMessage.innerHTML = '';
    }
}

function proceedSignup() {
    'use strict';

    event.preventDefault();

    var xhr = new XMLHttpRequest();

    var signupMessage = document.getElementById('signup-message'),
        emailField = document.getElementById('email'),
        usernameField = document.getElementById('username'),
        passwordField = document.getElementById('password'),
        passwordConfirmationField = document.getElementById('password-confirmation');

    var user = {
        email: emailField.value,
        username: usernameField.value,
        password: passwordField.value,
        passwordConfirmation: passwordConfirmationField.value
    }

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (this.status === 200) {
                signupMessage.innerHTML = 'Un e-mail de confirmation vous a été envoyé';
            } else if (this.status === 401) {
                signupMessage.innerHTML = 'Une erreur est survenue lors de l\'inscription';
            }
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