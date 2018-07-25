"use strict";

const express = require('express');

const router = express.Router();
/*const listar = express.Router();
const seguimiento = express.Router();*/

const passport = require("../../services/passport");
const controllers = require("../../controllers");

const defaultStrategy = passport.default;
const defaultPassport = defaultStrategy.authenticate('jwt', {session: false});

router.post('/tipo-canal', defaultPassport, controllers.cliente.listTipoCanal);
router.post('/tipo-negocio', defaultPassport, controllers.cliente.listTipoNegocio);
router.post('/tipo-visita', defaultPassport, controllers.cliente.listTipoVisita);

router.post('/marker-ubicacion', defaultPassport, controllers.cliente.markerUbicacion);
router.post('/marker-visita', defaultPassport, controllers.cliente.markerVisita);
router.post('/marker-alta', defaultPassport, controllers.cliente.markerAlta);

/*
router.use('/listar', listar);
router.use('/seguimiento', seguimiento);*/

module.exports = router;