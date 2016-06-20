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
        xhr.setRequestHeader('x-requested-with', 'XMLHttpRequest');
        xhr.send(JSON.stringify({ username: usernameField.value }));
    }
}

function checkPassword(e) {
    'use strict';

    var passwordField = document.getElementById('password'),
        passwordConfirmationField = document.getElementById('password-confirmation'),
        passwordMessage = document.getElementById('password-message');

    if (
        passwordField.value !== passwordConfirmationField.value &&
        passwordField.value !== '' &&
        passwordConfirmationField.value !== ''
    ) {
        e.target.classList.add('error');
        passwordMessage.innerHTML = 'Les mots de passe ne correspondent pas';
    } else {
        e.target.classList.remove('error');
        passwordMessage.innerHTML = '';
    }
}