var openedClass = 'opened';

function initPlayerInfo() {
    var rankingOverlay = document.getElementById('rankings-overlay');
    var statsOverlay = document.getElementById('stats-overlay');
    var playerInfoToggle = document.getElementById('player-info-toggle');
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
        if (confirm('Il vous faut quitter la partie pour modifier vos informations, voulez-vous continuer ?'))
            document.location.href = this.href;
    });

    playerInfoToggle.addEventListener('click', function(e) {
        if (playerInfoToggle.hasClass(openedClass)) {
            playerInfoToggle.removeClass(openedClass);
            playerInfo.removeClass(openedClass);
        } else {
            playerInfoToggle.addClass(openedClass);
            playerInfo.addClass(openedClass);
        }
    });
}

function initChat() {
	var chat = document.getElementById('chat');
	var chatToggle = document.getElementById('chat-toggle');

	chatToggle.addEventListener('click', function(e) {
		if (chatToggle.hasClass(openedClass)) {
			chatToggle.removeClass(openedClass);
			chat.removeClass(openedClass);
		} else {
			chatToggle.addClass(openedClass);
			chat.addClass(openedClass);
		}
	});
}

function initRanking() {
    var ranking = document.getElementById('game-ranking');
    var rankingToggle = document.getElementById('ranking-toggle');

    rankingToggle.addEventListener('click', function(e) {
        if (rankingToggle.hasClass(openedClass)) {
            rankingToggle.removeClass(openedClass);
            ranking.removeClass(openedClass);
        } else {
            rankingToggle.addClass(openedClass);
            ranking.addClass(openedClass);
        }
    });
}

function initAside() {
    var switchingAside = document.getElementById('switching-aside');
    var asideToggle = document.getElementById('aside-toggle');

    rankingToggle.addEventListener('click', function(e) {
        if (asideToggle.hasClass(openedClass)) {
            asideToggle.removeClass(openedClass);
            switchingAside.removeClass(openedClass);
        } else {
            asideToggle.addClass(openedClass);
            switchingAside.addClass(openedClass);
        }
    });
}

function initSocialModal() {
    document.getElementById('close-social').addEventListener('click', function(e) {
        document.getElementById('social-modal').removeClass(openedClass);
    });
}

function initReplayModal() {
    document.getElementById('close-replay').addEventListener('click', function(e) {
        document.getElementById('replay-modal').removeClass(openedClass);
    });
}