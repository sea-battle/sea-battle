var ajax = {
    get: function (url, callback) {
        var request = new XMLHttpRequest();
        request.open('GET', url, true);

        request.onreadystatechange = function () {
            if (this.readyState === 4) {
                if (this.status >= 200 && this.status < 400) {
                    var data = JSON.parse(this.responseText);
                    callback(data);
                } else {
                    //TODO
                    //handlers.onError();
                }
            } else {
                //TODO
                //handlers.onFail();
            }
        };
        request.send();
        request = null;
    },
    post: function (url, data, callback) {
        var request = new XMLHttpRequest();
        request.open('POST', url, true);
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        request.onreadystatechange = function () {
            if (this.readyState === 4) {
                if (this.status >= 200 && this.status < 400) {
                    var data = JSON.parse(this.responseText);
                    callback(data);
                } else {
                    callback('Fail');
                }
            } else {
                callback('Error');
            }
        };
        request.send(data);
    }
}