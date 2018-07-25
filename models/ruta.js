"use strict";

const databases = require('../services/sequelize');

class Ruta {
/*
    static seguimientoRutaPreventa(data) {
        return databases.defaultResponse({
            database: data.company,
            payload: {
                schema: 'data',
                name: 'seguimiento_rutas_preventa',
                parameters: data.payload
            }
        });
    }
*/
    static polygonUbicacion(data) {
        return databases.defaultResponse({
            database: data.company,
            payload: {
                schema: 'map',
                name: 'ruta_polygon_ubicacion',
                parameters: data.payload
            }
        });
    }

    static polygonRiesgo(data) {
        return databases.defaultResponse({
            database: data.company,
            payload: {
                schema: 'map',
                name: 'ruta_polygon_riesgo',
                parameters: data.payload
            }
        });
    }
}

module.exports = Ruta;