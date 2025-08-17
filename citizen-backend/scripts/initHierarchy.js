const mongoose = require('mongoose');
const HierarchyConfig = require('../models/HierarchyConfig');

// Подключение к MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/citizen-db';

async function initHierarchy() {
  try {
    console.log('Подключение к MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Подключение успешно установлено');

    // Проверяем, есть ли уже конфигурация
    const existingConfig = await HierarchyConfig.findOne({});
    
    if (existingConfig) {
      console.log('Конфигурация иерархии уже существует');
      return;
    }

    // Создаем первую конфигурацию по умолчанию
    const defaultConfig = new HierarchyConfig({
      levels: [
        { name: 'Город', type: 'city', enabled: true, required: true },
        { name: 'Район', type: 'district', enabled: true, required: false },
        { name: 'Улица', type: 'street', enabled: true, required: false }
      ]
    });

    await defaultConfig.save();
    console.log('Создана стандартная конфигурация иерархии');

    console.log('Инициализация завершена успешно');
  } catch (error) {
    console.error('Ошибка инициализации:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Отключение от MongoDB');
  }
}

// Запуск скрипта
initHierarchy();
