function proceedSignin() {
    'use strict';

    event.preventDefault();

    var usernameField = document.getElementById('username'),
        passwordField = document.getElementById('password');

    var user = {
        username: usernameField.value,
        password: passwordField.value
    }

    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (this.status === 200) {
                window.location = '/rooms';
            }

            if (this.status === 401) {
                document.getElementById('signin-message').innerHTML = 'Le mot de passe ou le pseudonyme est incorrect';
            }
        }
    };

    xhr.open('POST', '/signin', true);
    xhr.setRequestHeader('content-type', 'application/json; charset=utf-8');
    xhr.send(JSON.stringify(user));
}

document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    var signinSubmit = document.getElementById('signin-submit');

    signinSubmit.addEventListener('click', proceedSignin, false);
}, false);