const express = require('express');
const router = express.Router();
const hierarchyController = require('../controllers/hierarchyController');

router.get('/', hierarchyController.getCurrentHierarchy);
router.patch('/', hierarchyController.updateHierarchy);
router.get('/config', hierarchyController.getHierarchyConfig);
router.post('/config', hierarchyController.createHierarchyConfig);
router.delete('/config', hierarchyController.deleteHierarchyConfig);

module.exports = router;
