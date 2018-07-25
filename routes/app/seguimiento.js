"use strict";

const express = require('express');

const router = express.Router();
/*const avance = express.Router();
const seguimiento = express.Router();*/


const passport = require("../../services/passport");

const defaultStrategy = passport.default;
const defaultPassport = defaultStrategy.authenticate('jwt', {
    session: false,
    failureRedirect: '/pedimap/app'
});




/* Router Avance */






/* */

/* Router Seguimiento */


router.get('/mapa', defaultPassport, (req, res) => {
    res.render('seguimiento_mapa', {usuario: req.user['data']});
});

router.get('/dispositivos', defaultPassport, (req, res) => {
    res.render('seguimiento_dispositivos', {usuario: req.user['data']});
});





/* */
/*
router.use('/avance', avance);
router.use('/seguimiento', seguimiento);
*/
module.exports = router;