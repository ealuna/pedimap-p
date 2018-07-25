(function () {

    appPedimap.collapseDataTable = function (options) {
        var id = '#' + options.id + ' table';
        var data = options.data;
        var columns = options.columns;

        var collapse = $('#' + options.id);
        collapse.collapse('hide');
        collapse.on('shown.bs.collapse', function () {
            resetTable({id: options.id, columns: options.labels});
            $(id).dataTable({
                'destroy': true,
                "paging": false,
                'language': {
                    "url": "http://cdn.datatables.net/plug-ins/9dcbecd42ad/i18n/Spanish.json"
                },
                'dom': 'frtp',
                'filter': false,
                //'responsive': true,
                'stateSave': false,
                'data': data,
                'columns': columns
            });
            collapse.unbind('shown.bs.collapse');
        });
    };

    appPedimap.defaultDataTable = function (options) {
        var id = '#' + options.id + ' table';
        var data = options.data;
        var columns = options.columns;
        var columnDefs = options.columnDefs || undefined;
        resetTable({id: options.id, columns: options.labels, footer: options.footer});
        $(id).dataTable({
            'destroy': true,
            "paging": false,
            'language': {
                "url": "http://cdn.datatables.net/plug-ins/9dcbecd42ad/i18n/Spanish.json"
            },
            'dom': 'frtp',
            'filter': true,
            'responsive': true,
            'stateSave': false,
            "order": [],
            'data': data,
            'columns': columns,
            'columnDefs': columnDefs,
            'footerCallback': (options.footerCallback instanceof Function ? options.footerCallback : undefined)
        });
    };

    var modalTable = function (id, cb, cb2) {
        var modal = $('#' + id);
        modal.on('shown.bs.modal', function () {
            cb();
        });
        if (cb2 instanceof Function) {
            modal.on('hidden.bs.modal', function () {
                cb2();
            });
        }
    };

    var collapseTable = function (id, cb) {
        var collapse = $('#' + id);
        collapse.collapse('hide');
        collapse.on('shown.bs.collapse', function () {
            cb();
            collapse.unbind('shown.bs.collapse');
        });
    };

    var resetCollapse = function (id) {
        var collapse = $('#' + id);
        var html = '<div class="loading"><img src="/pedimap/assets/images/ajax-loader.gif"></div>';
        collapse.collapse('hide');
        collapse.html(html);
    };

    var resetTableModal = function (id) {
        var collapse = $('#' + id);
        var html = '<div class="loading"><img src="/pedimap/assets/images/ajax-loader.gif"></div>';
        collapse.html(html);
    };

    appPedimap['collapseTable'] = collapseTable;
    appPedimap['resetCollapse'] = resetCollapse;
    appPedimap['resetTableModal'] = resetTableModal;
    appPedimap['modalTable'] = modalTable;

    function resetTable(options) {
        var id = options.id;
        var columns = options.columns;
        var footer = options.footer instanceof Array ? options.footer : [];
        var classes = 'table table-bordered table-striped table-responsive';
        var style = 'style="width: 100%"';
        var html = '<table class="' + classes + '" cellspacing="0" ' + style + '><thead ' + style + '><tr>';
        for (var z = 0; z < columns.length; z++) {
            html += '<th>' + columns[z] + '</th>';
        }
        html += '</tr></thead><tbody></tbody><tfoot>';
        for (var y = 0; y < footer.length; y++) {
            var colspan = (footer[y].colspan > 1 ? ' colspan="' + footer[y].colspan + '"' : '');
            var column = '<th' + colspan + '>' + (footer[y].text || '') + '</th>';
            html += new Array(footer[y].columns + 1).join(column);
        }
        html += '</tfoot></table>';
        $('#' + id + ' table').remove();
        $('#' + id).html(html);
    }

})();