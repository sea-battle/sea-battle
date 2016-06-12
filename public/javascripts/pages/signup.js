function checkEmailAddress() {
    'use strict';

    var signupEmailMessage = document.getElementById(event.target.id + '-message');

    var regexEmail = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

    if (!regexEmail.test(event.target.value)) {
        event.target.classList.add('error');
        signupEmailMessage.innerHTML = 'Entrez une adresse e-mail valide';
    } else {
        event.target.classList.remove('error');
        signupEmailMessage.innerHTML = '';
    }
}

function checkUsername() {
    'use strict';

    var signupUsernameMessage = document.getElementById('signup-username-message');

    if (event.target.value === '') {
        signupUsernameMessage.innerHTML = '';
        return;
    } else {
        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && this.status === 200) {
                var signupUsername = document.getElementById('signup-username'),
                    checkUsernameAvailabilityResponse = JSON.parse(xhr.responseText);

                if (!checkUsernameAvailabilityResponse['usernameAvailability']) {
                    signupUsername.classList.add('error');
                } else {
                    signupUsername.classList.remove('error');
                }

                signupUsernameMessage.innerHTML = checkUsernameAvailabilityResponse['usernameAvailabilityMessage'];
            }
        };

        xhr.open('POST', '/check-username-availability', true);
        xhr.setRequestHeader('content-type', 'application/json; charset=utf-8');
        xhr.send(JSON.stringify({ username: event.target.value }));
    }
}

function checkPassword() {
    'use strict';

    var signupPassword = document.getElementById('signup-password'),
        signupPasswordConfirmation = document.getElementById('signup-password-confirmation'),
        signupPasswordMessage = document.getElementById('signup-password-message'),
        signupPasswordConfirmationMessage = document.getElementById('signup-password-confirmation-message');

    if (signupPassword.value === signupPasswordConfirmation.value) {
        event.target.classList.remove('error');
        signupPasswordConfirmationMessage.innerHTML = '';
    } else {
        event.target.classList.add('error');
        signupPasswordConfirmationMessage.innerHTML = 'Les mots de passe ne correspondent pas';
    }
}

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
        if (xhr.readyState === 4 && this.status === 200) {
            var signupResponse = JSON.parse(xhr.responseText);

            document.getElementById('signup-message').innerHTML = signupResponse['signupMessage'];
        }
    };

    xhr.open('POST', '/signup', true);
    xhr.setRequestHeader('content-type', 'application/json; charset=utf-8');
    xhr.send(JSON.stringify(user));
}

document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    var signupSubmit = document.getElementById('signup-submit'),
        signupEmail = document.getElementById('signup-email'),
        signupUsername = document.getElementById('signup-username'),
        signupPassword = document.getElementById('signup-password'),
        signupPasswordConfirmation = document.getElementById('signup-password-confirmation');

    signupSubmit.addEventListener('click', proceedSignup, false);
    signupEmail.addEventListener('blur', checkEmailAddress, false);
    signupUsername.addEventListener('keyup', checkUsername, false);
    signupPassword.addEventListener('keyup', checkPassword, false);
    signupPasswordConfirmation.addEventListener('keyup', checkPassword, false);
}, false);