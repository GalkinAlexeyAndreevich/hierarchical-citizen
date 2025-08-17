const mongoose = require('mongoose');
const Citizen = require('../models/Citizen');

// Подключение к MongoDB
mongoose.connect('mongodb://localhost:27017/citizen-db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function migrateCitizenCity() {
  try {
    console.log('Начинаем миграцию поля city для жителей...');
    
    // Получаем всех жителей
    const citizens = await Citizen.find({});
    console.log(`Найдено ${citizens.length} жителей для миграции`);
    
    let updatedCount = 0;
    
    for (const citizen of citizens) {
      // Если у жителя есть city_id, но нет поля city, добавляем его
      if (citizen.city_id && !citizen.city) {
        citizen.city = citizen.city_id;
        await citizen.save();
        updatedCount++;
        console.log(`Обновлен житель: ${citizen.name} (ID: ${citizen._id})`);
      }
    }
    
    console.log(`Миграция завершена. Обновлено ${updatedCount} жителей.`);
    
  } catch (error) {
    console.error('Ошибка миграции:', error);
  } finally {
    mongoose.connection.close();
    console.log('Соединение с базой данных закрыто.');
  }
}

// Запускаем миграцию
migrateCitizenCity();
