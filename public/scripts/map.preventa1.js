(function () {
    var UserData = appPedimap.UserData;
    var InputData = appPedimap.InputData;

    var MapUtils = appPedimap.MapUtils;
    var MapEvents = appPedimap.MapEvents;
    var MapElements = appPedimap.MapElements;

    var __map = appPedimap.defaultMap;

    var __marker = {
        'empleado': [],
        'cliente': [],
        'clienteVisitado': [],
        'clienteNuevo': []
    };
    var __polyline = {
        'empleado': []
    };
    var __polygon = {
        'ruta': []
    };
    var __bounds = {
        'empleado': new google.maps.LatLngBounds(),
        'cliente': new google.maps.LatLngBounds()
    };
    var __icon = {
        'empleado': {
            'inicio': '/pedimap/assets/markers/employee.initial.png',
            'vendedor': {
                url: '/pedimap/assets/markers/employee.salesperson.png',
                labelOrigin: new google.maps.Point(25, 10)
            },
            'supervisor': {
                url: '/pedimap/assets/markers/employee.supervisor.png',
                labelOrigin: new google.maps.Point(25, 10)
            }
        },
        'clienteVisitado': function (code) {
            switch (code.toString()) {
                case '0':
                    return '/pedimap/assets/markers/sale.success.png';
                    break;
                default:
                    return '/pedimap/assets/markers/sale.reject.png';
                    break;
            }
        },
        'cliente': '/pedimap/assets/markers/customer.initial.png',
        'clienteNuevo': '/pedimap/assets/markers/sale.new.png'
    };
    var __bubble = {
        'markerEmployee': MapElements.InfoBubble({map: __map, id: 'markerEmployee'}),
        'markerCustomer': MapElements.InfoBubble({map: __map, id: 'markerCustomer'}),
        'markerCustomerNew': MapElements.InfoBubble({map: __map, id: 'markerCustomerNew'}),
        'polylineEmployee': MapElements.InfoBubble({map: __map, id: 'polylineEmployee', disableAutoPan: true}),
        'polygonRoute': MapElements.InfoBubble({map: __map, id: 'polygonRoute', disableAutoPan: true})
    };

    MapEvents.clickCloseBubble('markerEmployee', __bubble.markerEmployee);
    MapEvents.clickCloseBubble('markerCustomer', __bubble.markerCustomer);
    MapEvents.clickCloseBubble('markerCustomerNew', __bubble.markerCustomerNew);
    MapEvents.clickCloseBubble('polylineEmployee', __bubble.polylineEmployee);
    MapEvents.clickCloseBubble('polygonRoute', __bubble.polygonRoute);

    MapEvents.clickMap(__map, function () {
        customeMapEvents.closeBubbles();
    });


    var customeRequests = {
        'defaultList': function (options) {
            appPedimap.postRequest({
                url: options.url,
                data: options.payload || {},
                success: function (response) {
                    InputData.setOptions({
                        name: options.name,
                        data: response.data,
                        firstDefault: options.firstDefault || false
                    });
                }
            });
        },
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
                    customeRequests.listEmpleado(payload);
                }
            });
        },
        /*'listJefe': function (options) {
            appPedimap.postRequest({
                url: '/empresa/lista-empleado',
                data: {
                    sucursal: options.sucursal || UserData.defaultSucursal,
                    esquema: options.esquema || UserData.defaultEsquema
                },
                success: function (response) {
                    var jefe = InputData.setOptions({
                        name: 'jefe',
                        data: response.data,
                        labelOption: 'nombre'
                    });
                    options.jefe = jefe;
                    customeRequests.listSupervisor(options);
                    customeRequests.polygonRuta(options);
                    customeRequests.markerCliente(options);
                    customeRequests.markerVisita(options);
                    customeRequests.markerAlta({
                        sucursal: options.sucursal || UserData.defaultSucursal,
                        esquema: options.esquema || UserData.defaultEsquema,
                        empleado: jefe
                    });
                }
            });
        },*/
        'listEmpleado': function (options) {
            var payload = {
                sucursal: options.sucursal || UserData.defaultSucursal,
                esquema: options.esquema || UserData.defaultEsquema,
                empleado: options.empleado || UserData.defaultEmpleado
            };
            appPedimap.postRequest({
                url: '/empresa/lista-empleado',
                data: payload,
                success: function (response) {
                    /*var supervisor = InputData.setOptions({name: 'supervisor', data: response.data, filter: 'S'});
                    var vendedor = InputData.setOptions({name: 'vendedor', data: response.data, filter: 'V'});
                    var jefe = InputData.setOptions({name: 'jefe', data: response.data, filter: 'G'});*/
                    //payload.empleado = jefe || supervisor;
                    if(options.callback instanceof Function){
                        options.callback(response.data);
                    }
                }
            });
        },
        /*'listSupervisor': function (options) {
            appPedimap.postRequest({
                url: '/empleado/listar/supervisor',
                data: {
                    sucursal: options.sucursal || UserData.defaultSucursal,
                    esquema: options.esquema || UserData.defaultEsquema,
                    jefe: options.jefe || UserData.defaultJefe
                },
                success: function (response) {
                    options.supervisor = InputData.setOptions({
                        name: 'supervisor',
                        data: response.data,
                        labelOption: 'nombre',
                        firstDefault: true
                    });
                    customeRequests.listVendedor(options);
                }
            });
        },
        'listVendedor': function (options) {
            appPedimap.postRequest({
                url: '/empleado/listar/vendedor',
                data: {
                    sucursal: options.sucursal || UserData.defaultSucursal,
                    esquema: options.esquema || UserData.defaultEsquema,
                    jefe: options.jefe || UserData.defaultJefe,
                    supervisor: options.supervisor || UserData.defaultSupervisor
                },
                success: function (response) {
                    InputData.setOptions({
                        name: 'vendedor',
                        data: response.data,
                        labelOption: 'nombre',
                        firstDefault: true
                    });
                }
            });
            customeMapEvents.intervalVendedor(options);
        },*/
        'markerVendedor': function (options, callback) {
            appPedimap.postRequest({
                url: '/empleado/seguimiento/vendedor-posicion',
                data: {
                    sucursal: options.sucursal || UserData.defaultSucursal,
                    esquema: options.esquema || UserData.defaultEsquema,
                    jefe: options.jefe || UserData.defaultJefe,
                    supervisor: options.supervisor || UserData.defaultSupervisor,
                    vendedor: options.vendedor || null
                },
                success: function (response) {
                    SaveMapElements.markerVendedor(response.data);
                    if (callback instanceof Function) callback();
                }
            });
        },
        'markerCliente': function (options) {
            appPedimap.postRequest({
                url: '/cliente/seguimiento/preventa',
                data: {
                    sucursal: options.sucursal || UserData.defaultSucursal,
                    esquema: options.esquema || UserData.defaultEsquema,
                    jefe: options.jefe || UserData.defaultJefe,
                    supervisor: options.supervisor || UserData.defaultSupervisor,
                    vendedor: options.vendedor || null
                },
                success: function (response) {
                    SaveMapElements.markerCliente(response.data);
                }
            });
        },
        'markerVisita': function (options) {
            appPedimap.postRequest({
                url: '/cliente/seguimiento/visita',
                data: {
                    sucursal: options.sucursal || UserData.defaultSucursal,
                    esquema: options.esquema || UserData.defaultEsquema,
                    jefe: options.jefe || UserData.defaultJefe,
                    supervisor: options.supervisor || UserData.defaultSupervisor,
                    vendedor: options.vendedor || null
                },
                success: function (response) {
                    SaveMapElements.markerVisita(response.data);
                }
            });
        },
        'markerAlta': function (options) {
            appPedimap.postRequest({
                url: '/cliente/seguimiento/alta',
                data: {
                    sucursal: options.sucursal || UserData.defaultSucursal,
                    esquema: options.esquema || UserData.defaultEsquema,
                    empleado: options.empleado || UserData.defaultEmpleado
                },
                success: function (response) {
                    SaveMapElements.markerAlta(response.data);
                }
            });
        },
        'polylineVendedor': function (options) {
            if (!options.vendedor) return customeMapEvents.deleteVendedorPolyline();
            appPedimap.postRequest({
                url: '/empleado/seguimiento/vendedor-recorrido',
                data: {
                    sucursal: options.sucursal || UserData.defaultSucursal,
                    esquema: options.esquema || UserData.defaultEsquema,
                    vendedor: options.vendedor
                },
                success: function (response) {
                    SaveMapElements.polylineVendedor(response.data);
                }
            });
        },
        'polygonRuta': function (options) {
            appPedimap.postRequest({
                url: '/ruta/seguimiento/preventa',
                data: {
                    sucursal: options.sucursal || UserData.defaultSucursal,
                    esquema: options.esquema || UserData.defaultEsquema,
                    jefe: options.jefe || UserData.defaultJefe,
                    supervisor: options.supervisor || UserData.defaultSupervisor,
                    vendedor: options.vendedor || null
                },
                success: function (response) {
                    SaveMapElements.polygonRuta(response.data);
                }
            });
        }
    };

    var contentInfoBubble = {
        'markerVendedor': function (data) {
            return MapUtils.contentInfoBubble({
                id: 'forMarkerV',
                title: data.codigo + ' - ' + data.nombre,
                data: [
                    {label: 'Sucursal', value: data['sucursal'].descrip},
                    {label: 'Esquema', value: data['esquema'].descrip},
                    {label: 'Supervisor', value: data['supervisor'].nombre},
                    {label: 'Precisión', value: data.precision},
                    {label: 'Bateria', value: data.bateria},
                    {label: 'Fecha y Hora', value: data.fecha}
                ]
            });
        },
        'markerVisita': function (data) {
            return MapUtils.contentInfoBubble({
                id: 'forMarkerA',
                title: data.codigo + ' - ' + data.nombre,
                data: [
                    {label: 'Vendedor', value: data['vendedor'].codigo + ' - ' + data['vendedor'].nombre},
                    {label: 'Visita', value: data['visita'].descrip},
                    {label: 'Precisión', value: data.precision},
                    {label: 'Coordenada', value: data['position'].lng + ', ' + data['position'].lat},
                    {label: 'Fecha y Hora', value: data.fecha}
                ]
            });
        },
        'markerAlta': function (data) {
            return MapUtils.contentInfoBubble({
                id: 'forMarkerA',
                title: 'ALTA ' + data.codigo,
                data: [
                    {label: 'Vendedor', value: data['vendedor'].codigo + ' - ' + data['vendedor'].nombre},
                    {label: 'Cliente', value: data['cliente'].nombre},
                    {label: 'Coordenada', value: data['position'].lng + ', ' + data['position'].lat},
                    {label: 'Fecha y Hora', value: data.fecha}
                ]
            });
        },
        'markerCliente': function (data) {
            return MapUtils.contentInfoBubble({
                id: 'forMarkerC',
                title: data.codigo + ' - ' + data.nombre,
                data: [
                    {label: data['tipoid'].descrip, value: data['tipoid'].numero},
                    {label: 'Dirección', value: data.domicilio},
                    {label: 'Ruta', value: data['ruta'].descrip},
                    {label: 'Vendedor', value: data['vendedor'].codigo + ' - ' + data['vendedor'].nombre},
                    {label: 'Canal', value: data['canal'].descrip},
                    {label: 'Tipo Negocio', value: data['negocio'].descrip},
                    {label: 'Visita', value: data['visita'].descrip}
                ]
            });
        },
        'polylineVendedor': function (firstPoint, lastPoint) {
            if (lastPoint) {
                return MapUtils.contentInfoBubble({
                    id: 'forPolyline',
                    title: 'RECORRIDO - VENDEDOR ' + firstPoint.codigo,
                    data: [
                        {label: 'Precisión', value: firstPoint.precision + ' - ' + lastPoint.precision},
                        {label: 'Bateria', value: firstPoint.bateria + ' - ' + lastPoint.bateria},
                        {label: 'Fecha y Hora', value: firstPoint.fecha + ' - ' + lastPoint.fecha}
                    ]
                });
            }
            return MapUtils.contentInfoBubble({
                id: 'forMarkerA',
                title: 'INICIO - VENDEDOR ' + firstPoint.codigo,
                data: [
                    {label: 'Precisión', value: firstPoint.precision},
                    {label: 'Bateria', value: firstPoint.bateria},
                    {label: 'Fecha y Hora', value: firstPoint.fecha}
                ]
            });
        },
        'polygonRuta': function (data) {
            return MapUtils.contentInfoBubble({
                id: 'forPolygon',
                title: data.descrip,
                data: [
                    {label: 'Sucursal', value: data['sucursal'].descrip},
                    {label: 'Esquema', value: data['esquema'].descrip},
                    {label: 'Supervisor', value: data['supervisor'].nombre},
                    {label: 'Vendedor', value: data['vendedor'].codigo + ' - ' + data['vendedor'].nombre}
                ]
            });
        }
    };

    var customeMapEvents = {
        'intervalVendedor': function (options) {
            appPedimap.setRequestInterval(function () {
                customeRequests.markerVendedor(options);
                if (InputData.getValue('showRecorrido')) customeRequests.polylineVendedor(options);
            }, function () {
                customeRequests.markerVendedor(options, customeMapEvents.centerVendedor);
                if (InputData.getValue('showRecorrido')) customeRequests.polylineVendedor(options);
            });
        },
        'centerVendedor': function () {
            MapEvents.centerBounds(__map, __bounds.vendedor);
        },
        'deleteVendedorMarker': function () {
            MapUtils.clearElementsInMap(__marker.vendedor);
            __bounds.vendedor = new google.maps.LatLngBounds();
            __marker.vendedor = [];
        },
        'deleteClienteMarker': function () {
            MapUtils.clearElementsInMap(__marker.cliente);
            __marker.cliente = [];
        },
        'deleteVisitaMarker': function () {
            MapUtils.clearElementsInMap(__marker.visita);
            __marker.visita = [];
        },
        'deleteAltaMarker': function () {
            MapUtils.clearElementsInMap(__marker.alta);
            __marker.alta = [];
        },
        'checkFilter': function (filter, data) {
            for (var i = 0; i < filter.length; i++) {
                var name = filter[i].name;
                var value = filter[i].value;
                if (value !== '' && data[name].toString() !== value) return false;
            }
            return true;
        },
        'showClienteMarker': function (check, markers, filtros) {
            var checked = $(check).is(':checked');
            var disabled = $(check).prop('disabled');
            for (var i = 0; i < markers.length; i++) {
                var marker = markers[i];
                var data = markers[i].data;
                var show = this.checkFilter(filtros, data);
                if (show && checked && !disabled) {
                    marker.setMap(__map);
                } else {
                    marker.setMap(null);
                }
            }
        },
        'showVisitaMarker': function (filtros) {

            var markers = __marker.visita;
            var checked = $('#showCliente').is(':checked');
            var disabled = $('#showCliente').prop('disabled');
            for (var i = 0; i < markers.length; i++) {
                var marker = markers[i];
                var data = markers[i].data;
                var show = this.checkFilter(filtros, data);
                if (show && checked && !disabled) {
                    marker.setMap(__map);
                } else {
                    marker.setMap(null);
                }
            }
        },
        'deleteVendedorPolyline': function () {
            MapUtils.clearElementsInMap(__polyline.vendedor);
            __polyline.vendedor = [];
        },
        'deleteRutaPolygon': function () {
            MapUtils.clearElementsInMap(__polygon.ruta);
            __polygon.ruta = [];
        },
        'resetMap': function () {
            this.deleteVendedorMarker();
            this.deleteVendedorPolyline();
            this.deleteRutaPolygon();
            this.deleteClienteMarker();
            this.deleteVisitaMarker();
            this.deleteAltaMarker();
            this.closeBubbles()
        },
        'closeBubbles': function () {
            __bubble.forMarkerV.close()
            __bubble.forMarkerC.close()
            __bubble.forMarkerA.close()
            __bubble.forPolyline.close()
            __bubble.forPolygon.close()
        }

    };

    var SaveMapElements = {
        'markerVendedor': function (data) {
            customeMapEvents.deleteVendedorMarker();
            for (var i = 0; i < data.length; i++) {
                var vendedor = data[i];
                var marker = MapElements.Marker({
                    icon: __icon.vendedor.current,
                    label: vendedor.codigo.toString(),
                    zIndex: i + 1,
                    position: vendedor.position,
                    data: {
                        sucursal: vendedor.sucursal.codigo,
                        esquema: vendedor.esquema.codigo,
                        supervisor: vendedor.sucursal.codigo
                    }
                });
                var content = contentInfoBubble.markerVendedor(vendedor);
                MapEvents.infoBubbleInMarker(__map, marker, __bubble.forMarkerV, content);
                __marker.vendedor.push(marker);
                __bounds.vendedor.extend(vendedor.position);
                marker.setMap(__map);
            }
        },
        'markerCliente': function (data) {
            customeMapEvents.deleteClienteMarker();
            for (var i = 0; i < data.length; i++) {
                var cliente = data[i];
                var marker = MapElements.Marker({
                    icon: __icon.cliente,
                    position: cliente.position,
                    data: {
                        //sucursal: cliente.sucursal.codigo,
                        //esquema: cliente.esquema.codigo,
                        codigo: cliente.codigo,
                        tipoid: cliente.tipoid.codigo,
                        negocio: cliente.negocio.codigo,
                        canal: cliente.canal.codigo,
                        ruta: cliente.ruta.codigo,
                        vendedor: cliente.vendedor.codigo,
                        supervisor: cliente.supervisor,
                        visita: cliente.visita.codigo
                    }
                });
                var content = contentInfoBubble.markerCliente(cliente);
                MapEvents.infoBubbleInMarker(__map, marker, __bubble.forMarkerC, content);
                __marker.cliente.push(marker);
            }
        },
        'markerVisita': function (data) {
            customeMapEvents.deleteVisitaMarker();
            for (var i = 0; i < data.length; i++) {
                var visita = data[i];
                var marker = MapElements.Marker({
                    icon: __icon.visita(visita.visita.codigo),
                    position: visita.position,
                    data: {
                        codigo: visita.codigo,
                        vendedor: visita.vendedor.codigo,
                        supervisor: visita.supervisor,
                        negocio: visita.negocio,
                        canal: visita.canal,
                        visita: visita.visita.codigo
                    }
                });
                var content = contentInfoBubble.markerVisita(visita);
                MapEvents.infoBubbleInMarker(__map, marker, __bubble.forMarkerA, content);
                __marker.visita.push(marker);
            }
        },
        'markerAlta': function (data) {
            customeMapEvents.deleteAltaMarker();
            for (var i = 0; i < data.length; i++) {
                var alta = data[i];
                var marker = MapElements.Marker({
                    icon: __icon.alta,
                    position: alta.position,
                    data: {
                        codigo: alta.codigo,
                        vendedor: alta.vendedor.codigo,
                        supervisor: alta.supervisor
                    }
                });
                var content = contentInfoBubble.markerAlta(alta);
                MapEvents.infoBubbleInMarker(__map, marker, __bubble.forMarkerA, content);
                __marker.alta.push(marker);
            }
        },
        'polylineVendedor': function (data) {
            customeMapEvents.deleteVendedorPolyline();

            var start = MapElements.Marker({
                icon: __icon.vendedor.initial,
                position: data[0].position
            })
            var html = contentInfoBubble.polylineVendedor(data[0]);
            MapEvents.infoBubbleInMarker(__map, start, __bubble.forMarkerA, html);
            __polyline.vendedor.push(start);
            start.setMap(__map);

            for (var i = 0; i < data.length - 1; i++) {
                var first = data[i];
                var last = data[i + 1];
                var polyline = MapElements.Polyline({
                    path: [first.position, last.position]
                });
                var content = contentInfoBubble.polylineVendedor(first, last);
                MapEvents.infoBubbleInMap(polyline, __bubble.forPolyline, content);
                __polyline.vendedor.push(polyline);
                polyline.setMap(__map);
            }
        },
        'polygonRuta': function (data) {
            customeMapEvents.deleteRutaPolygon();
            for (var i = 0; i < data.length; i++) {
                var ruta = data[i];
                var polygon = MapElements.Polygon({
                    paths: MapUtils.parsePolygonPaths(ruta.coords),
                    data: {
                        sucursal: ruta.sucursal.codigo,
                        esquema: ruta.esquema.codigo,
                        supervisor: ruta.supervisor.codigo,
                        vendedor: ruta.vendedor.codigo,
                        codigo: ruta.codigo
                    }
                });
                var content = contentInfoBubble.polygonRuta(ruta);
                MapEvents.infoBubbleInMap(polygon, __bubble.forPolygon, content);
                __polygon.ruta.push(polygon);
            }
        }
    };

    customeRequests.defaultList({url: '/cliente/tipo-canal', name: 'canal', firstDefault: true});

    customeRequests.defaultList({url: '/cliente/tipo-negocio', name: 'negocio', firstDefault: true});

    customeRequests.defaultList({url: '/cliente/tipo-visita', name: 'visita', firstDefault: true});

    switch (UserData.type) {
        case 'ADMIN':
            customeRequests.listSucursal();
            break;
        case 'JEFEVENTAS':
            customeRequests.listSupervisor({});
            customeRequests.polygonRuta({});
            customeRequests.markerCliente({});
            customeRequests.markerVisita({});
            customeRequests.markerAlta({});
            break;
        default:
            customeRequests.listVendedor({});
            customeRequests.polygonRuta({});
            customeRequests.markerCliente({});
            customeRequests.markerVisita({});
            customeRequests.markerAlta({});
            break;
    }


    InputData.eventChange('sucursal', function () {
        customeMapEvents.resetMap();
        customeRequests.listEsquema({
            sucursal: this.value
        });
    });
    InputData.eventChange('esquema', function () {
        customeMapEvents.resetMap();
        customeRequests.listJefe({
            sucursal: InputData.getValue('sucursal'),
            esquema: this.value
        });
    });
    InputData.eventChange('jefe', function () {
        customeMapEvents.resetMap();
        var options = {
            sucursal: InputData.getValue('sucursal'),
            esquema: InputData.getValue('esquema'),
            jefe: this.value
        }
        customeRequests.listSupervisor(options);
        customeRequests.polygonRuta(options);
        customeRequests.markerCliente(options);
        customeRequests.markerVisita(options);
        customeRequests.markerAlta({
            sucursal: InputData.getValue('sucursal'),
            esquema: InputData.getValue('esquema'),
            empleado: this.value
        });
    });

    InputData.eventChange('supervisor', function () {
        customeRequests.listVendedor({
            sucursal: InputData.getValue('sucursal'),
            esquema: InputData.getValue('esquema'),
            jefe: InputData.getValue('jefe'),
            supervisor: this.value
        });
        //var check = $('#showCliente')[0].parentElement.MaterialCheckbox;
        var checkAlta = $('#showAlta')[0].parentElement.MaterialCheckbox;
        if (this.value === '') {
            checkAlta.disable()
            //check.disable()
        } else {
            checkAlta.enable()
            //check.enable()
        }
        var filtros = [
            {name: 'supervisor', value: this.value},
            {name: 'vendedor', value: ''},
            {name: 'negocio', value: InputData.getValue('negocio')},
            {name: 'visita', value: InputData.getValue('visita')},
            {name: 'canal', value: InputData.getValue('canal')}
        ];
        customeMapEvents.showClienteMarker('#showCliente', __marker.cliente, filtros);
        customeMapEvents.showClienteMarker('#showVisita', __marker.visita, filtros);
        customeMapEvents.showClienteMarker('#showAlta', __marker.alta, [
            {name: 'supervisor', value: this.value},
            {name: 'vendedor', value: ''}
        ]);

    });

    InputData.eventChange('vendedor', function () {
        customeMapEvents.intervalVendedor({
            sucursal: InputData.getValue('sucursal'),
            esquema: InputData.getValue('esquema'),
            jefe: InputData.getValue('jefe'),
            supervisor: InputData.getValue('supervisor'),
            vendedor: this.value
        });
        //var checkCliente = $('#showCliente')[0].parentElement.MaterialCheckbox;
        var checkRecorrido = $('#showRecorrido')[0].parentElement.MaterialCheckbox;
        var checkAlta = $('#showAlta')[0].parentElement.MaterialCheckbox;
        /*if (this.value === '' && InputData.getValue('supervisor') === '') {
            checkCliente.disable()
        } else {
            checkCliente.enable()
        }*/
        if (this.value === '') {
            checkAlta.disable()
            checkRecorrido.disable()
        }
        else {
            checkAlta.enable()
            checkRecorrido.enable()
        }
        var filtros = [
            {name: 'supervisor', value: InputData.getValue('supervisor')},
            {name: 'vendedor', value: this.value},
            {name: 'negocio', value: InputData.getValue('negocio')},
            {name: 'visita', value: InputData.getValue('visita')},
            {name: 'canal', value: InputData.getValue('canal')}
        ];
        customeMapEvents.showClienteMarker('#showCliente', __marker.cliente, filtros);
        customeMapEvents.showClienteMarker('#showVisita', __marker.visita, filtros);
        customeMapEvents.showClienteMarker('#showAlta', __marker.alta, [
            {name: 'supervisor', value: InputData.getValue('supervisor')},
            {name: 'vendedor', value: this.value}
        ]);
    });

    InputData.eventChange('canal', function () {
        var filtros = [
            {name: 'supervisor', value: InputData.getValue('supervisor')},
            {name: 'vendedor', value: InputData.getValue('vendedor')},
            {name: 'negocio', value: InputData.getValue('negocio')},
            {name: 'visita', value: InputData.getValue('visita')},
            {name: 'canal', value: this.value}
        ];
        customeMapEvents.showClienteMarker('#showCliente', __marker.cliente, filtros);
        customeMapEvents.showClienteMarker('#showVisita', __marker.visita, filtros);
        customeMapEvents.showClienteMarker('#showAlta', __marker.alta, [
            {name: 'supervisor', value: InputData.getValue('supervisor')},
            {name: 'vendedor', value: InputData.getValue('vendedor')}
        ]);

    });

    InputData.eventChange('visita', function () {
        var filtros = [
            {name: 'supervisor', value: InputData.getValue('supervisor')},
            {name: 'vendedor', value: InputData.getValue('vendedor')},
            {name: 'negocio', value: InputData.getValue('negocio')},
            {name: 'visita', value: this.value},
            {name: 'canal', value: InputData.getValue('canal')}
        ];
        customeMapEvents.showClienteMarker('#showCliente', __marker.cliente, filtros);
        customeMapEvents.showClienteMarker('#showVisita', __marker.visita, filtros);
        customeMapEvents.showClienteMarker('#showAlta', __marker.alta, [
            {name: 'supervisor', value: InputData.getValue('supervisor')},
            {name: 'vendedor', value: InputData.getValue('vendedor')}
        ]);

    });
    InputData.eventChange('negocio', function () {
        var filtros = [
            {name: 'supervisor', value: InputData.getValue('supervisor')},
            {name: 'vendedor', value: InputData.getValue('vendedor')},
            {name: 'negocio', value: this.value},
            {name: 'visita', value: InputData.getValue('visita')},
            {name: 'canal', value: InputData.getValue('canal')}
        ];
        customeMapEvents.showClienteMarker('#showCliente', __marker.cliente, filtros);
        customeMapEvents.showClienteMarker('#showVisita', __marker.visita, filtros);
        customeMapEvents.showClienteMarker('#showAlta', __marker.alta, [
            {name: 'supervisor', value: InputData.getValue('supervisor')},
            {name: 'vendedor', value: InputData.getValue('vendedor')}
        ]);

    });

    InputData.eventChange('showRuta', function () {
        if (this.checked) {
            return MapUtils.showElementsInMap(__map, __polygon.ruta);
        }
        __bubble.forPolygon.close();
        MapUtils.clearElementsInMap(__polygon.ruta);
    });
    InputData.eventChange('showCliente', function () {
        if (this.checked) {
            var filtros = [
                {name: 'supervisor', value: InputData.getValue('supervisor')},
                {name: 'vendedor', value: InputData.getValue('vendedor')},
                {name: 'negocio', value: InputData.getValue('negocio')},
                {name: 'visita', value: InputData.getValue('visita')},
                {name: 'canal', value: InputData.getValue('canal')}
            ];
            customeMapEvents.showClienteMarker('#showCliente', __marker.cliente, filtros);
            /* customeMapEvents.showClienteMarker('#showVisita', __marker.visita, filtros);
             customeMapEvents.showClienteMarker('#showAlta', __marker.alta, [
                 {name: 'supervisor', value: InputData.getValue('supervisor')},
                 {name: 'vendedor', value: InputData.getValue('vendedor')}
             ]);*/
            return;
        }
        /*__bubble.forMarkerA.close();
        MapUtils.clearElementsInMap(__marker.alta);
        MapUtils.clearElementsInMap(__marker.visita);*/
        __bubble.forMarkerC.close();
        MapUtils.clearElementsInMap(__marker.cliente);
    });

    InputData.eventChange('showRecorrido', function () {
        if (this.checked) {
            var options = {
                sucursal: InputData.getValue('sucursal'),
                esquema: InputData.getValue('esquema'),
                jefe: InputData.getValue('jefe'),
                supervisor: InputData.getValue('supervisor'),
                vendedor: InputData.getValue('vendedor')
            };
            appPedimap.setRequestInterval(function () {
                customeRequests.markerVendedor(options);
                if (InputData.getValue('showRecorrido')) customeRequests.polylineVendedor(options);
            });
            return;
        }
        __bubble.forPolyline.close();
        MapUtils.clearElementsInMap(__polyline.vendedor);
    });

    InputData.eventChange('showAlta', function () {
        if (this.checked) {
            return customeMapEvents.showClienteMarker('#showAlta', __marker.alta, [
                {name: 'supervisor', value: InputData.getValue('supervisor')},
                {name: 'vendedor', value: InputData.getValue('vendedor')}
            ]);
        }
        __bubble.forMarkerA.close();
        MapUtils.clearElementsInMap(__marker.alta);
    });

    InputData.eventChange('showVisita', function () {
        if (this.checked) {
            return customeMapEvents.showClienteMarker('#showVisita', __marker.visita, [
                {name: 'supervisor', value: InputData.getValue('supervisor')},
                {name: 'vendedor', value: InputData.getValue('vendedor')},
                {name: 'negocio', value: InputData.getValue('negocio')},
                {name: 'visita', value: InputData.getValue('visita')},
                {name: 'canal', value: InputData.getValue('canal')}
            ]);
        }
        __bubble.forMarkerA.close();
        MapUtils.clearElementsInMap(__marker.visita);
    });


})()


