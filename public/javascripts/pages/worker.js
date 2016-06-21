self.addEventListener('message', function (e) {
    var data = e.data;
    var result = true;

    console.log('data:', data);

    for (var i = 0; i < data.length; i++) {
        if (data[i] !== true) {
            result = false;
        }
    }

    postMessage(result);
}, false);