function proceedSignup() {
    'use strict';

    event.preventDefault();
}

document.addEventListener('DOMContentLoaded', function () {
    var buttonSignupSubmit = document.getElementById('signup-submit');

    buttonSignupSubmit.addEventListener('click', proceedSignup, false);
});