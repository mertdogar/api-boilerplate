'use strict';

const _ = require('lodash');
const debug = require('debug')('boilerplate:app:server');
const fs = require('fs');
const ErrorType = require('boilerplate/lib/errors');
const config = require('boilerplate/lib/config');
const http = require('http');
const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bodyParser = require('body-parser');
const helmet = require('helmet');
const multer = require('multer');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const morgan = require('morgan');
const winston = require('winston');
const redis = require('redis');


class Server {
    constructor() {
        debug('Constucting server');
        this.app = express();

        this.app.enable('trust proxy');
        this.app.disable('x-powered-by');

        this.initPassportJS();
        this.initMiddlewares();
    }

    initMiddlewares() {
        this.app.use(require('boilerplate/lib/middleware/cors'));
        this.app.use(helmet());

        // Serve swagger.yaml with replacing host

        if (config.get('http:static:serve')) {
            _.forEach(config.get('http:static:serve'), (mountPath, servePath) => {
                this.app.use(mountPath, express.static(servePath));
            });
        }

        this.app.use(bodyParser.json({limit: '10mb'}));
        this.app.use(bodyParser.urlencoded({limit: '10mb', extended: false}));

        // TODO: Buradaki temp s3 oldugu zaman calismaz.
        this.app.use(multer({ dest: config.get('components:staticstore:store:temp') }));
        this.app.use(cookieParser());

        if (config.get('http:log'))
            this.app.use(morgan('short', {stream: {
                write: function(message, encoding){
                    winston.info('[HttpServer]', message.trim());
                }
            }}));

        this.redisClient = redis.createClient({url: config.get('redis')});

        this.app.use(session({
            secret: config.get('sessionSecret'),
            proxy: true,
            cookie: {
                maxAge: 365 * 24 * 60 * 60,
                domain: config.get('http:cookie:domain'),
                httpOnly: true,
                secure: config.get('http:protocol') == 'https://'
            },
            resave: true,
            saveUninitialized: true,
            store: new RedisStore({
                client: this.redisClient
            })
        }));

        this.app.use(passport.initialize());
        this.app.use(passport.session());

        this.app.use('/', require('boilerplate/app/router'));
        this.app.use(require('boilerplate/lib/middleware/error'));

        this.app.all('/health', (req, res) => {
            res.json({ success: true });
        });
    }

    initPassportJS() {
        passport.use(new LocalStrategy({
            usernameField: 'email',
            passReqToCallback: true
            },
            function(req, email, password, done){
                done(null, {id: 'user'});
        }));

        passport.serializeUser(function(user, done) {
            done(null, user.id);
        });

        passport.deserializeUser(function(id, done) {
            done(null, {id: 'user'});
        });
    }

    init() {
        this.server_ = http.Server(this.app);
        return new Promise((resolve, reject) => {
            debug('Port: ' + config.get('http:port'));
            this.server_
                .listen(
                    config.get('http:port'),
                    '0.0.0.0',
                    err => {
                        if (err) return reject(err);
                        debug('Listening: 0.0.0.0')
                        resolve();
                    })
        });
    }
}

module.exports = new Server();
