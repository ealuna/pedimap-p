"use strict";

module.exports = {
    success: (res, data) => {
        res.status(200).json({status: 200, data: data});
    },
    error: (res, cod, error) => {
        res.status(cod).json({status: cod, message: error});
    },
    custome: (res, data) => {
        res.status(200).json(data);
    },
    simpleResponse: function (options) {
        const model = options.model;
        const data = options.data;
        const response = options.response;

        return model(data).then(result => {
            this.success(response, result);
        }).catch(err => {
            this.error(response, 500, err);
        });
    }
};