function proceedSignin() {
    'use strict';

    event.preventDefault();

    var emailField = document.getElementById('email'),
        passwordField = document.getElementById('password');

    var user = {
        username: emailField.value,
        password: passwordField.value
    }

    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (this.status === 200) {
                window.location = '/rooms';
            }

            if (this.status === 401) {
                document.getElementById('signin-message').innerHTML = 'Le mot de passe ou le pseudonyme est incorrect. <br /> Avez-vous confirmé votre inscription ?';
            }
        }
    };

    xhr.open('POST', '/signin', true);
    xhr.setRequestHeader('content-type', 'application/json; charset=utf-8');
    xhr.setRequestHeader('x-requested-with', 'XMLHttpRequest');
    xhr.send(JSON.stringify(user));
}

document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    var signinSubmit = document.getElementById('signin-submit');

    signinSubmit.addEventListener('click', proceedSignin, false);
}, false);