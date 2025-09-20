const Citizen = require('../models/Citizen');
const City = require('../models/City');

class CitizenService {
  async getAllCitizens(filters = {}) {
    const { search, city_id } = filters;
    
    const query = {};
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    if (city_id) {
      query.city = city_id;
    }
    
    return await Citizen.find(query)
      .populate('city')
      .sort({ name: 1 });
  }

  async getCitizenById(id) {
    const citizen = await Citizen.findById(id).populate('city');
    
    if (!citizen) {
      throw new Error('Житель не найден');
    }
    
    return citizen;
  }

  async createCitizen(citizenData) {
    const { name, city_id, groups } = citizenData;
    
    const city = await City.findById(city_id);
    if (!city) {
      throw new Error('Город не найден');
    }
    
    const citizen = new Citizen({
      name,
      city_id: city_id,
      groups
    });
    
    await citizen.save();
    
    return await Citizen.findById(citizen._id).populate('city');
  }

  async updateCitizen(id, updateData) {
    const citizen = await Citizen.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    ).populate('city');
    
    if (!citizen) {
      throw new Error('Житель не найден');
    }
    
    return citizen;
  }

  async deleteCitizen(id) {
    const citizen = await Citizen.findByIdAndDelete(id);
    
    if (!citizen) {
      throw new Error('Житель не найден');
    }
    
    return citizen;
  }

  async getHierarchyTree() {
    const citizens = await Citizen.find({})
      .populate('city_id')
      .lean();
    
    const tree = {};
    
    citizens.forEach(citizen => {
      citizen.groups.forEach(group => {
        if (!tree[group.type]) {
          tree[group.type] = {};
        }
        
        if (!tree[group.type][group.name]) {
          tree[group.type][group.name] = {
            id: group.name,
            name: group.name,
            type: group.type,
            citizens: []
          };
        }
        
        tree[group.type][group.name].citizens.push({
          id: citizen._id,
          name: citizen.name,
          city: citizen.city_id
        });
      });
    });
    
    return {
      tree,
      totalCitizens: citizens.length
    };
  }

  async getHierarchyValues(type) {
    const values = await Citizen.aggregate([
      { $unwind: '$groups' },
      { $match: { 'groups.type': type } },
      { $group: { _id: '$groups.name' } },
      { $sort: { _id: 1 } }
    ]);
    
    return values.map(v => v._id);
  }
}

module.exports = new CitizenService();
