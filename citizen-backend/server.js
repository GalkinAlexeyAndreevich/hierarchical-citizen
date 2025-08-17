const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config({ path: './config.env' });

const citizenRoutes = require('./routes/citizenRoutes');
const cityRoutes = require('./routes/cityRoutes');
const hierarchyRoutes = require('./routes/hierarchyRoutes');
const HierarchyConfig = require('./models/HierarchyConfig');

const app = express();
const PORT = process.env.PORT || 3000;

// Функция инициализации базовой иерархии
async function initializeDefaultHierarchy() {
  try {
    // Проверяем, есть ли уже конфигурация иерархии
    const existingConfig = await HierarchyConfig.findOne();
    
    if (!existingConfig) {
      console.log('Создание базовой конфигурации иерархии...');
      
      // Создаем базовую конфигурацию
      const defaultConfig = new HierarchyConfig({
        levels: [
          { type: 'city', name: 'Город', enabled: true, required: true },
          { type: 'district', name: 'Район', enabled: true, required: false },
          { type: 'street', name: 'Улица', enabled: true, required: false }
        ]
      });
      
      await defaultConfig.save();
      console.log('Базовая конфигурация иерархии создана успешно');
    } else {
      console.log('Конфигурация иерархии уже существует');
    }
  } catch (error) {
    console.error('Ошибка при инициализации иерархии:', error);
  }
}

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));
app.use(express.json());

app.use('/api/citizens', citizenRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/hierarchy', hierarchyRoutes);

console.log("init mongo uri", process.env.MONGODB_URI);
const mongoUri = process.env.MONGODB_URI;

// Попытка подключения к MongoDB
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000, // 10 секунд таймаут
  socketTimeoutMS: 10000,
})
.then(async () => {
  console.log(`Подключение к MongoDB установлено: ${mongoUri}`);
  
  // Инициализируем базовую иерархию
  await initializeDefaultHierarchy();
  
  app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
    console.log(`API доступен по адресу: http://localhost:${PORT}`);
  });
})
.catch((err) => {
  console.error('Ошибка подключения к MongoDB:', err);
  console.log('Проверьте:');
  console.log('1. Запущен ли MongoDB контейнер');
  console.log('2. Правильно ли настроены переменные окружения');
  console.log('3. Доступен ли порт 27017');
  process.exit(1);
});

module.exports = app;
