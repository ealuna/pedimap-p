"use strict";

const express = require('express');

const router = express.Router();
//const listar = express.Router();
//const seguimiento = express.Router();

const cobertura = express.Router();
const volumen = express.Router();
const efectividad = express.Router();
const rechazo = express.Router();

const passport = require("../../services/passport");
const controllers = require("../../controllers");

const defaultStrategy = passport.default;
const defaultPassport = defaultStrategy.authenticate('jwt', {session: false});

router.post('/marker-ubicacion', defaultPassport, controllers.empleado.markerUbicacion);
router.post('/polyline-recorrido', defaultPassport, controllers.empleado.polylineRecorrido);
router.post('/estado-avance', defaultPassport, controllers.empleado.estadoAvance);
router.post('/estado-movil', defaultPassport, controllers.empleado.estadoMovil);
router.post('/movil-detalle', defaultPassport, controllers.empleado.detalleMovil);
router.post('/movil-actualizar', defaultPassport, controllers.empleado.actualizarMovil);


/**/
cobertura.post('/preventa-general', defaultPassport, controllers.empleado.coberturaGeneralPreventa);
volumen.post('/preventa-general', defaultPassport, controllers.empleado.volumenGeneralPreventa);
volumen.post('/preventa-linea', defaultPassport, controllers.empleado.volumenLineaPreventa);
volumen.post('/preventa-mesa', defaultPassport, controllers.empleado.volumenMesaPreventa);
volumen.post('/preventa-vendedor', defaultPassport, controllers.empleado.volumenVendedorPreventa);
efectividad.post('/preventa-general', defaultPassport, controllers.empleado.efectividadGeneralPreventa);
rechazo.post('/ruta-volumen-general', defaultPassport, controllers.empleado.rechazoGeneralVolumenEnRuta);
rechazo.post('/ruta-volumen-mesa', defaultPassport, controllers.empleado.rechazoMesaVolumenEnRuta);
rechazo.post('/ruta-volumen-vendedor', defaultPassport, controllers.empleado.rechazoVendedorVolumenEnRuta);
/**/

/*
seguimiento.post('/vendedor-posicion', defaultPassport, controllers.empleado.positionSeguimientoVendedor);
seguimiento.post('/vendedor-recorrido', defaultPassport, controllers.empleado.roadSeguimientoVendedor);
*/

//router.use('/listar', listar);
//router.use('/seguimiento', seguimiento);
router.use('/cobertura', cobertura);
router.use('/volumen', volumen);
router.use('/efectividad', efectividad);
router.use('/rechazo', rechazo);

module.exports = router;

