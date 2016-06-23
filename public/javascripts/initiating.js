var openedClass = 'opened';

function initPlayerInfo() {
    var rankingOverlay = document.getElementById('rankings-overlay');
    var statsOverlay = document.getElementById('stats-overlay');
    var playerInfo = document.getElementById('player-info');

    document.getElementById('rankings-link').addEventListener('click', function(e) {
        e.preventDefault();
        rankingOverlay.addClass(openedClass);
    });

    document.getElementById('close-rankings').addEventListener('click', function() {
        rankingOverlay.removeClass(openedClass);
    });

    document.getElementById('stats-link').addEventListener('click', function(e) {
        e.preventDefault();
        statsOverlay.addClass(openedClass);
    });

    document.getElementById('close-stats').addEventListener('click', function() {
        statsOverlay.removeClass(openedClass);
    });

    document.getElementById('profil-link').addEventListener('click', function(e) {
        e.preventDefault();
        if (document.body.hasClass('wait') || document.body.hasClass('game')) {
            if (confirm('Il vous faut quitter la partie pour accéder à votre profil, voulez-vous continuer ?'))
                document.location.href = this.href;
        }
        else
            document.location.href = this.href;
    });

    document.getElementById('close-player-info').addEventListener('click', function(e) {
        playerInfo.removeClass(openedClass);
        bodyScroll(true);
    });

    document.getElementById('player-info-toggle').addEventListener('click', function(e) {
        playerInfo.addClass(openedClass);
        bodyScroll(false);
    });
}

function initChat() {
	var chat = document.getElementById('chat');

    document.getElementById('close-chat').addEventListener('click', function() {
        chat.removeClass(openedClass);
        bodyScroll(true);
    });

	document.getElementById('chat-toggle').addEventListener('click', function() {
		chat.addClass(openedClass);
        bodyScroll(false);
	});
}

function initRanking() {
    var ranking = document.getElementById('game-ranking');

    document.getElementById('close-ranking').addEventListener('click', function() {
        ranking.removeClass(openedClass);
        bodyScroll(true);
    });

    document.getElementById('ranking-toggle').addEventListener('click', function() {
        ranking.addClass(openedClass);
        bodyScroll(false);
    });
}

function initAside() {
    var switchingAside = document.getElementById('switching-aside');

    document.getElementById('close-aside').addEventListener('click', function() {
        switchingAside.removeClass(openedClass);
        bodyScroll(true);
    });

    document.getElementById('aside-toggle').addEventListener('click', function() {
        switchingAside.addClass(openedClass);
        bodyScroll(false);
    });
}

function initModals() {
    document.getElementById('close-social').addEventListener('click', function(e) {
        document.getElementById('social-modal').removeClass(openedClass);
        bodyScroll(true);
    });

    document.getElementById('close-replay').addEventListener('click', function(e) {
        document.getElementById('replay-modal').removeClass(openedClass);
        bodyScroll(false);
    });
}

function bodyScroll(scroll) {
    scroll ? document.body.removeClass('overlayed') : document.body.addClass('overlayed');
}

function initWait() {
    initPlayerInfo();
    initChat();
}

function initGame() {
    initPlayerInfo();
    initChat();
    initRanking();
    initAside();
    initModals();
}