const router = require('express').Router();
const homeRoute = require('./api/homeRoute');



router.use('/', homeRoute);


module.exports = router;

