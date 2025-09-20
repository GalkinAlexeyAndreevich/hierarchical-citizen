const hierarchyService = require('../services/hierarchyService');

class HierarchyController {
  async getCurrentHierarchy(req, res) {
    try {
      const levels = await hierarchyService.getCurrentHierarchy();
      
      res.json({
        success: true,
        data: levels
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async updateHierarchy(req, res) {
    try {
      const { levels } = req.body;
      const updatedLevels = await hierarchyService.updateHierarchy(levels);
      
      res.json({
        success: true,
        data: updatedLevels,
        message: 'Иерархия обновлена'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getHierarchyConfig(req, res) {
    try {
      const config = await hierarchyService.getHierarchyConfig();
      
      res.json({
        success: true,
        data: config
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async createHierarchyConfig(req, res) {
    try {
      const { levels } = req.body;
      const config = await hierarchyService.createHierarchyConfig(levels);
      
      res.status(201).json({
        success: true,
        data: config,
        message: 'Конфигурация иерархии создана'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async deleteHierarchyConfig(req, res) {
    try {
      const result = await hierarchyService.deleteHierarchyConfig();
      
      res.json({
        success: true,
        data: result,
        message: 'Конфигурация иерархии удалена'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new HierarchyController();
