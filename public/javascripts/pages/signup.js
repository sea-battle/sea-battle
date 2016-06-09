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
        if (this.readyState === 4 && this.status === 200) {
            console.log('response :', xhr.responseText);
        }
    };

    xhr.open('POST', '/signup', true);
    xhr.setRequestHeader('content-type', 'application/json; charset=utf-8');
    xhr.send(JSON.stringify(user));
}

document.addEventListener('DOMContentLoaded', function () {
    var buttonSignupSubmit = document.getElementById('signup-submit');

    buttonSignupSubmit.addEventListener('click', proceedSignup, false);
});