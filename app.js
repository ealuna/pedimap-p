"use strict";

const path = require('path');
const logger = require('morgan');
const helmet = require('helmet');
const express = require('express');
//const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const compression = require('compression');
const cookieParser = require('cookie-parser');

const routes = require('./routes');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//app.use('/pedimap', logger('dev'));
app.use('/pedimap', compression());
app.use('/pedimap', cookieParser());
app.use('/pedimap', bodyParser.json());
app.use('/pedimap', bodyParser.urlencoded({extended: false}));

app.use('/pedimap', (req, res, next) => {
    if (req.cookies.idSession && !req.headers.authorization) {
        req.headers.authorization = `JWT ${req.cookies.idSession}`;
    }
    next();
});

app.use('/pedimap', routes);

//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {

    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    res.status(err.status || 500);
    res.render('error');

});

module.exports = app;
