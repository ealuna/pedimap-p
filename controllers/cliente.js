"use strict";

const Cliente = require('../models').cliente;
const response = require('../services/response');

module.exports = {
    listTipoCanal: (req, res) => {
        const user = req.user['data'];

        response.simpleResponse({
            model: Cliente.listTipoCanal,
            data: {company: user.empresa['id'], payload: {}},
            response: res
        });
    },
    listTipoNegocio: (req, res) => {
        const user = req.user['data'];

        response.simpleResponse({
            model: Cliente.listTipoNegocio,
            data: {company: user.empresa['id'], payload: {}},
            response: res
        });
    },
    listTipoVisita: (req, res) => {
        const user = req.user['data'];

        response.simpleResponse({
            model: Cliente.listTipoVisita,
            data: {company: user.empresa['id'], payload: {}},
            response: res
        });
    },
    /*seguimientoPreventaCliente: (req, res) => {
        const user = req.user['data'];
        const payload = req.body;

        response.simpleResponse({
            model: Cliente.seguimientoPreventaCliente,
            data: {company: user.empresa['id'], payload: payload},
            response: res
        });
    },
    seguimientoVisitaCliente: (req, res) => {
        const user = req.user['data'];
        const payload = req.body;

        response.simpleResponse({
            model: Cliente.seguimientoVisitaCliente,
            data: {company: user.empresa['id'], payload: payload},
            response: res
        });
    },
    seguimientoAltaCliente: (req, res) => {
        const user = req.user['data'];
        const payload = req.body;

        response.simpleResponse({
            model: Cliente.seguimientoAltaCliente,
            data: {company: user.empresa['id'], payload: payload},
            response: res
        });
    }*/
    markerUbicacion: (req, res) => {
        const user = req.user['data'];
        const payload = req.body;

        response.simpleResponse({
            model: Cliente.markerUbicacion,
            data: {company: user.empresa['id'], payload: payload},
            response: res
        });
    },
    markerVisita: (req, res) => {
        const user = req.user['data'];
        const payload = req.body;

        response.simpleResponse({
            model: Cliente.markerVisita,
            data: {company: user.empresa['id'], payload: payload},
            response: res
        });
    },
    markerAlta: (req, res) => {
        const user = req.user['data'];
        const payload = req.body;

        response.simpleResponse({
            model: Cliente.markerAlta,
            data: {company: user.empresa['id'], payload: payload},
            response: res
        });
    }

};