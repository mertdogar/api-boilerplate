'use strict';

const nconf = require('nconf');
const _ = require('lodash');
const debug = require('debug')('boilerplate:lib:config');
const winston = require('winston');
const CONFIG = process.env.CONFIG;


winston.info('Reading config file ' + (CONFIG || '`config/default.json` by default'));

nconf.use('memory');
nconf.env('__');

if (CONFIG)
    nconf.file('custom-config', CONFIG);

nconf.file('config/default.json');


function transformArrayProperty(key) {
    try {
        const value = nconf.get(key);

        if (!_.isString(value))
            return;

        debug(`Transforming: ${key}. Initial value is ${value}(${typeof value} -> JSON)`);

        nconf.set(key, JSON.parse(value));
    } catch(e) {
        debug(`${key} cannot be a string! Discarding ${key}...`, e);
    }
}

['http:allowedOrigins'].forEach(transformArrayProperty);


module.exports = nconf;
