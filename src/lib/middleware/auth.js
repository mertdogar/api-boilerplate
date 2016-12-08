'use strict';

const _ = require('lodash');
const ErrorType = require('boilerplate/lib/errors');


/**
 * ensureAuthentication - Check passportjs authentication.
 */
exports.ensureAuthentication = (req, res, next) => {
    if (req.isAuthenticated())
        return next();

    captcha
        .isCaptchaRequired(req.headers['x-forwarded-for'] || req.connection.remoteAddress)
        .catch(err => false)
        .then(isRequired => {
            const err = new ErrorType.ClientError('Not authorized.');
            err.payload = {isCaptchaRequired: isRequired};
            next(err);
        });
};
