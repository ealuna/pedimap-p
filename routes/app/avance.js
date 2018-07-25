"use strict";

const express = require('express');

const router = express.Router();


const passport = require("../../services/passport");

const defaultStrategy = passport.default;
const defaultPassport = defaultStrategy.authenticate('jwt', {
    session: false,
    failureRedirect: '/pedimap/app'
});


router.get('/volumen', defaultPassport, (req, res) => {
    res.render('avance_volumen', {usuario: req.user['data']});
});



module.exports = router;