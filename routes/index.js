// Modules needed.
const express = require('express');
const router = express.Router();

// GET Home Page.
router.get('/', function (req, res, next) {
    res.render('index', {
        title: 'Express'
    });
});

// Export this Router.
module.exports = router;