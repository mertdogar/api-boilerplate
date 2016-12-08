'use strict';

const winston = require('winston');
const repl = require('repl');
const promisify = require('repl-promised').promisify;
const app = require('boilerplate/app');

winston.info('Booting REPL console...');

app
    .init(true)
    .then(() => {
        winston.info('Booted successfuly.');
        console.log('Type `app` to reach singleton app instance.');

        const replServer = repl.start({prompt: "> "});
        promisify(replServer);
        replServer.context.app = app;
    })
    .catch((err) => {
        winston.error('Cannot boot.', err);
    });

