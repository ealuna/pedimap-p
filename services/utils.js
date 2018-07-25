"use strict";

const Promise = require('bluebird');
const parser = Promise.promisifyAll(require('xml2js').Parser());

module.exports = {
    decodeUnicode: (value) => {
        return value.replace(/\\u([\d\w]{4})/gi, (match, grp) => {
            return String.fromCharCode(parseInt(grp, 16));
        });
    },
    dataArray: (data) => {
        if (!data.hasOwnProperty('MapData')) {
            return [];
        } else if (!data.MapData.hasOwnProperty('DataSet')) {
            return [];
        } else if (!Array.isArray(data.MapData.DataSet)) {
            return [];
        }
        return data.MapData.DataSet;
    },
    rowValidation: (row) => {
        return !row.hasOwnProperty('P') || !row.hasOwnProperty('$');
    },
    formatId: (value) => {
        return value.replace(/^(.-)|\(|\)/g, '').trim();
    },
    formatVehicle: (value) => {
        return value.replace(/.*?\(|\)/g, '').trim();
    },
    splitArray: (value) => {
        return value.toString().split('|');
    },
    parseXML: (xml) => {
        return parser.parseStringAsync(xml);
    }
};