"use strict";

const Empresa = require('../models').empresa;
const response = require('../services/response');

module.exports = {
    listSucursal: (req, res) => {
        const user = req.user['data'];

        response.simpleResponse({
            model: Empresa.listSucursal,
            data: {company: user.empresa['id'], payload: {}},
            format: response,
            response: res
        });
    },
    listEsquema: (req, res) => {
        const user = req.user['data'];
        const payload = req.body;

        response.simpleResponse({
            model: Empresa.listEsquema,
            data: {company: user.empresa['id'], payload: payload},
            format: response,
            response: res
        });
    },
    listEmpleado: (req, res) => {
        const user = req.user['data'];
        const payload = req.body;

        response.simpleResponse({
            model: Empresa.listEmpleado,
            data: {company: user.empresa['id'], payload: payload},
            format: response,
            response: res
        });
    }
};