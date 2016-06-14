function checkUsername() {
    'use strict';

    var usernameMessage = document.getElementById('username-message');

    if (event.target.value === '') {
        usernameMessage.innerHTML = '';
        return;
    } else {
        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && this.status === 200) {
                var editUsername = document.getElementById('edit-username'),
                    response = JSON.parse(xhr.responseText);

                if (!response['success']) {
                    editUsername.classList.add('error');
                } else {
                    editUsername.classList.remove('error');
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

    var email = document.getElementById('edit-email').value,
        emailField = document.getElementById('edit-email'),
        emailMessage = document.getElementById('email-message');

    var regexEmail = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

    if (!regexEmail.test(email)) {
        emailField.classList.add('error');
        emailMessage.innerHTML = 'Entrez une adresse e-mail valide';
    } else {
        emailField.classList.remove('error');
        emailMessage.innerHTML = '';

        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && this.status === 200) {
                var response = JSON.parse(xhr.responseText);

                emailMessage.innerHTML = response['message'];
            }
        };

        xhr.open('POST', '/edit-email', true);
        xhr.setRequestHeader('content-type', 'application/json; charset=utf-8');
        xhr.send(JSON.stringify({ email: email }));
    }
}

function editUsername() {
    'use strict';

    event.preventDefault();

    var xhr = new XMLHttpRequest();

    var username = document.getElementById('edit-username').value,
        usernameMessage = document.getElementById('username-message');

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && this.status === 200) {
            var response = JSON.parse(xhr.responseText);

            usernameMessage.innerHTML = response['message'];
        }
    };

    xhr.open('POST', '/edit-username', true);
    xhr.setRequestHeader('content-type', 'application/json; charset=utf-8');
    xhr.send(JSON.stringify({ username: username }));
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

    var editEmailSubmit = document.getElementById('email-submit'),
        deleteUserSubmit = document.getElementById('delete-user'),
        editUsernameField = document.getElementById('edit-username'),
        editUsernameSubmit = document.getElementById('username-submit');

    editEmailSubmit.addEventListener('click', editEmail, false);
    editUsernameField.addEventListener('keyup', checkUsername, false);
    editUsernameSubmit.addEventListener('click', editUsername, false);
    deleteUserSubmit.addEventListener('click', deleteUser, false);
}, false);