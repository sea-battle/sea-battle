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
        xhr.send(JSON.stringify({ username: event.target.value }));
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
            if (xhr.readyState === 4 && (this.status === 200 || this.status === 500)) {
                var response = JSON.parse(xhr.responseText);
                emailMessage.innerHTML = response['message'];
            }
        };

        xhr.open('POST', '/edit-email', true);
        xhr.setRequestHeader('content-type', 'application/json; charset=utf-8');
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
        if (xhr.readyState === 4 && this.status === 200) {
            var response = JSON.parse(xhr.responseText);
            usernameMessage.innerHTML = response['message'];
        }
    };

    xhr.open('POST', '/edit-username', true);
    xhr.setRequestHeader('content-type', 'application/json; charset=utf-8');
    xhr.send(JSON.stringify({ username: usernameField.value }));
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
    xhr.send();
}

document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    var emailSubmit = document.getElementById('email-submit'),
        usernameField = document.getElementById('username'),
        usernameSubmit = document.getElementById('username-submit'),
        deleteUserSubmit = document.getElementById('delete-user');

    emailSubmit.addEventListener('click', editEmail, false);
    usernameField.addEventListener('keyup', checkUsername, false);
    usernameSubmit.addEventListener('click', editUsername, false);
    deleteUserSubmit.addEventListener('click', deleteUser, false);
}, false);