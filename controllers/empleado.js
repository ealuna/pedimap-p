"use strict";

const Empleado = require('../models').empleado;
const response = require('../services/response');

module.exports = {
    /*listVendedor: (req, res) => {
        const user = req.user['data'];
        const payload = req.body;

        response.simpleResponse({
            model: Empleado.listVendedor,
            data: {company: user.empresa['id'], payload: payload},
            format: response,
            response: res
        });
    },
    listSupervisor: (req, res) => {
        const user = req.user['data'];
        const payload = req.body;

        response.simpleResponse({
            model: Empleado.listSupervisor,
            data: {company: user.empresa['id'], payload: payload},
            format: response,
            response: res
        });
    },
    listJefe: (req, res) => {
        const user = req.user['data'];
        const payload = req.body;

        response.simpleResponse({
            model: Empleado.listJefe,
            data: {company: user.empresa['id'], payload: payload},
            format: response,
            response: res
        });
    },*/
    markerUbicacion: (req, res) => {
        const user = req.user['data'];
        const payload = req.body;

        response.simpleResponse({
            model: Empleado.markerUbicacion,
            data: {company: user.empresa['id'], payload: payload},
            format: response,
            response: res
        });
    },
    estadoMovil: (req, res) => {
        const user = req.user['data'];
        const payload = req.body;

        response.simpleResponse({
            model: Empleado.estadoMovil,
            data: {company: user.empresa['id'], payload: payload},
            format: response,
            response: res
        });
    },
    detalleMovil: (req, res) => {
        const user = req.user['data'];
        const payload = req.body;

        response.simpleResponse({
            model: Empleado.detalleMovil,
            data: {company: user.empresa['id'], payload: payload},
            format: response,
            response: res
        });
    },
    estadoAvance: (req, res) => {
        const user = req.user['data'];
        const payload = req.body;

        response.simpleResponse({
            model: Empleado.estadoAvance,
            data: {company: user.empresa['id'], payload: payload},
            format: response,
            response: res
        });
    },
    actualizarMovil: (req, res) => {
        const user = req.user['data'];
        const payload = req.body;

        response.simpleResponse({
            model: Empleado.actualizarMovil,
            data: {company: user.empresa['id'], payload: payload},
            format: response,
            response: res
        });
    },
    polylineRecorrido: (req, res) => {
        const user = req.user['data'];
        const payload = req.body;

        response.simpleResponse({
            model: Empleado.polylineRecorrido,
            data: {company: user.empresa['id'], payload: payload},
            format: response,
            response: res
        });
    },
    coberturaGeneralPreventa: (req, res) => {
        const user = req.user['data'];
        const payload = req.body;

        response.simpleResponse({
            model: Empleado.coberturaGeneralPreventa,
            data: {company: user.empresa['id'], payload: payload},
            format: response,
            response: res
        });
    },
    volumenGeneralPreventa: (req, res) => {
        const user = req.user['data'];
        const payload = req.body;

        response.simpleResponse({
            model: Empleado.volumenGeneralPreventa,
            data: {company: user.empresa['id'], payload: payload},
            format: response,
            response: res
        });
    },
    volumenLineaPreventa: (req, res) => {
        const user = req.user['data'];
        const payload = req.body;

        response.simpleResponse({
            model: Empleado.volumenLineaPreventa,
            data: {company: user.empresa['id'], payload: payload},
            format: response,
            response: res
        });
    },
    volumenMesaPreventa: (req, res) => {
        const user = req.user['data'];
        const payload = req.body;

        response.simpleResponse({
            model: Empleado.volumenMesaPreventa,
            data: {company: user.empresa['id'], payload: payload},
            format: response,
            response: res
        });
    },
    volumenVendedorPreventa: (req, res) => {
        const user = req.user['data'];
        const payload = req.body;

        response.simpleResponse({
            model: Empleado.volumenVendedorPreventa,
            data: {company: user.empresa['id'], payload: payload},
            format: response,
            response: res
        });
    },
    efectividadGeneralPreventa: (req, res) => {
        const user = req.user['data'];
        const payload = req.body;

        response.simpleResponse({
            model: Empleado.efectividadGeneralPreventa,
            data: {company: user.empresa['id'], payload: payload},
            format: response,
            response: res
        });
    },
    rechazoGeneralVolumenEnRuta: (req, res) => {
        const user = req.user['data'];
        const payload = req.body;

        response.simpleResponse({
            model: Empleado.rechazoGeneralVolumenEnRuta,
            data: {company: user.empresa['id'], payload: payload},
            format: response,
            response: res
        });
    },
    rechazoMesaVolumenEnRuta: (req, res) => {
        const user = req.user['data'];
        const payload = req.body;

        response.simpleResponse({
            model: Empleado.rechazoMesaVolumenEnRuta,
            data: {company: user.empresa['id'], payload: payload},
            format: response,
            response: res
        });
    },
    rechazoVendedorVolumenEnRuta: (req, res) => {
        const user = req.user['data'];
        const payload = req.body;

        response.simpleResponse({
            model: Empleado.rechazoVendedorVolumenEnRuta,
            data: {company: user.empresa['id'], payload: payload},
            format: response,
            response: res
        });
    }
};