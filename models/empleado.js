"use strict";

const databases = require('../services/sequelize');

class Empleado {
/*
    static listVendedor(data) {
        return databases.defaultResponse({
            database: data.company,
            payload: {
                schema: 'data',
                name: 'listar_empleado_vendedor',
                parameters: data.payload
            }
        });
    }
*/

    static markerUbicacion(data) {
        return databases.defaultResponse({
            database: data.company,
            payload: {
                schema: 'map',
                name: 'empleado_marker_ubicacion',
                parameters: data.payload
            }
        });
    }

    static estadoMovil(data) {
        return databases.defaultResponse({
            database: data.company,
            payload: {
                schema: 'map',
                name: 'empleado_estado_movil',
                parameters: data.payload
            }
        });
    }

    static detalleMovil(data) {
        return databases.defaultResponse({
            database: data.company,
            payload: {
                schema: 'table',
                name: 'empleado_movil_detalle',
                parameters: data.payload
            }
        });
    }

    static actualizarMovil(data) {
        return databases.defaultResponse({
            database: data.company,
            payload: {
                schema: 'app',
                name: 'celular_actualizar',
                parameters: data.payload
            }
        });
    }

    static estadoAvance(data) {
        return databases.defaultResponse({
            database: data.company,
            payload: {
                schema: 'map',
                name: 'empleado_estado_avance',
                parameters: data.payload
            }
        });
    }

    static coberturaGeneralPreventa(data) {
        return databases.defaultResponse({
            database: data.company,
            payload: {
                schema: 'chart',
                name: 'cobertura_general_preventa',
                parameters: data.payload
            }
        });
    }

    static volumenGeneralPreventa(data) {
        return databases.defaultResponse({
            database: data.company,
            payload: {
                schema: 'chart',
                name: 'volumen_general_preventa',
                parameters: data.payload
            }
        });
    }
    static volumenLineaPreventa(data) {
        return databases.defaultResponse({
            database: data.company,
            payload: {
                schema: 'chart',
                name: 'volumen_linea_preventa',
                parameters: data.payload
            }
        });
    }

    static volumenMesaPreventa(data) {
        return databases.defaultResponse({
            database: data.company,
            payload: {
                schema: 'chart',
                name: 'volumen_mesa_preventa',
                parameters: data.payload
            }
        });
    }

    static volumenVendedorPreventa(data) {
        return databases.defaultResponse({
            database: data.company,
            payload: {
                schema: 'chart',
                name: 'volumen_vendedor_preventa',
                parameters: data.payload
            }
        });
    }

    static efectividadGeneralPreventa(data) {
        return databases.defaultResponse({
            database: data.company,
            payload: {
                schema: 'chart',
                name: 'efectividad_general_preventa',
                parameters: data.payload
            }
        });
    }

    static rechazoGeneralVolumenEnRuta(data) {
        return databases.defaultResponse({
            database: data.company,
            payload: {
                schema: 'chart',
                name: 'rechazo_general_volumen_ruta',
                parameters: data.payload
            }
        });
    }

    static rechazoMesaVolumenEnRuta(data) {
        return databases.defaultResponse({
            database: data.company,
            payload: {
                schema: 'chart',
                name: 'rechazo_mesa_volumen_ruta',
                parameters: data.payload
            }
        });
    }

    static rechazoVendedorVolumenEnRuta(data) {
        return databases.defaultResponse({
            database: data.company,
            payload: {
                schema: 'chart',
                name: 'rechazo_vendedor_volumen_ruta',
                parameters: data.payload
            }
        });
    }

    static polylineRecorrido(data) {
        return databases.defaultResponse({
            database: data.company,
            payload: {
                schema: 'map',
                name: 'empleado_polyline_recorrido',
                parameters: data.payload
            }
        });
    }
/*
    static listSupervisor(data) {
        return databases.defaultResponse({
            database: data.company,
            payload: {
                schema: 'data',
                name: 'listar_empleado_supervisor',
                parameters: data.payload
            }
        });
    }

    static listJefe(data) {
        return databases.defaultResponse({
            database: data.company,
            payload: {
                schema: 'data',
                name: 'listar_empleado_jefe',
                parameters: data.payload
            }
        });
    }*/

}

module.exports = Empleado;