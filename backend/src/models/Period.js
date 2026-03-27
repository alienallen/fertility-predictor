const mongoose = require('mongoose');

const periodSchema = new mongoose.Schema({
  openid: {
    type: String,
    required: true,
    index: true
  },
  start_date: {
    type: Date,
    required: true
  },
  end_date: {
    type: Date,
    default: null
  },
  cycle_length: {
    type: Number,
    default: null
  }
}, {
  timestamps: true
});

// Compound index for user + date queries
periodSchema.index({ openid: 1, start_date: -1 });

module.exports = mongoose.model('Period', periodSchema);