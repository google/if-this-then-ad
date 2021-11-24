const express = require('express');
const router = express.Router();
const path = require('path');

// Controllers
const someController = require('../controllers/some');

// Routes
router.get('/api/some', someController.hello);

// Frontend
router.use('/', express.static('./static'));

router.use('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'static', 'index.html'));
});

module.exports = router;