var ajax = {
    get: function (url, handlers) {
        var request = new XMLHttpRequest();
        request.open('GET', url, true);

        request.onreadystatechange = function () {
            if (this.readyState === 4) {
                if (this.status >= 200 && this.status < 400) {
                    var data = JSON.parse(this.responseText);
                    handlers.onComplete(data);
                } else {
                    //TODO
                    //handlers.onError();
                }
            }else{
                //TODO
                //handlers.onFail();
            }
        };
        request.send();
        request = null;
    }
}