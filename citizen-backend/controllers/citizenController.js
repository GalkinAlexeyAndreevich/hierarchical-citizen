const citizenService = require('../services/citizenService');

class CitizenController {
  async getAllCitizens(req, res) {
    try {
      const { search, city_id } = req.query;
      const citizens = await citizenService.getAllCitizens({ search, city_id });
      
      res.json({
        success: true,
        data: citizens
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getCitizenById(req, res) {
    try {
      const citizen = await citizenService.getCitizenById(req.params.id);
      
      res.json({
        success: true,
        data: citizen
      });
    } catch (error) {
      const statusCode = error.message === 'Житель не найден' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  async createCitizen(req, res) {
    try {
      const citizen = await citizenService.createCitizen(req.body);
      
      res.status(201).json({
        success: true,
        data: citizen,
        message: 'Житель успешно создан'
      });
    } catch (error) {
      const statusCode = error.message === 'Город не найден' ? 400 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  async updateCitizen(req, res) {
    try {
      const citizen = await citizenService.updateCitizen(req.params.id, req.body);
      
      res.json({
        success: true,
        data: citizen,
        message: 'Житель успешно обновлен'
      });
    } catch (error) {
      const statusCode = error.message === 'Житель не найден' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  async deleteCitizen(req, res) {
    try {
      const citizen = await citizenService.deleteCitizen(req.params.id);
      
      res.json({
        success: true,
        data: citizen,
        message: 'Житель успешно удален'
      });
    } catch (error) {
      const statusCode = error.message === 'Житель не найден' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  async getHierarchyTree(req, res) {
    try {
      const result = await citizenService.getHierarchyTree();
      
      res.json({
        success: true,
        data: result.tree,
        totalCitizens: result.totalCitizens
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getHierarchyValues(req, res) {
    try {
      const { type } = req.params;
      const values = await citizenService.getHierarchyValues(type);
      
      res.json({
        success: true,
        data: values
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new CitizenController();
