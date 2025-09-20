const express = require('express');
const router = express.Router();
const citizenController = require('../controllers/citizenController');

router.get('/', citizenController.getAllCitizens);
router.get('/:id', citizenController.getCitizenById);
router.post('/', citizenController.createCitizen);
router.put('/:id', citizenController.updateCitizen);
router.delete('/:id', citizenController.deleteCitizen);
router.get('/hierarchy/tree', citizenController.getHierarchyTree);
router.get('/hierarchy/values/:type', citizenController.getHierarchyValues);

module.exports = router;
