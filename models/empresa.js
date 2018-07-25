"use strict";

const databases = require('../services/sequelize');

class Empresa {

    static listSucursal(data) {
        return databases.defaultResponse({
            database: data.company,
            payload: {
                schema: 'data',
                name: 'listar_empresa_sucursal',
                parameters: data.payload
            }
        });
    }

    static listEsquema(data) {
        return databases.defaultResponse({
            database: data.company,
            payload: {
                schema: 'data',
                name: 'listar_empresa_esquema',
                parameters: data.payload
            }
        });
    }

    static listEmpleado(data) {
        return databases.defaultResponse({
            database: data.company,
            payload: {
                schema: 'data',
                name: 'listar_empresa_empleado',
                parameters: data.payload
            }
        });
    }

}

module.exports = Empresa;