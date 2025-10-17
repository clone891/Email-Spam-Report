const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  inbox: String,
  provider: String,
  received: Boolean,
  folder: String,
  messageCount: { type: Number, default: 0 },
  checkedAt: { type: Date, default: Date.now },
});

const testSchema = new mongoose.Schema({
  testCode: {
    type: String,
    unique: true,
    required: true,
    index: true,
  },
  userEmail: {
    type: String,
    required: true,
    index: true,
  },
  testInboxes: [String],
  results: [resultSchema],
  status: {
    type: String,
    enum: ['pending', 'checking', 'complete', 'error'],
    default: 'pending',
  },
  deliveryScore: {
    type: Number,
    default: 0,
  },
  shareLink: String,
  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 30 * 24 * 60 * 60 * 1000),
    index: { expireAfterSeconds: 2592000 },
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

testSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  if (this.results && this.results.length > 0) {
    const received = this.results.filter(r => r.received).length;
    this.deliveryScore = Math.round((received / this.results.length) * 100);
  }
  next();
});

module.exports = mongoose.model('Test', testSchema);