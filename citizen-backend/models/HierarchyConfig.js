const mongoose = require('mongoose');

const hierarchyConfigSchema = new mongoose.Schema({
  levels: [{
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    enabled: {
      type: Boolean,
      default: true
    },
    required: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true
});



module.exports = mongoose.model('HierarchyConfig', hierarchyConfigSchema);
