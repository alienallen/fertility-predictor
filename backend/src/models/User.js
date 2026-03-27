const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  openid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  unionid: {
    type: String,
    default: null
  },
  session_key: {
    type: String,
    default: null
  },
  cycle_length: {
    type: Number,
    default: 28
  },
  period_length: {
    type: Number,
    default: 5
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);