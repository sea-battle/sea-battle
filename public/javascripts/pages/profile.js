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

function editEmail() {
    'use strict';

    event.preventDefault();

    var emailField = document.getElementById('email'),
        emailMessage = document.getElementById('email-message');

    var regexEmail = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

    if (!regexEmail.test(emailField.value)) {
        emailField.classList.add('error');
        emailMessage.innerHTML = 'Entrez une adresse e-mail valide';
    } else {
        emailField.classList.remove('error');
        emailMessage.innerHTML = '';

        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (this.status === 200) {
                    emailMessage.innerHTML = 'L\'adresse e-mail a été changé avec succès';
                }

                if (this.status === 500) {
                    emailMessage.innerHTML = 'L\'adresse e-mail n\'a pas pu être changé';
                }

                if (this.status === 401) {
                    window.location = '/';
                }
            }
        };


        xhr.open('POST', '/edit-email', true);
        xhr.setRequestHeader('content-type', 'application/json; charset=utf-8');
        xhr.setRequestHeader('x-requested-with', 'XMLHttpRequest');
        xhr.send(JSON.stringify({ email: emailField.value }));
    }
}

function editUsername() {
    'use strict';

    event.preventDefault();

    var usernameField = document.getElementById('username'),
        usernameMessage = document.getElementById('username-message');

    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (this.status === 200) {
                usernameMessage.innerHTML = 'Le pseudonyme a été changé avec succès';
            }

            if (this.status === 500) {
                usernameMessage.innerHTML = 'Le pseudonyme n\'a pas pu être changé';
            }

            if (this.status === 401) {
                window.location = '/';
            }
        }
    };

    xhr.open('POST', '/edit-username', true);
    xhr.setRequestHeader('content-type', 'application/json; charset=utf-8');
    xhr.setRequestHeader('x-requested-with', 'XMLHttpRequest');
    xhr.send(JSON.stringify({ username: usernameField.value }));
}

function editPassword() {
    'use strict';

    event.preventDefault();

    var oldPasswordField = document.getElementById('old-password'),
        passwordField = document.getElementById('password'),
        passwordMessage = document.getElementById('password-message')

    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (this.status === 200) {
                passwordMessage.innerHTML = 'Le mot de passe a été changé avec succès';
            }

            if (this.status === 500) {
                passwordMessage.innerHTML = 'Le mot de passe n\'a pas pu être changé';
            }

            if (this.status === 403) {
                passwordMessage.innerHTML = 'Le mot de passe actuel est erroné';
            }

            if (this.status === 401) {
                window.location = '/';
            }
        }
    };

    xhr.open('POST', '/edit-password', true);
    xhr.setRequestHeader('content-type', 'application/json; charset=utf-8');
    xhr.setRequestHeader('x-requested-with', 'XMLHttpRequest');
    xhr.send(JSON.stringify({
        oldPassword: oldPasswordField.value,
        password: passwordField.value
    }));
}

function deleteUser() {
    'use strict';

    event.preventDefault();

    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && this.status === 200) {
            window.location = '/';
        }
    };

    xhr.open('POST', '/delete-user', true);
    xhr.setRequestHeader('content-type', 'application/json; charset=utf-8');
    xhr.setRequestHeader('x-requested-with', 'XMLHttpRequest');
    xhr.send();
}

document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    var emailSubmit = document.getElementById('email-submit'),
        usernameField = document.getElementById('username'),
        usernameSubmit = document.getElementById('username-submit'),
        passwordField = document.getElementById('password'),
        passwordConfirmationField = document.getElementById('password-confirmation'),
        passwordSubmit = document.getElementById('password-submit'),
        deleteUserSubmit = document.getElementById('delete-user');

    emailSubmit.addEventListener('click', editEmail, false);
    usernameField.addEventListener('keyup', checkUsername, false);
    usernameSubmit.addEventListener('click', editUsername, false);
    passwordField.addEventListener('keyup', checkPassword, false);
    passwordConfirmationField.addEventListener('keyup', checkPassword, false);
    passwordSubmit.addEventListener('click', editPassword, false);
    deleteUserSubmit.addEventListener('click', deleteUser, false);
}, false);