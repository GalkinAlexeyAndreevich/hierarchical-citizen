const citizenRoutes = require('./citizenRoutes');
const cityRoutes = require('./cityRoutes');
const hierarchyRoutes = require('./hierarchyRoutes');
const express = require('express');
const router = express.Router();

router.use('/citizens', citizenRoutes);
router.use('/cities', cityRoutes);
router.use('/hierarchy', hierarchyRoutes);

module.exports = router;