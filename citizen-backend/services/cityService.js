const City = require('../models/City');

class CityService {
  async getAllCities(search = null) {
    const query = {};
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    return await City.find(query).sort({ name: 1 });
  }

  async getCityById(id) {
    const city = await City.findById(id);
    
    if (!city) {
      throw new Error('Город не найден');
    }
    
    return city;
  }

  async createCity(cityData) {
    const { name, population } = cityData;
    
    const existingCity = await City.findOne({ name });
    if (existingCity) {
      throw new Error('Город с таким именем уже существует');
    }
    
    const city = new City({
      name,
      population: population || 0
    });
    
    return await city.save();
  }

  async updateCity(id, updateData) {
    const city = await City.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    if (!city) {
      throw new Error('Город не найден');
    }
    
    return city;
  }

  async deleteCity(id) {
    const city = await City.findByIdAndDelete(id);
    
    if (!city) {
      throw new Error('Город не найден');
    }
    
    return city;
  }
}

module.exports = new CityService();
