"use strict";

const Ruta = require('../models').ruta;
const response = require('../services/response');

module.exports = {
    polygonUbicacion: (req, res) => {
        const user = req.user['data'];
        const payload = req.body;

        response.simpleResponse({
            model: Ruta.polygonUbicacion,
            data: {company: user.empresa['id'], payload: payload},
            format: response,
            response: res
        });
    },
    polygonRiesgo: (req, res) => {
        const user = req.user['data'];
        const payload = req.body;

        response.simpleResponse({
            model: Ruta.polygonRiesgo,
            data: {company: user.empresa['id'], payload: payload},
            format: response,
            response: res
        });
    }
};