"use strict";

const passportJWT = require("passport-jwt");
const Passport = require("passport").Passport;

const redis = require('./redis');
const usuarios = require('../controllers/usuario');

const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;

//const {ExtractJwt, Strategy} = require("passport-jwt");

const JwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt'),
    secretOrKey: usuarios.secret
};

module.exports = {
    default: new Passport().use(new JwtStrategy(JwtOptions, (payload, next) => {
        const hash = payload.hash;
        const user = payload.data.usuario;
        const group = payload.data.empresa['id'];

        redis.hget(group, hash, (err, res) => {
            if (res || err) {
                return next(null, false);
            }
            next(null, payload);
        });
    })),

    custome: (values, include) => {
        return new Passport().use(new JwtStrategy(JwtOptions, (payload, next) => {

            const hash = payload.hash;
            const user = payload.data.usuario;
            const tipo = payload.data.tipo['id'];
            const group = payload.data.empresa['id'];

            const result = Array.isArray(values) ? values.includes(tipo) : (values.toString() === tipo);

            if ((include && !result) || (!include && result)) {
                return next(null, false);
            }

            redis.hget(group, hash, (err, res) => {
                if (res || err) {
                    return next(null, false);
                }
                return next(null, payload);
            });

        }));
    }
};





