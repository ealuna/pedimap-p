(function () {
    "use strict";

    var UserData = appPedimap.UserData;
    var InputData = appPedimap.InputData;


    var customeRequests = {
        'coberturaGeneralPreventa': function (cb) {
            appPedimap.postRequest({
                url: '/empleado/cobertura/preventa-general',
                data: {
                    sucursal: UserData.defaultSucursal,
                    esquema: UserData.defaultEsquema,
                    fecha: moment(InputData.getValue('date'), 'DD/MM/YYYY').format('YYYY/MM/DD'),
                    empleado: UserData.defaultEmpleado
                },
                success: function (response) {
                    cb(response.data)
                }
            });
        },
        'volumenGeneralPreventa': function (cb) {
            appPedimap.postRequest({
                url: '/empleado/volumen/preventa-general',
                data: {
                    sucursal: UserData.defaultSucursal,
                    esquema: UserData.defaultEsquema,
                    fecha: moment(InputData.getValue('date'), 'DD/MM/YYYY').format('YYYY/MM/DD'),
                    empleado: UserData.defaultEmpleado
                },
                success: function (response) {
                    cb(response.data)
                }
            });
        },
        'volumenLineaPreventa': function (cb) {
            appPedimap.postRequest({
                url: '/empleado/volumen/preventa-linea',
                data: {
                    sucursal: UserData.defaultSucursal,
                    esquema: UserData.defaultEsquema,
                    fecha: moment(InputData.getValue('date'), 'DD/MM/YYYY').format('YYYY/MM/DD'),
                    empleado: UserData.defaultEmpleado
                },
                success: function (response) {
                    cb(response.data)
                }
            });
        },
        'volumenMesaPreventa': function (ops) {
            appPedimap.postRequest({
                url: '/empleado/volumen/preventa-mesa',
                data: {
                    sucursal: UserData.defaultSucursal,
                    esquema: UserData.defaultEsquema,
                    fecha: moment(InputData.getValue('date'), 'DD/MM/YYYY').format('YYYY/MM/DD'),
                    empleado: ops.empleado || UserData.defaultEmpleado,
                    linea: ops.linea || null
                },
                success: function (response) {
                    ops.callback(response.data)
                }
            });
        },
        'volumenVendedorPreventa': function (ops) {
            appPedimap.postRequest({
                url: '/empleado/volumen/preventa-vendedor',
                data: {
                    sucursal: UserData.defaultSucursal,
                    esquema: UserData.defaultEsquema,
                    fecha: moment(InputData.getValue('date'), 'DD/MM/YYYY').format('YYYY/MM/DD'),
                    empleado: ops.empleado || UserData.defaultEmpleado,
                    linea: ops.linea || null
                },
                success: function (response) {
                    ops.callback(response.data)
                }
            });
        },
        'efectividadGeneralPreventa': function (cb) {
            appPedimap.postRequest({
                url: '/empleado/efectividad/preventa-general',
                data: {
                    sucursal: UserData.defaultSucursal,
                    esquema: UserData.defaultEsquema,
                    fecha: moment(InputData.getValue('date'), 'DD/MM/YYYY').format('YYYY/MM/DD'),
                    empleado: UserData.defaultEmpleado
                },
                success: function (response) {
                    cb(response.data)
                }
            });
        },
        'rechazoVolumenGeneralRuta': function (cb) {
            appPedimap.postRequest({
                url: '/empleado/rechazo/ruta-volumen-general',
                data: {
                    sucursal: UserData.defaultSucursal,
                    esquema: UserData.defaultEsquema,
                    fecha: moment(InputData.getValue('date'), 'DD/MM/YYYY').format('YYYY/MM/DD'),
                    empleado: UserData.defaultEmpleado
                },
                success: function (response) {
                    cb(response.data)
                }
            });
        },
        'rechazoVolumenMesaRuta': function (cb) {
            appPedimap.postRequest({
                url: '/empleado/rechazo/ruta-volumen-mesa',
                data: {
                    sucursal: UserData.defaultSucursal,
                    esquema: UserData.defaultEsquema,
                    fecha: moment(InputData.getValue('date'), 'DD/MM/YYYY').format('YYYY/MM/DD'),
                    empleado: UserData.defaultEmpleado
                },
                success: function (response) {
                    cb(response.data)
                }
            });
        },
        'rechazoVolumenVendedorRuta': function (ops) {
            appPedimap.postRequest({
                url: '/empleado/rechazo/ruta-volumen-mesa',
                data: {
                    sucursal: UserData.defaultSucursal,
                    esquema: UserData.defaultEsquema,
                    fecha: moment(InputData.getValue('date'), 'DD/MM/YYYY').format('YYYY/MM/DD'),
                    empleado: ops.empleado || UserData.defaultEmpleado
                },
                success: function (response) {
                    ops.callback(response.data)
                }
            });
        }
    };

    function calcPorcentaje(value, total) {
        return ((total === 0 ? 0 : (value / total)) * 100).toFixed(2);
    }

    cargarAvanceGeneral(function (chart, data) {
        chartAvanceGeneral(chart);
        appPedimap.collapseDataTable({
            id: 'tResumen',
            data: data,
            labels: ['Descripción', 'Pendiente', 'Avance', '%'],
            columns: [
                {'data': 'label'},
                {'data': 'total'},
                {'data': 'avance'},
                {'data': 'avance'},
            ]
        });
        $('#dResumen button').show();
    });

    customeRequests.volumenLineaPreventa(function (data) {
        chartVolumenPreventa({
            id: 'cLinea',
            title: 'PREVENTA VS CUOTA DEL DÍA POR LINEA DE PRODUCTO',
            responsiveLabels: false,
            data: data,
            onLabelClick: function (value, name) {
                $('#dMesaModal button').hide();
                appPedimap.resetCollapse('tMesaModal');
                appPedimap.resetChart('cMesaModal');
                appPedimap.modalChart('modal', function () {
                    customeRequests.volumenMesaPreventa({
                        linea: value,
                        callback: function (data) {
                            chartVolumenPreventa({
                                id: 'cMesaModal',
                                title: 'PREVENTA VS CUOTA DEL DÍA DE ' + name + ' POR MESA',
                                data: data
                            });
                            appPedimap.collapseDataTable({
                                id: 'tMesaModal',
                                data: data,
                                labels: ['Mesa', 'Cuota', 'Avance', '%'],
                                columns: [
                                    {'data': 'label.name'},
                                    {'data': 'total'},
                                    {'data': 'avance'},
                                    {'data': 'avance'},
                                ]
                            });
                            $('#dMesaModal button').show();
                        }
                    });
                });
            }
        });
        $('#dLinea button').show();
    });

    customeRequests.volumenMesaPreventa({
        callback: function (data) {
            chartVolumenPreventa({
                id: 'cMesa',
                title: 'PREVENTA VS CUOTA DEL DÍA POR MESA',
                data: data,
                onLabelClick: function (value, name) {
                    appPedimap.resetChart('cMesaModal');
                    $('#dMesaModal button').hide();
                    appPedimap.modalChart('modal', function () {
                        customeRequests.volumenVendedorPreventa({
                            empleado: value,
                            callback: function (data) {
                                chartVolumenPreventa({
                                    id: 'cMesaModal',
                                    title: 'PREVENTA VS CUOTA DEL DÍA DE ' + name + ' POR VENDEDOR',
                                    data: data
                                });
                                $('#dMesaModal button').show();
                            }
                        });
                    });
                }
            });
            $('#dMesa button').show();
        }
    });

    /*
        customeRequests.rechazoVolumenMesaRuta(function (data) {
            chartRechazoRuta({id: 'rechazo', title: 'RECHAZO EN RUTA POR MESA', data: data})
        });
    */
    function chartAvanceGeneral(chartData) {
        return appPedimap.chartBarVertical({
            id: 'cResumen',
            title: 'AVANCE GENERAL DE PREVENTA',
            labels: 'label',
            data: [chartData],
            format: 'percentage',
            datasets: [{
                id: 'volumen',
                label: 'Volumen',
                stack: 0,
                backgroundColor: '#36a2eb'

            }, {
                id: 'cobertura',
                label: 'Cobertura',
                stack: 1,
                backgroundColor: '#cc65fe'
            }, {
                id: 'efectividad',
                label: 'Efectividad',
                stack: 2,
                backgroundColor: '#4bc0c0'
            }, {
                id: 'rechazo',
                label: 'Rechazo en ruta',
                stack: 3,
                backgroundColor: '#ff6384'

            }]
        });
    }

    customeRequests.volumenGeneralPreventa(function (data) {
        chartVolumenPreventaVertical({id: 'cGeneral', title: 'PREVENTA VS CUOTA DEL DÍA', data: data});
        $('#dGeneral button').show();
    });

    function chartVolumenPreventa(ops) {
        return appPedimap.chartBarHorizontal({
            id: ops.id,
            title: ops.title,
            labels: 'label',
            data: ops.data,
            responsiveLabels: ops.responsiveLabels === undefined ? true : ops.responsiveLabels,
            format: 'money',
            onLabelClick: ops.onLabelClick,
            responsive: true,
            maintainAspectRatio: false,
            datasets: [{
                id: 'total',
                label: 'Cuota',
                stack: 0,
                backgroundColor: '#ff6384'
            }, {
                id: 'avance',
                label: 'Preventa',
                stack: 1,
                backgroundColor: '#ffce56'
            }]
        });
    }

    function chartVolumenPreventaVertical(ops) {
        return appPedimap.chartBarVertical({
            id: ops.id,
            title: ops.title,
            labels: 'label',
            data: ops.data,
            responsiveLabels: ops.responsiveLabels === undefined ? true : ops.responsiveLabels,
            format: 'money',
            onLabelClick: ops.onLabelClick,
            datasets: [{
                id: 'total',
                label: 'Cuota',
                stack: 0,
                backgroundColor: '#ff6384'
            }, {
                id: 'avance',
                label: 'Preventa',
                stack: 1,
                backgroundColor: '#ffce56'
            }]
        });
    }

    function chartRechazoRuta(ops) {
        return appPedimap.chartBarHorizontal({
            id: ops.id,
            title: ops.title, //,
            labels: 'label',
            responsiveLabels: true,
            data: ops.data,
            format: 'money',
            onLabelClick: ops.onLabelClick,
            datasets: [{
                id: 'avance',
                label: 'Rechazo en ruta',
                stack: 0,
                backgroundColor: '#ff6384'
            }]
        });
    }

    function cargarAvanceGeneral(cb) {
        var chartData = {label: 'AVANCE GENERAL'};
        var rawData = [];
        customeRequests.coberturaGeneralPreventa(function (data) {
            rawData.push(data[0]);
            chartData.cobertura = calcPorcentaje(data[0].avance, data[0].total);
            customeRequests.volumenGeneralPreventa(function (data) {
                rawData.push(data[0]);
                chartData.volumen = calcPorcentaje(data[0].avance, data[0].total);
                customeRequests.efectividadGeneralPreventa(function (data) {
                    rawData.push(data[0]);
                    chartData.efectividad = calcPorcentaje(data[0].avance, data[0].total);
                    customeRequests.rechazoVolumenGeneralRuta(function (data) {
                        rawData.push(data[0]);
                        chartData.rechazo = calcPorcentaje(data[0].avance, data[0].total);
                        cb(chartData, rawData)
                    })
                })
            })
        })
    }

})();