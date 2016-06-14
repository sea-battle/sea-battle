function proceedSignin() {
    'use strict';

    event.preventDefault();

    var xhr = new XMLHttpRequest();

    var username = document.getElementById('signin-username').value,
        password = document.getElementById('signin-password').value;

    var user = {
        username: username,
        password: password
    }

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && (this.status === 200 || this.status === 401)) {
            var response = JSON.parse(xhr.responseText);

            if (!response['success']) {
                document.getElementById('signin-message').innerHTML = response['message'];
            } else {
                window.location = '/rooms';
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