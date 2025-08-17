const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  }
}, { _id: false });

const citizenSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  groups: {
    type: [groupSchema],
    required: true
  },
  city_id: {
    type: String,
    required: true
  },
  city: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'City',
  }
}, {
  timestamps: true
});

// Индексы для оптимизации запросов
citizenSchema.index({ 'groups.type': 1, 'groups.name': 1 });
citizenSchema.index({ city_id: 1 });
citizenSchema.index({ city: 1 });
citizenSchema.index({ name: 1 });

module.exports = mongoose.model('Citizen', citizenSchema);
