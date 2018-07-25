(function () {
    window.storage = window.localStorage || window.sessionStorage;

    if (!storage) {
        console.error('El navegador no soporta Web Storage.');
    }

    var setInput = function (input, value) {
        switch (input.type) {
            case 'text':
                input.value = value;
                break;
            case 'checkbox':
                input.checked = value;
                break;
            default:
                input.value = value;
                break;
        }
    };
    var getInput = function (input) {
        switch (input.type) {
            case 'text':
                return input.value;
            case 'checkbox':
                return input.checked;
            default:
                return input.value;
        }
    };

    document.getElementByNameOrId = function (n) {
        return this.getElementsByName(n)[0] || this.getElementById(n);
    };

    window.loadInputs = function (page, inputs) {
        if (!storage) return;

        var values = JSON.parse(storage.getItem(page));

        if (!values) return;

        inputs.forEach(function (name) {
            var input = document.getElementByNameOrId(name);
            if (values.hasOwnProperty(name)) setInput(input, values[name]);
        });

    };

    window.saveInputs = function (page, inputs, check) {
        if (!storage) return;

        var values = {};

        inputs.forEach(function (name) {
            var input = document.getElementByNameOrId(name);
            if (check) values[name] = getInput(input);
        });

        storage.setItem(page, JSON.stringify(values));
    };

})();