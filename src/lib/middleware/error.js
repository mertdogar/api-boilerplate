'use strict';

const config = require('boilerplate/lib/config');
const winston = require('winston');
const ErrorType = require('boilerplate/lib/errors');


module.exports = function(err, req, res, next) {
    let message = 'Internal error.';
    let payload = null;
    let responseCode = 500;
    let isExpected = false;

    if (err instanceof Error && err.name === 'ClientError') {
        message = err.message;
        payload = err.payload;
        responseCode = 400;
        isExpected = true;
    } else if (err instanceof Error && err.name === 'InternalError') {
        message = err.message;
        payload = err.payload;
        responseCode = 500;
        isExpected = true;
    } else if (err instanceof Error && err.name === 'HttpError') {
        message = err.message;
        payload = err.payload;
        responseCode = err.status;
        isExpected = true;
    }

    req.error = message;

    if (!isExpected && err)
        winston.error('Unexpected error occured in router', err);

    res
        .status(responseCode)
        .json({
            error: message,
            payload: payload,
            now: Date.now()
        });
};
