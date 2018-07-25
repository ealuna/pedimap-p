(function () {

    var UserData = appPedimap.UserData;
    var InputData = appPedimap.InputData;

    var customeRequests = {
        'listSucursal': function () {
            appPedimap.postRequest({
                url: '/empresa/lista-sucursal',
                success: function (response) {
                    customeRequests.listEsquema({
                        sucursal: InputData.setOptions({
                            name: 'sucursal',
                            data: response.data,
                            selected: UserData.defaultSucursal
                        })
                    });
                }
            });
        },
        'listEsquema': function (options) {
            options = options || {};
            var payload = {
                sucursal: (options.sucursal || UserData.defaultSucursal)
            };
            appPedimap.postRequest({
                url: '/empresa/lista-esquema',
                data: payload,
                success: function (response) {
                    payload.esquema = InputData.setOptions({
                        name: 'esquema',
                        data: response.data,
                        selected: UserData.defaultEsquema
                    });
                    customeRequests.listJefe(payload);
                }
            });
        },
        'listJefe': function (options) {
            options = options || {};
            var payload = {
                sucursal: options.sucursal || UserData.defaultSucursal,
                esquema: options.esquema || UserData.defaultEsquema,
                empleado: options.empleado || UserData.defaultEmpleado,
                cargo: 'G'
            };
            appPedimap.postRequest({
                url: '/empresa/lista-empleado',
                data: payload,
                success: function (response) {
                    payload.empleado = InputData.setOptions({name: 'jefe', data: response.data});
                    customeRequests.listEmpleado(payload);
                }
            });
        },
        'listEmpleado': function (options) {
            options = options || {};
            var payload = {
                sucursal: options.sucursal || UserData.defaultSucursal,
                esquema: options.esquema || UserData.defaultEsquema,
                empleado: options.empleado || UserData.defaultEmpleado,
                cargo: 'S'
            };
            appPedimap.postRequest({
                url: '/empresa/lista-empleado',
                data: payload,
                success: function (response) {
                    InputData.setOptions({name: 'supervisor', data: response.data, firstDefault: true});
                    customeRequests.tableMovil(payload);
                }
            });
        },
        'actualizarDispositivo': function (options, callback) {
            var payload = {
                sucursal: options.sucursal,
                esquema: options.esquema,
                empleado: options.empleado,
                imei: options.imei,
                anulado: options.anulado
            };
            appPedimap.postRequest({
                url: '/empleado/movil-actualizar',
                data: payload,
                success: function (response) {
                    callback(response.data)
                }
            });
        },
        'tableMovil': function (options) {
            options = options || {};
            var payload = {
                sucursal: options.sucursal || UserData.defaultSucursal,
                esquema: options.esquema || UserData.defaultEsquema,
                empleado: options.empleado || InputData.getValue('supervisor') || UserData.defaultEmpleado || null,
                anulado: InputData.getValue('verAnulado')
            };
            appPedimap.postRequest({
                url: '/empleado/movil-detalle',
                data: payload,
                success: function (response) {
                    appPedimap.defaultDataTable({
                        id: 'tMovilModal',
                        data: response.data,
                        labels: [
                            'Codigo',
                            'Nombre',
                            'Jefe/Supervisor',
                            'Modelo',
                            'IMEI',
                            'Estado',
                            'Fecha Alta',
                            'Fecha Baja',
                            'Opciones'
                        ],
                        columns: [
                            {data: 'codigo'},
                            {data: 'nombre'},
                            {data: 'supervisor.nombre'},
                            {data: 'modelo'},
                            {data: 'imei'},
                            {
                                orderable: false,
                                render: function (data, type, row) {
                                    var check = '<i title="Activo" class="fas fa-check-circle" style="color: #00a65a"></i>';
                                    var ban = '<i title="Anulado" class="fas fa-ban" style="color: #dd4b39"></i>';
                                    return row.anulado ? ban : check;
                                }
                            },
                            {data: 'fechadesde'},
                            {data: 'fechahasta'},
                            {
                                orderable: false,
                                render: function (data, type, row) {
                                    return '<div class="dropdown in-table">' +
                                        '<button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown" aria-expanded="false">' +
                                        'Opciones <span class="caret"></span>' +
                                        '</button>' +
                                        '<ul class="dropdown-menu pull-right" role="menu">' +
                                        '<li><a href="#" onclick="appPedimap.activarDispositivo(\'' + row.sucursal + '\', \'' + row.esquema + '\', \'' + row.codigo + '\', \'' + row.imei + '\')"' + (row.anulado ? '' : '  disabled') + '><i class="fa fa-check-circle" style="color: #00a65a"></i>Activar Dispositivo</a></li>' +
                                        '<li><a href="#" onclick="appPedimap.anularDispositivo(\'' + row.sucursal + '\', \'' + row.esquema + '\', \'' + row.codigo + '\', \'' + row.imei + '\')"' + (row.anulado ? ' disabled' : '') + '><i class="fa fa-ban" style="color: #dd4b39"></i>Anular Dispositivo</a></li></ul></div>'
                                }
                            }
                        ],
                        columnDefs: [{"orderData": 0, "targets": 1}, {"visible": false, "targets": 0}]
                    });
                }
            });
        }
    };

    switch (UserData.type) {
        case 'ADMIN':
            customeRequests.listSucursal();
            break;
        case 'JEFEVENTAS':
            customeRequests.listEmpleado();
            break;
        default:
            customeRequests.listEmpleado();
            break;
    }


    function initialLoad() {

        switch (UserData.type) {
            case 'ADMIN':
                customeRequests.listSucursal();
                break;
            case 'JEFEVENTAS':
                customeRequests.listEmpleado();
                break;
            default:
                customeRequests.listEmpleado();
                break;
        }
    }

    InputData.eventChange('sucursal', function () {
        customeRequests.listEsquema({
            sucursal: this.value
        });
    });
    InputData.eventChange('esquema', function () {
        customeRequests.listJefe({
            sucursal: InputData.getValue('sucursal'),
            esquema: this.value
        });
    });
    InputData.eventChange('jefe', function () {
        customeRequests.listEmpleado({
            sucursal: InputData.getValue('sucursal'),
            esquema: InputData.getValue('esquema'),
            empleado: this.value
        });
    });
    InputData.eventChange('supervisor', function () {
        customeRequests.tableMovil({
            sucursal: InputData.getValue('sucursal'),
            esquema: InputData.getValue('esquema'),
            empleado: this.value
        });
    });
    InputData.eventChange('verAnulado', function () {
        customeRequests.tableMovil({
            sucursal: InputData.getValue('sucursal'),
            esquema: InputData.getValue('esquema'),
            empleado: InputData.getValue('supervisor') || InputData.getValue('jefe')
        });
    });

    appPedimap.anularDispositivo = function (sucursal, esquema, empleado, imei) {
        alertify.confirm('Confirmar Acción', '¿Desea anular el dispositivo?', function () {
                //alertify.success('Ok')
                customeRequests.actualizarDispositivo({
                    sucursal: sucursal,
                    esquema: esquema,
                    empleado: empleado,
                    imei: imei,
                    anulado: 1
                }, function (data) {
                    if (data[0].resultado) {
                        alertify.success(data[0].mensaje);
                    } else {
                        alertify.error(data[0].mensaje);
                    }
                    initialLoad()
                })
            }
            , function () {
            });
    };

    appPedimap.activarDispositivo = function (sucursal, esquema, empleado, imei) {
        alertify.confirm('Confirmar Acción', '¿Desea activar el dispositivo?', function () {
                customeRequests.actualizarDispositivo({
                    sucursal: sucursal,
                    esquema: esquema,
                    empleado: empleado,
                    imei: imei,
                    anulado: 0
                }, function (data) {
                    if (data[0].resultado) {
                        alertify.success(data[0].mensaje);
                    } else {
                        alertify.error(data[0].mensaje);
                    }
                    initialLoad()
                })
            }
            , function () {
            });
    };
})();