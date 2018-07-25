(function () {
    if (!window.appPedimap) window.appPedimap = {};

    appPedimap.height = (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight);

    window.getParameterByName = function (name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"), results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    };

    document.getElementByNameOrId = function (n) {
        return this.getElementsByName(n)[0] || this.getElementById(n);
    };

    appPedimap.setNewStyle = function (text) {
        var style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = text;
        (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(style);
    };

    document.inputValidation = function (inputs, callback) {
        for (var i = 0; i < inputs.length; i++) {
            var input = document.getElementByNameOrId(inputs[i]);
            if (input.value === "") {
                return callback(input.name);
            }
        }
        callback();
    };

    document.setSelectData = function (select, data, options) {
        var name = options.name || 'descrip';
        var html = options.firstCustome || (options.first ? '<option value="" selected>TODOS</option>' : '');
        var value = options.selected;

        data.forEach(function (item) {
            html += ('<option value="' + item['codigo'] + '">' + item[name] + '</option>');
        });

        select.html(html);
        if (value) select.val(value);
        select.trigger("chosen:updated");

        return select.val();
    }

    window.postRequest = function (ajax, payload) {
        var url = payload.url;
        var data = payload.data || {};
        var success = payload.success;
        var error = payload.error || function (error) {
            //console.log(error.responseText)
        };

        ajax.post({
            url: '/pedimap/api' + url,
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(data),
            success: success,
            error: error
        });
    }

    window.setIntervalAndExcute = function (callback, timeout) {
        if (window._interval) clearInterval(window._interval);
        callback();
        window._interval = setInterval(callback, timeout);
    }

    window.setFirstAndInterval = function (cb1, cb2, timeout) {
        if (window._interval) clearInterval(window._interval);
        cb1();
        window._interval = setInterval(cb2, timeout);
    }

    window.parsePolygonPoints = function (data) {
        var coords = data.split(',');
        var paths = [];
        coords.forEach(function (item) {
            var coord = item.trim().split(' ');
            paths.push({lng: parseFloat(coord[0]), lat: parseFloat(coord[1])});
        });
        return paths;
    }

})();