function proceedSignin() {
    'use strict';

    event.preventDefault();

    var xhr = new XMLHttpRequest();

    var email = document.getElementById('signin-email').value,
        password = document.getElementById('signin-password').value,

    var user = {
        username: username,
        password: password,
    }

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && this.status === 200) {
            var signinResponse = JSON.parse(xhr.responseText);

            document.getElementById('signin-message').innerHTML = signinResponse['signinMessage'];
        }
    };

    xhr.open('POST', '/signin', true);
    xhr.setRequestHeader('content-type', 'application/json; charset=utf-8');
    xhr.send(JSON.stringify(user));
}

document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    var signinSubmit = document.getElementById('signin-submit');

    // signinSubmit.addEventListener('click', proceedSignin, false);
}, false);