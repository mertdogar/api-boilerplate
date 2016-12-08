'use strict';

const cluster = require('cluster');
const winston = require('winston');


if (cluster.isMaster) {
    const cpuCount = require('os').cpus().length;

    for (let i = 0; i < cpuCount; i += 1) {
        winston.info('Forking new worker...');
        cluster.fork();
    }

    cluster.on('exit', (worker) => {
        winston.error('Worker %d died, forking new one...', worker.id);
        cluster.fork();
    });
} else {
    require('./boot');
}
