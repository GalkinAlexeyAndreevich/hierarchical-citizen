const Citizen = require('../models/Citizen');
const City = require('../models/City');
const HierarchyConfig = require('../models/HierarchyConfig');

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

const hierarchyData = [
  { name: 'Город', type: 'city', enabled: true, required: true },
  { name: 'Район', type: 'district', enabled: true, required: false },
  { name: 'Улица', type: 'street', enabled: true, required: false }
];

async function initData() {
  try {
    const existingHierarchy = await HierarchyConfig.findOne();
    const existingCities = await City.findOne();
    const existingCitizens = await Citizen.findOne();
    
    if (!existingHierarchy) {
      const defaultConfig = new HierarchyConfig({
        levels: hierarchyData
      });
      await defaultConfig.save();
      console.log('Создана стандартная конфигурация иерархии');
    } else {
      console.log('Конфигурация иерархии уже существует');
    }

    if (!existingCities) {
      const cities = await City.insertMany(citiesData);
      console.log(`Создано ${cities.length} городов`);
    } else {
      console.log('Города уже существуют');
    }

    if (!existingCitizens) {
      const firstCity = await City.findOne();
      if (firstCity) {
        const citizensWithCity = citizensData.map(citizen => ({
          ...citizen,
          city_id: firstCity._id,
          city: firstCity._id
        }));
        await Citizen.insertMany(citizensWithCity);
        console.log(`Создано ${citizensData.length} жителей`);
      } else {
        console.log('Не удалось найти город для привязки жителей');
      }
    } else {
      console.log('Жители уже существуют');
    }
    
    console.log('Инициализация данных завершена');
  } catch (error) {
    console.error('Ошибка инициализации данных:', error);
    process.exit(1);
  }
}

module.exports = { initData };
