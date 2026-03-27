const mongoose = require('mongoose');

// result: 0=阴性, 1=弱阳, 2=强阳, 3=已排卵
const ovulationTestSchema = new mongoose.Schema({
  openid: {
    type: String,
    required: true,
    index: true
  },
  test_date: {
    type: Date,
    required: true
  },
  result: {
    type: Number,
    required: true,
    enum: [0, 1, 2, 3]
  }
}, {
  timestamps: true
});

ovulationTestSchema.index({ openid: 1, test_date: -1 });

module.exports = mongoose.model('OvulationTest', ovulationTestSchema);