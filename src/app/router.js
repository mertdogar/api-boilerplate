'use strict';

const express = require('express');
const router = express.Router();

router.use('/foo', require('boilerplate/app/routers/foo'));


module.exports = router;
