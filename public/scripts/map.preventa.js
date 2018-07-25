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
        'cliente': new google.maps.LatLngBounds(),
        'clienteVisitado': new google.maps.LatLngBounds(),
        'clienteNuevo': new google.maps.LatLngBounds(),
        'recorrido': new google.maps.LatLngBounds()
    };
    var __icon = {
        'empleado': {
            'inicio': '/pedimap/assets/markers/employee.initial.png',
            'actual': function (cargo, estado) {
                switch (estado) {
                    case 0:
                        return {
                            url: '/pedimap/assets/markers/employee.issue.png',
                            labelOrigin: new google.maps.Point(25, 10)
                        };
                        break;
                    default:
                        return (cargo === 'S' ? this.supervisor : this.vendedor);
                        break;
                }
            },
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
    var centerMenuOptions = document.createElement('div');
    centerMenuOptions.classList.add('map-control');
    centerMenuOptions.innerHTML = '<div>' +
        '<button title="Empleados" onclick="appPedimap.centerEmpleado()"><i class="fas fa-suitcase"></i></button>' +
        '<button title="Clientes" onclick="appPedimap.centerCliente()"><i class="fas fa-user"></i></button>' +
        '<button title="Visita" onclick="appPedimap.centerClienteVisitado()"><i class="fas fa-dollar-sign"></i></button>' +
        '<button title="Alta" onclick="appPedimap.centerClienteNuevo()"><i class="fas fa-plus"></i></button>' +
        '<button title="Recorrido" onclick="appPedimap.centerRecorrido()"><i class="fas fa-road"></i></button>' +
        '<button title="Ocultar/Mostrar Menu" data-toggle="collapse" data-target="#menu"><i class="far fa-eye"></i></button>' +
        '</div>';

    __map.controls[google.maps.ControlPosition.RIGHT_CENTER].push(centerMenuOptions);

    function loadInputList(_data) {
        InputData.setOptions({name: 'supervisor', data: _data, filter: 'S', firstDefault: true});
        InputData.setOptions({name: 'vendedor', data: _data, filter: 'V', firstDefault: true});
    }

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
                    var jefe = InputData.setOptions({name: 'jefe', data: response.data});
                    payload.empleado = jefe;
                    customeRequests.listEmpleado(payload, loadInputList);
                    customeRequests.mapElements(payload);
                    /* customeRequests.markerCliente(payload);
                     customeRequests.markerVisita(payload);
                     customeRequests.markerAlta(payload);
                     customeRequests.polygonRuta(payload);*/
                }
            });
        },
        'mapElements': function (payload) {
            this.markerCliente(payload);
            this.markerVisita(payload);
            this.markerAlta(payload);
            this.polygonRuta(payload);
        },
        'listEmpleado': function (options, callback) {
            options = options || {};
            var payload = {
                sucursal: options.sucursal || UserData.defaultSucursal,
                esquema: options.esquema || UserData.defaultEsquema,
                empleado: options.empleado || UserData.defaultEmpleado
            };
            appPedimap.postRequest({
                url: '/empresa/lista-empleado',
                data: payload,
                success: function (response) {
                    if (callback instanceof Function) {
                        callback(response.data)
                    }
                    customeMapEvents.intervalEmpleado(payload);
                }
            });

        },
        'markerEmpleado': function (options, callback) {
            options = options || {};
            appPedimap.postRequest({
                url: '/empleado/marker-ubicacion',
                data: {
                    sucursal: options.sucursal || UserData.defaultSucursal,
                    esquema: options.esquema || UserData.defaultEsquema,
                    empleado: options.empleado || UserData.defaultEmpleado,
                    fecha: moment(InputData.getValue('fecha'), 'DD/MM/YYYY').format('YYYY/MM/DD')
                },
                success: function (response) {
                    SaveMapElements.markerEmpleado(response.data);
                    if (callback instanceof Function) {
                        callback()
                    }
                }
            });
        },
        'markerCliente': function (options) {
            options = options || {};
            appPedimap.postRequest({
                url: '/cliente/marker-ubicacion',
                data: {
                    sucursal: options.sucursal || UserData.defaultSucursal,
                    esquema: options.esquema || UserData.defaultEsquema,
                    empleado: options.empleado || UserData.defaultEmpleado,
                    fecha: moment(InputData.getValue('fecha'), 'DD/MM/YYYY').format('YYYY/MM/DD')
                },
                success: function (response) {
                    SaveMapElements.markerCliente(response.data);
                }
            });
        },
        'markerVisita': function (options) {
            options = options || {};
            appPedimap.postRequest({
                url: '/cliente/marker-visita',
                data: {
                    sucursal: options.sucursal || UserData.defaultSucursal,
                    esquema: options.esquema || UserData.defaultEsquema,
                    empleado: options.empleado || UserData.defaultEmpleado,
                    fecha: moment(InputData.getValue('fecha'), 'DD/MM/YYYY').format('YYYY/MM/DD')
                },
                success: function (response) {
                    SaveMapElements.markerVisita(response.data);
                }
            });
        },
        'markerAlta': function (options) {
            options = options || {};
            appPedimap.postRequest({
                url: '/cliente/marker-alta',
                data: {
                    sucursal: options.sucursal || UserData.defaultSucursal,
                    esquema: options.esquema || UserData.defaultEsquema,
                    empleado: options.empleado || UserData.defaultEmpleado,
                    fecha: moment(InputData.getValue('fecha'), 'DD/MM/YYYY').format('YYYY/MM/DD')
                },
                success: function (response) {
                    SaveMapElements.markerAlta(response.data);
                }
            });
        },
        'polylineEmpleado': function (options) {
            options = options || {};
            var vendedor = InputData.getValue('vendedor');
            var supervisor = InputData.getValue('supervisor');
            if (!options.empleado || (vendedor === '' && supervisor === '')) {
                return customeMapEvents.deleteEmpleadoPolyline();
            }
            appPedimap.postRequest({
                url: '/empleado/polyline-recorrido',
                data: {
                    sucursal: options.sucursal || UserData.defaultSucursal,
                    esquema: options.esquema || UserData.defaultEsquema,
                    empleado: options.empleado || UserData.defaultEmpleado,
                    fecha: moment(InputData.getValue('fecha'), 'DD/MM/YYYY').format('YYYY/MM/DD')
                },
                success: function (response) {
                    SaveMapElements.polylineEmpleado(response.data);
                }
            });
        },
        'polygonRuta': function (options) {
            options = options || {};
            appPedimap.postRequest({
                url: '/ruta/polygon-ubicacion',
                data: {
                    sucursal: options.sucursal || UserData.defaultSucursal,
                    esquema: options.esquema || UserData.defaultEsquema,
                    empleado: options.empleado || UserData.defaultEmpleado
                },
                success: function (response) {
                    SaveMapElements.polygonRuta(response.data);
                }
            });
        }
    };

    var contentInfoBubble = {
        'markerEmpleado': function (data) {
            return MapUtils.contentInfoBubble({
                id: 'markerEmployee',
                title: data.codigo + ' - ' + data.nombre,
                data: [
                    //{label: 'Código', value: data.codigo},
                    {label: data['supervisor'].tipo, value: data['supervisor'].nombre},
                    {label: 'Precisión', value: data.precision},
                    {label: 'Bateria', value: data.bateria},
                    {label: 'Fecha y Hora', value: data.fecha}
                ]
            });
        },
        'markerVisita': function (data) {
            return MapUtils.contentInfoBubble({
                id: 'markerCustomerNew',
                title: data.codigo + ' - ' + data.nombre,
                data: [
                    {label: 'Código', value: data.codigo},
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
                id: 'markerCustomerNew',
                title: 'ALTA ' + data.codigo,
                data: [
                    {label: 'Código', value: data.codigo},
                    {label: 'Vendedor', value: data['vendedor'].codigo + ' - ' + data['vendedor'].nombre},
                    {label: 'Cliente', value: data['cliente'].nombre},
                    {label: 'Coordenada', value: data['position'].lng + ', ' + data['position'].lat},
                    {label: 'Fecha y Hora', value: data.fecha}
                ]
            });
        },
        'markerCliente': function (data) {
            return MapUtils.contentInfoBubble({
                id: 'markerCustomer',
                title: data.nombre,
                data: [
                    {label: 'Código', value: data.codigo},
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
        'polylineEmpleado': function (firstPoint, lastPoint) {
            if (lastPoint) {
                return MapUtils.contentInfoBubble({
                    id: 'polylineEmployee',
                    title: 'RECORRIDO - ' + firstPoint.cargo.toUpperCase() + ' ' + firstPoint.codigo,
                    data: [
                        {label: 'Precisión', value: firstPoint.precision + ' - ' + lastPoint.precision},
                        {label: 'Bateria', value: firstPoint.bateria + ' - ' + lastPoint.bateria},
                        {label: 'Fecha y Hora', value: firstPoint.fecha + ' - ' + lastPoint.fecha}
                    ]
                });
            }
            return MapUtils.contentInfoBubble({
                id: 'markerCustomerNew',
                title: 'INICIO - ' + firstPoint.cargo.toUpperCase() + ' ' + firstPoint.codigo,
                data: [
                    {label: 'Precisión', value: firstPoint.precision},
                    {label: 'Bateria', value: firstPoint.bateria},
                    {label: 'Fecha y Hora', value: firstPoint.fecha}
                ]
            });
        },
        'polygonRuta': function (data) {
            var payload = JSON.stringify({
                sucursal: data.sucursal,
                esquema: data.esquema,
                ruta: data.codigo,
                fechadesde: data.fechadesde
            }).replace(/\"/g, '\'');
            var valueAdmin = '<input id="riesgo" type="checkbox" data="' + payload + '" onchange="appPedimap.checkRuta(this)"' + (data.riesgo ? ' checked' : '') + '>';
            return MapUtils.contentInfoBubble({
                id: 'polygonRoute',
                title: data.descrip,
                data: [
                    //    {label: 'Código', value: data.codigo},
                    {label: 'Supervisor', value: data['nombreSupervisor']},
                    {label: 'Vendedor', value: data['vendedor'] + ' - ' + data['nombreVendedor']},
                    {
                        label: (UserData.type === 'ADMIN' ? 'Riesgo' : 'Observación'),
                        value: (UserData.type === 'ADMIN' ? valueAdmin : (data.riesgo ? 'ZONA PELIGROSA' : 'NINGUNA'))
                    }
                ]
            });
        }
    };
    appPedimap.checkRuta = function (ops) {
        var payload = JSON.parse(ops.getAttribute('data').replace(/\'/g, '"'));
        payload.riesgo = ops.checked;
        appPedimap.postRequest({
            url: '/ruta/polygon-riesgo',
            data: payload,
            success: function (response) {
                var data = response.data[0];
                for (var i = 0; i < __polygon.ruta.length; i++) {
                    var polygon = __polygon.ruta[i].data;
                    if (polygon.codigo === data.ruta) {
                        __polygon.ruta[i].data.riesgo = data.riesgo;
                        __polygon.ruta[i].setOptions({fillOpacity: (data.riesgo ? 0.2 : 0)});
                        return;
                    }
                }
            }
        });
    }
    var customeMapEvents = {
        'intervalEmpleado': function (options) {
            __bubble.markerEmployee.close();
            appPedimap.setRequestInterval(function () {
                customeRequests.markerEmpleado(options);
                if (InputData.getValue('showRecorrido')) customeRequests.polylineEmpleado(options);
            }, function () {
                customeRequests.markerEmpleado(options, customeMapEvents.centerEmpleado);
                if (InputData.getValue('showRecorrido')) customeRequests.polylineEmpleado(options);
            });
        },
        'centerEmpleado': function () {
            MapEvents.centerBounds(__map, __bounds.empleado);
        },
        'centerRecorrido': function () {
            MapEvents.centerBounds(__map, __bounds.recorrido);
        },
        'centerCliente': function () {
            MapEvents.centerBounds(__map, __bounds.cliente);
        },
        'centerClienteVisitado': function () {
            MapEvents.centerBounds(__map, __bounds.clienteVisitado);
        },
        'centerClienteNuevo': function () {
            MapEvents.centerBounds(__map, __bounds.clienteNuevo);
        },
        'deleteEmpleadoMarker': function () {
            MapUtils.clearElementsInMap(__marker.empleado);
            __bounds.empleado = new google.maps.LatLngBounds();
            __marker.empleado = [];
        },
        'deleteClienteMarker': function () {
            MapUtils.clearElementsInMap(__marker.cliente);
            __bounds.cliente = new google.maps.LatLngBounds();
            __marker.cliente = [];
        },
        'deleteVisitaMarker': function () {
            MapUtils.clearElementsInMap(__marker.clienteVisitado);
            __bounds.clienteVisitado = new google.maps.LatLngBounds();
            __marker.clienteVisitado = [];
        },
        'deleteAltaMarker': function () {
            MapUtils.clearElementsInMap(__marker.clienteNuevo);
            __bounds.clienteNuevo = new google.maps.LatLngBounds();
            __marker.clienteNuevo = [];
        },
        'checkFilter': function (filter, data) {
            for (var i = 0; i < filter.length; i++) {
                var name = filter[i].name;
                var value = filter[i].value;
                if (value !== '' && data[name].toString() !== value && data[name] !== undefined) {
                    return false;
                }
            }
            return true;
        },
        'showClienteMarker': function (check, markers, filtros, center) {
            var checked = $(check).is(':checked');
            var disabled = $(check).prop('disabled');
            if (center !== undefined) {
                __bounds[center] = new google.maps.LatLngBounds();
            }
            for (var i = 0; i < markers.length; i++) {
                var marker = markers[i];
                var data = markers[i].data;
                var show = this.checkFilter(filtros, data);
                if (show && checked && !disabled) {
                    marker.setMap(__map);
                    if (center !== undefined) {
                        var position = marker.getPosition();
                        __bounds[center].extend({lat: position.lat(), lng: position.lng()});
                    }
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
        'deleteEmpleadoPolyline': function () {
            MapUtils.clearElementsInMap(__polyline.empleado);
            __bounds.recorrido = new google.maps.LatLngBounds();
            __polyline.empleado = [];
        },
        'deleteRutaPolygon': function () {
            MapUtils.clearElementsInMap(__polygon.ruta);
            __polygon.ruta = [];
        },
        'resetMap': function () {
            this.deleteEmpleadoMarker();
            this.deleteEmpleadoPolyline();
            this.deleteRutaPolygon();
            this.deleteClienteMarker();
            this.deleteVisitaMarker();
            this.deleteAltaMarker();
            this.closeBubbles()
        },
        'resetCheckbox': function () {
            var ruta = getMaterialCheckBox('#showRuta');
            var cliente = getMaterialCheckBox('#showCliente');
            var visita = getMaterialCheckBox('#showVisita');
            var recorrido = getMaterialCheckBox('#showRecorrido');
            var alta = getMaterialCheckBox('#showAlta');
            ruta.uncheck();
            cliente.uncheck();
            visita.uncheck();
            recorrido.check();
            alta.uncheck();
            /* ruta.enable();
             cliente.enable();
             visita.enable();
             recorrido.enable();*/
            recorrido.disable();
        },
        'closeBubbles': function () {
            __bubble.markerEmployee.close()
            __bubble.markerCustomer.close()
            __bubble.markerCustomerNew.close()
            __bubble.polylineEmployee.close()
            __bubble.polygonRoute.close()
        },
        'infoBubbleInElement': function (infoBubble, content, center) {
            infoBubble.setContent(content);
            infoBubble.setPosition(center);
            infoBubble.open();
        }
    };

    appPedimap['centerEmpleado'] = customeMapEvents.centerEmpleado;
    appPedimap['centerRecorrido'] = customeMapEvents.centerRecorrido;
    appPedimap['centerCliente'] = customeMapEvents.centerCliente;
    appPedimap['centerClienteVisitado'] = customeMapEvents.centerClienteVisitado;
    appPedimap['centerClienteNuevo'] = customeMapEvents.centerClienteNuevo;


    var SaveMapElements = {
        'markerEmpleado': function (data) {
            customeMapEvents.deleteEmpleadoMarker();
            for (var i = 0; i < data.length; i++) {
                var empleado = data[i];
                var marker = MapElements.Marker({
                    icon: __icon.empleado.actual(empleado.cargo, empleado.estado),
                    label: empleado.codigo.toString(),
                    zIndex: i + 3,
                    position: empleado.position,
                    data: {
                        supervisor: empleado.supervisor.codigo,
                        codigo: empleado.codigo
                    }
                });
                var content = contentInfoBubble.markerEmpleado(empleado);
                MapEvents.infoBubbleInMarker(__map, marker, __bubble.markerEmployee, content);
                __marker.empleado.push(marker);
                __bounds.empleado.extend(empleado.position);
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
                        codigo: cliente.codigo,
                        tipoid: cliente.tipoid.codigo,
                        negocio: cliente.negocio.codigo,
                        canal: cliente.canal.codigo,
                        ruta: cliente.ruta.codigo,
                        vendedor: cliente.vendedor.codigo,
                        supervisor: cliente.supervisor,
                        visita: cliente.visita.codigo,
                        venta: cliente.visita.venta
                    }
                });
                var content = contentInfoBubble.markerCliente(cliente);
                MapEvents.infoBubbleInMarker(__map, marker, __bubble.markerCustomer, content);
                __marker.cliente.push(marker);
            }
        },
        'markerVisita': function (data) {
            customeMapEvents.deleteVisitaMarker();
            for (var i = 0; i < data.length; i++) {
                var visita = data[i];
                var marker = MapElements.Marker({
                    icon: __icon.clienteVisitado(visita.visita.codigo),
                    position: visita.position,
                    zIndex: 2,
                    data: {
                        codigo: visita.codigo,
                        vendedor: visita.vendedor.codigo,
                        supervisor: visita.supervisor,
                        negocio: visita.negocio,
                        canal: visita.canal,
                        visita: visita.visita.codigo,
                        venta: visita.visita.venta
                    }
                });
                var content = contentInfoBubble.markerVisita(visita);
                MapEvents.infoBubbleInMarker(__map, marker, __bubble.markerCustomerNew, content);
                __marker.clienteVisitado.push(marker);
            }
        },
        'markerAlta': function (data) {
            customeMapEvents.deleteAltaMarker();
            for (var i = 0; i < data.length; i++) {
                var alta = data[i];
                var marker = MapElements.Marker({
                    icon: __icon.clienteNuevo,
                    position: alta.position,
                    zIndex: 2,
                    data: {
                        codigo: alta.codigo,
                        vendedor: alta.vendedor.codigo,
                        supervisor: alta.supervisor
                    }
                });
                var content = contentInfoBubble.markerAlta(alta);
                MapEvents.infoBubbleInMarker(__map, marker, __bubble.markerCustomerNew, content);
                __marker.clienteNuevo.push(marker);
            }
        },
        'polylineEmpleado': function (data) {
            customeMapEvents.deleteEmpleadoPolyline();

            if (data.length === 0 || !data) {
                return;
            }

            var start = MapElements.Marker({
                icon: __icon.empleado.inicio,
                position: data[0].position
            });

            var html = contentInfoBubble.polylineEmpleado(data[0]);
            MapEvents.infoBubbleInMarker(__map, start, __bubble.markerCustomerNew, html);
            __polyline.empleado.push(start);
            __bounds.recorrido.extend(data[0].position);
            start.setMap(__map);

            for (var i = 0; i < data.length - 1; i++) {
                var first = data[i];
                var last = data[i + 1];
                var polyline = MapElements.Polyline({
                    path: [first.position, last.position]
                });
                var content = contentInfoBubble.polylineEmpleado(first, last);
                MapEvents.infoBubbleInMap(polyline, __bubble.polylineEmployee, content);
                __polyline.empleado.push(polyline);
                __bounds.recorrido.extend(last.position);
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
                        sucursal: ruta.sucursal,
                        esquema: ruta.esquema,
                        codigo: ruta.codigo,
                        descrip: ruta.descrip,
                        riesgo: ruta.riesgo,
                        fechadesde: ruta.fechadesde,
                        supervisor: ruta.supervisor.codigo,
                        nombreSupervisor: ruta.supervisor.nombre,
                        vendedor: ruta.vendedor.codigo,
                        nombreVendedor: ruta.vendedor.nombre,
                        center: ruta.center
                    },
                    fillOpacity: (ruta.riesgo ? 0.2 : 0)
                });
                //var content = contentInfoBubble.polygonRuta(ruta);
                //MapEvents.infoBubbleInMap(polygon, __bubble.polygonRoute, content);
                /*MapEvents.onClickMapElement(polygon, function (element, e) {
                    var content = contentInfoBubble.polygonRuta(ruta);
                });*/
                MapEvents.onClickMapElement(polygon, function (e) {
                    var content = contentInfoBubble.polygonRuta(e.data);
                    customeMapEvents.infoBubbleInElement(__bubble.polygonRoute, content, e.latLng);
                });
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
            customeRequests.listEmpleado(null, loadInputList);
            customeRequests.mapElements();
            break;
        default:
            customeRequests.listEmpleado(null, loadInputList);
            customeRequests.mapElements();
            break;
    }


    function getVentaValue(n) {
        return (n === '0' || n === '9999' || n === '') ? n : '9998';
    }

    function getVisitaValue(n) {
        return (n === '9998') ? '' : n;
    }

    InputData.eventChange('sucursal', function () {
        customeMapEvents.resetMap();
        customeMapEvents.resetCheckbox();
        customeRequests.listEsquema({
            sucursal: this.value
        });
    });
    InputData.eventChange('esquema', function () {
        customeMapEvents.resetMap();
        customeMapEvents.resetCheckbox();
        customeRequests.listJefe({
            sucursal: InputData.getValue('sucursal'),
            esquema: this.value
        });
    });
    InputData.eventChange('jefe', function () {
        customeMapEvents.resetMap();
        customeMapEvents.resetCheckbox();
        var options = {
            sucursal: InputData.getValue('sucursal'),
            esquema: InputData.getValue('esquema'),
            empleado: this.value
        }
        customeRequests.listEmpleado(options, loadInputList);
        customeRequests.polygonRuta(options);
        customeRequests.markerCliente(options);
        customeRequests.markerVisita(options);
        customeRequests.markerAlta(options);
    });

    InputData.eventChange('supervisor', function () {
        var payload = {
            sucursal: InputData.getValue('sucursal'),
            esquema: InputData.getValue('esquema'),
            empleado: this.value || InputData.getValue('jefe')
        };
        customeRequests.listEmpleado(payload, function (data) {
            InputData.setOptions({name: 'vendedor', data: data, filter: 'V', firstDefault: true});
        });
        customeMapEvents.intervalEmpleado(payload);
        var checkRecorrido = getMaterialCheckBox('#showRecorrido');
        if (this.value === '') {
            checkRecorrido.disable()
        } else {
            checkRecorrido.enable()
        }
        var filtros = [
            {name: 'supervisor', value: this.value},
            {name: 'vendedor', value: ''},
            {name: 'negocio', value: InputData.getValue('negocio')},
            {name: 'visita', value: getVisitaValue(InputData.getValue('visita'))},
            {name: 'venta', value: getVentaValue(InputData.getValue('visita'))},
            {name: 'canal', value: InputData.getValue('canal')}
        ];
        customeMapEvents.showClienteMarker('#showCliente', __marker.cliente, filtros, 'cliente');
        customeMapEvents.showClienteMarker('#showVisita', __marker.clienteVisitado, filtros, 'clienteVisitado');
        customeMapEvents.showClienteMarker('#showAlta', __marker.clienteNuevo, filtros, 'clienteNuevo');
        customeMapEvents.showClienteMarker('#showRuta', __polygon.ruta, filtros);
    });


    function getMaterialCheckBox(id) {
        return $(id).get(0).parentElement.MaterialCheckbox;
    }

    $('#modalLista').on('click', function () {
        var modal = $('#modal');
        $('#modal .modal-header .modal-title').html('ESTADO DE LOS DISPOSITIVOS');
        modal.unbind('shown.bs.modal');
        modal.modal('show');
        appPedimap.modalTable('modal', function () {
            appPedimap.postRequest({
                url: '/empleado/estado-movil',
                data: {
                    sucursal: InputData.getValue('sucursal') || UserData.defaultSucursal,
                    esquema: InputData.getValue('esquema') || UserData.defaultEsquema,
                    empleado: InputData.getValue('supervisor') || InputData.getValue('jefe') || UserData.defaultEmpleado,
                    fecha: moment(InputData.getValue('fecha'), 'DD/MM/YYYY').format('YYYY/MM/DD')
                },
                success: function (response) {
                    appPedimap.defaultDataTable({
                        id: 'tMovilModal',
                        data: response.data,
                        labels: [
                            'Codigo',
                            'Nombre',
                            '<i class="fas fa-check-circle"></i>',
                            'Jefe/Supervisor',
                            'Bateria',
                            'Hora'
                        ],
                        columns: [
                            {data: 'codigo'},
                            {data: 'nombre'},
                            {
                                orderable: false,
                                render: function (data, type, row) {
                                    var check = '<i class="fas fa-check-circle" style="color: #00a65a"></i>';
                                    var ban = '<i class="fas fa-ban" style="color: #dd4b39"></i>';
                                    return row.estado === 1 ? check : ban;
                                }
                            },
                            {data: 'supervisor.nombre'},
                            {data: 'bateria'},
                            {data: 'hora'}
                        ],
                        columnDefs: [{"orderData": 0, "targets": 1}, {"visible": false, "targets": 0}]

                    });
                }
            });
        }, function () {
            appPedimap.resetTableModal('tMovilModal');
        });
    });

    $('#modalResumen').on('click', function () {
        var modal = $('#modal');
        $('#modal .modal-header .modal-title').html('ESTADO DE AVANCE');
        modal.unbind('shown.bs.modal');
        modal.modal('show');
        appPedimap.modalTable('modal', function () {
            appPedimap.postRequest({
                url: '/empleado/estado-avance',
                data: {
                    sucursal: InputData.getValue('sucursal') || UserData.defaultSucursal,
                    esquema: InputData.getValue('esquema') || UserData.defaultEsquema,
                    empleado: InputData.getValue('supervisor') || InputData.getValue('jefe') || UserData.defaultEmpleado,
                    fecha: moment(InputData.getValue('fecha'), 'DD/MM/YYYY').format('YYYY/MM/DD')
                },
                success: function (response) {
                    appPedimap.defaultDataTable({
                        id: 'tMovilModal',
                        data: response.data,
                        labels: [
                            'Codigo',
                            'Nombre',
                            'Jefe/Supervisor',
                            'Pedidos',
                            'No pedidos',
                            'Altas',
                            'Avance',
                            '%'
                        ],
                        columns: [
                            {data: 'codigo'},
                            {data: 'nombre'},
                            {data: 'supervisor.nombre'},
                            {data: 'pedidos'},
                            {data: 'nopedidos'},
                            {data: 'altas'},
                            {data: 'avance'},
                            {data: 'porcentaje'}
                        ],
                        columnDefs: [{"orderData": 0, "targets": 1}, {"visible": false, "targets": 0}],
                        footer: [{"colspan": 1, "columns": 1}, {
                            "colspan": 2,
                            "columns": 1,
                            "text": 'Total:'
                        }, {"colspan": 1, "columns": 5}],
                        footerCallback: function (row, data, start, end, display) {
                            var api = this.api();

                            var intVal = function (i, k) {
                                return typeof i === 'string' ? parseInt(i.split('/')[k]) : typeof i === 'number' ? i : 0;
                            };

                            var pedidos = api
                                .column(3)
                                .data()
                                .reduce(function (a, b) {
                                    return a + b;
                                }, 0);
                            var nopedidos = api
                                .column(4)
                                .data()
                                .reduce(function (a, b) {
                                    return a + b;
                                }, 0);

                            var altas = api
                                .column(5)
                                .data()
                                .reduce(function (a, b) {
                                    return a + b;
                                }, 0);

                            var avance = api
                                .column(6)
                                .data()
                                .reduce(function (a, b) {
                                    return intVal(a, 0) + intVal(b, 0);
                                }, 0);
                            var cartera = api
                                .column(6)
                                .data()
                                .reduce(function (a, b) {
                                    return intVal(a, 1) + intVal(b, 1);
                                }, 0);

                            $(api.column(3).footer()).html(pedidos);
                            $(api.column(4).footer()).html(nopedidos);
                            $(api.column(5).footer()).html(altas);
                            $(api.column(6).footer()).html(avance + '/' + cartera);
                            $(api.column(7).footer()).html((cartera !== 0 ? (avance / cartera * 100) : 0).toFixed(2) + '%');
                            /*$(api.column(4).footer()).html('');
                            $(api.column(4).footer()).html('');
                            $(api.column(4).footer()).html('');
                            $(api.column(4).footer()).html('');*/
                        }

                    });
                }
            });
        }, function () {
            appPedimap.resetTableModal('tMovilModal');
        });
    });

    InputData.eventChange('vendedor', function () {
        customeMapEvents.intervalEmpleado({
            sucursal: InputData.getValue('sucursal'),
            esquema: InputData.getValue('esquema'),
            empleado: this.value || InputData.getValue('supervisor') || InputData.getValue('jefe')
        });
        var checkRecorrido = getMaterialCheckBox('#showRecorrido');
        if (this.value === '' && InputData.getValue('supervisor') === '') {
            checkRecorrido.disable()
        } else {
            checkRecorrido.enable()
        }
        var filtros = [
            {name: 'supervisor', value: InputData.getValue('supervisor')},
            {name: 'vendedor', value: this.value},
            {name: 'negocio', value: InputData.getValue('negocio')},
            {name: 'visita', value: getVisitaValue(InputData.getValue('visita'))},
            {name: 'venta', value: getVentaValue(InputData.getValue('visita'))},
            {name: 'canal', value: InputData.getValue('canal')}
        ];

        customeMapEvents.showClienteMarker('#showCliente', __marker.cliente, filtros, 'cliente');
        customeMapEvents.showClienteMarker('#showVisita', __marker.clienteVisitado, filtros, 'clienteVisitado');
        customeMapEvents.showClienteMarker('#showAlta', __marker.clienteNuevo, filtros, 'clienteNuevo');
        customeMapEvents.showClienteMarker('#showRuta', __polygon.ruta, filtros);
    });

    InputData.eventChange('canal', function () {
        var filtros = [
            {name: 'supervisor', value: InputData.getValue('supervisor')},
            {name: 'vendedor', value: InputData.getValue('vendedor')},
            {name: 'negocio', value: InputData.getValue('negocio')},
            {name: 'visita', value: getVisitaValue(InputData.getValue('visita'))},
            {name: 'venta', value: getVentaValue(InputData.getValue('visita'))},
            {name: 'canal', value: this.value}
        ];
        customeMapEvents.showClienteMarker('#showCliente', __marker.cliente, filtros, 'cliente');
        customeMapEvents.showClienteMarker('#showVisita', __marker.clienteVisitado, filtros, 'clienteVisitado');
    });

    InputData.eventChange('visita', function () {
        var filtros = [
            {name: 'supervisor', value: InputData.getValue('supervisor')},
            {name: 'vendedor', value: InputData.getValue('vendedor')},
            {name: 'negocio', value: InputData.getValue('negocio')},
            {name: 'visita', value: getVisitaValue(this.value)},
            {name: 'venta', value: getVentaValue(this.value)},
            {name: 'canal', value: InputData.getValue('canal')}
        ];
        customeMapEvents.showClienteMarker('#showCliente', __marker.cliente, filtros, 'cliente');
        customeMapEvents.showClienteMarker('#showVisita', __marker.clienteVisitado, filtros, 'clienteVisitado');

    });
    InputData.eventChange('negocio', function () {
        var filtros = [
            {name: 'supervisor', value: InputData.getValue('supervisor')},
            {name: 'vendedor', value: InputData.getValue('vendedor')},
            {name: 'negocio', value: this.value},
            {name: 'visita', value: getVisitaValue(InputData.getValue('visita'))},
            {name: 'venta', value: getVentaValue(InputData.getValue('visita'))},
            {name: 'canal', value: InputData.getValue('canal')}
        ];
        customeMapEvents.showClienteMarker('#showCliente', __marker.cliente, filtros, 'cliente');
        customeMapEvents.showClienteMarker('#showVisita', __marker.clienteVisitado, filtros, 'clienteVisitado');
    });

    InputData.eventChange('showRuta', function () {
        if (this.checked) {
            return customeMapEvents.showClienteMarker('#showRuta', __polygon.ruta, [
                {name: 'supervisor', value: InputData.getValue('supervisor')},
                {name: 'vendedor', value: InputData.getValue('vendedor')}
            ]);
        }
        __bubble.polygonRoute.close();
        MapUtils.clearElementsInMap(__polygon.ruta);
    });
    InputData.eventChange('showCliente', function () {
        if (this.checked) {
            return customeMapEvents.showClienteMarker('#showCliente', __marker.cliente, [
                {name: 'supervisor', value: InputData.getValue('supervisor')},
                {name: 'vendedor', value: InputData.getValue('vendedor')},
                {name: 'negocio', value: InputData.getValue('negocio')},
                {name: 'venta', value: getVentaValue(InputData.getValue('visita'))},
                {name: 'visita', value: getVisitaValue(InputData.getValue('visita'))},
                {name: 'canal', value: InputData.getValue('canal')}
            ], 'cliente');
        }
        __bubble.markerCustomer.close();
        __bounds.cliente = new google.maps.LatLngBounds();
        MapUtils.clearElementsInMap(__marker.cliente);
    });

    InputData.eventChange('showRecorrido', function () {
        if (this.checked) {
            var options = {
                sucursal: InputData.getValue('sucursal'),
                esquema: InputData.getValue('esquema'),
                empleado: InputData.getValue('vendedor') || InputData.getValue('supervisor')
            };
            return appPedimap.setRequestInterval(function () {
                customeRequests.markerEmpleado(options);
                if (InputData.getValue('showRecorrido')) customeRequests.polylineEmpleado(options);
            });
        }
        __bubble.polylineEmployee.close();
        MapUtils.clearElementsInMap(__polyline.empleado);
    });

    InputData.eventChange('showAlta', function () {
        if (this.checked) {
            return customeMapEvents.showClienteMarker('#showAlta', __marker.clienteNuevo, [
                {name: 'supervisor', value: InputData.getValue('supervisor')},
                {name: 'vendedor', value: InputData.getValue('vendedor')}
            ], 'clienteNuevo');
        }
        __bubble.markerCustomerNew.close();
        __bounds.clienteNuevo = new google.maps.LatLngBounds();
        MapUtils.clearElementsInMap(__marker.clienteNuevo);
    });

    InputData.eventChange('showVisita', function () {
        if (this.checked) {
            return customeMapEvents.showClienteMarker('#showVisita', __marker.clienteVisitado, [
                {name: 'supervisor', value: InputData.getValue('supervisor')},
                {name: 'vendedor', value: InputData.getValue('vendedor')},
                {name: 'negocio', value: InputData.getValue('negocio')},
                {name: 'visita', value: getVisitaValue(InputData.getValue('visita'))},
                {name: 'venta', value: getVentaValue(InputData.getValue('visita'))},
                {name: 'canal', value: InputData.getValue('canal')}
            ], 'clienteVisitado');
        }
        __bubble.markerCustomerNew.close();
        __bounds.clienteVisitado = new google.maps.LatLngBounds();
        MapUtils.clearElementsInMap(__marker.clienteVisitado);
    });

    $('#fecha').on('changeDate', function () {
        switch (UserData.type) {
            case 'ADMIN':
                customeRequests.listSucursal();
                break;
            case 'JEFEVENTAS':
                customeRequests.listEmpleado(null, loadInputList);
                customeRequests.mapElements();
                break;
            default:
                customeRequests.listEmpleado(null, loadInputList);
                customeRequests.mapElements();
                break;
        }
    })

    function buscarElemento(elementos, codigo) {
        for (var i = 0; i < elementos.length; i++) {
            if (elementos[i].data.codigo.toString() === codigo.toString() && elementos[i].map !== null) {
                return elementos[i];
            }
        }
        return null;
    }


    appPedimap['buscarElemento'] = function () {
        $('#buscar').modal('hide');
        var tipo = InputData.getValue('tipoBuscar');
        var codigo = InputData.getValue('codigoBuscar');
        if (codigo === '') {
            return;
        }

        switch (tipo) {
            case 'cliente':
                if (InputData.getValue('showCliente')) {
                    var cliente = buscarElemento(__marker.cliente, codigo);
                    if (cliente !== null) {
                        new google.maps.event.trigger(cliente, 'click');
                    }
                }
                break;
            case 'visita':
                if (InputData.getValue('showVisita')) {
                    var visita = buscarElemento(__marker.clienteVisitado, codigo);
                    if (visita !== null) {
                        new google.maps.event.trigger(visita, 'click');
                    }
                }
                break;
            case 'alta':
                if (InputData.getValue('showAlta')) {
                    var alta = buscarElemento(__marker.clienteNuevo, codigo);
                    if (alta !== null) {
                        new google.maps.event.trigger(alta, 'click');
                    }
                }
                break;
            case 'ruta':
                if (InputData.getValue('showRuta')) {
                    var ruta = buscarElemento(__polygon.ruta, codigo);
                    if (ruta !== null) {
                        new google.maps.event.trigger(ruta, 'click', {
                            latLng: new google.maps.LatLng(ruta.data.center.lat, ruta.data.center.lng)
                        });
                    }
                }
                break;
            case 'empleado':
                var empleado = buscarElemento(__marker.empleado, codigo);
                if (empleado !== null) {
                    new google.maps.event.trigger(empleado, 'click');
                }
                break;
        }

    }

    appPedimap['keyBuscarElemento'] = function (e) {
        if (e.keyCode !== 13) {
            return;
        }
        appPedimap.buscarElemento();
    }

    $('#buscar').on('shown.bs.modal', function () {
        $('#codigoBuscar').focus();
    })

})()