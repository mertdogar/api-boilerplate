'use strict';

const config = require('boilerplate/lib/config');
const allowedOrigin = new RegExp('^https?://(' + config.get('http:allowedOrigins').join('|') + ')(:\\d+)?(/.*)?$');


module.exports = exports = function(req, res, next) {
    const origin = req.get('Origin') || '';
    res.header('Access-Control-Allow-Origin', allowedOrigin.test(origin) ? origin : '');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'OPTIONS, GET, HEAD, POST, PUT, DELETE');

    if ('OPTIONS' == req.method)
        return res.status(200).end();

    next();
};
