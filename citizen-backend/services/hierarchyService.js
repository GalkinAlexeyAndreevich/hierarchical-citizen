const HierarchyConfig = require('../models/HierarchyConfig');

class HierarchyService {
  async getCurrentHierarchy() {
    let config = await HierarchyConfig.findOne();
    
    if (!config) {
      config = new HierarchyConfig({
        levels: [
          { name: 'Город', type: 'city', enabled: true, required: true },
          { name: 'Район', type: 'district', enabled: true, required: false },
          { name: 'Улица', type: 'street', enabled: true, required: false }
        ]
      });
      await config.save();
    }
    
    return config.levels;
  }

  async updateHierarchy(levels) {
    let config = await HierarchyConfig.findOne();
    
    if (!config) {
      config = new HierarchyConfig({ levels });
    } else {
      config.levels = levels;
    }
    
    await config.save();
    
    return config.levels;
  }

  async getHierarchyConfig() {
    return await HierarchyConfig.findOne();
  }

  async createHierarchyConfig(levels) {
    const config = new HierarchyConfig({ levels });
    return await config.save();
  }

  async deleteHierarchyConfig() {
    const result = await HierarchyConfig.deleteMany({});
    return result;
  }
}

module.exports = new HierarchyService();
