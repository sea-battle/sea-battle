function getRanking(routeRanking) {
    'use strict';

    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (this.status === 200) {
                var sectionRanking = document.getElementById('ranking');

                sectionRanking.removeChildren();
                sectionRanking.innerHTML = JSON.parse(xhr.responseText).html;
            }

            if (this.status === 401) {
                window.location = '/';
            }
        }
    };

    xhr.open('GET', routeRanking, true);
    xhr.setRequestHeader('content-type', 'application/json; charset=utf-8');
    xhr.setRequestHeader('x-requested-with', 'XMLHttpRequest');
    xhr.send();
}

document.addEventListener('DOMContentLoaded', function () {
    var linkGeneralRanking = document.getElementById('rankings-link'),
        linkMonthRanking = document.getElementById('month-ranking-tab');

    linkMonthRanking.addEventListener('click', function () {
        getRanking('/month-ranking');
    }, false);

    linkGeneralRanking.addEventListener('click', function () {
        getRanking('/general-ranking');
    }, false);
}, false);