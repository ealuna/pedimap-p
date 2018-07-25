"use strict";

const fs = require('fs');
const path = require('path');
const express = require('express');

const router = express.Router();
const basename = path.basename(__filename);

const passport = require("../../services/passport");

const defaultStrategy = passport.default;
const defaultPassport = defaultStrategy.authenticate('jwt', {
    session: false,
    failureRedirect: '/pedimap/app'
});

router.get('/', (req, res, next) => {
    defaultStrategy.authenticate('jwt', (err, user) => {
        if (err) return next(err);
        if (!user) return res.render('main_login');
        req.logIn(user, {session: false}, err => {
            if (err) return next(err);
            return res.redirect('/pedimap/app/login');
        });
    })(req, res, next);
});

router.get('/login', defaultPassport, (req, res) => {
    res.render('main_validator', {usuario: req.user['data'], action: 'login'});
});

router.get('/logout', defaultPassport, (req, res) => {
    res.render('main_validator', {action: 'logout'});
});




router.get('/preventa/seguimiento/mapa', defaultPassport, (req, res) => {
    res.redirect('/pedimap/app/seguimiento/mapa');
});

router.get('/home', defaultPassport, (req, res) => {
    res.render('reporte_general', {usuario: req.user['data']});
});



fs.readdirSync(__dirname)
    .filter(file => {
        return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
    })
    .forEach(file => {
        const filename = file.replace('.js', '');
        router.use('/' + filename, require(path.join(__dirname, file)))
    });

module.exports = router;