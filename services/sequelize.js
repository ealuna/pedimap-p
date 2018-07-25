"use strict";

const Promise = require('bluebird');
const sequelize = require('sequelize');
const config = require('../config/database');

const connections = {
    'usuarios': new sequelize(config.USUARIOS),
    'oriunda': new sequelize(config.ORIUNDA),
    'terranorte': new sequelize(config.TERRANORTE)
};

const getDatabase = name => {
    const database = connections[name];

    return {
        storeQuery: payload => {

            if (!payload || !payload.name) {
                throw new Error('El Proceso Almacenado o los datos no estan definidos');
            }

            const schema = payload.schema || 'app';
            const name = payload.name;
            const parameters = payload.parameters || {};

            return database.query(
                `EXEC [${schema}].[${name}]${Object.keys(parameters).map(key => ` @${key} = :${key}`)}`,
                {
                    nest: true,
                    replacements: parameters,
                    operatorsAliases: false,
                    type: database.QueryTypes.SELECT
                });
        }
    }
};

const databases = (
    () => {
        const db = {};
        const dbnames = Object.keys(connections);
        dbnames.forEach(item => {
            db[item] = getDatabase(item);
        });
        return db;
    }
)();

module.exports = {
    databases: databases,
    defaultResponse: (options) => {
        const database = databases[options.database];
        const payload = options.payload;

        return database.storeQuery(payload).then(data => {
            return Promise.resolve(data);
        }).catch(err => {
            return Promise.reject(err)
        });
    },
    classResponse: (options) => {
        const database = databases[options.database];
        const payload = options.payload;
        const error = options.error;
        const class_ = options.class_;

        return database.storeQuery(payload).then(data => {
            if (data && data.length) {
                return Promise.resolve(new class_(data[0]));
            }
            return Promise.reject(error);
        }).catch(err => {
            return Promise.reject(err)
        });
    }
};


