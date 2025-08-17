const mongoose = require('mongoose');
const HierarchyConfig = require('../models/HierarchyConfig');

// Подключение к MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/citizen-db';

async function migrateHierarchy() {
  try {
    console.log('Подключение к MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Подключение успешно установлено');

    // Находим все конфигурации иерархии
    const configs = await HierarchyConfig.find({});
    
    if (configs.length === 0) {
      console.log('Конфигурации иерархии не найдены');
      return;
    }

    console.log(`Найдено ${configs.length} конфигураций для миграции`);

    for (const config of configs) {
      let needsUpdate = false;
      
      // Проверяем каждый уровень
      for (const level of config.levels) {
        if (!level.type) {
          // Генерируем type из name
          level.type = level.name.toLowerCase().replace(/[а-яё]/g, '');
          needsUpdate = true;
          console.log(`Добавлен type "${level.type}" для уровня "${level.name}"`);
        }
      }
      
      // Если нужно обновить, сохраняем
      if (needsUpdate) {
        await config.save();
        console.log(`Конфигурация ${config._id} обновлена`);
      }
    }

    console.log('Миграция завершена успешно');
  } catch (error) {
    console.error('Ошибка миграции:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Отключение от MongoDB');
  }
}

// Запуск скрипта
migrateHierarchy();
