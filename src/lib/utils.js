'use strict';

const _ = require('lodash');
const ErrorType = require('./errors');
const http = require('http');
const fs = require('fs');
const request = require('request');


/**
 * @param {Object} obj Object to find deep property for.
 * @param {string|Array} path Dot separated or array of property path.
 * @param {*=} opt_default Default value.
 * @return {*}
 */
exports.getObjectProperty = function getObjectProperty (obj, path, opt_default) {
    return (Array.isArray(path) ? path : path.split('.'))
        .reduce(function(o, p) { return o && o[p] || opt_default || null; }, obj);
};


/**
 * @param {Object} obj Object to find deep property for.
 * @param {string|Array} path Dot separated or array of property path.
 * @param {*} value
 * @return {Object} Returns changed object.
 */
exports.setObjectProperty = function setObjectProperty(obj, path, value) {
    var parent = obj;
    path = Array.isArray(path) ? path : path.split('.');

    for (var i = 0; i < path.length - 1; i++) {
        if (!parent[path[i]]) parent[path[i]] = {};
        parent = parent[path[i]];
    }

    parent[path[path.length - 1]] = value;
    return obj;
};


/**
 * @param {Object} obj Object to find deep property for.
 * @param {string|Array} path Dot separated or array of property path.
 * @return {Object} Returns changed object.
 */
exports.deleteObjectProperty = function deleteObjectProperty(obj, path) {
    var parent = obj;
    path = Array.isArray(path) ? path : path.split('.');

    for (var i = 0; i < path.length - 1; i++) {
        if (!parent[path[i]]) parent[path[i]] = {};
        parent = parent[path[i]];
    }

    delete parent[path[path.length - 1]];
    return obj;
};


exports.hexToBase64 = function hexToBase64(hex) {
    hex = hex.toString();
    return new Buffer(hex, 'hex').toString('base64');
};


exports.base64toHex = function base64toHex(base64) {
    return new Buffer(base64, 'base64').toString('hex');
};


exports.intToBase64 = function intToBase64(int) {
    var hex = int.toString(16);
    if (hex.length % 2 == 1)
        hex = '0' + hex;
    return new Buffer(hex, 'hex').toString('base64');
};


exports.base64toInt = function base64toInt(base64) {
    return parseInt(new Buffer(base64, 'base64').toString('hex'), 16);
};


/**
 * Creates an object from dot notation string.
 * @param {string} str `a.b.c.d` like string
 * @param {*} val Any value
 * @return {Object}
 */
exports.buildObjectFromString = function(str, val) {
    var obj = {},
    path = str.split(".");

    for (var i = 0, tmp = obj; i < path.length - 1; i++) {
       tmp = tmp[path[i]] = {};
    }

    tmp[path[i]] = val;
    return obj;
};


/**
 * Deep version (including arrays) of lodash's _.omit
 * @param {*} obj
 * @param {string|Array.<string>} fields
 * @return {*}
 */
exports.omitDeep = function omitDeep(obj, fields) {
    if (_.isArray(obj))
        return _.map(obj, item => omitDeep(item, fields));

    if (_.isDate(obj))
        return obj;

    if (_.isObject(obj)) {
        if (_.isFunction(obj.toJSON))
            obj = obj.toJSON();

        obj = _.omit(obj, fields);
        return _.mapValues(obj, (value) => {
            if (!_.isArray(value) && !_.isObject(value))
                return value;

            return omitDeep(value, fields);
        });
    }

    return obj;
}

exports.errorHandler = function errorHandler(error) {
      if (error instanceof Error && error.name === 'ClientError') {
          // Do nothing
      } else if (error instanceof Error && error.name === 'InternalError') {
          // Do nothing
      } else if (error instanceof Error) {
          if(_.isArray(error.errors))
              error = new ErrorType.ClientError(error.errors.map(err => err.message).join('\n'));
      }

      throw error;
}


/**
 *
 * @param {string|Object} url
 * @param {string} filePath
 * @return {Promise}
 */
exports.downloadFromWeb = function(url, filePath) {
    return new Promise((resolve, reject) => {
        try {
            request
                .get(url)
                .on('response', (response) => {
                    if (response.statusCode < 200 || response.statusCode >= 300)
                        return reject(new ErrorType.ClientError(response.statusMessage || 'Could not download.'));

                    const downloadStream = response.pipe(fs.createWriteStream(filePath));

                    downloadStream.on('error', (err) => {
                        fs.unlink(filePath);
                        reject(new ErrorType.ClientError(err.message || 'Could not download.'));;
                    });

                    downloadStream.on('finish', () => {
                        resolve();
                    });
                })
                .on('error', (err) => {
                    reject(new ErrorType.ClientError(err.message || 'Could not download.'));
                });
        } catch (err) {
            reject(new ErrorType.ClientError(err.message || 'Could not download.'));
        }
    });
}


/**
 *
 * @param {string} fileId
 * @param {string} authToken
 * @param {string} filePath
 * @return {Promise}
 */
exports.downloadFromGoogleDrive = function(fileId, authToken, filePath) {
    const options = {
        url: `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        headers: {
            'Authorization': `Bearer ${authToken}`
        }
    };

    return exports.downloadFromWeb(options, filePath);
}


/**
 *
 * @param {string} filePath
 * @return {Promise}
 */
exports.getFileSizeOfLocalFile = function(filePath) {
    return new Promise((resolve, reject) => {
        fs.stat(filePath, (err, stats) => {
            if (err)
                return reject(err);

            resolve(stats.size);
        })
    });
}


/**
 *
 * @param {string|Object} url
 * @return {Promise}
 */
exports.getFileSizeOfRemoteFile = function(url) {
    return new Promise((resolve, reject) => {
        try {
            request
                .head(url)
                .on('response', (response) => {
                    if (response.statusCode < 200 || response.statusCode >= 300)
                        return reject(new ErrorType.ClientError(response.statusMessage || 'Could not get head.'));

                    const fileSize = response.headers['content-length'];

                    if (!fileSize)
                        return reject(new ErrorType.ClientError(`"content-length" header not found.`));

                    resolve(_.isNumber(fileSize) ? fileSize : parseInt(fileSize, 10));
                })
                .on('error', (err) => {
                    reject(new ErrorType.ClientError(err.message || 'Could not get head.'));
                });
        } catch (err) {
            reject(new ErrorType.ClientError(err.message || 'Could not get head.'));
        }
    });
}


/**
 *
 * @param {string} fileId
 * @param {string} authToken
 * @return {Promise}
 */
exports.getFileSizeOfGoogleDriveFile = function(fileId, authToken) {
    const options = {
        url: `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        headers: {
            'Authorization': `Bearer ${authToken}`
        }
    };

    return exports.getFileSizeOfRemoteFile(options);
};

