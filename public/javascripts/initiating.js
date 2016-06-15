function initPlayerInfo() {
    var rankingOverlay = document.getElementById('rankings-overlay');
    var statsOverlay = document.getElementById('stats-overlay');

    document.getElementById('rankings-link').addEventListener('click', function(e) {
        e.preventDefault();
        rankingOverlay.addClass('opened');
    });

    document.getElementById('close-rankings').addEventListener('click', function() {
        rankingOverlay.removeClass('opened');
    });

    document.getElementById('stats-link').addEventListener('click', function(e) {
        e.preventDefault();
        statsOverlay.addClass('opened');
    });

    document.getElementById('close-stats').addEventListener('click', function() {
        statsOverlay.removeClass('opened');
    });

    document.getElementById('profil-link').addEventListener('click', function(e) {
        e.preventDefault();
        if (confirm('Il vous faut quitter la partie pour modifier vos informations, voulez-vous continuer ?'))
            document.location.href = this.href;
    });
}

function initChat() {
	var chat = document.getElementById('chat');
	var chatToggle = document.getElementById('chat-toggle');
	var openedClass = 'opened';

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