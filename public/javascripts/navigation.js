var handlers = {
    onComplete: function (data) {
        //TODO change innerHTML
        var switcher = document.getElementById('switching-content');
        switcher.innerHTML = data.html;
        document.title = data.title;
        document.body.className = data.bodyClass;
        data.scriptsSrc.forEach(function (src) {
            var script = document.createElement('script');
            script.src = src;
            switcher.appendChild(script);
        });
    }
}