const express = require('express');
const router = express.Router();
const City = require('../models/City');

// Получить все города
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    
    const query = {};
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    const cities = await City.find(query)
      .sort({ name: 1 });
    
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
});

// Получить город по ID
router.get('/:id', async (req, res) => {
  try {
    const city = await City.findById(req.params.id);
    
    if (!city) {
      return res.status(404).json({
        success: false,
        error: 'Город не найден'
      });
    }
    
    res.json({
      success: true,
      data: city
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Создать новый город
router.post('/', async (req, res) => {
  try {
    const { name, data } = req.body;
    
    // Проверяем уникальность имени
    const existingCity = await City.findOne({ name });
    if (existingCity) {
      return res.status(400).json({
        success: false,
        error: 'Город с таким именем уже существует'
      });
    }
    
    const city = new City({
      name,
      data: data || '0'
    });
    
    await city.save();
    
    res.status(201).json({
      success: true,
      data: city,
      message: 'Город успешно создан'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Обновить город
router.put('/:id', async (req, res) => {
  try {
    const { name, data } = req.body;
    
    // Проверяем уникальность имени (исключая текущий город)
    if (name) {
      const existingCity = await City.findOne({ 
        name, 
        _id: { $ne: req.params.id } 
      });
      if (existingCity) {
        return res.status(400).json({
          success: false,
          error: 'Город с таким именем уже существует'
        });
      }
    }
    
    const updatedCity = await City.findByIdAndUpdate(
      req.params.id,
      {
        name,
        data
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedCity) {
      return res.status(404).json({
        success: false,
        error: 'Город не найден'
      });
    }
    
    res.json({
      success: true,
      data: updatedCity,
      message: 'Город успешно обновлен'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Удалить город
router.delete('/:id', async (req, res) => {
  try {
    const city = await City.findByIdAndDelete(req.params.id);
    
    if (!city) {
      return res.status(404).json({
        success: false,
        error: 'Город не найден'
      });
    }
    
    res.json({
      success: true,
      message: 'Город успешно удален'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
