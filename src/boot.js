'use strict';

const winston = require('./lib/logger.js');
const app = require('boilerplate/app');

winston.info('Booting...');

app
    .init()
    .then(() => {
        winston.info('Booted successfuly.');
    })
    .catch((err) => {
        winston.error('Cannot boot.', err);
    });
