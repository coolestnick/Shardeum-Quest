const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questId: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['started', 'in_progress', 'completed'],
    default: 'started'
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  steps: [{
    stepId: String,
    completed: Boolean,
    completedAt: Date
  }],
  transactionHash: String
}, {
  timestamps: true
});

progressSchema.index({ userId: 1, questId: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);