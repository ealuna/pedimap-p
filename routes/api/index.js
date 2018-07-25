"use strict";

var fs = require('fs');
var path = require('path');
const express = require('express');


const router = express.Router();
var basename = path.basename(__filename);



fs.readdirSync(__dirname)
    .filter(file => {
        return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
    })
    .forEach(file => {
        const filename = file.replace('.js', '');
        router.use('/' + filename, require(path.join(__dirname, file)))
    });


module.exports = router;


