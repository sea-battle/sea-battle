var handlers = {
    onComplete: function (data) {
        //TODO change innerHTML
        document.body.innerHTML = data.html;
        document.title = data.title;
        data.scriptsSrc.forEach(function (src) {
            var script = document.createElement('script');
            script.src = src;
            document.body.appendChild(script);
        });
    }
}