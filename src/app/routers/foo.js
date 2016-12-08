'use strict';

const _ = require('lodash');
const config = require('boilerplate/lib/config');
const auth = require('boilerplate/lib/middleware/auth');
const PromiseRouter = require('boilerplate/lib/promiserouter');
const ErrorType = require('boilerplate/lib/errors');

const router = new PromiseRouter();


/**
 * GET /foo
 */
router.get('/', function(req, res, next) {
    return Promise.resolve({foo: 'bar'});
});



module.exports = router.getOriginal();
