const cityService = require('../services/cityService');

class CityController {
  async getAllCities(req, res) {
    try {
      const { search } = req.query;
      const cities = await cityService.getAllCities(search);
      
      res.json({
        success: true,
        data: cities
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getCityById(req, res) {
    try {
      const city = await cityService.getCityById(req.params.id);
      
      res.json({
        success: true,
        data: city
      });
    } catch (error) {
      const statusCode = error.message === 'Город не найден' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  async createCity(req, res) {
    try {
      const city = await cityService.createCity(req.body);
      
      res.status(201).json({
        success: true,
        data: city,
        message: 'Город успешно создан'
      });
    } catch (error) {
      const statusCode = error.message === 'Город с таким именем уже существует' ? 400 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  async updateCity(req, res) {
    try {
      const city = await cityService.updateCity(req.params.id, req.body);
      
      res.json({
        success: true,
        data: city,
        message: 'Город успешно обновлен'
      });
    } catch (error) {
      const statusCode = error.message === 'Город не найден' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  async deleteCity(req, res) {
    try {
      const city = await cityService.deleteCity(req.params.id);
      
      res.json({
        success: true,
        data: city,
        message: 'Город успешно удален'
      });
    } catch (error) {
      const statusCode = error.message === 'Город не найден' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new CityController();
