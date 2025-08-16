const mongoose = require('mongoose');
const Citizen = require('../models/Citizen');
const City = require('../models/City');

// Подключение к MongoDB
mongoose.connect('mongodb://localhost:27017/citizen-db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Данные для инициализации
const citiesData = [
  { name: 'Москва', data: '10000000 жителей' },
  { name: 'Санкт-Петербург', data: '5000000 жителей' },
  { name: 'Новосибирск', data: '1500000 жителей' }
];

const citizensData = [
  {
    name: 'Петр',
    groups: [
      { type: 'city', name: 'Москва г.' },
      { type: 'district', name: 'Мытищи р-н' },
      { type: 'street', name: 'Ленина ул.' },
      { type: 'house', name: 'Дом 15' }
    ]
  },
  {
    name: 'Анна',
    groups: [
      { type: 'city', name: 'Москва г.' },
      { type: 'district', name: 'Мытищи р-н' },
      { type: 'street', name: 'Ленина ул.' },
      { type: 'house', name: 'Дом 15' }
    ]
  },
  {
    name: 'Иван',
    groups: [
      { type: 'city', name: 'Москва г.' },
      { type: 'district', name: 'Мытищи р-н' },
      { type: 'street', name: 'Город ул.' },
      { type: 'house', name: 'Дом 7' }
    ]
  }
];

async function initData() {
  try {
    console.log('Очистка существующих данных...');
    await Citizen.deleteMany({});
    await City.deleteMany({});

    console.log('Создание городов...');
    const cities = await City.insertMany(citiesData);
    console.log(`Создано ${cities.length} городов`);

    console.log('Создание жителей...');
    const citizensWithCity = citizensData.map(citizen => ({
      ...citizen,
      city_id: cities[0]._id // Привязываем всех к Москве
    }));
    
    const citizens = await Citizen.insertMany(citizensWithCity);
    console.log(`Создано ${citizens.length} жителей`);

    console.log('Данные успешно инициализированы!');
    process.exit(0);
  } catch (error) {
    console.error('Ошибка инициализации:', error);
    process.exit(1);
  }
}

initData();
