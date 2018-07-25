"use strict";

const express = require('express');

const router = express.Router();

const passport = require("../../services/passport");
const controllers = require("../../controllers");

const defaultStrategy = passport.default;
const defaultPassport = defaultStrategy.authenticate('jwt', {session: false});

const adminStrategy = passport.custome('ADMIN', true);
const adminPassport = adminStrategy.authenticate('jwt', {session: false});





router.post('/login', controllers.usuario.login);
router.post('/create', adminPassport, controllers.usuario.create);
router.post('/logout', defaultPassport, controllers.usuario.logout);

module.exports = router;