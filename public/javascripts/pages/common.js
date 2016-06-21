function checkEmailAddress() {
    'use strict';

    var emailField = document.getElementById('email'),
        emailMessage = document.getElementById('email-message'),
        emailSubmit = (document.getElementById('email-submit')) ? document.getElementById('email-submit') : false;

    var regexEmail = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

    if (!regexEmail.test(emailField.value)) {
        emailField.classList.add('error');
        emailMessage.innerHTML = 'Entrez une adresse e-mail valide';
        if (emailSubmit) emailSubmit.style.display = 'none';
        emailIsValid = false;
        formIsValid.postMessage([emailIsValid, usernameIsValid, passwordIsValid]);
    } else {
        emailField.classList.remove('error');
        emailMessage.innerHTML = '';
        if (emailSubmit) emailSubmit.style.display = 'block';
        emailIsValid = true;
        formIsValid.postMessage([emailIsValid, usernameIsValid, passwordIsValid]);
    }
}

function checkUsername() {
    'use strict';

    var usernameField = document.getElementById('username'),
        usernameMessage = document.getElementById('username-message'),
        usernameSubmit = (document.getElementById('username-submit')) ? document.getElementById('username-submit') : false;

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
                    if (usernameSubmit) usernameSubmit.style.display = 'block';
                    usernameIsValid = true;
                    formIsValid.postMessage([emailIsValid, usernameIsValid, passwordIsValid]);
                }

                if (this.status === 409) {
                    usernameField.classList.add('error');
                    usernameMessage.innerHTML = 'Ce pseudonyme est déjà utlisé';
                    if (usernameSubmit) usernameSubmit.style.display = 'none';
                    usernameIsValid = false;
                    formIsValid.postMessage([emailIsValid, usernameIsValid, passwordIsValid]);
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
        passwordMessage = document.getElementById('password-message'),
        passwordSubmit = (document.getElementById('password-submit')) ? document.getElementById('password-submit') : false;

    if (passwordField.value !== '' && passwordConfirmationField.value !== '') {
        if (passwordField.value === passwordConfirmationField.value) {
            e.target.classList.remove('error');
            passwordMessage.innerHTML = '';
            if (passwordSubmit) passwordSubmit.style.display = 'block';
            passwordIsValid = true;
            formIsValid.postMessage([emailIsValid, usernameIsValid, passwordIsValid]);
        } else {
            e.target.classList.add('error');
            passwordMessage.innerHTML = 'Les mots de passe ne correspondent pas';
            if (passwordSubmit) passwordSubmit.style.display = 'none';
            passwordIsValid = false;
            formIsValid.postMessage([emailIsValid, usernameIsValid, passwordIsValid]);
        }
    }
}