const mongoose = require('mongoose');

const intercourseRecordSchema = new mongoose.Schema({
  openid: {
    type: String,
    required: true,
    index: true
  },
  record_date: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

intercourseRecordSchema.index({ openid: 1, record_date: -1 });

module.exports = mongoose.model('IntercourseRecord', intercourseRecordSchema);