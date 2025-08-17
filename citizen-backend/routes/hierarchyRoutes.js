const express = require('express');
const router = express.Router();
const HierarchyConfig = require('../models/HierarchyConfig');

// Получить текущую иерархию (первую доступную)
router.get('/', async (req, res) => {
  try {
    let config = await HierarchyConfig.findOne();
    
    // Если конфигурации нет, создаем по умолчанию
    if (!config) {
      config = new HierarchyConfig({
        levels: [
          { name: 'Город', type: 'city', enabled: true, required: true },
          { name: 'Район', type: 'district', enabled: true, required: false },
          { name: 'Улица', type: 'street', enabled: true, required: false }
        ]
      });
      await config.save();
    }
    
    res.json({
      success: true,
      data: config.levels
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Обновить иерархию (используем PATCH так как обновляем только часть ресурса)
router.patch('/', async (req, res) => {
  try {
    const { levels } = req.body;
    
    let config = await HierarchyConfig.findOne();
    
    // Если конфигурации нет, создаем новую
    if (!config) {
      config = new HierarchyConfig({ levels });
    } else {
      // Обновляем существующую конфигурацию (PATCH операция)
      config.levels = levels;
    }
    
    await config.save();
    
    res.json({
      success: true,
      data: config.levels,
      message: 'Иерархия обновлена'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
