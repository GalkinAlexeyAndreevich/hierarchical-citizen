const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config({ path: './config.env' });

const appRoutes = require('./routes/index');
const { initData } = require('./utils/initData');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));
app.use(express.json());
app.use('/api', appRoutes);



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
  

  
  app.listen(PORT, async () => {
    console.log(`Сервер запущен на порту ${PORT}`);
    console.log(`API доступен по адресу: http://localhost:${PORT}`);
    
    setTimeout(async () => {
      await initData();
    }, 2000);
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
