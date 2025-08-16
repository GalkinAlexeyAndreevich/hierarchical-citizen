const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['city', 'district', 'street']
  },
  name: {
    type: String,
    required: true
  },
  id: {
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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'City',
    required: true
  }
}, {
  timestamps: true
});

// Индексы для оптимизации запросов
citizenSchema.index({ 'groups.type': 1, 'groups.id': 1 });
citizenSchema.index({ city_id: 1 });
citizenSchema.index({ name: 1 });

// Виртуальное поле для получения города
citizenSchema.virtual('city', {
  ref: 'City',
  localField: 'city_id',
  foreignField: '_id',
  justOne: true
});

// Метод для получения иерархического пути
citizenSchema.methods.getHierarchyPath = function() {
  return this.groups
    .sort((a, b) => {
      const order = ['city', 'district', 'street'];
      return order.indexOf(a.type) - order.indexOf(b.type);
    })
    .map(group => group.name)
    .join(' → ');
};

module.exports = mongoose.model('Citizen', citizenSchema);
