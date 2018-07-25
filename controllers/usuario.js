"use strict";

const uuid = require('uuid/v1');
const jwt = require('jsonwebtoken');

const redis = require('../services/redis');
const Usuario = require('../models').usuario;
const response = require('../services/response');
const secret = require('../config/crypto').JWT_SECRET;

module.exports = {
    secret: secret,
    create: (req, res) => {
        const payload = req.body;

        if (payload.clave !== payload.confirmar) {
            return response.error(res, 400, 'Las contraseñas ingresadas no coinciden.');
        }

        delete payload.confirmar;

        Usuario.create(payload).then(user => {
            response.success(res, user.toJSON());
        }).catch(err => {
            response.error(res, 500, err);
        });
    },
    login: (req, res) => {
        const data = req.body;

        if (!data.usuario || !data.clave || !data.empresa) {
            return response.error(res, 400, "Ingrese los datos correctamente.");
        }

        const payload = {
            usuario: data.usuario,
            empresa: data.empresa
        };

        Usuario.newInstance(payload).then(user => {
            user.comparePassword(data.clave).then(match => {
                if (!match) {
                    return response.error(res, 401, "Contraseña incorrecta.");
                }

                const hash = uuid();
                const usuario = user.toJSON();
                const token = jwt.sign({data: usuario, hash: hash}, secret, {expiresIn: "2d"});

                res.cookie('idSession', token, {httpOnly: true, maxAge: 2 * 24 * 3600000, path: '/pedimap'});
                response.custome(res, {user: usuario, token: `JWT ${token}`})

            }).catch(err => {
                response.error(res, 500, err);
            });
        }).catch(err => {
            response.error(res, err.status || 500, err.message || err);
        });
    },
    logout: (req, res) => {
        const data = req.user['data'];
        const hash = req.user['hash'];
        const user = data.usuario;
        const company = data.empresa['id'];

        redis.hset(company, [hash, user]);
        res.cookie('idSession', '', {expires: new Date(0)});
        return response.success(res, {});

    }

};