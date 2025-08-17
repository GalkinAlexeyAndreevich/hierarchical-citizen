const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  population: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Индексы
citySchema.index({ name: 1 });

module.exports = mongoose.model('City', citySchema);
