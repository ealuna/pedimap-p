"use strict";

const express = require('express');

const router = express.Router();
//const listar = express.Router();

const passport = require("../../services/passport");
const controllers = require("../../controllers");

const defaultStrategy = passport.default;
const defaultPassport = defaultStrategy.authenticate('jwt', {session: false});

router.post('/lista-empleado', defaultPassport, controllers.empresa.listEmpleado);
router.post('/lista-sucursal', defaultPassport, controllers.empresa.listSucursal);
router.post('/lista-esquema', defaultPassport, controllers.empresa.listEsquema);


//router.use('/listar', listar);

module.exports = router;