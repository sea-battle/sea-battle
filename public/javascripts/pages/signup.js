function proceedSignup(e) {
    'use strict';

    e.preventDefault();

    var xhr = new XMLHttpRequest();

    var signupForm = document.getElementById('signup'),
        signupMessage = document.getElementById('signup-message'),
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
            if (this.status === 201) {
                signupForm.innerHTML = '<p id="signup-message">Votre compte a été créé. Un e-mail de confirmation vous a été envoyé</p>';
            } else if (this.status === 500) {
                signupMessage.innerHTML = 'Une erreur est survenue lors de l\'inscription';
            }
        }
    };

    xhr.open('POST', '/signup', true);
    xhr.setRequestHeader('content-type', 'application/json; charset=utf-8');
    xhr.setRequestHeader('x-requested-with', 'XMLHttpRequest');
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