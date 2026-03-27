const mongoose = require('mongoose');

const temperatureSchema = new mongoose.Schema({
  openid: {
    type: String,
    required: true,
    index: true
  },
  record_date: {
    type: Date,
    required: true
  },
  temperature: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

temperatureSchema.index({ openid: 1, record_date: -1 });

module.exports = mongoose.model('Temperature', temperatureSchema);