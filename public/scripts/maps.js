(function () {
    if (!window.appPedimap) return console.error('La aplicación requiere del modulo inicial');
    //if (!window.google) return console.error('La aplicación requiere de GoogleMaps.');
    // if (!window.InfoBubble) return console.error('La aplicación requiere de InfoBubble.');

    appPedimap.newMap = function (id, script) {
        appPedimap.defaultMap = new google.maps.Map(document.getElementById(id), {
            center: new google.maps.LatLng(-11.936396, -77.070768),
            zoom: 12,
            styles: [
                {featureType: "poi", stylers: [{visibility: "off"}]},
                {featureType: "transit.station", stylers: [{visibility: "off"}]}
            ],
            //mapTypeControlOptions: {mapTypeIds: []},
            gestureHandling: 'greedy'
        });
        appPedimap.setNewScript({src: '/pedimap/assets/scripts/' + script});
    };

    appPedimap.MapElements = {
        'Marker': function (options) {
            var _options = {
                data: options.data || {},
                position: options.position,
                zIndex: (options.zIndex || 0) + 2,
                icon: options.icon || ''
            };
            if (options.label) _options.label = {text: options.label, fontSize: '11px'};
            return new google.maps.Marker(_options);
        },
        'Polyline': function (options) {
            return new google.maps.Polyline({
                path: options.path,
                strokeWeight: options.strokeWeight || 2,
                strokeColor: options.strokeColor || '#4169E1',
                zIndex: options.zIndex || 1,
                icons: [{
                    icon: {path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW},
                    offset: '100%'
                }]
            });
        },
        'Polygon': function (options) {
            return new google.maps.Polygon({
                data: options.data || {},
                paths: options.paths,
                strokeColor: options.strokeColor || '#a62e1d',
                strokeOpacity: options.strokeOpacity || 0.8,
                strokeWeight: options.strokeWeight || 2,
                fillOpacity: options.fillOpacity || 0,
                fillColor: options.fillColor || '#a62e1d',
                zIndex: options.zIndex || 0
            });
        },
        'InfoBubble': function (options) {
            var bubble = new InfoBubble({
                map: options.map,
                shadowStyle: 0,
                padding: 0,
                maxWidth: 320,
                backgroundColor: options.backgroundColor || '#ecf0f5',
                borderRadius: options.borderRadius || 8,
                arrowSize: options.arrowSize || 10,
                borderWidth: options.borderWidth || 1,
                borderColor: options.borderColor || '#364e93',
                hideCloseButton: true,
                disableAutoPan: options.disableAutoPan || false,
                arrowPosition: options.arrowPosition || 50,
                arrowStyle: options.arrowStyle || 0,
                backgroundClassName: options.id
            });
            google.maps.event.addListener(bubble, 'domready', function (e) {
                document.getElementsByClassName(options.id)[0].parentElement.classList.add('bubble')
            });
            return bubble;
        }
    };

    appPedimap.MapEvents = {
        'clickCloseBubble': function (id, bubble) {
            google.maps.event.addListener(bubble, 'domready', function (e) {
                google.maps.event.addDomListener(document.getElementById(id), 'click', function () {
                    bubble.close();
                });
            });
        },
        'clickMap': function (map, callback) {
            google.maps.event.addListener(map, "click", callback);
        },
        'centerBounds': function (map, bounds) {
            if (!bounds.isEmpty()) {
                google.maps.event.addListenerOnce(map, 'bounds_changed', function () {
                    if (this.getZoom() > 17) {
                        this.setZoom(17);
                    }
                });
                map.fitBounds(bounds);
            }
        },
        'infoBubbleInMarker': function (map, marker, infoBubble, content) {
            marker.addListener('click', function () {
                infoBubble.setContent(content);
                infoBubble.open(map, this);
            });
        },
        'infoBubbleInMap': function (element, infoBubble, content, center) {
            google.maps.event.addListener(element, 'click', function (e) {
                infoBubble.setContent(content);
                infoBubble.setPosition(center || e.latLng);
                infoBubble.open();
            });
        },
        'onClickMapElement': function (element, cb) {
            google.maps.event.addListener(element, 'click', function (e) {
                e.data = element.data;
                cb(e);
            });
        }
    };

    appPedimap.MapUtils = {
        'contentInfoBubble': function (options) {
            var data = options.data;
            var html = '<div class="infowindow">' +
                '<div class="infobody content">' +
                '<table class="table table-striped"><tbody>' +
                '<tr><th id="' + options.id + '" colspan="2">' + options.title + '</th></tr>';
            for (var i = 0; i < data.length; i++) {
                html += '<tr><td>' + data[i].label + '</td><td>' + data[i].value + '</td></tr>';
            }
            html += '</tbody></table></div></div>';
            return html;
        },
        'parsePolygonPaths': function (data) {
            var coords = data.split(',');
            var paths = [];
            coords.forEach(function (item) {
                var coord = item.trim().split(' ');
                paths.push({lng: parseFloat(coord[0]), lat: parseFloat(coord[1])});
            });
            return paths;
        },
        'clearElementsInMap': function (elements) {
            for (var i = 0; i < elements.length; i++) {
                elements[i].setMap(null);
            }
        },
        'showElementsInMap': function (map, elements) {
            for (var i = 0; i < elements.length; i++) {
                elements[i].setMap(map);
            }
        }
    };
})();