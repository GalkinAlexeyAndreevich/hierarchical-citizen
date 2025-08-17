const express = require('express');
const router = express.Router();
const Citizen = require('../models/Citizen');
const City = require('../models/City');

// Получить всех жителей
router.get('/', async (req, res) => {
  try {
    const { search, city_id } = req.query;
    
    const query = {};
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    if (city_id) {
      query.city_id = city_id;
    }
    
    const citizens = await Citizen.find(query)
      .populate('city_id')
      .sort({ name: 1 });
    
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
});

// Получить жителя по ID
router.get('/:id', async (req, res) => {
  try {
    const citizen = await Citizen.findById(req.params.id)
      .populate('city_id');
    
    if (!citizen) {
      return res.status(404).json({
        success: false,
        error: 'Житель не найден'
      });
    }
    
    res.json({
      success: true,
      data: citizen
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Создать нового жителя
router.post('/', async (req, res) => {
  try {
    const { name, city_id, groups } = req.body;
    
    // Проверяем существование города
    const city = await City.findById(city_id);
    if (!city) {
      return res.status(400).json({
        success: false,
        error: 'Город не найден'
      });
    }
    
    // Создаем жителя
    const citizen = new Citizen({
      name,
      city_id,
      groups
    });
    
    await citizen.save();
    
    // Получаем созданного жителя с популяцией города
    const savedCitizen = await Citizen.findById(citizen._id)
      .populate('city_id');
    
    res.status(201).json({
      success: true,
      data: savedCitizen,
      message: 'Житель успешно создан'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Обновить жителя
router.put('/:id', async (req, res) => {
  try {
    const { name, city_id, groups } = req.body;
    
    // Проверяем существование города
    if (city_id) {
      const city = await City.findById(city_id);
      if (!city) {
        return res.status(400).json({
          success: false,
          error: 'Город не найден'
        });
      }
    }
    
    // Обновляем жителя
    const updatedCitizen = await Citizen.findByIdAndUpdate(
      req.params.id,
      {
        name,
        city_id,
        groups
      },
      { new: true, runValidators: true }
    ).populate('city_id');
    
    if (!updatedCitizen) {
      return res.status(404).json({
        success: false,
        error: 'Житель не найден'
      });
    }
    
    res.json({
      success: true,
      data: updatedCitizen,
      message: 'Житель успешно обновлен'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Удалить жителя
router.delete('/:id', async (req, res) => {
  try {
    const citizen = await Citizen.findByIdAndDelete(req.params.id);
    
    if (!citizen) {
      return res.status(404).json({
        success: false,
        error: 'Житель не найден'
      });
    }
    
    res.json({
      success: true,
      message: 'Житель успешно удален'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Получить иерархическое дерево жителей
router.get('/hierarchy/tree', async (req, res) => {
  try {
    const citizens = await Citizen.find({})
      .populate('city_id')
      .lean();
    
    // Строим простое дерево
    const tree = {};
    
    citizens.forEach(citizen => {
      citizen.groups.forEach(group => {
        if (!tree[group.type]) {
          tree[group.type] = {};
        }
        
        if (!tree[group.type][group.name]) {
          tree[group.type][group.name] = {
            id: group.name,
            name: group.name,
            type: group.type,
            citizens: []
          };
        }
        
        tree[group.type][group.name].citizens.push({
          id: citizen._id,
          name: citizen.name,
          city: citizen.city_id
        });
      });
    });
    
    res.json({
      success: true,
      data: tree,
      totalCitizens: citizens.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Получить все уникальные значения для определенного типа иерархии
router.get('/hierarchy/values/:type', async (req, res) => {
  try {
    const { type } = req.params;
    
    // Получаем все уникальные значения для данного типа
    const values = await Citizen.aggregate([
      { $unwind: '$groups' },
      { $match: { 'groups.type': type } },
      { $group: { _id: '$groups.name' } },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      success: true,
      data: values.map(v => v._id)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
