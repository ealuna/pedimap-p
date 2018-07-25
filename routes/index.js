"use strict";

const path = require('path');
const helmet = require('helmet');
const express = require('express');
const logger = require('morgan');

const router = express.Router();

const app = require('./app');
const api = require('./api');

router.use('/app', helmet({noCache: true}));
router.use('/api', helmet());
router.use('/assets', helmet());

router.use('/app', logger('dev'));
router.use('/api', logger('dev'));

router.use('/app', app);
router.use('/api', api);
router.use('/assets', express.static(path.join(__dirname, '..', 'public')));

module.exports = router;