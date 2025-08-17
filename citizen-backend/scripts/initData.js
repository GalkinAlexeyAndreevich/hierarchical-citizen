const mongoose = require('mongoose');
const Citizen = require('../models/Citizen');
const City = require('../models/City');
const HierarchyConfig = require('../models/HierarchyConfig');

// Подключение к MongoDB
mongoose.connect('mongodb://localhost:27017/citizen-db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Данные для инициализации
const citiesData = [
  { name: 'Москва', population: 10000000 },
  { name: 'Санкт-Петербург', population: 5000000 },
  { name: 'Новосибирск', population: 1500000 }
];

const citizensData = [
  {
    name: 'Петр',
    groups: [
      { type: 'city', name: 'Москва г.' },
      { type: 'district', name: 'Мытищи р-н' },
      { type: 'street', name: 'Ленина ул.' }
    ]
  },
  {
    name: 'Анна',
    groups: [
      { type: 'city', name: 'Москва г.' },
      { type: 'district', name: 'Мытищи р-н' },
      { type: 'street', name: 'Ленина ул.' }
    ]
  },
  {
    name: 'Иван',
    groups: [
      { type: 'city', name: 'Москва г.' },
      { type: 'district', name: 'Мытищи р-н' },
      { type: 'street', name: 'Город ул.' }
    ]
  }
];

async function initData() {
  try {
    console.log('Очистка существующих данных...');
    await Citizen.deleteMany({});
    await City.deleteMany({});
    await HierarchyConfig.deleteMany({});

    console.log('Создание иерархии...');
    const defaultConfig = new HierarchyConfig({
      levels: [
        { name: 'Город', type: 'city', enabled: true, required: true },
        { name: 'Район', type: 'district', enabled: true, required: false },
        { name: 'Улица', type: 'street', enabled: true, required: false }
      ]
    });
    await defaultConfig.save();
    console.log('Создана стандартная конфигурация иерархии');

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
