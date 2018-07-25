"use strict";

const Promise = require('bluebird');
const bcrypt = Promise.promisifyAll(require('bcrypt'));

const databases = require('../services/sequelize');

class Usuario {
    constructor(data) {
        this.usuario = data.usuario;
        this.clave = data.clave;
        this.tipo = data.tipo;
        this.empresa = data.empresa;
        this.datos = data.datos;
    }

    static newInstance(usuario) {
        const payload = {name: 'usuario_buscar', parameters: usuario};
        return databases.classResponse({
            database: 'usuarios',
            payload: payload,
            error: {status: 401, message: 'Usuario no encontrado.'},
            class_: Usuario
        });
    }

    static create(data) {
        return bcrypt.genSaltAsync(10).then(salt => {
            return bcrypt.hashAsync(data.clave, salt).then(hash => {
                data.clave = hash;
                const payload = {name: 'usuario_nuevo', parameters: data};
                return databases.classResponse({
                    database: 'usuarios',
                    payload: payload,
                    error: {status: 400, message: 'Usuario no registrado.'},
                    class_: Usuario
                });
            });
        });
    }

    comparePassword(password) {
        return bcrypt.compareAsync(password.toString(), this.clave);
    };

    toJSON() {
        return {
            usuario: this.usuario,
            tipo: this.tipo,
            empresa: this.empresa,
            datos: this.datos
        };
    }
}

module.exports = Usuario;