const router = require('express').Router();
const { identify, test } = require('../controller/identify');

router.post('/identify', identify);
router.post('/test', test);

module.exports = router;