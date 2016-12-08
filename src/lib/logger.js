'use strict';

const winston = require('winston');
const Papertrail = require('winston-papertrail').Papertrail;
const config = require('boilerplate/lib/config');



// Add `.toJSON()` method to Error prototype. This is useful while
// sending errors as payload
if (!('toJSON' in Error.prototype))
    Object.defineProperty(Error.prototype, 'toJSON', {
        value: function () {
            var alt = {};

            Object.getOwnPropertyNames(this).forEach(function (key) {
                alt[key] = this[key];
            }, this);

            return alt;
        },
        configurable: true,
        writable: true
    });

// Add papertrail transport if configured
if (config.get('papertrail:host') && config.get('papertrail:port')) {
    winston.add(winston.transports.Papertrail, {
        host: config.get('papertrail:host'),
        port: config.get('papertrail:port'),
        program: 'boilerplate',
        colorize: true,
        inlineMeta: true
    });
}

module.exports = winston;
