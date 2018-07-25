"use strict";

const redis = require('redis');

module.exports = {
    hset: (group, data, callback) => {
        const client = redis.createClient();
        client.hset(group, data, (err, res) => {
            client.quit();
            if (callback instanceof Function) callback(err, res);
        });
    },
    hget: (group, key, callback) => {
        const client = redis.createClient();
        client.hget(group, key, (err, res) => {
            client.quit();
            callback(err, res);
        });
    }
};